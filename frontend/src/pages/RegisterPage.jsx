import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { UserPlusIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { GoogleLogin } from "@react-oauth/google";

function RegisterPage() {
  const { register, googleAuth } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await register(email, password, displayName);
      navigate("/verify-email", { state: { email: user.email } });
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    try {
      setLoading(true);
      await googleAuth(credentialResponse.credential);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Google authentication failed.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-base-content">
          Create an account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card border border-base-300 bg-base-100 py-8 px-4 shadow-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
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
              <label className="label">
                <span className="label-text font-medium">Display Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <input
                type="password"
                required
                minLength={8}
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full gap-2"
              >
                {loading ? <span className="loading loading-spinner loading-sm" /> : <UserPlusIcon className="size-5" />}
                Sign up
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-base-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-base-100 px-2 text-base-content/60">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Sign-In failed")}
                useOneTap
              />
            </div>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-base-content/70">Already have an account? </span>
            <Link to="/login" className="link-hover link-primary font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
