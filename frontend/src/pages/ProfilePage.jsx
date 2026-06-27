import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";
import { UserIcon, MailIcon, KeyRoundIcon, SaveIcon, CheckIcon } from "lucide-react";

function ProfilePage() {
  const { user, setUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const { data } = await api.patch("/auth/me", { displayName });
      setUser((prev) => ({ ...prev, ...data }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwLoading(true);
    setPwError(null);
    setPwSuccess(false);

    try {
      await api.post("/auth/change-password", { currentPassword, newPassword });
      setPwSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) {
      setPwError(err.response?.data?.error || "Failed to change password");
    } finally {
      setPwLoading(false);
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-8 text-left">
      <div className="flex items-center gap-3">
        <UserIcon className="size-7 text-primary" aria-hidden />
        <h1 className="text-2xl font-bold text-base-content">Profile</h1>
      </div>

      {/* Profile info */}
      <div className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-lg">Account Information</h2>

          <div className="flex items-center gap-3 mt-2 rounded-lg bg-base-200 p-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-base-300 border border-base-300 overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="size-14 object-cover" />
              ) : (
                <UserIcon className="size-6 text-base-content/40" />
              )}
            </div>
            <div>
              <p className="font-semibold text-base-content">{user.displayName}</p>
              <p className="flex items-center gap-1 text-sm text-base-content/60">
                <MailIcon className="size-3.5" aria-hidden />
                {user.email}
                {user.emailVerified && (
                  <CheckIcon className="size-3.5 text-success ml-1" aria-label="Verified" />
                )}
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
            {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

            <div>
              <label className="label">
                <span className="label-text font-medium">Display Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                minLength={2}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary gap-2"
            >
              {saving ? (
                <span className="loading loading-spinner loading-sm" />
              ) : saved ? (
                <CheckIcon className="size-4" />
              ) : (
                <SaveIcon className="size-4" />
              )}
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </form>
        </div>
      </div>

      {/* Change password */}
      <div className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-lg flex items-center gap-2">
            <KeyRoundIcon className="size-5" aria-hidden />
            Change Password
          </h2>

          <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
            {pwError && <div className="alert alert-error text-sm"><span>{pwError}</span></div>}
            {pwSuccess && <div className="alert alert-success text-sm"><span>Password changed successfully</span></div>}

            <div>
              <label className="label">
                <span className="label-text font-medium">Current Password</span>
              </label>
              <input
                type="password"
                className="input input-bordered w-full"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">New Password</span>
              </label>
              <input
                type="password"
                className="input input-bordered w-full"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={pwLoading}
              className="btn btn-outline gap-2"
            >
              {pwLoading ? <span className="loading loading-spinner loading-sm" /> : <KeyRoundIcon className="size-4" />}
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
