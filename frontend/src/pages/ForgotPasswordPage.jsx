import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { KeyRoundIcon, ArrowRightIcon } from "lucide-react";
import { api } from "../lib/api.js";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1); // 1: email, 2: code & new password
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleRequestReset(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post("/auth/reset-password", { email, code, newPassword });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Reset failed. Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <KeyRoundIcon className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-base-content">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-base-content/60">
          {step === 1 ? "Enter your email to receive a reset code." : "Enter the code sent to your email and your new password."}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card border border-base-300 bg-base-100 py-8 px-4 shadow-xl sm:px-10">
          {success ? (
            <div className="text-center">
              <div className="alert alert-success text-sm">
                <span>Password reset successfully! Redirecting to login...</span>
              </div>
            </div>
          ) : step === 1 ? (
            <form className="space-y-6" onSubmit={handleRequestReset}>
              {error && (
                <div className="alert alert-error text-sm">
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="label">
                  <span className="label-text font-medium">Email address</span>
                </label>
                <input
                  type="email"
                  required
                  className="input input-bordered w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full gap-2"
                >
                  {loading ? <span className="loading loading-spinner loading-sm" /> : "Send Reset Code"}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleResetPassword}>
              {error && (
                <div className="alert alert-error text-sm">
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="label">
                  <span className="label-text font-medium">Reset Code</span>
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
                <label className="label">
                  <span className="label-text font-medium">New Password</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  className="input input-bordered w-full"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || code.length !== 6 || newPassword.length < 8}
                  className="btn btn-primary w-full gap-2"
                >
                  {loading ? <span className="loading loading-spinner loading-sm" /> : <ArrowRightIcon className="size-5" />}
                  Reset Password
                </button>
              </div>
              
              <div className="mt-4 text-center text-sm">
                 <button
                   type="button"
                   onClick={() => setStep(1)}
                   className="link-hover link-primary font-medium"
                 >
                   Back to email
                 </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <Link to="/login" className="link-hover text-base-content/60 font-medium">
              Return to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
