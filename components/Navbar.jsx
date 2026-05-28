'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, Leaf, User, LogOut, LayoutDashboard, Settings, Plus, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import api from '@/utils/api';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, isAuthenticated, isFarmer, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchUnread = () =>
      api.get('/messages').then((r) => {
        const total = (r.data.conversations || []).reduce((s, c) => s + (c.unread || 0), 0);
        setUnreadMessages(total);
      }).catch(() => {});
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const isActive = (p) => pathname === p;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              F2C<span className="text-green-600">.</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'}`}>
              Home
            </Link>
            <Link href="/products" className={`text-sm font-medium transition-colors ${pathname === '/products' ? 'text-green-600' : 'text-gray-700 hover:text-green-600'}`}>
              Products
            </Link>
            <Link href="/farmers" className={`text-sm font-medium transition-colors ${pathname.startsWith('/farmers') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'}`}>
              Farmers
            </Link>
            {isAdmin && (
              <Link href="/admin/products" className={`flex items-center gap-1 text-sm font-medium transition-colors ${pathname === '/admin/products' ? 'text-green-600' : 'text-gray-700 hover:text-green-600'}`}>
                <Plus className="w-4 h-4" /> Edit Products
              </Link>
            )}
            {isFarmer && (
              <Link href="/farmer/dashboard" className={`text-sm font-medium transition-colors ${pathname.startsWith('/farmer') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'}`}>
                Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" className={`text-sm font-medium transition-colors ${pathname.startsWith('/admin') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'}`}>
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-3">
            {isAuthenticated && (
              <Link href="/messages" className="relative p-2 text-gray-600 hover:text-green-600 transition-colors">
                <MessageSquare className="w-6 h-6" />
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {unreadMessages}
                  </span>
                )}
              </Link>
            )}
            {!isFarmer && !isAdmin && (
              <Link href="/cart" className="relative p-2 text-gray-600 hover:text-green-600 transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2 transition-colors"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center text-xs font-bold text-green-700">
                      {user?.name?.[0]?.toUpperCase() || <User className="w-3 h-3" />}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name?.split(' ')[0]}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium hidden sm:block ${
                    user?.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    user?.role === 'farmer' ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {user?.role}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <Link href="/profile" onClick={() => setProfileOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <User className="w-4 h-4 mr-3 text-green-600" /> My Profile
                    </Link>
                    <Link href="/messages" onClick={() => setProfileOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <MessageSquare className="w-4 h-4 mr-3 text-green-600" /> Messages
                      {unreadMessages > 0 && <span className="ml-auto bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unreadMessages}</span>}
                    </Link>
                    {!isFarmer && !isAdmin && (
                      <Link href="/orders" onClick={() => setProfileOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <LayoutDashboard className="w-4 h-4 mr-3 text-green-600" /> My Orders
                      </Link>
                    )}
                    {isFarmer && (
                      <Link href="/farmer/dashboard" onClick={() => setProfileOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Settings className="w-4 h-4 mr-3 text-green-600" /> Dashboard
                      </Link>
                    )}
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setProfileOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Settings className="w-4 h-4 mr-3 text-green-600" /> Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button onClick={() => { logout(); setProfileOpen(false); }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <LogOut className="w-4 h-4 mr-3" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors px-3 py-2">
                  Login
                </Link>
                <Link href="/register" className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Register
                </Link>
              </div>
            )}

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-600">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
            <Link href="/" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-600">Home</Link>
            <Link href="/products" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-600">Products</Link>
            <Link href="/farmers" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-600">Farmers</Link>
            {isAdmin && <Link href="/admin/products" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-600">Edit Products</Link>}
            {isAuthenticated && <Link href="/messages" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-600">Messages</Link>}
            {isAuthenticated && <Link href="/profile" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-600">My Profile</Link>}
            {isFarmer && <Link href="/farmer/dashboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-600">Dashboard</Link>}
            {isAdmin && <Link href="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-600">Admin</Link>}
            {!isAuthenticated && (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700">Login</Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-green-600">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
