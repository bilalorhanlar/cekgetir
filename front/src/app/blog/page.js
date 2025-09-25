import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import fs from 'fs'
import path from 'path'
export const revalidate = 3600

export const metadata = {
  title: 'Blog ve Haberler',
  description: 'Çekgetir blog ve haberler. Yol yardım, çekici hizmeti, araç bakımı ve güvenli sürüş hakkında faydalı bilgiler.',
  alternates: {
    canonical: '/blog'
  },
  openGraph: {
    title: 'Blog ve Haberler | Çekgetir',
    description: 'Çekgetir blog ve haberler. Yol yardım, çekici hizmeti, araç bakımı ve güvenli sürüş hakkında faydalı bilgiler.',
  },
}

function readGeneratedPosts() {
  try {
    const filePath = path.join(process.cwd(), 'front', 'public', 'data', 'blog-posts.json')
    const raw = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(raw)
    if (Array.isArray(data.posts)) {
      return data.posts
    }
  } catch (e) {}
  return null
}

export default function BlogPage() {
  const generated = readGeneratedPosts()
  const blogPosts = generated || [
    {
      id: 1,
      title: "Şehirler Arası Araç Transferinde Dijital Kolaylık: Çekgetir ile Güvenli ve Hızlı Çözümler",
      excerpt: "Şehirler arası araç transferini dijital kolaylıklarla güvenli ve hızlı şekilde gerçekleştirmek artık mümkün. Çoklu ve özel çekici seçenekleri, esnek teslim ve canlı takip ile süreç tamamen kontrolünüz altında...",
      category: "Araç Taşıma",
      slug: "sehirler-arasi-arac-transferi-dijital-kolaylik",
      category: "Güvenlik",
      date: "2024-12-19",
      readTime: "5 dk"
    },
    {
      id: 2,
      title: "Şehirlerarası Transfer Fiyatları Nasıl Belirlenir? 2025 İçin Kapsamlı Rehber",
      excerpt: "2025 itibarıyla şehirler arası araç transfer fiyatlarının nasıl belirlendiğini öğrenin. Araç tipi, çekici seçeneği, teslim şekli ve mesafenin fiyat üzerindeki etkilerini keşfedin. Uygun maliyet veya hızlı çözüm için ipuçları burada...",
      slug: "sehirler-arasi-transfer-fiyatlari-2025",
      category: "Araç Taşıma",
      date: "2024-12-18",
      readTime: "7 dk"
    },
    {
      id: 3,
      title: "Yolda Kalan Araçlar İçin Yol Yardımı",
      excerpt: "Aracınız yolda kaldığında yol yardım hizmetlerinin kapsamını, çekici desteğinin önemini ve Çekgetir’in sağladığı avantajları öğrenin. Küçük arızalardan şehirlerarası çözümlere kadar rehberimizde her detayı bulabilirsiniz...",
      slug: "yolda-kalan-araclar-icin-yol-yardimi-2025",
      category: "Yol Yardımı",
      date: "2025-09-24",
      readTime: "6 dk"
    },
    {
      id: 4,
      title: "Yol Yardımı Çağırmadan Önce Bilmeniz Gerekenler",
      excerpt: "Aracınız yolda kaldığında panik yapmadan önce atmanız gereken adımları öğrenin. Güvenlik önlemleri, doğru hazırlık ve yanlış yönlendirmelerin önüne geçmenin yolları burada...",
      slug: "yol-yardimi-cagirmadan-once",
      category: "Yol Yardımı",
      date: "2025-09-24",
      readTime: "5 dk",
    },
    {
      id: 6,
      title: "Çekici Hizmeti Çağırmanın En Hızlı Yolu",
      excerpt: "Yolda kaldığınızda panik yapmadan doğru yardımı bulmak artık çok daha kolay. Geleneksel yöntemlerin aksine online çekici sistemleri; hızlı erişim, şeffaf fiyatlandırma ve güvenilir hizmeti tek platformda sunuyor. Çekgetir ile birkaç tıkla güvenli çözüme ulaşabilirsiniz.",
      slug: "cekici-hizmeti-online-sistemler-2025",
      category: "Çekici Hizmeti",
      date: "2025-09-24",
      readTime: "5 dk",
    },
    {
      id: 7,
      title: "Çekici Hizmeti Çağırmanın En Hızlı Yolu: Online Sistemler",
      excerpt: "Geleneksel yöntemlerin zorlukları ve online sistemlerin hız, şeffaflık ve güven avantajları. Çekgetir ile birkaç adımda doğru yardıma ulaşın.",
      slug: "cekici-hizmeti-cagirmanin-en-hizli-yolu-online-sistemler",
      category: "Çekici Hizmeti",
      date: "2025-09-24",
      readTime: "5 dk"
    }
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative py-24 sm:py-32 bg-black/80">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Blog ve Haberler</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Yol yardım, çekici hizmeti, araç bakımı ve güvenli sürüş hakkında faydalı bilgiler ve güncel haberler.
            </p>
          </div>
        </section>
        
        {/* Blog Posts Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            {/* Blog list structured data */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'CollectionPage',
                  name: 'Blog ve Haberler',
                  url: '/blog'
                })
              }}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`} className="block">
                  <article className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow h-full flex flex-col">
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {post.category}
                        </span>
                        <span className="text-gray-500 text-sm">{post.readTime}</span>
                      </div>
                      
                      <h2 className="text-xl font-semibold text-black mb-3 line-clamp-2">
                        {post.title}
                      </h2>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <time className="text-sm text-gray-500">
                          {new Date(post.date).toLocaleDateString('tr-TR')}
                        </time>
                        <div className="text-yellow-600 hover:text-yellow-700 font-medium text-sm">
                          Devamını Oku →
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <button className="bg-yellow-500 text-black px-8 py-3 rounded-lg font-medium hover:bg-yellow-400 transition-colors">
                Daha Fazla Yazı
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
} 