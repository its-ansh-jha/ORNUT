import { ShoppingCart, Heart, Search, User, Menu, Sun, Moon, ShieldCheck, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/components/theme-provider";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import logoImage from "@assets/IMG-20251106-WA0028_1762432081376.jpg";

export function Navbar() {
  const { user, signingIn, signInWithGoogle, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const { data: cartItems } = useQuery<any[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const { data: wishlistItems } = useQuery<any[]>({
    queryKey: ["/api/wishlist"],
    enabled: !!user,
  });

  const cartCount = cartItems?.length || 0;
  const wishlistCount = wishlistItems?.length || 0;

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("search") as string;
    if (query) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
      setMobileSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-slate-950 shadow-sm">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-2 cursor-pointer hover-elevate rounded-md px-2 py-2">
              <img 
                src={logoImage} 
                alt="Ornut Logo" 
                className="h-10 w-10 rounded-full object-cover border-2 border-[#037A3F]"
              />
              <span className="hidden sm:inline font-bold text-lg text-[#037A3F]">ORNUT</span>
            </div>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                name="search"
                placeholder="Search products..."
                className="pl-10 rounded-full bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-700"
                data-testid="input-search"
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/products">
              <Button variant="ghost" className="text-[#037A3F] hover:bg-gray-100 dark:hover:bg-slate-800" data-testid="link-products">
                Products
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" className="text-[#037A3F] hover:bg-gray-100 dark:hover:bg-slate-800" data-testid="link-about">
                About
              </Button>
            </Link>
            <Link href="/faq">
              <Button variant="ghost" className="text-[#037A3F] hover:bg-gray-100 dark:hover:bg-slate-800" data-testid="link-faq">
                FAQ
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button variant="ghost" className="text-[#037A3F] hover:bg-gray-100 dark:hover:bg-slate-800 gap-2" data-testid="link-admin">
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center gap-1">
            {/* Mobile Search Button */}
            {!mobileSearchOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileSearchOpen(true)}
                className="md:hidden text-[#037A3F] hover:bg-green-50 dark:hover:bg-slate-800"
                data-testid="button-mobile-search"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}

            {/* Mobile Search Input */}
            {mobileSearchOpen && (
              <form onSubmit={handleSearch} className="md:hidden flex-1 flex items-center gap-2">
                <Input
                  type="search"
                  name="search"
                  placeholder="Search..."
                  className="h-8 text-sm rounded-full bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-700"
                  autoFocus
                  data-testid="input-search-mobile"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileSearchOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            )}

            {/* Dark Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={`transition-colors ${
                theme === "light"
                  ? "text-yellow-500 hover:bg-yellow-50 dark:hover:bg-slate-800"
                  : "text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800"
              }`}
              data-testid="button-theme-toggle"
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {/* Wishlist (Desktop & Tablet) */}
            {user && (
              <Link href="/wishlist">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hidden sm:flex text-[#037A3F] hover:bg-green-50 dark:hover:bg-slate-800"
                  data-testid="button-wishlist"
                >
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <Badge
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-[#9EEA01] text-[#037A3F]"
                      data-testid="badge-wishlist-count"
                    >
                      {wishlistCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            {/* Cart Button */}
            {user && (
              <Link href="/cart">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-[#037A3F] hover:bg-green-50 dark:hover:bg-slate-800"
                  data-testid="button-cart"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-[#037A3F] text-white font-bold"
                      data-testid="badge-cart-count"
                    >
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden sm:flex text-[#037A3F] hover:bg-green-50 dark:hover:bg-slate-800"
                    data-testid="button-user-menu"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || "User"}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/account")} data-testid="menu-item-account">
                    My Account
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/orders")} data-testid="menu-item-orders">
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} data-testid="menu-item-logout">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={signInWithGoogle}
                disabled={signingIn}
                className="hidden sm:inline-flex bg-[#037A3F] hover:bg-[#026a34] text-white rounded-full"
                data-testid="button-signin"
              >
                {signingIn ? "Signing in..." : "Sign In"}
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-[#037A3F] hover:bg-green-50 dark:hover:bg-slate-800"
                  data-testid="button-mobile-menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-4 mt-8">
                  {user ? (
                    <>
                      <div className="mb-4 pb-4 border-b">
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          {user.displayName || user.email}
                        </p>
                      </div>
                      <Link href="/account" onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-[#037A3F]"
                          data-testid="link-account-mobile"
                        >
                          <User className="h-4 w-4 mr-2" />
                          My Account
                        </Button>
                      </Link>
                      <Link href="/orders" onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-[#037A3F]"
                          data-testid="link-orders-mobile"
                        >
                          My Orders
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full justify-start text-red-600"
                        data-testid="button-logout-mobile"
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => {
                        signInWithGoogle();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-[#037A3F] hover:bg-[#026a34] text-white rounded-full"
                      data-testid="button-signin-mobile"
                    >
                      Sign In
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
