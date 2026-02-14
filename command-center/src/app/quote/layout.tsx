// Minimal layout for public quote pages — no sidebar, no CRM chrome
// The root layout wraps everything in sidebar, so this layout is a
// workaround: it just passes children through. The actual styling
// is handled by the page component itself.
export default function PublicQuoteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
