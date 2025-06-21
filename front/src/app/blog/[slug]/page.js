import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'

// Blog verileri
const blogPosts = {
  'yolda-kalan-araclar-icin-acil-durum-rehberi': {
    id: 1,
    title: "Yolda Kalan Araçlar İçin Acil Durum Rehberi",
    excerpt: "Aracınız yolda kaldığında yapmanız gerekenler ve dikkat etmeniz gereken güvenlik önlemleri hakkında detaylı bilgi.",
    content: `
      <p>Aracınız yolda kaldığında panik yapmamak ve güvenli bir şekilde yardım almak çok önemlidir. Bu rehberde, acil durumlarda yapmanız gerekenleri adım adım açıklayacağız.</p>
      
      <h2>1. Güvenlik Önlemleri</h2>
      <p>İlk olarak, aracınızı güvenli bir yere çekin. Mümkünse yolun kenarına, diğer araçların geçişini engellemeyecek şekilde park edin. Acil durum ışıklarınızı yakın ve varsa üçgen reflektörünüzü yerleştirin.</p>
      
      <h2>2. Yardım Çağırma</h2>
      <p>Çekgetir'in 7/24 hizmet veren çağrı merkezini arayın. Uzman ekibimiz size en kısa sürede ulaşacak ve gerekli yardımı sağlayacaktır.</p>
      
      <h2>3. Araç Kontrolü</h2>
      <p>Mümkünse aracınızın ne tür bir sorun yaşadığını belirlemeye çalışın. Bu bilgi, gönderilecek ekibin doğru ekipmanla gelmesini sağlar.</p>
      
      <h2>4. Bekleme Süreci</h2>
      <p>Yardım gelene kadar aracınızın içinde güvenli bir şekilde bekleyin. Özellikle gece saatlerinde dikkatli olun ve yabancı araçlara güvenmeyin.</p>
    `,
    category: "Güvenlik",
    date: "2024-12-19",
    readTime: "5 dk",
    author: "Çekgetir Ekibi",
    image: "/images/blog/emergency-guide.jpg"
  },
  'sehirler-arasi-arac-tasima-surecinde-dikkat-edilmesi-gerekenler': {
    id: 2,
    title: "Şehirler Arası Araç Taşıma Sürecinde Dikkat Edilmesi Gerekenler",
    excerpt: "Aracınızı şehirler arası taşıtırken bilmeniz gereken önemli noktalar ve süreç hakkında bilgilendirme.",
    content: `
      <p>Şehirler arası araç taşıma, dikkatli planlama ve güvenilir hizmet gerektiren bir süreçtir. Bu yazıda, aracınızı güvenle taşıtmak için bilmeniz gereken her şeyi açıklayacağız.</p>
      
      <h2>1. Ön Hazırlık</h2>
      <p>Aracınızı taşıtmadan önce, kişisel eşyalarınızı çıkarın. Özellikle değerli eşyalar, belgeler ve elektronik cihazlarınızı yanınıza alın.</p>
      
      <h2>2. Araç Durumu</h2>
      <p>Aracınızın mevcut durumunu fotoğraflayın. Bu fotoğraflar, taşıma sırasında oluşabilecek hasarları belgelemek için önemlidir.</p>
      
      <h2>3. Sigorta Kapsamı</h2>
      <p>Çekgetir olarak tüm araçlarımız sigorta kapsamındadır. Ancak ek sigorta seçenekleri de sunmaktayız.</p>
      
      <h2>4. Takip Süreci</h2>
      <p>Aracınızın taşıma sürecini PNR numaranız ile takip edebilirsiniz. Her aşamada size bilgi verilmektedir.</p>
    `,
    category: "Araç Taşıma",
    date: "2024-12-18",
    readTime: "7 dk",
    author: "Çekgetir Ekibi",
    image: "/images/blog/car-transport.jpg"
  },
  'kis-aylarinda-arac-bakimi-ve-yol-guvenligi': {
    id: 3,
    title: "Kış Aylarında Araç Bakımı ve Yol Güvenliği",
    excerpt: "Kış aylarında araç bakımı, lastik kontrolü ve güvenli sürüş için önemli ipuçları.",
    content: `
      <p>Kış aylarında araç bakımı ve güvenli sürüş, özel dikkat gerektirir. Bu rehberde, kış şartlarında güvenli sürüş için gerekli tüm bilgileri bulacaksınız.</p>
      
      <h2>1. Lastik Kontrolü</h2>
      <p>Kış lastiklerinizin durumunu kontrol edin. Diş derinliği en az 4mm olmalıdır. Kış lastikleri, soğuk havalarda daha iyi tutuş sağlar.</p>
      
      <h2>2. Akü Bakımı</h2>
      <p>Soğuk havalarda aküler daha hızlı boşalır. Akünüzün durumunu kontrol edin ve gerekirse değiştirin.</p>
      
      <h2>3. Silecek ve Cam Suyu</h2>
      <p>Donmayan cam suyu kullanın ve sileceklerinizin durumunu kontrol edin. Görüş açınızın net olması güvenlik için kritiktir.</p>
      
      <h2>4. Acil Durum Kiti</h2>
      <p>Aracınızda acil durum kiti bulundurun: battaniye, el feneri, ilk yardım çantası ve telefon şarj cihazı.</p>
    `,
    category: "Bakım",
    date: "2024-12-17",
    readTime: "6 dk",
    author: "Çekgetir Ekibi",
    image: "/images/blog/winter-maintenance.jpg"
  },
  'cekici-hizmeti-alirken-dikkat-edilmesi-gerekenler': {
    id: 4,
    title: "Çekici Hizmeti Alırken Dikkat Edilmesi Gerekenler",
    excerpt: "Güvenilir çekici hizmeti seçerken dikkat etmeniz gereken kriterler ve yasal haklarınız.",
    content: `
      <p>Çekici hizmeti alırken güvenilir ve profesyonel bir firma seçmek çok önemlidir. Bu yazıda, doğru çekici hizmeti seçimi için dikkat etmeniz gereken noktaları açıklayacağız.</p>
      
      <h2>1. Lisans ve Belge Kontrolü</h2>
      <p>Çekici firmasının gerekli lisanslara sahip olduğundan emin olun. Ruhsat ve sigorta belgelerini kontrol edin.</p>
      
      <h2>2. Fiyat Şeffaflığı</h2>
      <p>Fiyatlandırmanın şeffaf olduğundan emin olun. Gizli ücretler olup olmadığını sorun ve yazılı teklif alın.</p>
      
      <h2>3. Hizmet Kalitesi</h2>
      <p>Firmanın müşteri yorumlarını okuyun ve referanslarını kontrol edin. Deneyimli ekipler daha güvenilir hizmet sunar.</p>
      
      <h2>4. Acil Durum Müdahale Süresi</h2>
      <p>Firmanın ortalama müdahale süresini öğrenin. Acil durumlarda hızlı müdahale hayati önem taşır.</p>
    `,
    category: "Çekici Hizmeti",
    date: "2024-12-16",
    readTime: "4 dk",
    author: "Çekgetir Ekibi",
    image: "/images/blog/tow-truck-service.jpg"
  },
  'arac-akusu-bakimi-ve-aku-takviye-hizmeti': {
    id: 5,
    title: "Araç Aküsü Bakımı ve Akü Takviye Hizmeti",
    excerpt: "Araç aküsü bakımı, ömrünü uzatma yöntemleri ve acil durumlarda akü takviye hizmeti hakkında bilgiler.",
    content: `
      <p>Araç aküsü, aracınızın en önemli bileşenlerinden biridir. Düzenli bakım ve doğru kullanım, akünüzün ömrünü uzatır ve beklenmedik sorunları önler.</p>
      
      <h2>1. Akü Bakımı</h2>
      <p>Akünüzün temiz olduğundan emin olun. Kutup başlarında oksitlenme varsa temizleyin. Su seviyesini kontrol edin.</p>
      
      <h2>2. Şarj Durumu</h2>
      <p>Akünüzün şarj durumunu düzenli olarak kontrol edin. Voltaj ölçer kullanarak akünüzün sağlığını takip edin.</p>
      
      <h2>3. Akü Takviye Hizmeti</h2>
      <p>Çekgetir olarak 7/24 akü takviye hizmeti sunuyoruz. Acil durumlarda hızlı müdahale ile aracınızı çalışır hale getiriyoruz.</p>
      
      <h2>4. Akü Değişimi</h2>
      <p>Akünüz 3-5 yıl sonra değiştirilmelidir. Eski aküler güvenilir değildir ve beklenmedik sorunlara neden olabilir.</p>
    `,
    category: "Bakım",
    date: "2024-12-15",
    readTime: "5 dk",
    author: "Çekgetir Ekibi",
    image: "/images/blog/battery-service.jpg"
  },
  'lastik-degisimi-ve-lastik-bakimi-rehberi': {
    id: 6,
    title: "Lastik Değişimi ve Lastik Bakımı Rehberi",
    excerpt: "Doğru lastik seçimi, lastik bakımı ve acil durumlarda lastik değişimi hakkında detaylı rehber.",
    content: `
      <p>Lastikler, aracınızın yol ile tek temas noktasıdır. Doğru lastik seçimi ve düzenli bakım, güvenli sürüş için kritiktir.</p>
      
      <h2>1. Lastik Seçimi</h2>
      <p>Aracınızın kullanım amacına ve iklim koşullarına uygun lastik seçin. Yaz, kış ve dört mevsim lastikleri farklı özelliklere sahiptir.</p>
      
      <h2>2. Lastik Basıncı</h2>
      <p>Lastik basıncını düzenli olarak kontrol edin. Yanlış basınç, yakıt tüketimini artırır ve güvenliği azaltır.</p>
      
      <h2>3. Diş Derinliği</h2>
      <p>Lastik diş derinliği en az 1.6mm olmalıdır. Daha az diş derinliği, yol tutuşunu azaltır ve tehlikelidir.</p>
      
      <h2>4. Acil Durum Lastik Değişimi</h2>
      <p>Çekgetir olarak yolda kalan araçlar için acil lastik değişimi hizmeti sunuyoruz. Uzman ekibimiz hızlı ve güvenli hizmet sağlar.</p>
    `,
    category: "Bakım",
    date: "2024-12-14",
    readTime: "8 dk",
    author: "Çekgetir Ekibi",
    image: "/images/blog/tire-service.jpg"
  }
}

export async function generateMetadata({ params }) {
  const post = blogPosts[params.slug]
  
  if (!post) {
    return {
      title: 'Blog Yazısı Bulunamadı',
      description: 'Aradığınız blog yazısı bulunamadı.'
    }
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | Çekgetir Blog`,
      description: post.excerpt,
      images: [post.image],
    },
  }
}

export default function BlogDetailPage({ params }) {
  const post = blogPosts[params.slug]

  if (!post) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Blog Yazısı Bulunamadı</h1>
            <p className="text-gray-600 mb-8">Aradığınız blog yazısı mevcut değil.</p>
            <a href="/blog" className="bg-yellow-500 text-black px-6 py-3 rounded-lg hover:bg-yellow-400 transition-colors">
              Blog'a Dön
            </a>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative py-16 bg-gradient-to-b from-yellow-400 to-yellow-500">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-8 pt-16">
              <span className="bg-yellow-600 text-white px-3  py-1 rounded-full text-sm font-medium">
                {post.category}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-6 text-center">
              {post.title}
            </h1>
            <div className="flex items-center justify-center gap-6 text-black/80 text-sm">
              <span>{post.author}</span>
              <span>•</span>
              <time>{new Date(post.date).toLocaleDateString('tr-TR')}</time>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>
          </div>
        </section>

        {/* Featured Image */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 pt-10">
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4">
            <article className="bg-white rounded-lg shadow-lg p-8 md:p-12">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              
              {/* Author Info */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{post.author}</h3>
                    <p className="text-gray-600 text-sm">Çekgetir Uzman Ekibi</p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* Related Posts */}
        <section className="py-12 bg-gray-100">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">İlgili Yazılar</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.values(blogPosts)
                .filter(p => p.id !== post.id)
                .slice(0, 3)
                .map((relatedPost) => (
                  <article key={relatedPost.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48">
                      <Image
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
                          {relatedPost.category}
                        </span>
                        <span className="text-gray-500 text-sm">{relatedPost.readTime}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {relatedPost.excerpt}
                      </p>
                      <a 
                        href={`/blog/${Object.keys(blogPosts).find(key => blogPosts[key].id === relatedPost.id)}`}
                        className="text-yellow-600 hover:text-yellow-700 font-medium text-sm"
                      >
                        Devamını Oku →
                      </a>
                    </div>
                  </article>
                ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-yellow-500">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-black mb-4">Yardıma mı ihtiyacınız var?</h2>
            <p className="text-xl text-black/80 mb-8">
              7/24 yol yardım ve çekici hizmeti için bize ulaşın
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+905404901000" 
                className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Hemen Ara
              </a>
              <a 
                href="/" 
                className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Hizmet Al
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
} 