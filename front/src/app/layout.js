import './globals.css'
import 'leaflet/dist/leaflet.css'
import { Inter } from 'next/font/google'
import ErrorBoundary from '@/components/ErrorBoundary'
import Notification from '@/components/Notification'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  metadataBase: new URL('https://cekgetir.com'),
  title: {
    default: 'Çekgetir | Şehirler Arası Araç Taşıma ve Yol Yardım Hizmetleri',
    template: '%s | Çekgetir'
  },
  description: 'Çekgetir ile 7/24 yol yardım, çekici hizmeti, araç kurtarma, lastik değişimi ve şehirler arası araç taşıma hizmetleri. İstanbul ve tüm Türkiye\'de güvenilir çözüm ortağınız. Anında fiyat teklifi alın!',
  authors: [{ name: 'Çekgetir Ekibi' }],
  creator: 'Çekgetir',
  publisher: 'Çekgetir',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Çekgetir | Şehirler Arası Araç Taşıma ve Yol Yardım Hizmetleri',
    description: 'Çekgetir ile 7/24 yol yardım, çekici hizmeti, araç kurtarma, lastik değişimi ve şehirler arası araç taşıma hizmetleri. İstanbul ve tüm Türkiye\'de güvenilir çözüm ortağınız.',
    url: 'https://cekgetir.com',
    siteName: 'Çekgetir',
    images: [
      {
        url: '/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Çekgetir Yol Yardım ve Çekici Hizmetleri',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Çekgetir | Şehirler Arası Araç Taşıma ve Yol Yardım Hizmetleri',
    description: 'Çekgetir ile 7/24 yol yardım, çekici hizmeti, araç kurtarma, lastik değişimi ve şehirler arası araç taşıma hizmetleri. İstanbul ve tüm Türkiye\'de güvenilir çözüm ortağınız.',
    images: ['/images/logo.png'],
    creator: '@cekgetir',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'YOUR_GOOGLE_SEARCH_CONSOLE_CODE', // Google Search Console doğrulama kodunu buraya ekleyin
    yandex: 'YOUR_YANDEX_CODE', // Yandex doğrulama kodu (opsiyonel)
  },
  alternates: {
    canonical: 'https://cekgetir.com',
  },
  category: 'Otomotiv Hizmetleri',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

export const revalidate = 86400

export default function RootLayout({ children }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script src="https://www.google.com/recaptcha/api.js" async defer></script>
        <script dangerouslySetInnerHTML={{
          __html: `            function onReCAPTCHASubmit(token) {
              document.getElementById('login-form').dispatchEvent(
                new Event('submit', { cancelable: true })
              );
            }
          `
        }} />
        {/* Google Analytics veya Google Tag Manager kodu buraya eklenebilir */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'YOUR_GA_ID');
          `
        }} />
        {/* Organization and WebSite structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Çekgetir',
              url: 'https://cekgetir.com',
              logo: 'https://cekgetir.com/images/logo.png',
              sameAs: []
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Çekgetir',
              url: 'https://cekgetir.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://cekgetir.com/search?q={search_term_string}',
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />
      </head>
      <body suppressHydrationWarning className={inter.className}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Notification />
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
