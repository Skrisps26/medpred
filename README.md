# MEDPRED

This project predicts whether a patient is likely to deteriorate based on clinical features using an **XGBoost model** trained on the **MIMIC dataset**.  
It has a **Next.js dashboard frontend** and a **FastAPI backend** for serving ML predictions.


---

## ✨ Features
- 📊 User-friendly **Next.js dashboard** for inputting patient details
- ⚡ **FastAPI backend** serving ML predictions via REST APIs
- 🤖 **XGBoost model** trained on the MIMIC dataset
- 🧪 Clinical dataset integration (MIMIC-III)
- 🌐 Deployed with a fast-api backend

---

## 🚀 Live Demo
🔗 [Live Demo](https://medpred.vercel.app)  

---
## 📦 Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/skrisps26/medpred.git
cd medpred

##For Frontend
cd frontend

#Install Dependencies
npm install

#Go to
http://127.0.0.1/3000


##For backend
cd backend

#Create virtual environment
venv\Scripts\activate

#Install Dependencies
pip install -r requirements.txt

#Run the FastAPI server
uvicorn main:app --reload

#Go to
http://127.0.0.1:8000



