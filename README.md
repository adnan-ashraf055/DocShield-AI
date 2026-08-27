# 🛡️ DocShield AI

### AI-Powered Identity & Document Screening System

DocShield AI is a web-based document screening platform designed to assist in the analysis of identity documents such as passports and other official documents.

The system combines **OCR, document validation, face detection, tampering analysis, and risk assessment** into a single screening workflow.

> **Note:** DocShield AI is currently a development/demo project. Some screening modules, including tampering detection and risk assessment, use demonstration logic and are not intended to replace professional document verification systems.

---

## 📌 Project Overview

Identity documents can contain important information that needs to be checked for consistency, readability, and potential suspicious characteristics.

DocShield AI provides a simple interface where a user can upload a document and run it through a multi-stage screening pipeline.

The system processes the uploaded document and provides:

- OCR extraction
- Document validation
- Face detection
- Tampering analysis
- Risk assessment
- Case ID generation
- Screening status and results

The goal is to demonstrate how **AI, computer vision, OCR, and web technologies** can be combined to build an intelligent document-screening workflow.

---

## ✨ Key Features

### 🔍 1. OCR Extraction

Extracts readable text from uploaded image documents using **Tesseract OCR**.

The system can extract information such as:

- Name
- Document number
- Date information
- Nationality
- Other visible document text

---

### 📄 2. Document Validation

Performs basic validation checks including:

- Supported file type
- File size
- Document type
- OCR availability
- Basic document consistency

Supported formats:

- JPG / JPEG
- PNG
- WEBP
- PDF

Maximum file size:

**10 MB**

---

### 👤 3. Face Detection

Uses **OpenCV** and a Haar Cascade classifier to detect whether a face is present in an uploaded image.

The system reports:

```text
Face Detected
