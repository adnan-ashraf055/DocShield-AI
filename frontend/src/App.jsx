import ScreenDocument from "./pages/ScreenDocument";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  ShieldCheck,
  FileSearch,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Upload,
  Activity,
  ScanLine,
  UserCheck,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [backendStatus, setBackendStatus] = useState("checking");
  const [systemInfo, setSystemInfo] = useState(null);

  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    try {
      const healthResponse = await axios.get(`${API_URL}/api/health`);
      const systemResponse = await axios.get(`${API_URL}/api/system`);

      if (healthResponse.data.status === "healthy") {
        setBackendStatus("online");
      }

      setSystemInfo(systemResponse.data);
    } catch (error) {
      console.error("Backend connection failed:", error);
      setBackendStatus("offline");
    }
  };

  const stats = [
    {
      title: "Documents Screened",
      value: "1,284",
      change: "+12.5%",
      icon: FileSearch,
      className: "blue",
    },
    {
      title: "Low Risk",
      value: "989",
      change: "76.9%",
      icon: CheckCircle2,
      className: "green",
    },
    {
      title: "Manual Review",
      value: "102",
      change: "7.9%",
      icon: Clock3,
      className: "orange",
    },
    {
      title: "High Risk",
      value: "37",
      change: "2.9%",
      icon: AlertTriangle,
      className: "red",
    },
  ];

  const recentCases = [
    {
      id: "DS-2026-00125",
      document: "Passport",
      person: "John Doe",
      score: 8,
      status: "LOW",
    },
    {
      id: "DS-2026-00124",
      document: "Visa",
      person: "Sample User",
      score: 54,
      status: "REVIEW",
    },
    {
      id: "DS-2026-00123",
      document: "National ID",
      person: "Demo Person",
      score: 91,
      status: "HIGH",
    },
    {
      id: "DS-2026-00122",
      document: "Driving Licence",
      person: "Test User",
      score: 17,
      status: "LOW",
    },
  ];

  if (currentPage === "screen") {
  return (
    <ScreenDocument
      onBack={() => setCurrentPage("dashboard")}
    />
  );
}
  return (
    <div className="app">

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <ShieldCheck size={27} />
          </div>

          <div>
            <h2>DocShield</h2>
            <span>AI SECURITY PLATFORM</span>
          </div>
        </div>

        <nav className="navigation">
          <button className="nav-item active">
            <Activity size={19} />
            Dashboard
          </button>

          <button className="nav-item">
            <ScanLine size={19} />
            Screen Document
          </button>

          <button className="nav-item">
            <FileSearch size={19} />
            Screening History
          </button>

          <button className="nav-item">
            <AlertTriangle size={19} />
            Investigations
          </button>

          <button className="nav-item">
            <UserCheck size={19} />
            Officers
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="security-card">
            <ShieldCheck size={20} />
            <div>
              <strong>Secure Mode</strong>
              <span>Protected session</span>
            </div>
          </div>

          <div className="profile">
            <div className="avatar">AD</div>
            <div>
              <strong>Security Officer</strong>
              <span>Officer AD001</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main">

        {/* Header */}
        <header className="header">
          <div>
            <p className="eyebrow">SECURITY OPERATIONS</p>
            <h1>Screening Dashboard</h1>
            <p className="subtitle">
              AI-assisted identity and document screening
            </p>
          </div>

          <div className="header-actions">
            <div className={`backend-status ${backendStatus}`}>
              <span className="status-dot"></span>

              {backendStatus === "online"
                ? "Backend Online"
                : backendStatus === "offline"
                ? "Backend Offline"
                : "Connecting..."}
            </div>

            <button className="icon-button" onClick={checkBackend}>
              <RefreshCw size={18} />
            </button>

            <div className="header-avatar">AD</div>
          </div>
        </header>

        {/* Hero */}
        <section className="hero">
          <div className="hero-content">
            <div className="hero-icon">
              <ShieldCheck size={30} />
            </div>

            <div>
              <p className="hero-label">DOCSHIELD AI</p>
              <h2>Intelligent Document Screening</h2>
              <p>
                Analyze identity documents using OCR, validation,
                document forensics and biometric verification.
              </p>
            </div>
          </div>

          <button
  className="primary-button"
  onClick={() => setCurrentPage("screen")}
>
  <Upload size={19} />
  Screen New Document
  <ChevronRight size={18} />
</button>
        </section>

        {/* Statistics */}
        <section className="stats-grid">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div className="stat-card" key={stat.title}>
                <div className={`stat-icon ${stat.className}`}>
                  <Icon size={21} />
                </div>

                <div className="stat-content">
                  <span>{stat.title}</span>
                  <strong>{stat.value}</strong>
                  <small>{stat.change}</small>
                </div>
              </div>
            );
          })}
        </section>

        {/* Content Grid */}
        <section className="content-grid">

          {/* Recent Cases */}
          <div className="panel cases-panel">
            <div className="panel-header">
              <div>
                <p className="panel-label">SCREENING ACTIVITY</p>
                <h3>Recent Cases</h3>
              </div>

              <button className="text-button">
                View all
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>CASE ID</th>
                    <th>DOCUMENT</th>
                    <th>PERSON</th>
                    <th>RISK</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>
                  {recentCases.map((item) => (
                    <tr key={item.id}>
                      <td className="case-id">{item.id}</td>
                      <td>{item.document}</td>
                      <td>{item.person}</td>

                      <td>
                        <div className="risk-score">
                          <div className="risk-bar">
                            <div
                              className={`risk-fill ${item.status.toLowerCase()}`}
                              style={{ width: `${item.score}%` }}
                            ></div>
                          </div>

                          <span>{item.score}%</span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${item.status.toLowerCase()}`}
                        >
                          {item.status === "LOW" && "● "}
                          {item.status === "REVIEW" && "● "}
                          {item.status === "HIGH" && "● "}
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Modules */}
          <div className="panel modules-panel">
            <div className="panel-header">
              <div>
                <p className="panel-label">AI PIPELINE</p>
                <h3>Screening Modules</h3>
              </div>
            </div>

            <div className="modules">
              {[
                ["OCR Extraction", "Extract identity fields", "active"],
                ["Document Validation", "Check document rules", "active"],
                ["Tampering Detection", "Analyze image anomalies", "active"],
                ["Face Verification", "Compare identity photos", "active"],
                ["Risk Assessment", "Generate explainable score", "active"],
              ].map(([title, description, status]) => (
                <div className="module" key={title}>
                  <div className="module-icon">
                    <ScanLine size={18} />
                  </div>

                  <div className="module-info">
                    <strong>{title}</strong>
                    <span>{description}</span>
                  </div>

                  <span className={`module-status ${status}`}>
                    Ready
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* System Status */}
        <section className="system-section">
          <div>
            <p className="panel-label">SYSTEM STATUS</p>
            <h3>DocShield AI Services</h3>
          </div>

          <div className="service-list">
            <div className="service">
              <span className="service-dot online"></span>
              <span>API Gateway</span>
              <strong>
                {backendStatus === "online" ? "Operational" : "Offline"}
              </strong>
            </div>

            <div className="service">
              <span className="service-dot"></span>
              <span>OCR Engine</span>
              <strong>Ready</strong>
            </div>

            <div className="service">
              <span className="service-dot"></span>
              <span>Risk Engine</span>
              <strong>Ready</strong>
            </div>

            <div className="service">
              <span className="service-dot"></span>
              <span>Database</span>
              <strong>Development</strong>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer>
          <span>DocShield AI • SIH26188</span>
          <span>
            {systemInfo?.purpose ||
              "AI-Based Fake Identity & Document Screening System"}
          </span>
        </footer>

      </main>
    </div>
  );
}

export default App;