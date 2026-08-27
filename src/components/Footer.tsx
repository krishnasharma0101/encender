"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Instagram } from 'lucide-react';
import Modal from './Modal';
import { useState } from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [cookieOpen, setCookieOpen] = useState(false);

  return (
    <footer className="bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <Image
                src="/encender.svg"
                alt="Encender Logo"
                width={32}
                height={40}
                className="h-10 w-auto object-contain brightness-0 invert"
              />
              <span className="text-2xl font-black tracking-tight">Encender</span>
            </Link>
            <p className="mt-4 text-gray-400 text-sm leading-relaxed max-w-sm">
              Preserving the soul of traditional craftsmanship through modern digital storytelling.
            </p>
          </div>

          {/* Discover */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-300 mb-4">Discover</h3>
            <ul className="space-y-2.5">
              <li><Link href="/products" className="text-gray-400 text-sm hover:text-white transition-colors">Our Story</Link></li>
              <li><Link href="/products" className="text-gray-400 text-sm hover:text-white transition-colors">Artisan Directory</Link></li>
              <li><Link href="/products" className="text-gray-400 text-sm hover:text-white transition-colors">Sustainability</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-300 mb-4">Support</h3>
            <ul className="space-y-2.5">
              <li><Link href="#" className="text-gray-400 text-sm hover:text-white transition-colors">Shipping &amp; Returns</Link></li>
              <li><button onClick={() => setContactOpen(true)} className="text-gray-400 text-sm hover:text-white transition-colors">Contact Us</button></li>
              <li><Link href="#" className="text-gray-400 text-sm hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Join Us / Newsletter */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-300 mb-4">Join Us</h3>
            <p className="text-gray-400 text-sm mb-3">Get early access to artisan drops.</p>
            <form className="flex" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Email"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-l-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#7c3aed] transition-colors"
              />
              <button
                type="submit"
                className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-3 py-2 rounded-r-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            © {currentYear} Encender. Crafted with soul, preserved by heritage.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPrivacyOpen(true)}
              className="text-gray-500 text-xs hover:text-white transition-colors"
            >
              Privacy
            </button>
            <button
              onClick={() => setTermsOpen(true)}
              className="text-gray-500 text-xs hover:text-white transition-colors"
            >
              Terms
            </button>
            <span className="text-gray-700">·</span>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Modals (unchanged content from original) */}
      <Modal open={privacyOpen} onClose={() => setPrivacyOpen(false)} title="Privacy Policy">
        <div className="space-y-4 text-sm">
          <p><strong>1. Capturing User Information</strong><br />
          When you buy from our store, we collect personal information like your name, address, and email. Additionally, we automatically receive your IP address while you browse, which helps us understand your browser and operating system. If you give us permission, we may also send you emails about our store, new products, and updates.</p>
          <p><strong>2. Consent</strong><br />
          When you provide personal information for transactions, such as completing a purchase or verifying a credit card, we assume you consent to its collection and use for that purpose only. If we seek your information for additional reasons, like marketing, we will either ask for your explicit consent or give you a chance to decline. If you change your mind after opting in, you can withdraw your consent for us to contact you or to continue collecting, using, or disclosing your information at any time. To do so, simply reach out to us through our contact email, writing to customersupport@encenderfashion.com.</p>
          <p><strong>3. Disclosure</strong><br />
          We may disclose your personal information if we are required by law to do so or if you violate our Terms of Service.</p>
          <p><strong>4. Data Security</strong><br />
          We prioritize the security of your personal information by implementing appropriate technical and organizational measures to prevent unauthorized access, alteration, disclosure, or destruction.</p>
          <p className="mt-4"><strong>Encender Gifting</strong><br />
            Customized gifts delivered across India with care.<br />
            <strong>CONTACT</strong><br />
            Email: customersupport@encenderfashion.com<br />
            Address: 603, Sharda Florentia, Kharadi, Pune-411014<br />
            +91-8208506731
          </p>
        </div>
      </Modal>
      <Modal open={termsOpen} onClose={() => setTermsOpen(false)} title="Terms of Service">
        <div className="space-y-4 text-sm">
          <p>This website is operated by EncenderFashion. By accessing or using our website at encenderfashion.com, you agree to these Terms of Service. If you do not agree, please do not use our services.</p>
          <p><strong>1. Acceptance of Terms</strong><br />
          By using our site, you confirm that you are of legal age or have the consent of a legal guardian for any minors using the site.</p>
          <p><strong>2. General Conditions</strong><br />
          We reserve the right to refuse service to anyone at any time. You may not reproduce, duplicate, or exploit any part of our services without written permission.</p>
          <p><strong>3. Accuracy of Information</strong><br />
          We strive for accuracy but are not responsible for any inaccuracies or omissions on our site.</p>
          <p><strong>4. Modifications to Services</strong><br />
          Prices and services are subject to change without notice.</p>
          <p><strong>5. Limitation of Liability</strong><br />
          We are not liable for any indirect or consequential damages arising from your use of our services.</p>
          <p className="mt-4"><strong>Encender Gifting</strong><br />
            Email: customersupport@encenderfashion.com<br />
            Address: 603, Sharda Florentia, Kharadi, Pune-411014<br />
            +91-8208506731
          </p>
        </div>
      </Modal>
      <Modal open={contactOpen} onClose={() => setContactOpen(false)} title="Contact Us">
        <div className="space-y-4 text-sm">
          <p>We&apos;d love to hear from you! For any questions, feedback, or support, please reach out to us:</p>
          <p><strong>Email:</strong> customersupport@encenderfashion.com</p>
          <p><strong>Phone:</strong> +91-8208506731</p>
          <p><strong>Address:</strong> 603, Sharda Florentia, Kharadi, Pune-411014</p>
          <p>Our team will get back to you as soon as possible.</p>
        </div>
      </Modal>
      <Modal open={cookieOpen} onClose={() => setCookieOpen(false)} title="Cookie Policy">
        <div className="space-y-4 text-sm">
          <p>This website uses cookies to enhance your browsing experience, analyze site traffic, and support our marketing efforts. By continuing to use our site, you consent to our use of cookies in accordance with this policy.</p>
          <p><strong>What are cookies?</strong><br />
          Cookies are small text files stored on your device by your web browser. They help us remember your preferences, login details, and provide a more personalized experience.</p>
          <p><strong>Managing cookies:</strong><br />
          You can control or delete cookies through your browser settings. Please note that disabling cookies may affect the functionality of our website.</p>
        </div>
      </Modal>
    </footer>
  );
}