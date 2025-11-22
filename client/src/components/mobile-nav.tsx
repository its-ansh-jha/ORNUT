import { Link, useLocation } from "wouter";
import { LayoutGrid, Star, HelpCircle, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export function MobileNav() {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location === path;

  const navItems = [
    { href: "/products", label: "Products", icon: LayoutGrid },
    { href: "/about", label: "About", icon: Star },
    { href: "/faq", label: "FAQ", icon: HelpCircle },
    { href: "/admin/login", label: "Admin", icon: ShieldCheck },
  ];

  if (user) {
    navItems[navItems.length - 1] = {
      href: "/account",
      label: "Account",
      icon: User,
    };
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white dark:bg-slate-950 border-t border-border">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <Button
              variant={isActive(href) ? "default" : "ghost"}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-lg ${
                isActive(href)
                  ? "bg-[#037A3F] text-white"
                  : "text-gray-600 dark:text-gray-400"
              }`}
              data-testid={`mobile-nav-${label.toLowerCase()}`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </nav>
  );
}
