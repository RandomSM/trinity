"use client";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { setUser } from "@shop/userSlice";
import Link from "next/link";
import { authAPI } from "@/lib/api";

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if redirected due to token expiration
    if (searchParams.get('expired') === 'true') {
      setError("Votre session a expiré. Veuillez vous reconnecter.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authAPI.login(email, password);
      
      // Update Redux store with user data
      dispatch(setUser({ 
        email: data.user.email, 
        id: data.user._id, 
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        phone: data.user.phone,
        billing: data.user.billing,
        isAdmin: data.user.isAdmin 
      }));
      
      // Redirect to homepage or admin if admin user
      if (data.user.isAdmin) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.error || "Email ou mot de passe incorrect";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-green-50 px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Connexion</h1>
          <p className="text-gray-600">Bienvenue ! Connectez-vous à votre compte</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="alert alert-error rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Email *</span>
            </label>
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered rounded-full w-full"
              required
              disabled={loading}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Mot de passe *</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered rounded-full w-full"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn w-full bg-[#FF6F00] hover:bg-[#FF8F00] text-white text-lg border-none rounded-full shadow-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner"></span>
                Connexion...
              </>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        <div className="divider mt-8">OU</div>

        <Link href="/register" className="btn w-full bg-[#52B46B] hover:bg-[#449958] text-white text-lg border-none rounded-full shadow-lg">
          Créer un compte
        </Link>
      </div>
    </div>
  );
}
