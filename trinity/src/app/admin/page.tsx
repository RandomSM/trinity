"use client";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@shop/store";
import { setUser } from "@shop/userSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI, usersAPI } from "@/lib/api";
import KPIDashboard from "@/components/KPIDashboard";

interface User {
  _id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  isAdmin: boolean;
}

export default function AdminUsersPage() {
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<'kpi' | 'users'>('kpi');

  useEffect(() => {
    const checkAuth = async () => {
      if (!user) {
        // Check if user is authenticated
        if (!authAPI.isAuthenticated()) {
          router.push("/login");
          return;
        }

        try {
          // Get current user from backend
          const userData = await authAPI.getCurrentUser();
          dispatch(setUser({
            email: userData.email,
            id: userData._id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            billing: userData.billing,
            isAdmin: userData.isAdmin
          }));
          
          if (!userData.isAdmin) {
            router.push("/");
            return;
          }
          
          setCheckingAuth(false);
        } catch (err) {
          console.error("Error checking auth:", err);
          router.push("/login");
        }
      } else {
        if (!user.isAdmin) {
          router.push("/");
          return;
        }
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [user, dispatch, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (checkingAuth || !user?.isAdmin) return;

      try {
        setLoading(true);
        const usersData = await usersAPI.getAll();
        setUsers(usersData);
      } catch (err: any) {
        console.error("Error fetching users:", err);
        const errorMessage = err.response?.data?.error || "Erreur lors du chargement des utilisateurs";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [checkingAuth, user]);

  if (checkingAuth || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-[#FF6F00]"></span>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#FF6F00] to-[#FF8F00] px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Panneau d'administration</h1>
            <p className="text-white/90 mt-2">Tableau de bord et gestion des utilisateurs</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'kpi'
                  ? 'text-[#FF6F00] border-b-2 border-[#FF6F00]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('kpi')}
            >
              📊 Tableau de Bord KPI
            </button>
            <button
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'users'
                  ? 'text-[#FF6F00] border-b-2 border-[#FF6F00]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('users')}
            >
              👥 Gestion des Utilisateurs ({users.length})
            </button>
          </div>

          <div className="p-8">
            {error && (
              <div className="alert alert-error mb-6 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* KPI Dashboard Tab */}
            {activeTab === 'kpi' && <KPIDashboard />}

            {/* Users Management Tab */}
            {activeTab === 'users' && (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Liste des utilisateurs ({users.length})
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="rounded-tl-xl">Email</th>
                        <th>Prénom</th>
                        <th>Nom</th>
                        <th>Téléphone</th>
                        <th>Admin</th>
                        <th className="rounded-tr-xl">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-gray-50">
                          <td className="font-medium">{u.email}</td>
                          <td>{u.firstName || "—"}</td>
                          <td>{u.lastName || "—"}</td>
                          <td>{u.phone || "—"}</td>
                          <td>
                            {u.isAdmin ? (
                              <span className="badge badge-success text-white">Oui</span>
                            ) : (
                              <span className="badge badge-ghost">Non</span>
                            )}
                          </td>
                          <td>
                            <Link
                              href={`/admin/users/${u._id}`}
                              className="btn btn-sm bg-[#FF6F00] hover:bg-[#FF8F00] text-white border-none rounded-full text-sm h-auto py-2 px-4"
                            >
                              Voir détails
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
