"use client";

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import Modal from './Modal';
import { useState } from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [cookieOpen, setCookieOpen] = useState(false);

  const footerLinks = {
    shop: [
      { name: 'All Products', href: '/products' },
      { name: 'Gifting', href: '/category/gifting' },
      { name: 'Pooja Essentials', href: '/category/pooja-essentials' },
      { name: 'Jewellery', href: '/category/jewellery' },
      { name: 'Daily Essentials', href: '/category/daily-essentials' },
      { name: 'Back to School', href: '/category/back-to-school' },
      { name: 'Interior', href: '/category/interior' },
    ],
    categories: [
      { name: 'Gifting', href: '/category/gifting' },
      { name: 'Pooja Essentials', href: '/category/pooja-essentials' },
      { name: 'Jewellery', href: '/category/jewellery' },
      { name: 'Daily Essentials', href: '/category/daily-essentials' },
      { name: 'Back to School', href: '/category/back-to-school' },
      { name: 'Interior', href: '/category/interior' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Story', href: '/story' },
      { name: 'Blog', href: '/blog' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'YouTube', icon: Youtube, href: '#' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold text-indigo-400">Encender</span>
            </Link>
            <p className="mt-4 text-gray-300 max-w-md">
              Your trusted partner for gifting, pooja essentials, jewellery, daily essentials, back to school, and interior products across India. We specialize in personalized gifts, traditional handicrafts, and unique items for every special occasion.
            </p>
            
            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="h-4 w-4 text-indigo-400" />
                <span>info@encenderfashion.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="h-4 w-4 text-indigo-400" />
                <span>+91 820-850-6731</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="h-4 w-4 text-indigo-400" />
                <span>Kharadi, Pune, Maharashtra, Pincode: 411014</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Company */}
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-md">
            <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
            <p className="text-gray-300 mb-4">
              Subscribe to our newsletter for new gift collections and special offers.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400"
              />
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {currentYear} Encender Fashion. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <button
              onClick={() => setPrivacyOpen(true)}
              className="hover:text-white transition-colors underline underline-offset-2"
              type="button"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setTermsOpen(true)}
              className="hover:text-white transition-colors underline underline-offset-2"
              type="button"
            >
              Terms of Service
            </button>
            <button
              onClick={() => setContactOpen(true)}
              className="hover:text-white transition-colors underline underline-offset-2"
              type="button"
            >
              Contact Us
            </button>
            <button
              onClick={() => setCookieOpen(true)}
              className="hover:text-white transition-colors underline underline-offset-2"
              type="button"
            >
              Cookie Policy
            </button>
          </div>
        </div>
      </div>
      <Modal open={privacyOpen} onClose={() => setPrivacyOpen(false)} title="Privacy Policy">
        <div className="space-y-4 text-sm">
          <p><strong>1. Capturing User Information</strong><br />
          When you buy from our store, we collect personal information like your name, address, and email. Additionally, we automatically receive your IP address while you browse, which helps us understand your browser and operating system. If you give us permission, we may also send you emails about our store, new products, and updates.</p>
          <p><strong>2. Consent</strong><br />
          When you provide personal information for transactions, such as completing a purchase or verifying a credit card, we assume you consent to its collection and use for that purpose only. If we seek your information for additional reasons, like marketing, we will either ask for your explicit consent or give you a chance to decline. If you change your mind after opting in, you can withdraw your consent for us to contact you or to continue collecting, using, or disclosing your information at any time. To do so, simply reach out to us through our contact email, writing to support@encenderfashion.com.</p>
          <p><strong>3. Disclosure</strong><br />
          We may disclose your personal information if we are required by law to do so or if you violate our Terms of Service.</p>
          <p><strong>4. Advertisements</strong><br />
          We use third-party advertising companies to display ads on our Platform. They may use non-personal information about your visits to tailor advertisements for you. You can opt out of personalized advertising through the &quot;Opt out of Ads Personalization&quot; settings in your device&apos;s settings application.</p>
          <p><strong>5. Location Information</strong><br />
          When users our site/App, your locations are saved, that we use for user authentication as per functionality of our App.</p>
          <p><strong>6. Data Security</strong><br />
          We prioritize the security of your personal information by implementing appropriate technical and organizational measures to prevent unauthorized access, alteration, disclosure, or destruction. Additionally, we require our third-party partners and service providers to adopt similar security measures to ensure your information remains protected. This comprehensive approach helps safeguard your data and maintain your trust in our services.</p>
          <p><strong>7. Web Privacy Policy</strong><br />
          Our portal and various related applications are owned and operated by Encender Fashion LLP. In this Privacy Policy, we refer to ourselves as &quot;we,&quot; &quot;us,&quot; or &quot;our,&quot; while end users are addressed as &quot;you,&quot; &quot;your,&quot; or &quot;user.&quot; The term &quot;portal&quot; or &quot;portals&quot; encompasses the various platforms and channels through which you can interact with our company&apos;s offerings. These include, but are not limited to, our Android App, iOS App, desktop website, mobile website, email communications, and social media pages.<br /><br />
          We are committed to providing a seamless and engaging user experience across all these platforms. Whether you are browsing our products on your mobile device, placing an order through our desktop site, or connecting with us via social media, we strive to ensure that your interactions are smooth, secure, and satisfactory.<br /><br />
          To enhance your experience, we utilize a variety of technologies and services that allow us to understand your preferences and tailor our offerings accordingly. This includes collecting data that helps us improve our products and services, ensuring that we meet your needs effectively.<br /><br />
          Your engagement with us through these portals is essential to our mission of delivering quality fashion offerings and exceptional service. We value your trust and are dedicated to protecting your personal information as you navigate our diverse platforms. If you have any questions about our services or this Privacy Policy, please feel free to reach out to us.</p>
          <p><strong>Information we collect when you contact us:</strong><br />
            • Email Id<br />
            • Contact Number<br />
            • Name<br />
            • Address
          </p>
          <p className="mt-4"><strong>Encender Gifting</strong><br />
            Customized gifts delivered across India with care.<br />
            <strong>CONTACT</strong><br />
            Email: support@encenderfashion.com<br />
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
          We strive for accuracy but are not responsible for any inaccuracies or omissions on our site. You are responsible for monitoring changes.</p>
          <p><strong>4. Modifications to Services</strong><br />
          Prices and services are subject to change without notice. We are not liable for any modifications or discontinuations.</p>
          <p><strong>5. User Submissions</strong><br />
          By submitting comments or feedback, you grant us the right to use them without obligation. You are responsible for the content you submit.</p>
          <p><strong>6. Personal Information</strong><br />
          Your personal information is governed by our Privacy Policy.</p>
          <p><strong>7. Limitation of Liability</strong><br />
          We are not liable for any indirect or consequential damages arising from your use of our services.</p>
          <p><strong>8. Indemnification</strong><br />
          You agree to indemnify EncenderFashion for any claims related to your violation of these Terms.</p>
          <p><strong>9. Governing Law</strong><br />
          These Terms are governed by the laws of India, and any disputes will be resolved in Mumbai.</p>
          <p><strong>10. Changes to Terms</strong><br />
          We may update these Terms occasionally. Continued use of our site signifies your acceptance of any changes.</p>
          <p><strong>Information we collect when you contact us:</strong><br />
            • Email Id<br />
            • Contact Number<br />
            • Name<br />
            • Address
          </p>
          <p className="mt-4"><strong>Encender Gifting</strong><br />
            Customized gifts delivered across India with care.<br />
            <strong>CONTACT</strong><br />
            Email: support@encenderfashion.com<br />
            Address: 603, Sharda Florentia, Kharadi, Pune-411014<br />
            +91-8208506731
          </p>
        </div>
      </Modal>
      <Modal open={contactOpen} onClose={() => setContactOpen(false)} title="Contact Us">
        <div className="space-y-4 text-sm">
          <p>We&apos;d love to hear from you! For any questions, feedback, or support, please reach out to us:</p>
          <p><strong>Email:</strong> support@encenderfashion.com</p>
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
          <p><strong>How we use cookies:</strong><br />
          - To remember your preferences and settings<br />
          - To keep you logged in<br />
          - To analyze site usage and improve our services<br />
          - To deliver relevant advertisements</p>
          <p><strong>Managing cookies:</strong><br />
          You can control or delete cookies through your browser settings. Please note that disabling cookies may affect the functionality of our website.</p>
          <p>For more information about how we use your data, please see our Privacy Policy.</p>
        </div>
      </Modal>
    </footer>
  );
} 