
# 🍉Ingredient Checker

🧪 Ingredient Checker
📌 Overview

Ingredient Checker is a smart web-based application that helps users make safer and healthier food choices by analyzing ingredients listed on packaged food products. The system allows users to scan ingredient labels using OCR, automatically extract ingredient text, and provide clear health insights, warnings, and safety indicators based on user profiles (allergies, pregnancy, dietary preferences, etc.).

The platform aims to improve food transparency and empower consumers to make informed decisions at the point of purchase.

🎯 Problem Statement

Consumers often struggle to understand complex ingredient names and identify harmful substances in packaged foods. This becomes critical for:

People with allergies

Pregnant women

Individuals with lifestyle diseases (diabetes, BP, etc.)

Health-conscious consumers

Current food labels are not user-friendly, and important warnings are often missed.

💡 Solution

Ingredient Checker solves this problem by:

Scanning ingredient labels using OCR (Tesseract)

Breaking down each ingredient into simple descriptions (1–2 lines)

Highlighting harmful or restricted ingredients

Providing color-coded safety indicators

Giving personalized warnings based on user health profiles

🚀 Key Features

📷 Image-based Ingredient Scanning (OCR)

🧠 Ingredient Analysis & Classification

🚦 Color-coded Safety System

🟢 Green – Safe

🟡 Yellow – Caution

🟠 Orange – Moderate Risk

🔴 Red – Harmful / Avoid

👩‍⚕️ User-Specific Warnings

Allergies

Pregnancy safety

Dietary restrictions (vegan, diabetic, etc.)

📊 Ingredient Descriptions

🗂 Scan History & Reports

🌐 Web-based UI (React)

🔐 Secure backend with Flask & MongoDB

🏗️ System Architecture

Frontend: React (Vite)

Backend: Flask (Python)

Database: MongoDB

OCR Engine: Tesseract OCR

APIs: Groq API and Gemini API used

| Layer    | Technology                         |
| -------- | ---------------------------------- |
| Frontend | React.js, TypeScript, Tailwind CSS |
| Backend  | Flask, Python                      |
| Database | MongoDB                            |
| OCR      | Tesseract OCR                      |
| Tools    | VS Code, GitHub, Postman           |
| Design   | Figma, Canva                       |


⚙️ Installation & Setup
🔹 Prerequisites

Node.js (v18+)

Python (3.9+)

MongoDB

Tesseract OCR

🔹 Clone Repository<br>

git clone<br>
https://github.com/your-username/ingredient-checker.git
cd ingredient-checker

🔹 Frontend Setup<br>
cd frontend
npm install
npm run dev

🔹 Backend Setup<br>
cd backend
pip install -r requirements.txt
python app.py

🔹 Environment Variables

Create a .env file in the root:

VITE_LLM_API_KEY=your_api_key
VITE_OCR_ENGINE=tesseract
MONGO_URI=mongodb://localhost:27017/ingredient_checker

🧪 Use Case Flow

User uploads/scans food ingredient label

OCR extracts text

Ingredients are parsed and analyzed

Risk level assigned with color codes

User receives warnings & explanations

Scan stored in history

📊 Database Design

Users Collection

Ingredients Collection

Analysis Results Collection

Supports user preferences, ingredient metadata, and scan history.


📈 Future Enhancements

Mobile App (PWA)

Barcode scanning

AI-based ingredient risk prediction

Multilingual OCR support

Integration with FSSAI & FDA datasets

Recommendation of safer alternatives


🏆 Use Case & Impact

Improves food safety awareness

Reduces health risks

Encourages informed consumer behavior

Supports public health initiatives

📜 References


OpenFoodFacts – https://world.openfoodfacts.org

USDA FoodData Central – https://fdc.nal.usda.gov

WHO Food Safety – https://www.who.int/health-topics/food-safety

FSSAI – https://www.fssai.gov.in

👥 Team & Contribution

This project is Part of D.E from Government Engineering College, Rajkot<br>
By - Ravi, Akshat, Krupali, Ansh🥂

