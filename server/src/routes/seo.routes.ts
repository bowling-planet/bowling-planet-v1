import express, { Request, Response } from 'express';
import { BaseProduct, ProductItem } from '../models/product';
import Project from '../models/project';
import Blog from '../models/blog';
import { ServiceDetail } from '../models/ServiceDetail';

const router = express.Router();

const BASE_URL = 'https://bowlingplanet.co.in';

// PERFORMANCE: Cache the sitemap for 1 hour to prevent N+4 DB queries on every crawler hit.
// Without this, Google/Bing crawlers can trigger dozens of 4-query batches per hour.
let sitemapCache: { content: string; generatedAt: number } | null = null;
const SITEMAP_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

router.get('/sitemap.xml', async (req: Request, res: Response) => {
  // Serve from cache if fresh
  if (sitemapCache && Date.now() - sitemapCache.generatedAt < SITEMAP_CACHE_TTL_MS) {
    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600');
    return res.send(sitemapCache.content);
  }

  try {
    const [baseProducts, productItems, projects, blogs, serviceDetails] = await Promise.all([
      BaseProduct.find({ status: 'active' }).select('slug updatedAt'),
      ProductItem.find({ status: 'active' }).populate('baseProduct', 'slug').select('slug updatedAt baseProduct'),
      Project.find({ isPublished: true, isDeleted: false }).select('slug updatedAt'),
      Blog.find({ isPublished: true, isDeleted: false }).select('slug updatedAt'),
      ServiceDetail.find().select('slug updatedAt'),
    ]);

    const staticRoutes = [
      '',
      '/about',
      '/projects',
      '/products',
      '/services',
      '/franchise',
      '/careers',
      '/contact',
      '/blog',
    ];

    const generateUrlNode = (path: string, lastmod?: string) => `
  <url>
    <loc>${BASE_URL}${path}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>weekly</changefreq>
    <priority>${path === '' ? '1.0' : '0.8'}</priority>
  </url>`;

    const today = new Date().toISOString().split('T')[0];

    const urls = [
      ...staticRoutes.map((route) => generateUrlNode(route, today)),
      ...baseProducts.map((p) => generateUrlNode(`/products/${p.slug}`, p.updatedAt.toISOString().split('T')[0])),
      ...productItems.map((p: any) => {
        const baseSlug = p.baseProduct?.slug;
        return baseSlug ? generateUrlNode(`/products/${baseSlug}/${p.slug}`, p.updatedAt.toISOString().split('T')[0]) : '';
      }),
      ...projects.map((p) => generateUrlNode(`/projects/${p.slug}`, p.updatedAt.toISOString().split('T')[0])),
      ...blogs.map((b) => generateUrlNode(`/blog/${b.slug}`, b.updatedAt.toISOString().split('T')[0])),
      ...serviceDetails.map((s: any) => generateUrlNode(`/services/${s.slug}`, s.updatedAt.toISOString().split('T')[0])),
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`;

    // Store in cache
    sitemapCache = { content: sitemap, generatedAt: Date.now() };

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).end();
  }
});

router.get('/robots.txt', (req: Request, res: Response) => {
  const robots = `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

export default router;
