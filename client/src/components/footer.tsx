import { Link } from "wouter";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-[#037A3F] text-white mt-16">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-xl mb-4 text-[#9EEA01]">ORNUT</h3>
            <p className="text-sm text-green-100 mb-2">
              Premium high-protein peanut butter. 100% natural, lab-tested, made in India.
            </p>
            <p className="text-xs text-green-200 mt-4">
              Email: support@peanutproducts.in
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-[#9EEA01]">Products</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-green-100 hover:text-[#9EEA01] transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?category=peanut-butter" className="text-green-100 hover:text-[#9EEA01] transition-colors">
                  Peanut Butter
                </Link>
              </li>
              <li>
                <Link href="/products?category=chocolate" className="text-green-100 hover:text-[#9EEA01] transition-colors">
                  Chocolate
                </Link>
              </li>
              <li>
                <Link href="/products?category=crunchy" className="text-green-100 hover:text-[#9EEA01] transition-colors">
                  Crunchy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-[#9EEA01]">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-green-100 hover:text-[#9EEA01] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-green-100 hover:text-[#9EEA01] transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-green-100 hover:text-[#9EEA01] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-green-100 hover:text-[#9EEA01] transition-colors">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-[#9EEA01]">Connect</h4>
            <div className="flex gap-4 mb-6">
              <a 
                href="https://www.facebook.com/share/1Ck558bCLg/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-100 hover:text-[#9EEA01] transition-colors" 
                aria-label="Facebook"
                data-testid="link-facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://instagram.com/ornu_t" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-100 hover:text-[#9EEA01] transition-colors" 
                aria-label="Instagram"
                data-testid="link-instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-100 hover:text-[#9EEA01] transition-colors" 
                aria-label="Twitter"
                data-testid="link-twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
            <p className="text-xs text-green-200">
              Join thousands enjoying premium peanut butter
            </p>
          </div>
        </div>
        <div className="border-t border-green-700 mt-8 pt-8 text-center text-sm text-green-200">
          <p>&copy; {new Date().getFullYear()} Ornut. All rights reserved. Crafted with care.</p>
        </div>
      </div>
    </footer>
  );
}
