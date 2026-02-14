
import { defineConfig } from 'vite';

export default defineConfig({
    root: './',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: 'index.html',
                gallery: 'gallery.html',
                blog: 'blog.html',
                blog_cost: 'blog/garage-floor-coating-cost-massachusetts.html',
                blog_poly_vs_epoxy: 'blog/polyaspartic-vs-epoxy.html',
                blog_5_reasons: 'blog/5-reasons-polyaspartic-garage-floor.html',
                longmeadow: 'locations/garage-floor-coating-longmeadow-ma.html',
                simsbury: 'locations/garage-floor-coating-simsbury-ct.html',
                glastonbury: 'locations/garage-floor-coating-glastonbury-ct.html',
                avon: 'locations/garage-floor-coating-avon-ct.html',
                southampton: 'locations/garage-floor-coating-southampton-ma.html',
                wilbraham: 'locations/garage-floor-coating-wilbraham-ma.html',
                farmington: 'locations/garage-floor-coating-farmington-ct.html',
                sturbridge: 'locations/garage-floor-coating-sturbridge-ma.html',
                hadley: 'locations/garage-floor-coating-hadley-ma.html',
                deerfield: 'locations/garage-floor-coating-deerfield-ma.html',
            },
        },
    },
});
