"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Users, Activity, Database, RefreshCw, StopCircle } from "lucide-react";
import { runScraper, getScrapedLeadsCount, getScraperStatus, importLeadsToDatabase, stopScraper } from "@/app/actions/leads";
import { toast } from "sonner";

export function LeadScraperCard() {
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [stopping, setStopping] = useState(false);
    const [csvCount, setCsvCount] = useState(0);
    const [dbCount, setDbCount] = useState(0);
    const [status, setStatus] = useState({ active: false, lastMessage: "" });
    const pollInterval = useRef<NodeJS.Timeout | null>(null);

    const fetchCount = async () => {
        const result = await getScrapedLeadsCount();
        setCsvCount(result.csvCount);
        setDbCount(result.dbCount);
    };

    const fetchStatus = async () => {
        const s = await getScraperStatus();
        setStatus(s);
        if (s.active) {
            setLoading(true);
            await fetchCount();
        } else if (loading && !s.active) {
            setLoading(false);
            await fetchCount();
        }
    };

    useEffect(() => {
        fetchCount();
        fetchStatus();

        pollInterval.current = setInterval(() => {
            fetchStatus();
        }, 3000);

        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, []);

    const handleScrape = async () => {
        if (loading || status.active) return;

        setLoading(true);
        try {
            runScraper().then(() => {
                toast.success("Lead scraper finished! Leads imported to CRM.");
                fetchCount();
                setLoading(false);
            }).catch((e) => {
                toast.error("Scraper encountered an error or was stopped.");
                setLoading(false);
            });

            toast.info("Scraper started in background.");
        } catch (error: any) {
            toast.error("Failed to start scraper.");
            setLoading(false);
        }
    };

    const handleStop = async () => {
        setStopping(true);
        try {
            const result = await stopScraper();
            if (result.stopped) {
                toast.success("Scraper stopped.");
                setLoading(false);
                setStatus({ active: false, lastMessage: "Stopped by user" });
            } else {
                toast.error(result.error || "Failed to stop scraper.");
            }
        } catch {
            toast.error("Failed to stop scraper.");
        }
        setStopping(false);
    };

    const handleImport = async () => {
        setImporting(true);
        try {
            const result = await importLeadsToDatabase();
            if (result.error) {
                toast.error(`Import failed: ${result.error}`);
            } else {
                toast.success(`Imported ${result.imported} leads to CRM! (${result.skipped} duplicates, ${result.noEmail} skipped — no email)`);
            }
            await fetchCount();
        } catch (error) {
            toast.error("Failed to import leads.");
        }
        setImporting(false);
    };

    return (
        <Card className="h-full flex flex-col border-blue-100 shadow-sm">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Search className="h-5 w-5 text-blue-500" />
                        Lead Scraper
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {status.active && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 border border-green-200 animate-pulse">
                                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                <span className="text-[10px] font-bold text-green-700 uppercase tracking-tighter">Active</span>
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-blue-500"
                            onClick={async () => {
                                await fetchCount();
                                await fetchStatus();
                                toast.success("Refreshed!");
                            }}
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
                <CardDescription>
                    Scan local business directories for new opportunities.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pt-0">
                <div className="flex flex-col items-center justify-center h-full space-y-3 py-4 relative">
                    {/* Stats Row */}
                    <div className="flex items-center gap-6 w-full justify-center">
                        <div className="flex flex-col items-center">
                            <div className="text-4xl font-black tracking-tighter text-blue-600">
                                {csvCount}
                            </div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground mt-1">
                                Found in CSV
                            </p>
                        </div>
                        <div className="h-10 w-px bg-gray-200"></div>
                        <div className="flex flex-col items-center">
                            <div className="text-4xl font-black tracking-tighter text-green-600">
                                {dbCount}
                            </div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground mt-1">
                                In CRM
                            </p>
                        </div>
                    </div>

                    {/* Live Progress */}
                    {status.lastMessage && (
                        <div className="w-full mt-3 p-3 rounded-lg bg-gray-950 text-[10px] font-mono text-green-400 overflow-hidden border border-gray-800 shadow-inner max-h-[80px]">
                            <div className="flex items-center gap-2 mb-2 border-b border-gray-800 pb-1">
                                <Activity className="h-3 w-3 text-green-500" />
                                <span className="text-gray-500 uppercase tracking-widest font-bold">Live Progress</span>
                                <div className="ml-auto flex items-center gap-1">
                                    <span className="h-1 w-1 rounded-full bg-green-500/50"></span>
                                    <span className="h-1 w-1 rounded-full bg-green-500/50"></span>
                                    <span className="h-1 w-1 rounded-full bg-green-500 animate-pulse"></span>
                                </div>
                            </div>
                            <div className="font-medium opacity-90 break-all leading-relaxed">
                                {status.lastMessage}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="border-t bg-slate-50/80 p-3 gap-2 flex-col">
                <div className="flex gap-2 w-full">
                    <Button
                        onClick={handleScrape}
                        disabled={loading || status.active}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 font-bold shadow-md shadow-blue-200 h-9"
                    >
                        {loading || status.active ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Scraping...
                            </>
                        ) : (
                            <>
                                <Search className="mr-2 h-4 w-4" />
                                Scrape Leads
                            </>
                        )}
                    </Button>
                    {(loading || status.active) && (
                        <Button
                            onClick={handleStop}
                            disabled={stopping}
                            variant="destructive"
                            className="font-bold h-9 shadow-md shadow-red-200"
                        >
                            {stopping ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <StopCircle className="mr-2 h-4 w-4" />
                            )}
                            Stop
                        </Button>
                    )}
                    <Button
                        onClick={handleImport}
                        disabled={importing || csvCount === 0}
                        variant="outline"
                        className="font-semibold h-9 border-green-200 text-green-700 hover:bg-green-50"
                    >
                        {importing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Database className="mr-2 h-4 w-4" />
                        )}
                        Import to CRM
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
