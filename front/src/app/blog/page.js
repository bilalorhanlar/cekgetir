import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Blog ve Haberler',
  description: 'Çekgetir blog ve haberler. Yol yardım, çekici hizmeti, araç bakımı ve güvenli sürüş hakkında faydalı bilgiler.',
  keywords: 'çekgetir blog, yol yardım haberleri, araç bakımı, güvenli sürüş, çekici hizmeti bilgileri',
  openGraph: {
    title: 'Blog ve Haberler | Çekgetir',
    description: 'Çekgetir blog ve haberler. Yol yardım, çekici hizmeti, araç bakımı ve güvenli sürüş hakkında faydalı bilgiler.',
  },
}

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: "Yolda Kalan Araçlar İçin Acil Durum Rehberi",
      excerpt: "Aracınız yolda kaldığında yapmanız gerekenler ve dikkat etmeniz gereken güvenlik önlemleri hakkında detaylı bilgi.",
      slug: "yolda-kalan-araclar-icin-acil-durum-rehberi",
      category: "Güvenlik",
      date: "2024-12-19",
      readTime: "5 dk"
    },
    {
      id: 2,
      title: "Şehirler Arası Araç Taşıma Sürecinde Dikkat Edilmesi Gerekenler",
      excerpt: "Aracınızı şehirler arası taşıtırken bilmeniz gereken önemli noktalar ve süreç hakkında bilgilendirme.",
      slug: "sehirler-arasi-arac-tasima-surecinde-dikkat-edilmesi-gerekenler",
      category: "Araç Taşıma",
      date: "2024-12-18",
      readTime: "7 dk"
    },
    {
      id: 3,
      title: "Kış Aylarında Araç Bakımı ve Yol Güvenliği",
      excerpt: "Kış aylarında araç bakımı, lastik kontrolü ve güvenli sürüş için önemli ipuçları.",
      slug: "kis-aylarinda-arac-bakimi-ve-yol-guvenligi",
      category: "Bakım",
      date: "2024-12-17",
      readTime: "6 dk"
    },
    {
      id: 4,
      title: "Çekici Hizmeti Alırken Dikkat Edilmesi Gerekenler",
      excerpt: "Güvenilir çekici hizmeti seçerken dikkat etmeniz gereken kriterler ve yasal haklarınız.",
      slug: "cekici-hizmeti-alirken-dikkat-edilmesi-gerekenler",
      category: "Çekici Hizmeti",
      date: "2024-12-16",
      readTime: "4 dk"
    },
    {
      id: 5,
      title: "Araç Aküsü Bakımı ve Akü Takviye Hizmeti",
      excerpt: "Araç aküsü bakımı, ömrünü uzatma yöntemleri ve acil durumlarda akü takviye hizmeti hakkında bilgiler.",
      slug: "arac-akusu-bakimi-ve-aku-takviye-hizmeti",
      category: "Bakım",
      date: "2024-12-15",
      readTime: "5 dk"
    },
    {
      id: 6,
      title: "Lastik Değişimi ve Lastik Bakımı Rehberi",
      excerpt: "Doğru lastik seçimi, lastik bakımı ve acil durumlarda lastik değişimi hakkında detaylı rehber.",
      slug: "lastik-degisimi-ve-lastik-bakimi-rehberi",
      category: "Bakım",
      date: "2024-12-14",
      readTime: "8 dk"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="block">
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