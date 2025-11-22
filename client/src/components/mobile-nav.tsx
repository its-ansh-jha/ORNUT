import { Link, useLocation } from "wouter";
import { LayoutGrid, Star, HelpCircle, ShieldCheck, User } from "lucide-react";
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
    <nav className="fixed bottom-0 left-0 w-full md:hidden bg-white dark:bg-slate-950 border-t border-[#ddd] dark:border-slate-700 flex justify-around py-2 shadow-[0_-3px_10px_rgba(0,0,0,0.1)] z-[9999]">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link 
          key={href} 
          href={href}
          className="no-underline text-[#333] dark:text-gray-300 text-sm flex flex-col items-center transition-all duration-200 hover:text-[#28a745] dark:hover:text-[#28a745] hover:-translate-y-1 active:scale-95"
        >
          <Icon className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
