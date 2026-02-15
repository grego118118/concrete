import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Camera, Package, ArrowLeft, Mail, Phone, MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import { getJob } from "@/app/actions/jobs";
import { notFound } from "next/navigation";
import { PhotoUploader } from "@/components/crm/photo-uploader";
import { JobAreaCalculator } from "@/components/crm/job-area-calculator";

export default async function JobDetailPage({ params }: { params: { id: string } }) {
    const job = await getJob(params.id);

    if (!job) {
        return notFound();
    }

    return (
        <div className="space-y-6 pb-12">
            <Link href="/crm/jobs" className="flex items-center text-sm text-muted-foreground hover:text-blue-600 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
            </Link>

            <div className="flex flex-col md:flex-row items-start justify-between gap-6 pb-6 border-b">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{job.title}</h1>
                        <Badge className="bg-blue-600">{job.status}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <Link href={`/crm/customers/${job.customer.id}`} className="font-semibold text-blue-600 hover:underline flex items-center gap-1">
                            {job.customer.name}
                        </Link>
                        {job.scheduledAt && (
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(job.scheduledAt).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Link href={`#upload-section`} className="flex-1 md:flex-none">
                        <Button variant="outline" className="w-full">
                            <Camera className="mr-2 h-4 w-4" />
                            Add Photo
                        </Button>
                    </Link>
                    <Link href={`/crm/jobs/${job.id}/edit`} className="flex-1 md:flex-none">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">Manage Job</Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <JobAreaCalculator jobId={job.id} />

                    <Card>
                        <CardHeader>
                            <CardTitle>Job Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-700 whitespace-pre-wrap">
                                {job.description || "No detailed description provided."}
                            </p>
                        </CardContent>
                    </Card>

                    <Card id="upload-section">
                        <CardHeader>
                            <CardTitle>Photo Board</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <PhotoUploader jobId={job.id} />

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {job.photos && job.photos.length > 0 ? (
                                    job.photos.map((p: any) => (
                                        <div key={p.id} className="aspect-square bg-slate-100 rounded-lg overflow-hidden relative group border shadow-sm transition-transform hover:scale-105">
                                            <img src={p.url} alt={p.caption || ""} className="object-cover w-full h-full" />
                                            {p.caption && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {p.caption}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-12 text-center text-muted-foreground bg-slate-50 border-2 border-dashed rounded-xl">
                                        <Camera className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                        <p className="text-sm">No photos uploaded to this job yet.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-t-4 border-t-blue-600 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-lg">Customer Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium text-slate-700">{job.customer.address || "No address"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium text-slate-700">{job.customer.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium text-slate-700">{job.customer.phone || "No phone"}</span>
                                </div>
                            </div>
                            <Link href={`/crm/customers/${job.customer.id}`} className="block pt-2">
                                <Button variant="outline" size="sm" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">View Profile</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Project Inventory</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!job.parts || job.parts.length === 0 ? (
                                <p className="text-muted-foreground text-xs text-center py-4 bg-slate-50 rounded-lg">No inventory items logged.</p>
                            ) : (
                                <div className="space-y-3">
                                    {job.parts.map((part: any) => (
                                        <div key={part.id} className="flex items-center justify-between text-sm pb-2 border-b last:border-0">
                                            <div>
                                                <p className="font-bold text-slate-900">{part.name}</p>
                                                <p className="text-[10px] text-slate-500 uppercase">{part.sku || "No SKU"}</p>
                                            </div>
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-mono">
                                                x{part.quantity}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="pt-4">
                                <Button size="sm" variant="ghost" className="w-full text-xs text-slate-400">
                                    <Package className="mr-2 h-3 w-3" />
                                    Log Extra Materials
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
