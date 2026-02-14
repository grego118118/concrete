"use client";

import { useState, useRef } from "react";
import { addPhotoToJob, addPhotoToQuote, uploadFile } from "@/app/actions/upload";
import { Loader2, Camera, X, Upload } from "lucide-react";
import { toast } from "sonner";


interface PhotoUploaderProps {
    jobId?: string;
    quoteId?: string;
    existingPhotos?: string[];
    onUploadComplete?: (urls: string[]) => void;
}

export function PhotoUploader({ jobId, quoteId, existingPhotos = [], onUploadComplete }: PhotoUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedUrls, setUploadedUrls] = useState<string[]>(existingPhotos);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (files: FileList | File[]) => {
        setIsUploading(true);
        const newUrls: string[] = [];

        try {
            for (const file of Array.from(files)) {
                console.log(`[PhotoUploader] Uploading ${file.name} (${file.type})...`);
                const formData = new FormData();
                formData.append("file", file);

                const blob = await uploadFile(formData);
                const url = blob.url;

                if (jobId) {
                    await addPhotoToJob(jobId, url);
                } else if (quoteId) {
                    await addPhotoToQuote(quoteId, url);
                }
                newUrls.push(url);
            }

            setUploadedUrls(prev => [...prev, ...newUrls]);
            if (onUploadComplete) onUploadComplete(newUrls);
            toast.success(`Uploaded ${newUrls.length} photos successfully`);
        } catch (error) {
            console.error("Upload Error:", error);
            toast.error("Failed to upload photos. The file might be too large or invalid.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleUpload(e.dataTransfer.files);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files.length > 0) {
            handleUpload(e.target.files);
        }
    };

    return (
        <div className="w-full space-y-4">
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                    relative border-2 border-dashed rounded-xl p-8 transition-colors cursor-pointer
                    flex flex-col items-center justify-center gap-3
                    ${dragActive ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50 hover:bg-slate-100"}
                    ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.heic"
                    onChange={handleChange}
                    className="hidden"
                    disabled={isUploading}
                />

                {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                        <span className="text-sm font-medium text-slate-600">Processing & Uploading...</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="bg-white p-3 rounded-full shadow-sm border border-slate-100">
                            <Camera className="h-6 w-6 text-slate-500" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-700">Click or drag photos here</p>
                            <p className="text-xs text-slate-500 mt-1">Supports JPEG, PNG, HEIC from iPhone</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Preview of local uploads (useful when jobId or quoteId isn't present yet) */}
            {uploadedUrls.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                    {uploadedUrls.map((url, i) => (
                        <div key={i} className="relative aspect-square rounded-lg border overflow-hidden bg-slate-100 shadow-sm">
                            <img src={url} alt="Preview" className="object-cover w-full h-full" />
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setUploadedUrls(prev => prev.filter(u => u !== url));
                                }}
                                className="absolute top-1 right-1 p-1 bg-white/90 rounded-full hover:bg-white shadow-sm transition-opacity"
                            >
                                <X className="h-3 w-3 text-slate-600" />
                            </button>
                            <input type="hidden" name="photoUrls" value={url} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
