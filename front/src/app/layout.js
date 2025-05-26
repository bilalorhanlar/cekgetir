import './globals.css'
import { Inter } from 'next/font/google'
import ErrorBoundary from '@/components/ErrorBoundary'
import Notification from '@/components/Notification'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  metadataBase: new URL('https://cekgetir.com'),
  title: 'Çekgetir | 7/24 Yol Yardım ve Çekici Hizmetleri',
  description: 'Çekgetir, İstanbul ve Türkiye genelinde 7/24 yol yardım, çekici hizmeti, lastik değişimi ve araç kurtarma hizmetleri sunmaktadır.',
  keywords: [
    'yol yardım', 
    'yol acil yardım', 
    'çekici hizmeti', 
    'araç kurtarma',
    'lastik değişimi',
    'akü takviye',
    '7/24 çekici',
    'istanbul çekici',
    'acil yol yardım',
    'araç taşıma',
    'şehirler arası çekici'
  ].join(', '),
  openGraph: {
    title: 'Çekgetir | 7/24 Yol Yardım ve Çekici Hizmetleri',
    description: 'Çekgetir, İstanbul ve Türkiye genelinde 7/24 yol yardım, çekici hizmeti, lastik değişimi ve araç kurtarma hizmetleri sunmaktadır.',
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
    title: 'Çekgetir | 7/24 Yol Yardım ve Çekici Hizmetleri',
    description: 'Çekgetir, İstanbul ve Türkiye genelinde 7/24 yol yardım, çekici hizmeti, lastik değişimi ve araç kurtarma hizmetleri sunmaktadır.',
    images: ['/images/logo.png'],
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
    google: 'google-site-verification-code', // Google Search Console doğrulama kodu
  },
  alternates: {
    canonical: 'https://cekgetir.com',
  },
  authors: [{ name: 'Çekgetir Ekibi' }],
  category: 'Otomotiv Hizmetleri',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

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
