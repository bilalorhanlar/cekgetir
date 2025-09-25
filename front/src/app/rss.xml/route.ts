import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

function getPosts() {
  const staticPosts: any[] = []
  try {
    // Load static posts from blog detail file by importing is not trivial; skip.
  } catch {}
  let jsonPosts: any[] = []
  try {
    const filePath = path.join(process.cwd(), 'front', 'public', 'data', 'blog-posts.json')
    const raw = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(raw)
    if (Array.isArray(data.posts)) jsonPosts = data.posts
  } catch {}
  return [...jsonPosts]
}

export async function GET() {
  const baseUrl = 'https://cekgetir.com'
  const posts = getPosts()
  const items = posts.map((p) => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${baseUrl}/blog/${p.id}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${p.id}</guid>
      <pubDate>${new Date(p.date || Date.now()).toUTCString()}</pubDate>
      <description><![CDATA[${p.excerpt || ''}]]></description>
    </item>
  `).join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0">
    <channel>
      <title>Çekgetir Blog</title>
      <link>${baseUrl}/blog</link>
      <description>Yol yardım, çekici ve araç taşıma içerikleri</description>
      ${items}
    </channel>
  </rss>`

  return new NextResponse(rss, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=600'
    }
  })
}
