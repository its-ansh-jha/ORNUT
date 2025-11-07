import { Link } from "wouter";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-16">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">Peanut Butter Co.</h3>
            <p className="text-sm text-muted-foreground">
              Premium artisanal peanut butter made with love and fresh roasted peanuts.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products">
                  <a className="text-muted-foreground hover:text-foreground">All Products</a>
                </Link>
              </li>
              <li>
                <Link href="/products?category=creamy">
                  <a className="text-muted-foreground hover:text-foreground">Creamy</a>
                </Link>
              </li>
              <li>
                <Link href="/products?category=crunchy">
                  <a className="text-muted-foreground hover:text-foreground">Crunchy</a>
                </Link>
              </li>
              <li>
                <Link href="/products?category=specialty">
                  <a className="text-muted-foreground hover:text-foreground">Specialty</a>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq">
                  <a className="text-muted-foreground hover:text-foreground">FAQ</a>
                </Link>
              </li>
              <li>
                <Link href="/track-order">
                  <a className="text-muted-foreground hover:text-foreground">Track Order</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-muted-foreground hover:text-foreground">Contact Us</a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a className="text-muted-foreground hover:text-foreground">About Us</a>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Peanut Butter Co. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
