import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ReviewsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Review Management</h1>
                    <p className="text-muted-foreground">Monitor and respond to customer feedback.</p>
                </div>
                <Button variant="outline">
                    <Send className="mr-2 h-4 w-4" />
                    Send Review Request
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Google Rating</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-bold">4.8</span>
                            <div className="flex pb-2 text-yellow-400">
                                <Star className="fill-current w-5 h-5" />
                                <Star className="fill-current w-5 h-5" />
                                <Star className="fill-current w-5 h-5" />
                                <Star className="fill-current w-5 h-5" />
                                <Star className="fill-current w-5 h-5 text-gray-300" />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">Based on 124 reviews</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Facebook Rating</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-bold">5.0</span>
                            <div className="flex pb-2 text-yellow-400">
                                <Star className="fill-current w-5 h-5" />
                                <Star className="fill-current w-5 h-5" />
                                <Star className="fill-current w-5 h-5" />
                                <Star className="fill-current w-5 h-5" />
                                <Star className="fill-current w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">Based on 42 reviews</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                {/* Review Item */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-4">
                                <Avatar>
                                    <AvatarFallback>JS</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-semibold">John Smith</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex text-yellow-400">
                                            <Star className="fill-current w-3 h-3" />
                                            <Star className="fill-current w-3 h-3" />
                                            <Star className="fill-current w-3 h-3" />
                                            <Star className="fill-current w-3 h-3" />
                                            <Star className="fill-current w-3 h-3" />
                                        </div>
                                        <span className="text-xs text-muted-foreground">• 2 days ago on Google</span>
                                    </div>
                                    <p className="mt-2 text-sm">
                                        TradeOps did an amazing job on my garage floor! The team was professional, on time, and the result is better than I expected. Highly recommend!
                                    </p>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-green-600 bg-green-50">Replied</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-4">
                                <Avatar>
                                    <AvatarFallback>MK</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-semibold">Mary Kay</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex text-yellow-400">
                                            <Star className="fill-current w-3 h-3" />
                                            <Star className="fill-current w-3 h-3" />
                                            <Star className="fill-current w-3 h-3" />
                                            <Star className="fill-current w-3 h-3" />
                                            <Star className="text-gray-300 w-3 h-3" />
                                        </div>
                                        <span className="text-xs text-muted-foreground">• 5 days ago on Facebook</span>
                                    </div>
                                    <p className="mt-2 text-sm">
                                        Good work but they arrived a bit late. Floor looks great though.
                                    </p>

                                    <div className="mt-4 flex gap-2">
                                        <Button size="sm" variant="outline">
                                            <MessageSquare className="mr-2 h-3 w-3" />
                                            Reply
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            Auto-Generate Response
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-orange-600 bg-orange-50">Pending</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
