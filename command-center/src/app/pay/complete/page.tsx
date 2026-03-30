import { Star, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Thank You | Pioneer Concrete Coatings",
};

export default function PaymentCompletePage() {
    const googleReviewUrl = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL || "https://www.google.com/search?q=Pioneer+Concrete+Coatings+review";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 flex flex-col">
            {/* Header */}
            <header className="bg-slate-900 text-white">
                <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 text-center">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Pioneer Concrete Coatings</h1>
                    <p className="text-slate-400 text-sm mt-1">Professional Epoxy Floor Coating Systems</p>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="max-w-lg w-full space-y-6">
                    {/* Payment Confirmed */}
                    <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 p-8 text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                                <CheckCircle2 className="h-9 w-9 text-emerald-600" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-900">Payment Received!</h2>
                            <p className="text-lg font-semibold text-emerald-700">Your project is complete and paid in full.</p>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            Thank you so much for choosing Pioneer Concrete Coatings. It was a pleasure working on your project, and we truly appreciate your business. A receipt has been sent to your email.
                        </p>
                    </div>

                    {/* Google Review CTA */}
                    <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-8 text-center space-y-5">
                        <div className="flex justify-center gap-1">
                            {[1, 2, 3, 4, 5].map(n => (
                                <Star key={n} className="h-7 w-7 fill-amber-400 text-amber-400" />
                            ))}
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-slate-900">How did we do?</h3>
                            <p className="text-slate-500">
                                We&apos;d love to hear about your experience. Your review helps us grow and helps other homeowners find a contractor they can trust.
                            </p>
                        </div>
                        <a
                            href={googleReviewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-base font-bold rounded-xl shadow-md shadow-blue-200 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <Star className="h-5 w-5 fill-white" />
                            Leave Us a Google Review
                        </a>
                        <p className="text-xs text-slate-400">Takes less than 2 minutes — it means a lot to us!</p>
                    </div>

                    {/* Footer */}
                    <div className="text-center space-y-1 pt-4 pb-8">
                        <p className="text-slate-500 text-sm font-medium">Questions? We&apos;re always happy to help.</p>
                        <p className="text-slate-700 font-bold">(413) 544-4933</p>
                        <p className="text-slate-400 text-sm">admin@pioneerconcretecoatings.com</p>
                        <p className="text-slate-300 text-xs mt-4">Pioneer Concrete Coatings · Serving Southern New England</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
