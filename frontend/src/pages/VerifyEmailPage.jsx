import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import { MailCheckIcon } from "lucide-react";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

function VerifyEmailPage() {
  const { user, setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  
  const email = location.state?.email || user?.email;

  useEffect(() => {
    if (!email) {
      navigate("/login", { replace: true });
    }
  }, [email, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post("/auth/verify-email", { code });
      setSuccess(true);
      if (user) {
        setUser({ ...user, emailVerified: true });
      }
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Verification failed. Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError(null);
    try {
      await api.post("/auth/resend-otp");
      alert("A new verification code has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  }

  if (!email) return null;

  return (
    <div className="flex flex-col items-center justify-center py-24 sm:px-6 lg:px-8 lg:py-32">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <MailCheckIcon className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-base-content">
          Verify your email
        </h2>
        <p className="mt-2 text-center text-sm text-base-content/60">
          We sent a 6-digit code to <span className="font-medium text-base-content">{email}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card border border-base-300 bg-base-100 py-8 px-4 shadow-xl sm:px-10">
          {success ? (
            <div className="text-center">
              <div className="alert alert-success text-sm">
                <span>Email verified successfully! Redirecting...</span>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="alert alert-error text-sm">
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="label">
                  <span className="label-text font-medium">Verification Code</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  className="input input-bordered w-full tracking-widest text-center text-2xl font-mono"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="------"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="btn btn-primary w-full"
                >
                  {loading ? <span className="loading loading-spinner loading-sm" /> : "Verify Email"}
                </button>
              </div>
            </form>
          )}

          {!success && (
            <div className="mt-6 text-center text-sm">
              <span className="text-base-content/70">Didn't receive the code? </span>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="link-hover link-primary font-medium disabled:opacity-50"
              >
                {resending ? "Sending..." : "Resend it"}
              </button>
            </div>
          )}
          
          <div className="mt-4 text-center text-sm">
             <Link to="/" className="link-hover text-base-content/60">
               Return to shop
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailPage;
