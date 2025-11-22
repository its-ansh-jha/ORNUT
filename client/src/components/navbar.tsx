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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-3 cursor-pointer hover-elevate rounded-md px-3 py-2">
              <img 
                src={logoImage} 
                alt="Ornut Logo" 
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="hidden sm:inline font-bold text-xl text-foreground">ORNUT</span>
            </div>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                name="search"
                placeholder="Search products..."
                className="pl-10 rounded-full"
                data-testid="input-search"
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Link href="/products">
              <Button variant="ghost" data-testid="link-products">Products</Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" data-testid="link-about">About</Button>
            </Link>
            <Link href="/faq">
              <Button variant="ghost" data-testid="link-faq">FAQ</Button>
            </Link>
            <Link href="/admin/login">
              <Button variant="ghost" className="gap-2" data-testid="link-admin">
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Button */}
            {!mobileSearchOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileSearchOpen(true)}
                className="md:hidden"
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
                  className="h-8 text-sm rounded-full"
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
              className="transition-colors"
              data-testid="button-theme-toggle"
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5 text-yellow-500" />
              ) : (
                <Sun className="h-5 w-5 text-blue-400" />
              )}
            </Button>

            {user && (
              <>
                <Link href="/wishlist">
                  <Button variant="ghost" size="icon" className="relative hidden sm:flex" data-testid="button-wishlist">
                    <Heart className="h-5 w-5" />
                    {wishlistCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs"
                        data-testid="badge-wishlist-count"
                      >
                        {wishlistCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <Link href="/cart">
                  <Button variant="ghost" size="icon" className="relative" data-testid="button-cart">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs"
                        data-testid="badge-cart-count"
                      >
                        {cartCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden sm:flex" data-testid="button-user-menu">
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
                className="inline-flex"
                data-testid="button-signin"
              >
                {signingIn ? "Signing in..." : "Sign In"}
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-4 mt-8">
                  {user ? (
                    <>
                      <div className="mb-4 pb-4 border-b">
                        <p className="text-sm font-semibold text-muted-foreground">
                          {user.displayName || user.email}
                        </p>
                      </div>
                      <Link href="/account" onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          data-testid="link-account-mobile"
                        >
                          <User className="h-4 w-4 mr-2" />
                          My Account
                        </Button>
                      </Link>
                      <Link href="/orders" onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
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
                        className="w-full justify-start text-destructive"
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
                      className="w-full"
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
