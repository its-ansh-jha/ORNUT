import { ShoppingCart, Heart, Search, User, Menu, Sun, Moon, ShieldCheck } from "lucide-react";
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
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity rounded-md px-3 py-2">
              <img 
                src={logoImage} 
                alt="Ornut Logo" 
                className="h-10 w-10 rounded-full object-cover border-2 border-[#037A3F]"
              />
              <span className="hidden sm:inline font-bold text-xl text-[#037A3F]">ORNUT</span>
            </div>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                name="search"
                placeholder="Search products..."
                className="pl-10 rounded-lg bg-gray-50 border-gray-200 focus:border-[#037A3F] focus:bg-white"
                data-testid="input-search"
              />
            </div>
          </form>

          <div className="flex items-center gap-2">
            {/* Trust Badge - Alpino Inspired */}
            <div className="hidden lg:flex items-center gap-1 px-3 py-2 text-xs text-[#037A3F] font-semibold">
              <ShieldCheck className="h-4 w-4 text-[#9EEA01]" />
              100% Pure
            </div>

            {/* Wishlist */}
            <Link href="/wishlist">
              <Button 
                variant="ghost" 
                size="icon"
                className="relative hover:text-[#037A3F]"
                data-testid="button-wishlist"
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-[#9EEA01] text-[#037A3F] h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {wishlistCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Link href="/cart">
              <Button 
                variant="ghost" 
                size="icon"
                className="relative hover:text-[#037A3F]"
                data-testid="button-cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-[#037A3F] text-white h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Auth */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="hover:text-[#037A3F]"
                    data-testid="button-user-menu"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="cursor-pointer">
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="cursor-pointer">
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  {user.email?.includes("@admin") && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer text-[#037A3F] font-semibold">
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} data-testid="button-logout">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={signInWithGoogle}
                disabled={signingIn}
                className="hidden sm:inline-flex bg-[#037A3F] hover:bg-[#026a34] text-white rounded-full"
                data-testid="button-sign-in"
              >
                {signingIn ? "Signing in..." : "Sign In"}
              </Button>
            )}

            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleTheme}
              className="hover:text-[#037A3F]"
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="md:hidden hover:text-[#037A3F]"
                  data-testid="button-mobile-menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
                  <Link href="/products" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-[#037A3F]">
                      Products
                    </Button>
                  </Link>
                  <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-[#037A3F]">
                      About
                    </Button>
                  </Link>
                  <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-[#037A3F]">
                      Contact
                    </Button>
                  </Link>
                  {!user && (
                    <Button 
                      onClick={() => {
                        signInWithGoogle();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-[#037A3F] hover:bg-[#026a34] text-white rounded-full mt-4"
                      data-testid="button-mobile-sign-in"
                    >
                      Sign In
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
