import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart3,
  Users,
  Activity,
  CreditCard,
  TrendingUp,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  Shield,
  Bell,
  ChevronDown,
  Home,
  Command,
  Zap,
} from "lucide-react";

export default function NavigationAdmin() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [notifications] = useState(3); // Mock notification count
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsCommandPaletteOpen(false);
  }, [router.pathname]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Command palette: Cmd/Ctrl + K
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      // Escape to close modals
      if (event.key === "Escape") {
        setIsCommandPaletteOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: BarChart3,
      description: "Overview & Analytics",
      badge: null,
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
      description: "User Management",
      badge: null,
      color: "from-green-500 to-green-600",
    },
    {
      name: "Auto Trading",
      href: "/admin/auto-trading",
      icon: Activity,
      description: "Trading Controls",
      badge: "Live",
      color: "from-orange-500 to-orange-600",
    },
    {
      name: "Trading Settings",
      href: "/admin/trading-settings",
      icon: TrendingUp,
      description: "Trading Configuration",
      badge: null,
      color: "from-purple-500 to-purple-600",
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      description: "System Configuration",
      badge: null,
      color: "from-slate-500 to-slate-600",
    },
  ];

  return (
    <>
      <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-2xl border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center justify-between w-full">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link
                  href="/admin"
                  className="flex items-center space-x-3 group"
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-purple-300 transition-all duration-300">
                      Admin Panel
                    </span>
                    <p className="text-xs text-slate-400 font-medium">
                      Management Dashboard
                    </p>
                  </div>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden lg:ml-8 lg:flex lg:space-x-1 xl:space-x-2">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = router.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group relative inline-flex items-center px-3 xl:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10"
                          : "text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 hover:shadow-lg"
                      }`}
                    >
                      <IconComponent
                        className={`w-4 h-4 mr-2 transition-all duration-300 ${
                          isActive
                            ? "text-blue-400"
                            : "text-slate-400 group-hover:text-white"
                        }`}
                      />
                      <span className="whitespace-nowrap">{item.name}</span>
                      {item.badge && (
                        <span
                          className={`ml-2 px-2 py-0.5 text-xs rounded-full font-medium whitespace-nowrap ${
                            item.badge === "Live"
                              ? "bg-green-500/20 text-green-400 animate-pulse"
                              : "bg-slate-600/50 text-slate-300"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                      )}
                    </Link>
                  );
                })}
              </div>
              {/* Right side controls */}
              <div className="flex items-center space-x-2">
                {/* Notifications */}
                <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 hover:scale-105 group">
                  <Bell className="w-5 h-5" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
                      {notifications}
                    </span>
                  )}
                </button>

                {/* User Menu (Desktop) */}
                <div className="hidden md:block relative" ref={userMenuRef}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsUserMenuOpen(!isUserMenuOpen);
                    }}
                    className="flex items-center space-x-3 p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                        <span className="text-white text-sm font-medium">
                          {user?.firstName?.charAt(0) || "A"}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium">
                          {user?.firstName || "Admin"}
                        </p>
                        <p className="text-xs text-slate-400">Administrator</p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isUserMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Enhanced User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 min-w-64 bg-slate-800/100 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl py-2 z-[60]">
                      <div className="px-4 py-3 border-b border-slate-700/50">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 shrink-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {user?.firstName?.charAt(0) || "A"}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-slate-400">
                              {user?.email}
                            </p>
                            <span className="inline-block px-2 py-0.5 bg-blue-600/20 text-blue-400 text-xs rounded-full mt-1">
                              Administrator
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        <Link
                          href="/dashboard"
                          className="flex items-center px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 group"
                        >
                          <Home className="w-4 h-4 mr-3 text-slate-400 group-hover:text-white transition-colors" />
                          <div>
                            <p className="font-medium">User Dashboard</p>
                            <p className="text-xs text-slate-400">
                              Switch to user view
                            </p>
                          </div>
                        </Link>
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 group"
                        >
                          <User className="w-4 h-4 mr-3 text-slate-400 group-hover:text-white transition-colors" />
                          <div>
                            <p className="font-medium">Profile Settings</p>
                            <p className="text-xs text-slate-400">
                              Manage your account
                            </p>
                          </div>
                        </Link>
                      </div>

                      <div className="border-t border-slate-700/50 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 group"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          <div className="text-left">
                            <p className="font-medium">Sign out</p>
                            <p className="text-xs text-red-400/70">
                              End admin session
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden">
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200 hover:scale-105"
                  >
                    {isMobileMenuOpen ? (
                      <X className="h-6 w-6" />
                    ) : (
                      <Menu className="h-6 w-6" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[70]">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Mobile menu panel */}
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-slate-800/98 backdrop-blur-xl border-r border-slate-700/50 shadow-2xl transform transition-transform duration-300">
            <div className="flex flex-col h-full overflow-hidden">
              {/* Mobile header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Admin Panel</h3>
                    <p className="text-xs text-slate-400">
                      Management Dashboard
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User info */}
              <div className="p-4 border-b border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-medium">
                      {user?.firstName?.charAt(0) || "A"}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-slate-400">{user?.email}</p>
                    <span className="inline-block px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full mt-1">
                      Administrator
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation items */}
              <div className="flex-1 overflow-y-auto p-2">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = router.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center p-3 rounded-xl mb-1 transition-all duration-300 group ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30"
                          : "text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-all duration-300 ${
                          isActive
                            ? `bg-gradient-to-r ${item.color} shadow-lg`
                            : "bg-slate-700/50 group-hover:bg-slate-600/50"
                        }`}
                      >
                        <IconComponent
                          className={`w-5 h-5 ${
                            isActive
                              ? "text-white"
                              : "text-slate-400 group-hover:text-white"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{item.name}</p>
                          {item.badge && (
                            <span
                              className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                item.badge === "Live"
                                  ? "bg-green-500/20 text-green-400 animate-pulse"
                                  : "bg-slate-600/50 text-slate-300"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Bottom actions */}
              <div className="p-4 border-t border-slate-700/50 space-y-2">
                <Link
                  href="/dashboard"
                  className="flex items-center p-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 group"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home className="w-5 h-5 mr-3 text-slate-400 group-hover:text-white transition-colors" />
                  <div>
                    <p className="font-medium">User Dashboard</p>
                    <p className="text-xs text-slate-400">
                      Switch to user view
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 group"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Sign out</p>
                    <p className="text-xs text-red-400/70">End admin session</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
