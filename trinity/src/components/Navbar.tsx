"use client";

import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@shop/store";
import { logout } from "@shop/userSlice";
import { clearCart } from "@shop/cartSlice";
import { authAPI } from "@/lib/api";
import { ShoppingCartIcon, UserIcon, ArrowRightOnRectangleIcon, Cog6ToothIcon, ChartBarIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();

  const handleLogout = () => {
    // Dispatch Redux logout actions
    dispatch(logout());
    dispatch(clearCart());
    
    // Use the API client to logout (clears localStorage and redirects)
    authAPI.logout();
  };

  return (
    <nav className="bg-gradient-to-r from-[#FF6F00] to-[#FF8F00] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="font-bold text-xl sm:text-2xl hover:opacity-80 transition-all duration-300 hover:scale-105 flex-shrink-0">
            OpenFoodMarket
          </Link>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {/* User Auth Buttons */}
            {user ? (
              <>
                {user.isAdmin && (
                  <>
                    <Link href="/admin/dashboard" className="btn btn-sm sm:btn-md bg-white/20 text-white border-none hover:bg-white/30 hover:scale-105 transition-all duration-300 shadow-lg gap-1 sm:gap-2 rounded-full px-3 sm:px-6">
                      <ChartBarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">KPIs</span>
                    </Link>
                    <Link href="/admin" className="btn btn-sm sm:btn-md bg-white/20 text-white border-none hover:bg-white/30 hover:scale-105 transition-all duration-300 shadow-lg gap-1 sm:gap-2 rounded-full px-3 sm:px-6">
                      <Cog6ToothIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">Admin</span>
                    </Link>
                  </>
                )}
                <Link href="/profile" className="btn btn-sm sm:btn-md bg-white/20 text-white border-none hover:bg-white/30 hover:scale-105 transition-all duration-300 shadow-lg gap-1 sm:gap-2 rounded-full px-3 sm:px-6">
                  <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Profil</span>
                </Link>
                <button onClick={handleLogout} className="btn btn-sm sm:btn-md bg-white/20 text-white border-none hover:bg-white/30 hover:scale-105 transition-all duration-300 shadow-lg gap-1 sm:gap-2 rounded-full px-3 sm:px-6">
                  <ArrowRightOnRectangleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </>
            ) : (
              <Link href="/login" className="btn btn-sm sm:btn-md bg-white/20 text-white border-none hover:bg-white/30 hover:scale-105 transition-all duration-300 shadow-lg gap-1 sm:gap-2 rounded-full px-3 sm:px-6">
                <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Connexion</span>
              </Link>
            )}

            {/* Cart Button */}
            <Link href="/panier" className="btn btn-sm sm:btn-md bg-[#52B46B] text-white border-none hover:bg-[#449958] hover:scale-105 transition-all duration-300 shadow-lg gap-1 sm:gap-2 rounded-full px-3 sm:px-6">
              <ShoppingCartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Panier</span>
              {cartCount > 0 && (
                <span className="hidden sm:inline">:</span>
              )}
              {cartCount > 0 && (
                <span className="text-white font-bold">{cartCount}</span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
