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

  .auth-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 4rem;
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
    line-height: 1.7;
    max-width: 380px;
  }

  .auth-right {
    width: 480px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    background: #0d1424;
    border-left: 1px solid #1a2340;
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
  }

  .auth-error {
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 0.8rem;
    color: #f87171;
    margin-bottom: 1.5rem;
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
    outline: none;
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
    cursor: pointer;
    margin-top: 0.5rem;
  }

  .auth-btn:hover {
    background: #fbbf24;
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

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/signup", {
        email,
        password,
      });

      navigate("/");
    } catch (err) {
      setError("Signup failed. This email may already be in use.");
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
            Create.
            <br />
            Shorten.
            <br />
            <em>Track.</em>
          </div>

          <p className="auth-left-tagline">
            Create your MiniLi account and start managing short links with
            real-time click analytics.
          </p>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-badge">MiniLi Signup</div>

            <h1 className="auth-heading">Create account</h1>
            <p className="auth-sub">
              Start shortening links and tracking clicks in seconds.
            </p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSignup}>
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
                  autoComplete="new-password"
                />
              </div>

              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Create account →"}
              </button>
            </form>

            <div className="auth-footer">
              Already have an account? <Link to="/">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;