import type { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

function readBlogIds(): Array<{ id: number | string; updatedAt?: string }> {
  try {
    const filePath = path.join(process.cwd(), 'front', 'public', 'data', 'blog-posts.json')
    const raw = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(raw)
    if (Array.isArray(data.posts)) {
      return data.posts.map((p: any) => ({ id: p.id, updatedAt: p.date }))
    }
  } catch (e) {}
  return [1, 2, 3, 4, 5, 6, 7].map(id => ({ id }))
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://cekgetir.com'
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/iletisim`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${baseUrl}/sss`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/pnr-sorgula`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
  ]

  const blogRoutes: MetadataRoute.Sitemap = readBlogIds().map(({ id, updatedAt }) => ({
    url: `${baseUrl}/blog/${id}`,
    lastModified: updatedAt ? new Date(updatedAt) : now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticRoutes, ...blogRoutes]
}


