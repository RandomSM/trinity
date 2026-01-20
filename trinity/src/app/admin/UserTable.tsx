"use client";

import { useState } from "react";
import { usersAPI } from "@/lib/api";

type User = {
  _id: string;
  email: string;
  name?: string;
};

export default function UserTable({ users, setUsers }: { users: User[], setUsers: any }) {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ email: "", name: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ email: user.email, name: user.name || "", password: "" });
    setError("");
  };

  const handleSave = async () => {
    if (!editingUser) return;

    setLoading(true);
    setError("");

    try {
      await usersAPI.adminEdit(editingUser._id, formData);
      const updatedUsers = users.map(u => u._id === editingUser._id ? { ...u, ...formData } : u);
      setUsers(updatedUsers);
      setEditingUser(null);
    } catch (err: any) {
      console.error("Error updating user:", err);
      const errorMessage = err.response?.data?.error || "Erreur lors de la mise à jour";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;

    setLoading(true);
    setError("");

    try {
      await usersAPI.adminDelete(id);
      setUsers(users.filter(u => u._id !== id));
    } catch (err: any) {
      console.error("Error deleting user:", err);
      const errorMessage = err.response?.data?.error || "Erreur lors de la suppression";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-300 rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Nom</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id} className="text-center border-b">
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.name || "-"}</td>
              <td className="p-2 flex justify-center gap-2">
                <button
                  onClick={() => handleEdit(user)}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(user._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-md"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Formulaire d'édition */}
      {editingUser && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <h2 className="font-semibold mb-2">Modifier l’utilisateur</h2>
          <input
            type="text"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="border p-2 w-full mb-2"
          />
          <input
            type="text"
            placeholder="Nom"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border p-2 w-full mb-2"
          />
          <input
            type="password"
            placeholder="Nouveau mot de passe"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="border p-2 w-full mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 text-white rounded-md"
            >
              Sauvegarder
            </button>
            <button
              onClick={() => setEditingUser(null)}
              className="px-4 py-2 bg-gray-400 text-white rounded-md"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
