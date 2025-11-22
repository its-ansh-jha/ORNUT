import { Link } from "wouter";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-16">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-xl mb-4 text-green-600">Ornut</h3>
            <p className="text-sm text-gray-600 mb-2">
              Premium peanut butter crafted with passion. 100% natural, no preservatives.
            </p>
            <p className="text-xs text-gray-500 mt-4">
              Email: support@peanutproducts.in
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-800">Products</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-gray-600 hover:text-green-600">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?category=peanut-butter" className="text-gray-600 hover:text-green-600">
                  Peanut Butter
                </Link>
              </li>
              <li>
                <Link href="/products?category=chocolate" className="text-gray-600 hover:text-green-600">
                  Chocolate
                </Link>
              </li>
              <li>
                <Link href="/products?category=crunchy" className="text-gray-600 hover:text-green-600">
                  Crunchy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-800">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-green-600">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-green-600">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-green-600">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-gray-600 hover:text-green-600">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-800">Connect</h4>
            <div className="flex gap-4 mb-6">
              <a 
                href="https://www.facebook.com/share/1Ck558bCLg/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-green-600" 
                aria-label="Facebook"
                data-testid="link-facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://instagram.com/ornu_t" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-green-600" 
                aria-label="Instagram"
                data-testid="link-instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-green-600" 
                aria-label="Twitter"
                data-testid="link-twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
            <p className="text-xs text-gray-500">
              Join thousands enjoying premium peanut butter
            </p>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Ornut. All rights reserved. Powered by Peanuts.</p>
        </div>
      </div>
    </footer>
  );
}
