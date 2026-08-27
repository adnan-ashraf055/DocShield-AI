from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from pathlib import Path
from uuid import uuid4
from datetime import datetime

import pytesseract
from PIL import Image

import io
import cv2
import numpy as np


# ============================================================
# TESSERACT CONFIGURATION
# ============================================================

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="DocShield AI API",
    description="AI-powered fake identity and document screening system",
    version="1.0.0",
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROOT API
# ============================================================

@app.get("/")
def root():

    return {
        "message": "DocShield AI Backend is running",
        "status": "online",
        "version": "1.0.0",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health_check():

    return {
        "status": "healthy",
        "service": "DocShield AI",
    }


# ============================================================
# SYSTEM INFORMATION
# ============================================================

@app.get("/api/system")
def system_information():

    return {
        "application": "DocShield AI",
        "purpose": "AI-Based Fake Identity & Document Screening",

        "modules": [
            "OCR",
            "Document Validation",
            "Tampering Detection",
            "Face Verification",
            "Risk Assessment",
        ],

        "status": "development",
    }


# ============================================================
# UPLOAD DIRECTORY
# ============================================================

UPLOAD_DIR = Path("uploads")

UPLOAD_DIR.mkdir(exist_ok=True)


# ============================================================
# FACE DETECTION
# ============================================================

def detect_face(image_bytes):

    try:

        # ----------------------------------------------------
        # Convert uploaded bytes into OpenCV image
        # ----------------------------------------------------

        image_array = np.frombuffer(
            image_bytes,
            np.uint8
        )

        image = cv2.imdecode(
            image_array,
            cv2.IMREAD_COLOR
        )

        if image is None:

            return False


        # ----------------------------------------------------
        # Convert to grayscale
        # ----------------------------------------------------

        gray = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2GRAY
        )


        # ----------------------------------------------------
        # Improve contrast
        # ----------------------------------------------------

        gray = cv2.equalizeHist(gray)


        # ----------------------------------------------------
        # Load Haar Cascade
        # ----------------------------------------------------

        cascade_path = (
            cv2.data.haarcascades
            + "haarcascade_frontalface_default.xml"
        )

        face_cascade = cv2.CascadeClassifier(
            cascade_path
        )


        # ----------------------------------------------------
        # Check cascade
        # ----------------------------------------------------

        if face_cascade.empty():

            print(
                "ERROR: Face cascade could not be loaded."
            )

            return False


        # ====================================================
        # ATTEMPT 1
        # Original image
        # ====================================================

        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.05,
            minNeighbors=3,
            minSize=(25, 25)
        )

        if len(faces) > 0:

            print(
                "FACE DETECTED - ORIGINAL IMAGE"
            )

            return True


        # ====================================================
        # ATTEMPT 2
        # Upscale image
        # ====================================================

        height, width = gray.shape

        enlarged = cv2.resize(
            gray,
            (
                width * 2,
                height * 2
            ),
            interpolation=cv2.INTER_CUBIC
        )


        faces = face_cascade.detectMultiScale(
            enlarged,
            scaleFactor=1.05,
            minNeighbors=3,
            minSize=(40, 40)
        )

        if len(faces) > 0:

            print(
                "FACE DETECTED - UPSCALED IMAGE"
            )

            return True


        # ====================================================
        # ATTEMPT 3
        # CLAHE enhancement
        # ====================================================

        clahe = cv2.createCLAHE(
            clipLimit=2.0,
            tileGridSize=(8, 8)
        )

        enhanced = clahe.apply(
            enlarged
        )


        faces = face_cascade.detectMultiScale(
            enhanced,
            scaleFactor=1.05,
            minNeighbors=3,
            minSize=(40, 40)
        )

        if len(faces) > 0:

            print(
                "FACE DETECTED - ENHANCED IMAGE"
            )

            return True


        # ====================================================
        # No face found
        # ====================================================

        print(
            "NO FACE DETECTED"
        )

        return False


    except Exception as error:

        print(
            "FACE DETECTION ERROR:",
            error
        )

        return False


# ============================================================
# TAMPERING DETECTION
# ============================================================

def detect_tampering(image_bytes):

    """
    Basic image-forensics tampering analysis.

    This performs heuristic checks using:

    1. Image decoding
    2. Edge density
    3. Local noise / variance
    4. JPEG compression difference

    This is a prototype/demo forensic analysis.
    It does not provide definitive proof of forgery.
    """

    try:

        # ----------------------------------------------------
        # Convert bytes to OpenCV image
        # ----------------------------------------------------

        image_array = np.frombuffer(
            image_bytes,
            np.uint8
        )

        image = cv2.imdecode(
            image_array,
            cv2.IMREAD_COLOR
        )

        if image is None:

            return {
                "status": "failed",
                "result": "Unable to analyze image.",
                "score": 50,
                "level": "MEDIUM"
            }


        # ----------------------------------------------------
        # Convert to grayscale
        # ----------------------------------------------------

        gray = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2GRAY
        )


        # ----------------------------------------------------
        # Resize very large images
        # ----------------------------------------------------

        max_dimension = 1600

        height, width = gray.shape

        if max(height, width) > max_dimension:

            scale = (
                max_dimension
                / max(height, width)
            )

            new_width = int(
                width * scale
            )

            new_height = int(
                height * scale
            )

            gray = cv2.resize(
                gray,
                (
                    new_width,
                    new_height
                ),
                interpolation=cv2.INTER_AREA
            )


        # ====================================================
        # 1. EDGE DENSITY ANALYSIS
        # ====================================================

        edges = cv2.Canny(
            gray,
            100,
            200
        )

        edge_density = (
            np.count_nonzero(edges)
            / edges.size
        )


        # ====================================================
        # 2. LOCAL NOISE ANALYSIS
        # ====================================================

        blurred = cv2.GaussianBlur(
            gray,
            (5, 5),
            0
        )

        noise = cv2.absdiff(
            gray,
            blurred
        )

        noise_mean = float(
            np.mean(noise)
        )


        # ====================================================
        # 3. JPEG COMPRESSION ANALYSIS
        # ====================================================

        encode_success, encoded_image = cv2.imencode(
            ".jpg",
            gray,
            [
                cv2.IMWRITE_JPEG_QUALITY,
                90
            ]
        )

        compression_difference = 0.0

        if encode_success:

            compressed = cv2.imdecode(
                encoded_image,
                cv2.IMREAD_GRAYSCALE
            )

            if compressed is not None:

                difference = cv2.absdiff(
                    gray,
                    compressed
                )

                compression_difference = float(
                    np.mean(difference)
                )


        # ====================================================
        # 4. CALCULATE TAMPERING SCORE
        # ====================================================

        tampering_score = 0


        # ----------------------------------------------------
        # Noise pattern
        # ----------------------------------------------------

        if noise_mean > 18:

            tampering_score += 25

        elif noise_mean > 12:

            tampering_score += 10


        # ----------------------------------------------------
        # Compression difference
        # ----------------------------------------------------

        if compression_difference > 15:

            tampering_score += 30

        elif compression_difference > 8:

            tampering_score += 15


        # ----------------------------------------------------
        # Edge density
        # ----------------------------------------------------

        if edge_density > 0.35:

            tampering_score += 20

        elif edge_density < 0.01:

            tampering_score += 10


        # ----------------------------------------------------
        # Keep score between 0 and 100
        # ----------------------------------------------------

        tampering_score = min(
            tampering_score,
            100
        )


        # ====================================================
        # 5. DETERMINE TAMPERING LEVEL
        # ====================================================

        if tampering_score >= 60:

            tampering_level = "HIGH"

            tampering_result = (
                "Suspicious image characteristics detected"
            )


        elif tampering_score >= 30:

            tampering_level = "MEDIUM"

            tampering_result = (
                "Potentially altered image characteristics detected"
            )


        else:

            tampering_level = "LOW"

            tampering_result = (
                "No obvious manipulation detected"
            )


        # ----------------------------------------------------
        # Console output
        # ----------------------------------------------------

        print(
            "TAMPERING SCORE:",
            tampering_score
        )

        print(
            "TAMPERING LEVEL:",
            tampering_level
        )


        # ====================================================
        # RETURN TAMPERING RESULT
        # ====================================================

        return {

            "status": "completed",

            "result": tampering_result,

            "score": tampering_score,

            "level": tampering_level

        }


    except Exception as error:

        print(
            "TAMPERING DETECTION ERROR:",
            error
        )

        return {

            "status": "failed",

            "result": "Tampering analysis failed.",

            "score": 50,

            "level": "MEDIUM"

        }


# ============================================================
# DOCUMENT SCREENING API
# ============================================================

@app.post(
    "/api/documents/analyze"
)
async def analyze_document(

    file: UploadFile = File(...),

    document_type: str = Form(...)
):


    # ========================================================
    # 1. CREATE CASE ID
    # ========================================================

    case_id = (

        f"DS-{datetime.now().year}-"

        f"{uuid4().hex[:6].upper()}"

    )


    # ========================================================
    # 2. ALLOWED FILE TYPES
    # ========================================================

    allowed_types = {

        "image/jpeg",

        "image/png",

        "image/webp",

        "application/pdf",

    }


    if file.content_type not in allowed_types:

        return {

            "success": False,

            "error": "Unsupported file type."

        }


    # ========================================================
    # 3. READ FILE
    # ========================================================

    file_bytes = await file.read()


    # ========================================================
    # 4. FILE SIZE VALIDATION
    # ========================================================

    max_file_size = (
        10 * 1024 * 1024
    )


    if len(file_bytes) > max_file_size:

        return {

            "success": False,

            "error": "File size exceeds 10 MB limit."

        }


    # ========================================================
    # 5. SAVE DOCUMENT
    # ========================================================

    file_extension = Path(
        file.filename or ""
    ).suffix.lower()


    saved_filename = (
        f"{case_id}"
        f"{file_extension}"
    )


    saved_path = (
        UPLOAD_DIR
        / saved_filename
    )


    with open(
        saved_path,
        "wb"
    ) as output_file:

        output_file.write(
            file_bytes
        )


    # ========================================================
    # 6. OCR EXTRACTION
    # ========================================================

    ocr_text = ""

    ocr_status = "pending"


    try:

        # ----------------------------------------------------
        # OCR FOR IMAGES
        # ----------------------------------------------------

        if file.content_type.startswith(
            "image/"
        ):

            image = Image.open(
                io.BytesIO(
                    file_bytes
                )
            )


            # Convert image to RGB

            image = image.convert(
                "RGB"
            )


            # Run Tesseract OCR

            ocr_text = (
                pytesseract.image_to_string(
                    image
                )
            )


            ocr_status = (
                "completed"
            )


        # ----------------------------------------------------
        # PDF
        # ----------------------------------------------------

        else:

            ocr_status = (
                "not_available_for_pdf"
            )


    except Exception as error:

        print(
            "OCR ERROR:",
            error
        )

        ocr_status = "failed"


    # ========================================================
    # 7. DOCUMENT VALIDATION
    # ========================================================

    validation_status = "passed"


    # If image but OCR found nothing

    if (

        file.content_type.startswith(
            "image/"
        )

        and not ocr_text.strip()

    ):

        validation_status = "review"


    # ========================================================
    # 8. FACE DETECTION
    # ========================================================

    if file.content_type.startswith("image/"):

        face_detected = detect_face(
            file_bytes
        )

    else:

        face_detected = False


    if face_detected:

        face_status = (
            "detected"
        )

        face_message = (
            "Face detected in the document."
        )

    else:

        face_status = (
            "not_detected"
        )

        if file.content_type == "application/pdf":

            face_message = (
                "Face detection is currently "
                "available for image documents."
            )

        else:

            face_message = (
                "No face detected in the document."
            )


    # ========================================================
    # 9. TAMPERING DETECTION
    # ========================================================

    if file.content_type.startswith("image/"):

        tampering_analysis = detect_tampering(
            file_bytes
        )


        tampering_status = (
            tampering_analysis["status"]
        )


        tampering_result = (
            tampering_analysis["result"]
        )


        tampering_score = (
            tampering_analysis["score"]
        )


        tampering_level = (
            tampering_analysis["level"]
        )


    else:

        # ----------------------------------------------------
        # PDF tampering analysis
        # will be added in the next stage.
        # ----------------------------------------------------

        tampering_status = (
            "not_available_for_pdf"
        )


        tampering_result = (
            "Tampering analysis is currently "
            "available for image documents."
        )


        tampering_score = 0

        tampering_level = "LOW"


    # ========================================================
    # 10. RISK ASSESSMENT
    # ========================================================

    # Start with baseline risk

    risk_score = 10


    # --------------------------------------------------------
    # OCR scoring
    # --------------------------------------------------------

    if ocr_status == "failed":

        risk_score += 40


    elif ocr_status == "not_available_for_pdf":

        risk_score += 15


    elif not ocr_text.strip():

        risk_score += 30


    # --------------------------------------------------------
    # Validation scoring
    # --------------------------------------------------------

    if validation_status == "review":

        risk_score += 25


    # --------------------------------------------------------
    # Face scoring
    # --------------------------------------------------------

    if face_status == "not_detected":

        # Do not add extra risk for PDF because
        # face detection is not available for PDFs.

        if file.content_type.startswith("image/"):

            risk_score += 15


    # --------------------------------------------------------
    # Tampering scoring
    # --------------------------------------------------------

    if tampering_level == "HIGH":

        risk_score += 40


    elif tampering_level == "MEDIUM":

        risk_score += 20


    # --------------------------------------------------------
    # Keep risk score between 0 and 100
    # --------------------------------------------------------

    risk_score = min(
        max(risk_score, 0),
        100
    )


    # ========================================================
    # DETERMINE RISK LEVEL
    # ========================================================

    if risk_score >= 70:

        risk_level = "HIGH"


    elif risk_score >= 40:

        risk_level = "MEDIUM"


    else:

        risk_level = "LOW"


    # ========================================================
    # 11. RETURN SCREENING RESULT
    # ========================================================

    return {

        "success": True,

        "case_id": case_id,

        "document_type": document_type,

        "filename": file.filename,

        "file_size": len(file_bytes),

        "status": "screened",

        "message": (
            "Document screening completed."
        ),


        "analysis": {


            # =================================================
            # OCR
            # =================================================

            "ocr": {

                "status": ocr_status,

                "text": ocr_text[:5000],

            },


            # =================================================
            # DOCUMENT VALIDATION
            # =================================================

            "validation": {

                "status": validation_status,

                "document_type": document_type,

                "file_type_valid": True,

                "file_size_valid": True,

            },


            # =================================================
            # TAMPERING DETECTION
            # =================================================

            "tampering_detection": {

                "status": tampering_status,

                "result": tampering_result,

                "score": tampering_score,

                "level": tampering_level,

            },


            # =================================================
            # FACE VERIFICATION
            # =================================================

            "face_verification": {

                "status": face_status,

                "message": face_message,

            },


            # =================================================
            # RISK ASSESSMENT
            # =================================================

            "risk_assessment": {

                "status": "completed",

                "score": risk_score,

                "level": risk_level,

            }

        }

    }