import { useState } from "react";
import { login, saveToken, saveUser, forgotPassword, resetPassword } from "../api/authApi";

interface LoginProps {
  onSuccess: (name: string) => void;
  onSwitchToRegister: () => void;
}

function Login({ onSuccess, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Forgot password state
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit() {
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const response = await login({ email, password });
      saveToken(response.token);
      saveUser(response.name, response.email);
      onSuccess(response.name);
    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(err.response.data.error || "Login failed");
      } else {
        setError("Cannot connect to server");
      }
    } finally {
      setLoading(false);
    }
  }

  // Step 1: Submit email to get security question
  async function handleForgotSubmitEmail() {
    setError("");
    if (!forgotEmail) {
      setError("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const question = await forgotPassword(forgotEmail);
      setSecurityQuestion(question);
      setForgotStep(2);
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Answer security question + set new password
  async function handleResetPassword() {
    setError("");
    if (!securityAnswer || !newPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const msg = await resetPassword(forgotEmail, securityAnswer, newPassword);
      setSuccessMessage(msg);
      // Reset everything after 3 seconds
      setTimeout(() => {
        setForgotMode(false);
        setForgotStep(1);
        setForgotEmail("");
        setSecurityQuestion("");
        setSecurityAnswer("");
        setNewPassword("");
        setSuccessMessage("");
      }, 3000);
    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(err.response.data.error || "Reset failed");
      } else {
        setError("Cannot connect to server");
      }
    } finally {
      setLoading(false);
    }
  }

  // ---- Forgot password UI ----
  if (forgotMode) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>Reset Password</h1>
          <p className="auth-subtitle">
            {forgotStep === 1 ? "Enter your email to get started" : securityQuestion}
          </p>

          {error && <div className="auth-error">{error}</div>}
          {successMessage && <div className="auth-success">{successMessage}</div>}

          <div className="auth-form">
            {forgotStep === 1 ? (
              <>
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
                <button className="auth-button" onClick={handleForgotSubmitEmail} disabled={loading}>
                  {loading ? "Checking..." : "Next"}
                </button>
              </>
            ) : (
              <>
                <label>Your Answer</label>
                <input
                  type="text"
                  placeholder="Answer the security question"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                />
                <label>New Password</label>
                <div className="password-field">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
									    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
									      <line x1="1" y1="1" x2="23" y2="23"></line>
									    </svg>
									  ) : (
									    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
									      <circle cx="12" cy="12" r="3"></circle>
									    </svg>
									  )}
                  </button>
                </div>
                <button className="auth-button" onClick={handleResetPassword} disabled={loading}>
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </>
            )}
          </div>

          <p className="auth-switch">
            <span onClick={() => { setForgotMode(false); setError(""); }}>
              Back to Login
            </span>
          </p>
        </div>
      </div>
    );
  }

  // ---- Normal login UI ----
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome Back!</h1>
        <p className="auth-subtitle">Log In</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-form">
          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="toggle-password"
              //onClick={() => setShowPassword(!showPassword)}
            >
			{showPassword ? (
									    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
									      <line x1="1" y1="1" x2="23" y2="23"></line>
									    </svg>
									  ) : (
									    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
									      <circle cx="12" cy="12" r="3"></circle>
									    </svg>
									  )} 
            </button>
          </div>

          <p className="forgot-link" onClick={() => { setForgotMode(true); setError(""); }}>
            Forgot password?
          </p>

          <button className="auth-button" onClick={handleSubmit} disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </div>

        <p className="auth-switch">
          Don't have an account?{" "}
          <span onClick={onSwitchToRegister}>Sign up</span>
        </p>
      </div>
    </div>
  );
}
export default Login;
