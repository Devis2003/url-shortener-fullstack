import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .auth-root {
    min-height: 100vh;
    background: #0a0f1e;
    display: flex;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow: hidden;
  }

  .auth-root::before {
    content: '';
    position: absolute;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%);
    top: -150px;
    right: -150px;
    pointer-events: none;
  }

  .auth-root::after {
    content: '';
    position: absolute;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%);
    bottom: -100px;
    left: -100px;
    pointer-events: none;
  }

  .auth-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 4rem;
    position: relative;
    z-index: 1;
  }

  .auth-left-brand {
    font-family: 'DM Serif Display', serif;
    font-size: 3.5rem;
    color: #f5f0e8;
    line-height: 1.1;
    margin-bottom: 1.5rem;
  }

  .auth-left-brand em {
    font-style: italic;
    color: #f59e0b;
  }

  .auth-left-tagline {
    font-size: 1rem;
    color: #6b7280;
    font-weight: 300;
    letter-spacing: 0.02em;
    line-height: 1.7;
    max-width: 380px;
    margin-bottom: 3rem;
  }

  .auth-stat-row {
    display: flex;
    gap: 2rem;
  }

  .auth-stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .auth-stat-num {
    font-family: 'DM Mono', monospace;
    font-size: 1.6rem;
    color: #f59e0b;
    font-weight: 500;
  }

  .auth-stat-label {
    font-size: 0.75rem;
    color: #4b5563;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .auth-divider {
    width: 1px;
    background: #1a2035;
    align-self: stretch;
  }

  .auth-right {
    width: 480px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    background: #0d1424;
    border-left: 1px solid #1a2340;
    position: relative;
    z-index: 1;
  }

  .auth-card {
    width: 100%;
    max-width: 380px;
  }

  .auth-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(245,158,11,0.08);
    border: 1px solid rgba(245,158,11,0.2);
    border-radius: 100px;
    padding: 6px 14px;
    font-family: 'DM Mono', monospace;
    font-size: 0.7rem;
    color: #f59e0b;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 2rem;
  }

  .auth-badge::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #f59e0b;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }

  .auth-heading {
    font-family: 'DM Serif Display', serif;
    font-size: 2rem;
    color: #f5f0e8;
    margin-bottom: 0.5rem;
    font-weight: 400;
  }

  .auth-sub {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 2.5rem;
    font-weight: 300;
  }

  .auth-error {
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 0.8rem;
    color: #f87171;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .field {
    margin-bottom: 1.25rem;
  }

  .field-label {
    display: block;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #4b5563;
    font-family: 'DM Mono', monospace;
    margin-bottom: 8px;
  }

  .field-input {
    width: 100%;
    background: #0a0f1e;
    border: 1px solid #1e2d50;
    border-radius: 8px;
    padding: 14px 16px;
    font-size: 0.9rem;
    color: #f5f0e8;
    font-family: 'DM Sans', sans-serif;
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
  }

  .field-input:hover {
    border-color: #2a3d6b;
  }

  .field-input:focus {
    border-color: rgba(245,158,11,0.5);
    box-shadow: 0 0 0 3px rgba(245,158,11,0.06);
  }

  .field-input::placeholder {
    color: #374151;
  }

  .auth-btn {
    width: 100%;
    padding: 15px;
    background: #f59e0b;
    border: none;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    color: #0a0f1e;
    letter-spacing: 0.03em;
    cursor: pointer;
    margin-top: 0.5rem;
    transition: background 0.2s, transform 0.1s;
  }

  .auth-btn:hover {
    background: #fbbf24;
  }

  .auth-btn:active {
    transform: scale(0.99);
  }

  .auth-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .auth-footer {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #1a2340;
    text-align: center;
    font-size: 0.8rem;
    color: #6b7280;
  }

  .auth-footer a {
    color: #f59e0b;
    text-decoration: none;
    font-weight: 500;
  }

  .auth-footer a:hover {
    text-decoration: underline;
  }

  @media (max-width: 860px) {
    .auth-left {
      display: none;
    }

    .auth-right {
      width: 100%;
      border-left: none;
    }
  }
`;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post("/auth/login", formData);
      localStorage.setItem("token", response.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="auth-root">
        <div className="auth-left">
          <div className="auth-left-brand">
            Shorten.
            <br />
            Track.
            <br />
            <em>Analyze.</em>
          </div>

          <p className="auth-left-tagline">
            MiniLi is a smart URL shortening platform with JWT authentication,
            click tracking, Redis caching, and real-time analytics.
          </p>

          
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-badge">MiniLi Dashboard</div>

            <h1 className="auth-heading">Welcome back</h1>
            <p className="auth-sub">
              Sign in to manage your links and view analytics.
            </p>

            {error && (
              <div className="auth-error">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6.5" stroke="#f87171" />
                  <path
                    d="M7 4v4M7 9.5v.5"
                    stroke="#f87171"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="field">
                <label className="field-label" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  className="field-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  className="field-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in →"}
              </button>
            </form>

            <div className="auth-footer">
              Don&apos;t have an account?{" "}
              <Link to="/signup">Create one free</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;