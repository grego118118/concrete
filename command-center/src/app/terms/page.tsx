import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Pioneer Concrete Coatings',
  description: 'Terms and conditions for using our services and website.',
};

export default function TermsOfService() {
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
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Terms of Service</h1>
            <p className="text-slate-500 font-medium">Last updated: {lastUpdated}</p>
          </header>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="leading-relaxed">
                By accessing or using the services provided by Pioneer Concrete Coatings ("we," "us," or "our"), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
              <p className="leading-relaxed">
                Pioneer Concrete Coatings provides concrete coating services, project management, and related estimation tools through its web platform. These services include generating quotes, managing invoices, and processing payments.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. User Responsibilities</h2>
              <p className="leading-relaxed">
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>Providing accurate and complete information for quotes and invoices</li>
                <li>Maintaining the confidentiality of your account access if applicable</li>
                <li>Ensuring all payments are made in accordance with agreed-upon terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Payment Terms</h2>
              <p className="leading-relaxed">
                Payment for services is due according to the terms specified on your individual invoice. We use secure third-party payment processors, including QuickBooks Online, to handle financial transactions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Limitation of Liability</h2>
              <p className="leading-relaxed">
                To the maximum extent permitted by law, Pioneer Concrete Coatings shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Intellectual Property</h2>
              <p className="leading-relaxed">
                All content, trademarks, and data on this website are the property of Pioneer Concrete Coatings or its licensors and are protected by applicable intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Governing Law</h2>
              <p className="leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the Commonwealth of Massachusetts, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Changes to Terms</h2>
              <p className="leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of any significant changes by posting the new terms on this page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Contact Us</h2>
              <p className="leading-relaxed">
                Questions about the Terms of Service should be sent to us at:
              </p>
              <div className="mt-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-bold">Pioneer Concrete Coatings</p>
                <p>Email: admin@pioneerconcretecoatings.com</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="py-10 border-t bg-white">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Pioneer Concrete Coatings. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-blue-600 transition-colors font-medium">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-blue-600 transition-colors font-medium">Terms of Service</Link>
            <a href="mailto:admin@pioneerconcretecoatings.com" className="hover:text-blue-600 transition-colors font-medium">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
