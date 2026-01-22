"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authAPI.register({ 
        email, 
        password, 
        firstName, 
        lastName,
        phone: phone || undefined
      });

      router.push("/login?registered=true");
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.error || "Erreur lors de l'inscription";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-green-50 px-4 py-12">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Inscription</h1>
          <p className="text-gray-600">Créez votre compte en quelques secondes</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          {error && (
            <div className="alert alert-error rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Prénom *</span>
              </label>
              <input
                type="text"
                placeholder="Jean"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input input-bordered rounded-full w-full"
                required
                disabled={loading}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Nom *</span>
              </label>
              <input
                type="text"
                placeholder="Dupont"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input input-bordered rounded-full w-full"
                required
                disabled={loading}
              />
            </div>
          </div>

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

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Téléphone (optionnel)</span>
            </label>
            <input
              type="tel"
              placeholder="06 12 34 56 78"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input input-bordered rounded-full w-full"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn w-full bg-[#52B46B] hover:bg-[#449958] text-white text-lg border-none rounded-full shadow-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Inscription...
              </>
            ) : (
              "S'inscrire"
            )}
          </button>
        </form>

        <div className="divider mt-8">OU</div>

        <Link href="/login" className="btn w-full bg-[#FF6F00] hover:bg-[#FF8F00] text-white text-lg border-none rounded-full shadow-lg">
          J'ai déjà un compte
        </Link>
      </div>
    </div>
  );
}
