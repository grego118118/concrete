import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Pioneer Concrete Coatings',
  description: 'Our commitment to protecting your privacy and personal data.',
};

export default function PrivacyPolicy() {
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight text-blue-600">
            Pioneer Concrete Coatings
          </Link>
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
            Back to Home
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-12">
          <header className="mb-12 border-b border-slate-100 pb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Privacy Policy</h1>
            <p className="text-slate-500 font-medium">Last updated: {lastUpdated}</p>
          </header>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <p className="leading-relaxed">
                Pioneer Concrete Coatings ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by Pioneer Concrete Coatings.
              </p>
              <p className="leading-relaxed mt-4">
                By accessing or using our service, you signify that you have read, understood, and agree to our collection, storage, use, and disclosure of your personal information as described in this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
              <p className="leading-relaxed">
                We collect personal information that you provide to us when you request a quote, schedule a service, or communicate with us. This includes:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>Contact information (name, email address, phone number, mailing address)</li>
                <li>Project details and site information</li>
                <li>Payment and financial information (processed via secure third-party partners)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. QuickBooks Integration</h2>
              <p className="leading-relaxed">
                Our application integrates with QuickBooks Online to manage invoices and payments. When you connect your QuickBooks account:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>We sync customer information to create accurate invoices and quotes.</li>
                <li>We do not store your QuickBooks login credentials.</li>
                <li>Your financial data is handled according to Intuit's strict security standards and our commitment to using it only for authorized business purposes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. How We Use Your Information</h2>
              <p className="leading-relaxed">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>Provide, operate, and maintain our services</li>
                <li>Communicate with you regarding quotes, projects, and invoices</li>
                <li>Process payments and manage financial records</li>
                <li>Improve and personalize our service offerings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Data Sharing & Security</h2>
              <p className="leading-relaxed">
                We do not sell your personal information to third parties. We only share information with partners (like QuickBooks or payment processors) necessary to provide our services. We use industry-standard encryption and security measures to protect your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Contact Us</h2>
              <p className="leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-bold">Pioneer Concrete Coatings</p>
                <p>Email: admin@pioneerconcretecoatings.com</p>
                <p>Phone: (413) 544-4933</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Pioneer Concrete Coatings. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
