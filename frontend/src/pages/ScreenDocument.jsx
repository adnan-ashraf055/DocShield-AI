import { useRef, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Upload,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  X,
  CheckCircle2,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function ScreenDocument({ onBack }) {
  const fileInputRef = useRef(null);

  const [documentType, setDocumentType] = useState("Passport");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setMessage("Please upload JPG, PNG, WEBP or PDF files.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setMessage("File size must be below 10 MB.");
      return;
    }

    setFile(selectedFile);
    setMessage("");
    setAnalysisResult(null);

    if (selectedFile.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);

    const droppedFile = event.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setMessage("");
    setAnalysisResult(null);
  };

  const analyzeDocument = async () => {
    if (!file) {
      setMessage("Please upload a document first.");
      return;
    }

    setUploading(true);
    setMessage("");
    setAnalysisResult(null);

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("document_type", documentType);

      const response = await axios.post(
        `${API_URL}/api/documents/analyze`,
        formData
      );

      console.log("Backend response:", response.data);

      if (response.data.success) {
        setAnalysisResult(response.data);
        setMessage("Document analyzed successfully.");
      } else {
        setMessage(response.data.error || "Analysis failed.");
      }
    } catch (error) {
      console.error("Analysis error:", error);

      setMessage(
        error.response?.data?.detail ||
          "Unable to connect to the backend."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="screen-page">

      {/* HEADER */}
      <div className="screen-header">

        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div>
          <p className="panel-label">DOCUMENT SCREENING</p>

          <h1>Screen New Document</h1>

          <p>
            Upload an identity document to begin AI-assisted screening.
          </p>
        </div>

        <div className="secure-indicator">
          <ShieldCheck size={17} />
          Secure Screening
        </div>

      </div>

      {/* MAIN CONTENT */}
      <div className="screen-layout">

        {/* LEFT CARD */}
        <div className="screen-card">

          <div className="card-heading">

            <div>
              <p className="panel-label">STEP 01</p>
              <h2>Document Information</h2>
            </div>

            <FileText size={23} />

          </div>

          <label className="field-label">
            Document Type
          </label>

          <select
            value={documentType}
            onChange={(event) =>
              setDocumentType(event.target.value)
            }
            className="document-select"
          >
            <option>Passport</option>
            <option>Visa</option>
            <option>National ID</option>
            <option>Driving Licence</option>
            <option>Permit</option>
          </select>

          <label className="field-label upload-label">
            Document
          </label>

          {!file ? (

            <div
              className={`drop-zone ${
                dragging ? "dragging" : ""
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() =>
                fileInputRef.current?.click()
              }
            >

              <div className="upload-icon">
                <Upload size={25} />
              </div>

              <h3>
                Drop your document here
              </h3>

              <p>
                or{" "}
                <span>
                  browse from your computer
                </span>
              </p>

              <small>
                JPG, PNG, WEBP or PDF • Maximum 10 MB
              </small>

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                hidden
                onChange={(event) =>
                  handleFile(event.target.files[0])
                }
              />

            </div>

          ) : (

            <div className="file-preview">

              <div className="file-preview-top">

                <div className="file-name-area">

                  {preview ? (

                    <img
                      src={preview}
                      alt="Document preview"
                      className="document-preview"
                    />

                  ) : (

                    <div className="pdf-preview">
                      <FileText size={30} />
                    </div>

                  )}

                  <div>

                    <strong>
                      {file.name}
                    </strong>

                    <span>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>

                    <span className="uploaded-status">
                      <CheckCircle2 size={13} />
                      Ready for analysis
                    </span>

                  </div>

                </div>

                <button
                  className="remove-button"
                  onClick={removeFile}
                >
                  <X size={17} />
                </button>

              </div>

            </div>

          )}

          {message && (
            <div className="upload-message">
              {message}
            </div>
          )}

          <button
            className="analyze-button"
            onClick={analyzeDocument}
            disabled={!file || uploading}
          >

            <ShieldCheck size={19} />

            {uploading
              ? "Starting Analysis..."
              : "Analyze Document"}

          </button>

          {/* ANALYSIS RESULT */}

          {analysisResult && (

            <div className="analysis-result">

              <div className="result-header">

                <div>
                  <p className="panel-label">
                    SCREENING RESULT
                  </p>

                  <h2>
                    Document Analysis Complete
                  </h2>
                </div>

                <CheckCircle2 size={28} />

              </div>

              <div className="result-info-grid">

                <div>
                  <span>CASE ID</span>

                  <strong>
                    {analysisResult.case_id}
                  </strong>
                </div>

                <div>
                  <span>DOCUMENT TYPE</span>

                  <strong>
                    {analysisResult.document_type}
                  </strong>
                </div>

                <div>
                  <span>FILE</span>

                  <strong>
                    {analysisResult.filename}
                  </strong>
                </div>

                <div>
                  <span>RISK SCORE</span>

                  <strong>
                    {analysisResult.analysis?.risk_assessment?.score ??
                      "N/A"}
                  </strong>
                </div>

              </div>

              <div className="analysis-modules">

                <div>
                  <span>OCR Extraction</span>

                  <strong>
                    {analysisResult.analysis?.ocr?.status}
                  </strong>
                </div>

                <div>
                  <span>Document Validation</span>

                  <strong>
                    {analysisResult.analysis?.validation?.status}
                  </strong>
                </div>

                <div>
                  <span>Tampering Detection</span>

                  <strong>
                    {analysisResult.analysis?.tampering_detection
                      ?.result ||
                      analysisResult.analysis?.tampering_detection
                        ?.status}
                  </strong>
                </div>

                <div>
                  <span>Face Verification</span>

                  <strong>
                    {analysisResult.analysis?.face_verification
                      ?.status}
                  </strong>
                </div>

                <div>
                  <span>Risk Assessment</span>

                  <strong>
                    {analysisResult.analysis?.risk_assessment
                      ?.level}
                  </strong>
                </div>

              </div>

            </div>

          )}

        </div>

        {/* RIGHT CARD */}

        <div className="screen-card process-card">

          <div className="card-heading">

            <div>
              <p className="panel-label">
                AI PIPELINE
              </p>

              <h2>
                What happens next?
              </h2>
            </div>

            <ImageIcon size={23} />

          </div>

          <div className="process-list">

            <div className="process-step">

              <div className="step-number">
                01
              </div>

              <div>
                <strong>
                  OCR Extraction
                </strong>

                <p>
                  Extract name, DOB, nationality,
                  document number and other fields.
                </p>
              </div>

            </div>

            <div className="process-step">

              <div className="step-number">
                02
              </div>

              <div>
                <strong>
                  Document Validation
                </strong>

                <p>
                  Check expiry, required fields,
                  formats and internal consistency.
                </p>
              </div>

            </div>

            <div className="process-step">

              <div className="step-number">
                03
              </div>

              <div>
                <strong>
                  Tampering Detection
                </strong>

                <p>
                  Analyze suspicious image regions
                  and possible manipulation.
                </p>
              </div>

            </div>

            <div className="process-step">

              <div className="step-number">
                04
              </div>

              <div>
                <strong>
                  Face Verification
                </strong>

                <p>
                  Compare the document portrait with
                  a provided identity image.
                </p>
              </div>

            </div>

            <div className="process-step">

              <div className="step-number">
                05
              </div>

              <div>
                <strong>
                  Risk Assessment
                </strong>

                <p>
                  Combine evidence into an explainable
                  low, medium or high-risk assessment.
                </p>
              </div>

            </div>

          </div>

          <div className="privacy-note">

            <ShieldCheck size={18} />

            <div>

              <strong>
                Privacy First
              </strong>

              <p>
                Demo screening should use synthetic or
                consented documents. Sensitive identity
                information should never be committed to GitHub.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ScreenDocument;