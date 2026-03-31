import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { CreditCard, CheckCircle2 } from "lucide-react";

export default async function PublicInvoicePage(props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;

    const invoice = await db.invoice.findUnique({
        where: { id },
        include: {
            customer: true,
            quote: { include: { items: true } },
            overageItems: true,
        },
    });

    if (!invoice) notFound();

    const customer = invoice.customer;
    const items = invoice.quote?.items ?? [];
    const overageItems = invoice.overageItems ?? [];
    const invoiceTotal = Number(invoice.amount);
    const overageTotal = overageItems.reduce((s: number, i: any) => s + Number(i.total), 0);
    const baseBalance = invoiceTotal - overageTotal;
    const isPaid = invoice.status === "PAID";
    const paymentLink = (invoice as any).completionPaymentLink || invoice.paymentLink;

    const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const dateStr = new Date(invoice.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div className="min-h-screen bg-slate-100 py-8 px-4">
            <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-sm">

                {/* ── Header ── */}
                <div className="flex justify-between items-start px-10 pt-10 pb-7 border-b-2 border-slate-900">
                    <div className="flex items-start gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.png" alt="Pioneer Concrete Coatings" className="w-14 h-14 object-contain" onError={e => (e.currentTarget.style.display = 'none')} />
                        <div>
                            <p className="text-xl font-black text-slate-900 leading-tight">Pioneer Concrete Coatings</p>
                            <p className="text-xs text-slate-500 mt-0.5">Serving Southern New England</p>
                            <p className="text-xs text-slate-500">(413) 544-4933</p>
                            <p className="text-xs text-slate-500">billing@pioneerconcretecoatings.com</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-4xl font-black text-slate-900 tracking-tight">INVOICE</p>
                        <p className="text-base font-bold text-slate-700 mt-1">#{invoice.number}</p>
                        <p className="text-sm text-slate-500 mt-0.5">Issued: {dateStr}</p>
                        {invoice.dueDate && (
                            <p className="text-sm font-bold text-red-600 mt-0.5">
                                Due: {new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                        )}
                        <span className={`inline-block mt-2 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest border ${
                            isPaid ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : 'border-slate-900 text-slate-900'
                        }`}>
                            {isPaid ? 'PAID' : invoice.status}
                        </span>
                    </div>
                </div>

                <div className="px-10 py-6 space-y-6">

                    {/* ── Paid banner ── */}
                    {isPaid && (
                        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-5 flex items-start gap-3">
                            <CheckCircle2 className="h-7 w-7 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-emerald-900">Payment Received — Thank You!</p>
                                <p className="text-sm text-emerald-700 mt-0.5">This invoice has been paid in full. We truly appreciate your business.</p>
                            </div>
                        </div>
                    )}

                    {/* ── Bill To / Invoice Details ── */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Bill To</p>
                            <div className="border-l-4 border-slate-200 pl-3 space-y-0.5">
                                <p className="font-bold text-slate-900">{customer.name}</p>
                                {customer.address && <p className="text-sm text-slate-600">{customer.address}</p>}
                                {customer.city && <p className="text-sm text-slate-600">{customer.city}{customer.state ? `, ${customer.state}` : ''}{customer.zip ? ` ${customer.zip}` : ''}</p>}
                                {customer.phone && <p className="text-sm text-slate-600">{customer.phone}</p>}
                                <p className="text-sm text-blue-600">{customer.email}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Invoice Details</p>
                            <div className="border-l-4 border-slate-200 pl-3 space-y-0.5">
                                <p className="text-sm text-slate-700">Invoice #: <span className="font-semibold">{invoice.number}</span></p>
                                {invoice.quote && (
                                    <p className="text-sm text-slate-700">Quote #: <span className="font-semibold">{invoice.quote.number}</span></p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Line Items Table ── */}
                    <div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-slate-900">
                                    <th className="text-left pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-900 w-[55%]">Description</th>
                                    <th className="text-right pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-900 w-[10%]">Qty</th>
                                    <th className="text-right pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-900 w-[15%]">Price</th>
                                    <th className="text-right pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-900 w-[20%]">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length > 0 ? items.map((item: any, i: number) => (
                                    <tr key={i} className="border-b border-slate-100">
                                        <td className="py-3 text-slate-800">{item.description}</td>
                                        <td className="py-3 text-right text-slate-700">{item.quantity}</td>
                                        <td className="py-3 text-right text-slate-700">${fmt(Number(item.unitPrice))}</td>
                                        <td className="py-3 text-right font-semibold text-slate-900">${fmt(Number(item.total))}</td>
                                    </tr>
                                )) : (
                                    <tr className="border-b border-slate-100">
                                        <td className="py-3 text-slate-800">Services Rendered</td>
                                        <td className="py-3 text-right text-slate-700">1</td>
                                        <td className="py-3 text-right text-slate-700">${fmt(invoiceTotal)}</td>
                                        <td className="py-3 text-right font-semibold text-slate-900">${fmt(invoiceTotal)}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Additional Charges (overages) ── */}
                    {overageItems.length > 0 && (
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Additional Charges</p>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-slate-900">
                                        <th className="text-left pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-900 w-[55%]">Description</th>
                                        <th className="text-right pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-900 w-[10%]">Qty</th>
                                        <th className="text-right pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-900 w-[15%]">Price</th>
                                        <th className="text-right pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-900 w-[20%]">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {overageItems.map((item: any, i: number) => (
                                        <tr key={i} className="border-b border-slate-100">
                                            <td className="py-3 text-slate-800">{item.description}</td>
                                            <td className="py-3 text-right text-slate-700">{item.quantity}</td>
                                            <td className="py-3 text-right text-slate-700">${fmt(Number(item.unitPrice))}</td>
                                            <td className="py-3 text-right font-semibold text-slate-900">${fmt(Number(item.total))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ── Totals ── */}
                    <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                            {overageItems.length > 0 && (
                                <>
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Remaining Balance</span>
                                        <span>${fmt(baseBalance)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Additional Charges</span>
                                        <span>${fmt(overageTotal)}</span>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between font-black text-xl text-slate-900 pt-3 border-t border-slate-200">
                                <span>Amount Due</span>
                                <span>${fmt(invoiceTotal)}</span>
                            </div>
                            {/* Balance due box */}
                            <div className={`flex justify-between items-center rounded px-3 py-2 mt-1 border ${
                                isPaid
                                    ? 'bg-emerald-50 border-emerald-200'
                                    : 'bg-red-50 border-red-200'
                            }`}>
                                <span className={`text-sm font-bold ${isPaid ? 'text-emerald-800' : 'text-red-700'}`}>Balance Due</span>
                                <span className={`font-bold ${isPaid ? 'text-emerald-800' : 'text-red-700'}`}>
                                    {isPaid ? '$0.00' : `$${fmt(invoiceTotal)}`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── Pay Now CTA ── */}
                    {!isPaid && paymentLink && (
                        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-lg p-6 text-center space-y-4">
                            <p className="text-lg font-black text-slate-900">Pay Your Final Balance</p>
                            <p className="text-sm text-slate-600">Click below to pay securely online. Your receipt will be emailed immediately upon payment.</p>
                            <a
                                href={paymentLink}
                                className="inline-flex items-center justify-center gap-2 px-10 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold rounded-lg shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                <CreditCard className="h-5 w-5" />
                                Pay ${fmt(invoiceTotal)} Securely
                            </a>
                            <p className="text-xs text-slate-400">Secured by Stripe · All major cards accepted</p>
                        </div>
                    )}

                    {/* ── Footer ── */}
                    <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 pb-4">
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Payment Terms</p>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                Payment is due upon receipt unless otherwise noted.<br />
                                Late payments may be subject to a 1.5% monthly fee.<br />
                                Please include invoice number with payment.
                            </p>
                        </div>
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Pioneer Concrete Coatings</p>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                Thank you for your business. We appreciate your prompt payment!
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Contact footer */}
            <div className="max-w-4xl mx-auto text-center space-y-1 pt-6 pb-10">
                <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Questions? We&apos;re here to help.</p>
                <p className="text-slate-600 font-bold">(413) 544-4933</p>
                <p className="text-slate-400 text-xs">billing@pioneerconcretecoatings.com</p>
            </div>
        </div>
    );
}
