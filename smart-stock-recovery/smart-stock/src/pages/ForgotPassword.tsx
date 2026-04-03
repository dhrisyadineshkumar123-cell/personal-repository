import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSendLink = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(`Reset link sent to ${email}. Continue below.`);
    setError(null);
    setStep(2);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setMessage("Password reset successful. Redirecting...");
    setTimeout(() => navigate("/login"), 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#020617] to-[#020617] p-6">

      <div className="w-full max-w-md bg-[#020617]/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl shadow-2xl shadow-blue-900/30 p-8 space-y-6">

        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">
            Reset Password
          </h1>

          <p className="text-sm text-gray-400 mt-1">
            {step === 1
              ? "Enter your SmartStock email."
              : "Create a new secure password"}
          </p>
        </div>

        {step === 1 && (
          <form className="space-y-4" onSubmit={handleSendLink}>

            <div>
              <label className="text-xs text-gray-300">
                Email
              </label>

              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"/>

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg text-sm bg-black border border-gray-700 text-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition shadow-lg shadow-blue-700/30"
            >
              Send Reset Link
            </button>

          </form>
        )}

        {step === 2 && (
          <form className="space-y-4" onSubmit={handleReset}>

            <div>
              <label className="text-xs text-gray-300">
                New Password
              </label>

              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"/>

                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e)=>setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg text-sm bg-black border border-gray-700 text-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-300">
                Confirm Password
              </label>

              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"/>

                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e)=>setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg text-sm bg-black border border-gray-700 text-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition shadow-lg shadow-blue-700/30"
            >
              Reset Password
            </button>

          </form>
        )}

        {message && (
          <p className="text-xs text-green-400">{message}</p>
        )}

        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}

        <div className="text-xs text-center">
          <Link to="/login" className="text-blue-400 hover:underline">
            Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;