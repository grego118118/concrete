"use client"

import { useState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Facebook, Instagram, Linkedin, MapPin, Sparkles, Image as ImageIcon, FileText, CheckCircle2 } from "lucide-react";
import { remixContent } from "@/lib/ai/content-remix";
import { publishBlogPost } from "@/app/actions/blog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function SocialComposerPage() {
    const [baseInput, setBaseInput] = useState("");
    const [imageDesc, setImageDesc] = useState("");
    const [generatedContent, setGeneratedContent] = useState({
        gbp: "",
        facebook: "",
        instagram: "",
        linkedin: "",
        blog: {
            title: "",
            excerpt: "",
            content: "",
            metaDescription: ""
        }
    });
    const [loading, setLoading] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };


    const handleRemix = async () => {
        if (!baseInput) {
            toast.error("Please provide some context first");
            return;
        }
        setLoading(true);
        try {
            const object = await remixContent(baseInput, imageDesc);
            setGeneratedContent(object);
            toast.success("AI Remix complete!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate content");
        } finally {
            setLoading(false);
        }
    };

    const handlePublishBlog = async () => {
        if (!generatedContent.blog.title) return;
        setPublishing(true);
        try {
            const result = await publishBlogPost(generatedContent.blog);
            if (result.success) {
                toast.success(`Blog post published: ${result.slug}`);
            } else {
                toast.error(`Publishing failed: ${result.error}`);
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred during publishing");
        } finally {
            setPublishing(false);
        }
    };

    const platforms = [
        { id: "facebook", icon: <Facebook className="h-4 w-4" />, name: "Facebook" },
        { id: "instagram", icon: <Instagram className="h-4 w-4" />, name: "Instagram" },
        { id: "linkedin", icon: <Linkedin className="h-4 w-4" />, name: "LinkedIn" },
        { id: "gbp", icon: <MapPin className="h-4 w-4" />, name: "Google" },
        { id: "blog", icon: <FileText className="h-4 w-4" />, name: "Blog" },
    ];

    return (
        <div className="space-y-6 max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-gray-900 flex items-center gap-2">
                        CONTENT <span className="text-blue-600">REMIXER</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Generate social and blog content from a single job update.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Save All Drafts</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" disabled={!generatedContent.facebook}>
                        Schedule All
                    </Button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-5">
                {/* Input Section */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-2 shadow-xl shadow-blue-500/5">
                        <CardHeader className="bg-gray-50/50 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-purple-600" />
                                Source Context
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div
                                onClick={triggerFileInput}
                                className="aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-blue-400 transition-all group overflow-hidden relative"
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-blue-500">
                                        <ImageIcon className="h-10 w-10 stroke-[1.5px]" />
                                        <span className="text-sm font-semibold">Upload Job Photo</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </div>


                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Job Details</label>
                                <Textarea
                                    placeholder="Describe the job: e.g. 'Finished a 2-car garage in Springfield with Graphite flakes. Homeowner loved the clean finish!'"
                                    className="h-40 resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl p-4 text-base"
                                    value={baseInput}
                                    onChange={(e) => setBaseInput(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Optional Image Details</label>
                                <Textarea
                                    placeholder="e.g. 'Close up of the flake texture shining in the sun'"
                                    className="h-20 resize-none border-gray-200 focus:ring-blue-500 rounded-xl"
                                    value={imageDesc}
                                    onChange={(e) => setImageDesc(e.target.value)}
                                />
                            </div>

                            <Button
                                onClick={handleRemix}
                                disabled={loading}
                                className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2 italic">
                                        <Sparkles className="h-5 w-5 animate-pulse" />
                                        Generating Magic...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5" />
                                        REMIX WITH CLAUDE AI
                                    </span>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Preview Section */}
                <div className="lg:col-span-3 space-y-6">
                    <Tabs defaultValue="facebook" className="w-full">
                        <TabsList className="grid w-full grid-cols-5 p-1 bg-gray-100/50 rounded-xl h-14 border border-gray-100">
                            {platforms.map(p => (
                                <TabsTrigger
                                    key={p.id}
                                    value={p.id}
                                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 transition-all font-semibold"
                                >
                                    <div className="flex flex-col items-center gap-0.5">
                                        {p.icon}
                                        <span className="text-[10px] hidden sm:inline">{p.name}</span>
                                    </div>
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <AnimatePresence mode="wait">
                            {platforms.map((platform) => (
                                <TabsContent key={platform.id} value={platform.id} className="mt-4 outline-none">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Card className="border-2 border-primary/5 shadow-xl shadow-gray-200/50 min-h-[500px] flex flex-col">
                                            <CardHeader className="bg-gray-50/50 border-b flex flex-row items-center justify-between py-4">
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    {platform.icon}
                                                    {platform.id === 'blog' ? 'Blog Post Preview' : `${platform.name} Post`}
                                                </CardTitle>
                                                {generatedContent.facebook && (
                                                    <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3" /> AI GENERATED
                                                    </span>
                                                )}
                                            </CardHeader>
                                            <CardContent className="flex-1 pt-6 space-y-4">
                                                {platform.id === 'blog' ? (
                                                    <div className="space-y-4">
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-bold text-gray-400">Title</label>
                                                            <input
                                                                className="w-full text-xl font-bold border-none focus:ring-0 p-0 placeholder:text-gray-200"
                                                                value={generatedContent.blog.title}
                                                                onChange={(e) => setGeneratedContent({
                                                                    ...generatedContent,
                                                                    blog: { ...generatedContent.blog, title: e.target.value }
                                                                })}
                                                                placeholder="AI will write a catchy title..."
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-bold text-gray-400">Content</label>
                                                            <Textarea
                                                                className="min-h-[400px] border-none focus:ring-0 p-0 text-base leading-relaxed placeholder:text-gray-200"
                                                                value={generatedContent.blog.content}
                                                                onChange={(e) => setGeneratedContent({
                                                                    ...generatedContent,
                                                                    blog: { ...generatedContent.blog, content: e.target.value }
                                                                })}
                                                                placeholder="Full blog content will appear here..."
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <Textarea
                                                        className="min-h-[450px] border-none focus:ring-0 p-0 text-base leading-relaxed placeholder:text-gray-200 resize-none"
                                                        value={generatedContent[platform.id as keyof typeof generatedContent] as string}
                                                        onChange={(e) => setGeneratedContent({ ...generatedContent, [platform.id]: e.target.value })}
                                                        placeholder="AI generated content will appear here..."
                                                    />
                                                )}
                                            </CardContent>
                                            <CardFooter className="bg-gray-50/50 border-t justify-end gap-3 py-4">
                                                <Button variant="outline" className="font-semibold px-6">Save Draft</Button>
                                                {platform.id === 'blog' ? (
                                                    <Button
                                                        className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 shadow-lg shadow-green-500/20"
                                                        onClick={handlePublishBlog}
                                                        disabled={publishing || !generatedContent.blog.title}
                                                    >
                                                        {publishing ? "Publishing..." : "Publish to Site"}
                                                    </Button>
                                                ) : (
                                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 shadow-lg shadow-blue-500/20">
                                                        Post to {platform.name}
                                                    </Button>
                                                )}
                                            </CardFooter>
                                        </Card>
                                    </motion.div>
                                </TabsContent>
                            ))}
                        </AnimatePresence>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

