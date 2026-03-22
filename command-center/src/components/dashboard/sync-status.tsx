"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SyncStatus() {
    const router = useRouter();
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const fetchStatus = async () => {
        try {
            const res = await fetch("/app/api/tradeops/sync");

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await res.text();
                // console.error("Received non-JSON response:", text.substring(0, 500));
                setStatus({ status: "FAILED", errorMessage: `Server Error: Received HTML/Text instead of JSON` });
                return;
            }

            const data = await res.json();

            if (!res.ok) {
                setStatus({ status: "FAILED", errorMessage: data.error || data.status || "Unknown Server Error" });
                return;
            }

            setStatus(data);
            if (data.status === "RUNNING") {
                // Poll again in 2s
                setTimeout(fetchStatus, 2000);
            } else if (status?.status === "RUNNING" && data.status === "COMPLETED") {
                toast.success("Sync completed!");
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to fetch sync status", error);
            setStatus({ status: "FAILED", errorMessage: "Network Error" });
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const startSync = async () => {
        setLoading(true);
        try {
            const res = await fetch("/app/api/tradeops/sync", { method: "POST" });

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await res.text();
                console.error("Sync POST failed (non-JSON):", text.substring(0, 500));
                toast.error("Server returned invalid response (HTML). Check logs.");
                setLoading(false);
                return;
            }

            const data = await res.json();
            if (res.ok) {
                toast.success("Sync started");
                fetchStatus();
            } else if (res.status === 409) {
                toast.warning("Sync already running");
                fetchStatus();
            } else {
                toast.error(data.error || "Failed to start sync");
            }
        } catch (error) {
            console.error("Sync network error:", error);
            toast.error("Network error");
        }
        setLoading(false);
    };

    if (!status) return null;

    return (
        <div className="flex items-center gap-4">
            {status.status === "RUNNING" ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {status.errorMessage || "Syncing..."}
                </div>
            ) : status.status === "FAILED" ? (
                <div className="flex items-center gap-2 text-sm text-red-500">
                    <XCircle className="h-4 w-4" />
                    Sync Failed: {status.errorMessage}
                </div>
            ) : status.status === "COMPLETED" ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Synced {status.completedAt ? new Date(status.completedAt).toLocaleTimeString() : ""}
                </div>
            ) : null}

            <Button
                variant="outline"
                size="sm"
                onClick={startSync}
                disabled={status.status === "RUNNING" || loading}
            >
                <RefreshCw className={`mr-2 h-4 w-4 ${status.status === "RUNNING" ? "animate-spin" : ""}`} />
                Sync Now
            </Button>
        </div>
    );
}
