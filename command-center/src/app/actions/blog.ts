'use server'

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

const PROJECT_ROOT = path.resolve(process.cwd(), '..');
const BLOG_DIR = path.join(PROJECT_ROOT, 'blog');
const BLOG_LISTING_FILE = path.join(PROJECT_ROOT, 'blog.html');

export type BlogPostData = {
    title: string;
    excerpt: string;
    content: string;
    metaDescription: string;
};

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export async function publishBlogPost(data: BlogPostData) {
    try {
        const slug = generateSlug(data.title);
        const fileName = `${slug}.html`;
        const filePath = path.join(BLOG_DIR, fileName);
        const date = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });


        // 1. Create the blog post file using a template
        const template = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title} | Pioneer Concrete Coatings</title>

    <!-- SEO Meta Tags -->
    <meta name="description" content="${data.metaDescription}">
    <meta name="keywords" content="concrete coating, floor coating, pioneer concrete coatings, ${data.title.toLowerCase()}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://pioneerconcretecoatings.com/blog/${fileName}">

    <!-- Open Graph Tags -->
    <meta property="og:title" content="${data.title}">
    <meta property="og:description" content="${data.metaDescription}">
    <meta property="og:image" content="https://pioneerconcretecoatings.com/assets/images/hero-garage.jpg">
    <meta property="og:url" content="https://pioneerconcretecoatings.com/blog/${fileName}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="Pioneer Concrete Coatings LLC">

    <!-- Favicon Links -->
    <link rel="icon" type="image/x-icon" href="../assets/images/favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="../assets/images/favicon-32x32.png">
    <link rel="apple-touch-icon" href="../assets/images/apple-touch-icon.png">

    <!-- Vite Entry Point -->
    <script type="module" src="/src/main.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
    
    <style>
        .blog-content h2 { font-size: 1.875rem; font-weight: 700; color: #111827; margin-top: 2.5rem; margin-bottom: 1rem; }
        .blog-content h3 { font-size: 1.5rem; font-weight: 600; color: #1f2937; margin-top: 2rem; margin-bottom: 0.75rem; }
        .blog-content p { margin-bottom: 1.25rem; line-height: 1.75; color: #4b5563; }
        .blog-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.25rem; color: #4b5563; }
        .blog-content li { margin-bottom: 0.5rem; }
        .blog-content strong { color: #111827; font-weight: 600; }
    </style>
</head>

<body class="bg-gray-50 text-gray-800 pb-16 md:pb-0">
    <header class="shadow-md sticky top-0 z-50 bg-white">
        <nav class="container mx-auto px-6 py-0 flex justify-between items-center">
            <a href="../index.html" class="flex items-center">
                <img src="../assets/images/logo-new.png" alt="Pioneer Concrete Coatings LLC Logo" class="h-32 w-auto">
            </a>
            <div class="hidden md:flex items-center space-x-6">
                <a href="../index.html" class="nav-link">Home</a>
                <a href="../blog.html" class="nav-link active">Blog</a>
                <a href="../index.html#contact" class="bg-blue-500 text-white px-4 py-2 rounded-lg">Get Free Quote</a>
            </div>
        </nav>
    </header>

    <main>
        <section class="bg-gray-900 text-white py-16">
            <div class="container mx-auto px-6 text-center">
                <h1 class="text-3xl md:text-5xl font-extrabold mb-6 max-w-4xl mx-auto leading-tight">${data.title}</h1>
                <div class="flex items-center justify-center gap-3 text-sm text-gray-400">
                    <span class="font-medium text-white">By Pioneer Concrete Coatings</span>
                    <span>•</span>
                    <span>${date}</span>
                </div>
            </div>
        </section>

        <article class="py-16 bg-white">
            <div class="container mx-auto px-6 max-w-4xl">
                <div class="blog-content">
                    ${data.content}
                </div>
                
                <div class="bg-blue-50 rounded-lg p-8 mt-12 text-center">
                    <h3 class="text-2xl font-bold mb-2">Get a Free Estimate</h3>
                    <p class="text-gray-600 mb-6">Ready to transform your floor?</p>
                    <a href="../index.html#contact" class="inline-block bg-blue-500 text-white font-bold py-3 px-8 rounded-lg">Request My Quote</a>
                </div>
            </div>
        </article>
    </main>

    <footer class="bg-gray-900 text-gray-400 py-8 text-center">
        <p>&copy; ${new Date().getFullYear()} Pioneer Concrete Coatings LLC. All Rights Reserved.</p>
    </footer>
</body>
</html>`;

        await fs.writeFile(filePath, template);

        // 2. Update the blog listing page (blog.html)
        let listingHtml = await fs.readFile(BLOG_LISTING_FILE, 'utf-8');

        const newCard = `
                    <!-- Blog Post Card: ${data.title} -->
                    <article class="blog-card bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                        <a href="blog/${fileName}" class="block">
                            <img src="assets/images/hero-garage.jpg" alt="${data.title}" class="w-full h-48 object-cover">
                            <div class="p-6">
                                <div class="flex items-center gap-3 mb-3">
                                    <span class="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">New Update</span>
                                    <span class="text-xs text-gray-500">5 min read</span>
                                </div>
                                <h2 class="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">${data.title}</h2>
                                <p class="text-gray-600 text-sm mb-4">${data.excerpt}</p>
                                <div class="flex items-center text-sm text-gray-500">
                                    <span>${date}</span>
                                </div>
                            </div>
                        </a>
                    </article>`;

        // Insert after the grid start comment or tag
        const gridStartTag = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">';
        if (listingHtml.includes(gridStartTag)) {
            listingHtml = listingHtml.replace(gridStartTag, `${gridStartTag}\n${newCard}`);
            await fs.writeFile(BLOG_LISTING_FILE, listingHtml);
        }

        return { success: true, slug };
    } catch (error) {
        console.error('Failed to publish blog post:', error);
        return { success: false, error: (error as Error).message };
    }
}
