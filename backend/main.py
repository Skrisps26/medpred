from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse
import pandas as pd
import xgboost as xgb
import io
import joblib
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

model = xgb.XGBClassifier()
model.load_model('xgb_model(1).bin')

# origins = [
#     "http://localhost.tiangolo.com",
#     "https://localhost.tiangolo.com",
#     "http://localhost",
#     "http://localhost:8080",
# ]
app.add_middleware(
    CORSMiddleware,
    allow_origins='*',
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
def feature_engineering(dfa: pd.DataFrame) -> pd.DataFrame:
    # Example feature engineering steps
    from inspect import isbuiltin
    from sklearn.preprocessing import LabelEncoder, StandardScaler, MinMaxScaler
    drop_cols = [
        "row_id_x","row_id_y", "subject_id", "hadm_id",
        "admittime", "dischtime", "deathtime", "dob", "dod", "dod_hosp", "dod_ssn",
        "edregtime", "edouttime", "has_chartevents_data",
        "diagnosis", "language", "religion", "ethnicity", "fluid_balance", "input_amt", "output_amt",
        "expire_flag", "hospital_expire_flag","insurance", "marital_status",'blood','circulatory','congenital','digestive','endocrine/metabolic',
               'genitourinary','infectious','injury/poisoning','mental','musculoskeletal',
               'neoplasms','nervous/senses','respiratory','skin','symptoms/signs','unknown'  #"dud", "admission_type"
    ]
    # comorb_cols = []

    X = dfa.drop(columns=drop_cols + ["dud", "mortality_90d", "los"])
    # X1 = dfa[comorb_cols]

    categorical_cols = ["admission_type", "admission_location", "discharge_location",
                    "gender"]
    for col in categorical_cols:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col].astype(str))
# X["los_days"] = X["los_days"].astype(int)
    X["comorb_count"].fillna(0, inplace=True)
    scaler = MinMaxScaler()
    norm_cols = ["aoa", "abn", "comorb_count"]
    X[norm_cols] = scaler.fit_transform(X[norm_cols])

    # X1 = X1.applymap(lambda x: 1 if x else 0)
    # X1[["aoa", "gender"]] = X[["aoa", "gender"]]

    return X

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    filename = file.filename.lower()

    if filename.endswith(".csv"):
        df = pd.read_csv(io.BytesIO(contents))
    elif filename.endswith(".xlsx"):
        df = pd.read_excel(io.BytesIO(contents), engine="openpyxl")
    elif filename.endswith(".xls"):

        df = pd.read_excel(io.BytesIO(contents), engine="xlrd")
    else:
        return {"error": "Unsupported file type. Please upload CSV or Excel."}


    X = feature_engineering(df)

    # Run predictions
    preds = model.predict_proba(X)
    df["prob_class_0"] = preds[:, 0]
    df["prob_class_1"] = preds[:, 1]
    df["prediction"] = (preds[:, 1] >= 0.5).astype(int) 

    # Save back to Excel
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False)
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=predictions.xlsx"}
    )