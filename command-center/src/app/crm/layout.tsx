export default function CrmLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50/50">
            {children}
        </div>
    );
}

