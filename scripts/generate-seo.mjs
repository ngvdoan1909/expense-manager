import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const fallbackSiteUrl = 'https://so-quy.vercel.app'
const envSiteUrl =
  process.env.VITE_SITE_URL ||
  process.env.SITE_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL ||
  fallbackSiteUrl

const siteUrl = (envSiteUrl.startsWith('http') ? envSiteUrl : `https://${envSiteUrl}`).replace(/\/$/, '')
const publicDir = resolve(process.cwd(), 'public')
const routes = ['/', '/login']
const now = new Date().toISOString()

await mkdir(publicDir, { recursive: true })

await writeFile(
  resolve(publicDir, 'robots.txt'),
  [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n'),
)

await writeFile(
  resolve(publicDir, 'sitemap.xml'),
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...routes.map(
      (route) => `  <url>
    <loc>${siteUrl}${route}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.7'}</priority>
  </url>`,
    ),
    '</urlset>',
    '',
  ].join('\n'),
)
