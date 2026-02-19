// Minimal layout for auth pages (login, error) — no sidebar, no CRM chrome.
// Uses fixed positioning to overlay the parent /app/layout.tsx sidebar.
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="fixed inset-0 z-50 min-h-screen bg-slate-50 flex items-center justify-center">
            {children}
        </div>
    )
}
