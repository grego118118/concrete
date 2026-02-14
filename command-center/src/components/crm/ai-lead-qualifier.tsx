"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { qualifyLead } from "@/lib/ai/lead-qualifier"; // In a real app, this would be a server action call
// Note: Direct import of server function in client component is not allowed in Next.js.
// We'll assume this is wrapped in a Server Action or API route for the implementation.

export function LeadQualifierChat() {
    const [messages, setMessages] = useState<{ role: "user" | "assistant", content: string }[]>([
        { role: "assistant", content: "Hello! I'm here to help qualify this lead. What is the customer asking about?" }
    ]);
    const [input, setInput] = useState("");
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { role: "user", content: input } as const];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        // Simulate AI response/analysis (Mocking Server Action response)
        // In production: const result = await qualifiedLeadAction(newMessages);
        setTimeout(() => {
            setMessages([...newMessages, { role: "assistant", content: "I've updated the analysis based on that info. Ask them about the age of the concrete next." }]);
            setAnalysis({
                score: 75,
                summary: "Customer interested in 2-car garage. Concrete is 5 years old, some pitting.",
                projectType: "GARAGE",
                suggestedNextStep: "Schedule Site Visit"
            });
            setLoading(false);
        }, 1000);
    };

    return (
        <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        AI Lead Assistant
                    </CardTitle>
                    {analysis && (
                        <Badge variant={analysis.score > 70 ? "default" : "secondary"}>
                            Score: {analysis.score}/100
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <div className="flex-1 flex overflow-hidden">
                {/* Chat Area */}
                <div className="flex-1 flex flex-col border-r">
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-primary/10 text-primary'}`}>
                                        {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                    </div>
                                    <div className={`max-w-[80%] rounded-lg p-3 text-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-muted'}`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                    <div className="p-4 border-t flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type lead response or notes..."
                        />
                        <Button size="icon" onClick={handleSend} disabled={loading}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Analysis Sidebar */}
                <div className="w-[300px] p-4 bg-muted/10">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                        Live Analysis
                    </h3>
                    {analysis ? (
                        <div className="space-y-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Summary</span>
                                <p className="mt-1">{analysis.summary}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <span className="text-muted-foreground block">Type</span>
                                    <Badge variant="outline">{analysis.projectType}</Badge>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Action</span>
                                    <span className="font-medium text-green-600">{analysis.suggestedNextStep}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground text-center mt-10">
                            Start chatting to generate AI analysis...
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
