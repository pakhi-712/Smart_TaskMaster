import { useState } from "react";
import { register, saveToken, saveUser } from "../api/authApi";

interface RegisterProps {
  onSuccess: (name: string) => void;
  onSwitchToLogin: () => void;
}

// Predefined security questions the user picks from
const SECURITY_QUESTIONS = [
  "What is your pet's name?",
  "What city were you born in?",
  "What is your mother's maiden name?",
  "What was the name of your first school?",
  "What is your favorite movie?",
];

function Register({ onSuccess, onSwitchToLogin }: RegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");

    if (!name || !email || !password || !confirmPassword || !securityAnswer) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await register({
        name, email, password, confirmPassword,
        securityQuestion, securityAnswer
      });
      saveToken(response.token);
      saveUser(response.name, response.email);
      onSuccess(response.name);

    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(err.response.data.error || "Registration failed");
      } else {
        setError("Cannot connect to server");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="auth-subtitle">Start managing your tasks</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-form">
          <label>Name</label>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
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
						  )}            </button>
          </div>

          <label>Confirm Password</label>
          <div className="password-field">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Type your password again"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
			{showConfirmPassword ? (
									    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
									      <line x1="1" y1="1" x2="23" y2="23"></line>
									    </svg>
									  ) : (
									    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
									      <circle cx="12" cy="12" r="3"></circle>
									    </svg>
									  )}            </button>
          </div>

          <label>Security Question</label>
          <select
            value={securityQuestion}
            onChange={(e) => setSecurityQuestion(e.target.value)}
          >
            {SECURITY_QUESTIONS.map((q) => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>

          <label>Security Answer</label>
          <input
            type="text"
            placeholder="Your answer (used for password recovery)"
            value={securityAnswer}
            onChange={(e) => setSecurityAnswer(e.target.value)}
          />

          <button className="auth-button" onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </div>

        <p className="auth-switch">
          Already have an account?{" "}
          <span onClick={onSwitchToLogin}>Log in</span>
        </p>
      </div>
    </div>
  );
}
export default Register;
