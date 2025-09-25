/*
  PDF to Blog JSON Ingestion Script
  - Scans /public/pdf-blog for .pdf files
  - Extracts text, derives title/excerpt/slug
  - Converts simple structure to HTML (paragraphs, headings, lists)
  - Tries to associate an image by filename prefix; falls back to a default
  - Writes /public/data/blog-posts.json
*/

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const ROOT = process.cwd();
const PDF_DIR = path.join(ROOT, 'front', 'public', 'pdf-blog');
const IMAGES_DIR = path.join(ROOT, 'front', 'public', 'images');
const OUT_DIR = path.join(ROOT, 'front', 'public', 'data');
const OUT_FILE = path.join(OUT_DIR, 'blog-posts.json');

function toSlug(input) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function findImageFor(baseName) {
  const candidates = [
    `${baseName}.jpg`, `${baseName}.JPG`, `${baseName}.jpeg`, `${baseName}.JPEG`,
    `${baseName}.png`, `${baseName}.PNG`
  ];
  for (const file of candidates) {
    const p = path.join(IMAGES_DIR, file);
    if (fs.existsSync(p)) {
      return `/images/${file}`;
    }
  }
  // Also try blog prefixed variants like blog1.JPG if baseName is like blog1
  const files = fs.existsSync(IMAGES_DIR) ? fs.readdirSync(IMAGES_DIR) : [];
  const match = files.find(f => f.toLowerCase().startsWith(baseName.toLowerCase() + '.'));
  if (match) return `/images/${match}`;
  return '/images/blog1.JPG';
}

function linesToHtml(lines) {
  const blocks = [];
  let listBuffer = [];

  const flushList = () => {
    if (listBuffer.length) {
      blocks.push(`<ul>${listBuffer.map(li => `<li>${li}</li>`).join('')}</ul>`);
      listBuffer = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushList();
      continue;
    }
    // Headings: lines that look like numbered sections or ALL CAPS short lines
    if (/^\d+\.|^\d+\)/.test(line)) {
      flushList();
      blocks.push(`<h2>${line.replace(/^\d+[\.)]\s*/, '')}</h2>`);
      continue;
    }
    if (/^[A-ZÇĞİÖŞÜ0-9\s\-]{3,}$/.test(line) && line.length < 90) {
      flushList();
      blocks.push(`<h2>${line}</h2>`);
      continue;
    }
    // Bullets
    if (/^[•\-\*\u2022]\s+/.test(line)) {
      listBuffer.push(line.replace(/^[•\-\*\u2022]\s+/, ''));
      continue;
    }
    if (/^\d+\s*\-\s+/.test(line)) {
      listBuffer.push(line.replace(/^\d+\s*\-\s+/, ''));
      continue;
    }
    // Paragraph
    flushList();
    blocks.push(`<p>${line}</p>`);
  }
  flushList();
  return blocks.join('\n');
}

async function parsePdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  const text = (data.text || '').replace(/\r/g, '');
  const lines = text.split('\n').map(l => l.trim());
  const nonEmpty = lines.filter(Boolean);

  const title = nonEmpty[0] || path.basename(filePath, path.extname(filePath));
  const excerpt = (nonEmpty.slice(1).find(l => l.length > 30) || nonEmpty[1] || '').slice(0, 160);
  const content = linesToHtml(lines);
  return { title, excerpt, content };
}

async function main() {
  if (!fs.existsSync(PDF_DIR)) {
    console.error(`PDF directory not found: ${PDF_DIR}`);
    process.exit(1);
  }
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const files = fs.readdirSync(PDF_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));
  if (!files.length) {
    console.log('No PDF files found. Nothing to do.');
    return;
  }

  const posts = [];
  let idCounter = 1;
  for (const file of files) {
    const filePath = path.join(PDF_DIR, file);
    try {
      const { title, excerpt, content } = await parsePdf(filePath);
      const base = path.basename(file, path.extname(file));
      const slug = toSlug(base.length > 4 ? base : title);
      const image = findImageFor(base);
      const post = {
        id: idCounter++,
        title,
        excerpt,
        slug,
        category: 'Genel',
        date: new Date().toISOString().slice(0, 10),
        readTime: `${Math.max(3, Math.ceil(content.split(/\s+/).length / 200))} dk`,
        author: 'Çekgetir Ekibi',
        image,
        content
      };
      posts.push(post);
    } catch (err) {
      console.error(`Failed to parse ${file}:`, err.message);
    }
  }

  // Sort by title for stability
  posts.sort((a, b) => a.title.localeCompare(b.title, 'tr'));

  fs.writeFileSync(OUT_FILE, JSON.stringify({ posts }, null, 2), 'utf8');
  console.log(`Wrote ${posts.length} posts to ${OUT_FILE}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});


