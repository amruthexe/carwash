import Link from "next/link";
import { FaInstagram, FaFacebook, FaTwitter } from "react-icons/fa";
export default function Footer() {
  return (
    <footer className="bg-white text-black pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">

        {/* TOP GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* BRAND */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Pure<span className="text-[var(--primary)]">Wash</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Premium car washing and detailing services designed to keep your vehicle looking brand new.
            </p>

            {/* SOCIAL */}
            <div className="flex gap-4 mt-6">
              <div className="icon-box"><FaFacebook size={18} /></div>
              <div className="icon-box"><FaInstagram size={18} /></div>
              <div className="icon-box"><FaTwitter size={18} /></div>
            </div>
          </div>

          {/* SERVICES */}
          <div>
            <h3 className="footer-title">Services</h3>
            <ul className="footer-links">
              <li><Link href="#">Exterior Wash</Link></li>
              <li><Link href="#">Interior Cleaning</Link></li>
              <li><Link href="#">Ceramic Coating</Link></li>
              <li><Link href="#">Premium Detailing</Link></li>
            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <h3 className="footer-title">Company</h3>
            <ul className="footer-links">
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="#">Careers</Link></li>
            </ul>
          </div>

          {/* NEWSLETTER */}
          <div>
            <h3 className="footer-title">Stay Updated</h3>
            <p className="text-gray-400 text-sm mb-4">
              Get updates on offers and services.
            </p>

            <div className="flex items-center bg-white/10 rounded-lg overflow-hidden border border-white/10">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-transparent outline-none text-sm"
              />
              <button className="px-4 py-2 bg-[var(--primary)] text-white text-sm hover:opacity-90 transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="border-t border-white/10 my-10"></div>

        {/* BOTTOM */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} PureWash. All rights reserved.</p>

          <div className="flex gap-6">
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}