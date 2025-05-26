'use client'

// Eğer React Icons kullanacaksan:
import { FaInstagram, FaXTwitter, FaTiktok, FaYoutube } from 'react-icons/fa6'
// Logo olarak resim kullanacaksan:
import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#202020] text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo ve İletişim */}
          <div className="col-span-1">
            <div className="flex items-center group">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/images/logo.png"
                  alt="Çekgetir Logo"
                  width={400}
                  height={400}
                  className="w-auto h-10 sm:w-auto sm:h-14 transition-transform duration-300 group-hover:scale-110"
                />
                <span className="text-xl sm:text-2xl font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors"></span>
              </Link>
            </div>
            <p className="mt-4 text-gray-300 text-sm sm:text-base leading-relaxed">
            Şehirler arası araç transferi, özel çekici ve yol yardım hizmetleri sunuyoruz.
            </p>
            <div className="mt-6 space-y-3">
              <a
                href="tel:+05404901000"
                className="flex items-center text-gray-300 hover:text-yellow-400 transition-colors group"
              >
                <svg
                  className="h-5 w-5 mr-3 text-yellow-400 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="text-sm sm:text-base">+90 540 490 10 00</span>
              </a>
              <div className="flex items-start text-gray-300 group">
                <svg
                  className="h-5 w-5 mr-3 mt-1 text-yellow-400 group-hover:scale-110 transition-transform flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-sm sm:text-base">Ferhatpaşa, Anadolu Cd. No:74, 34888 Ataşehir/İstanbul</span>
              </div>
              <a
                href="mailto:info@cekgetir.com"
                className="flex items-center text-gray-300 hover:text-yellow-400 transition-colors group"
              >
                <svg
                  className="h-5 w-5 mr-3 text-yellow-400 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm sm:text-base">info@cekgetir.com</span>
              </a>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div className="col-span-1">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-yellow-400">Hızlı Linkler</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm sm:text-base flex items-center group">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm sm:text-base flex items-center group">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  Hizmetler
                </Link>
              </li>
              <li>
                <Link href="/hakkimizda" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm sm:text-base flex items-center group">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm sm:text-base flex items-center group">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Hizmetler */}
          <div className="col-span-1">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-yellow-400">Hizmetlerimiz</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/#sehirler-arasi" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm sm:text-base flex items-center group">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  Şehirler Arası Taşıma
                </Link>
              </li>
              <li>
                <Link href="/#ozel-cekici" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm sm:text-base flex items-center group">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  Çekici Hizmeti
                </Link>
              </li>
              <li>
                <Link href="/#yol-yardim" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm sm:text-base flex items-center group">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  Yol Yardım
                </Link>
              </li>
            </ul>
          </div>

          {/* Çalışma Saatleri */}
          <div className="col-span-1">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-yellow-400">Çalışma Saatleri</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-300 text-sm sm:text-base">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2"></span>
                Pazartesi - Cuma: 7/24
              </li>
              <li className="flex items-center text-gray-300 text-sm sm:text-base">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2"></span>
                Cumartesi: 7/24
              </li>
              <li className="flex items-center text-gray-300 text-sm sm:text-base">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2"></span>
                Pazar: 7/24
              </li>
            </ul>
          </div>
        </div>

        {/* Alt Footer */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm sm:text-base">
              © 2025 cekgetir. Tüm hakları saklıdır.
            </p>
            <div className="flex space-x-6">
              <a 
                href="https://www.instagram.com/cekgetircom" 
                className="text-gray-400 hover:text-yellow-400 transition-colors transform hover:scale-110"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="sr-only">Instagram</span>
                <FaInstagram className="h-5 w-5 sm:h-6 sm:w-6" />
              </a>
              <a 
                href="https://x.com/cekgetircom" 
                className="text-gray-400 hover:text-yellow-400 transition-colors transform hover:scale-110"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="sr-only">Twitter</span>
                <FaXTwitter className="h-5 w-5 sm:h-6 sm:w-6" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-yellow-400 transition-colors transform hover:scale-110"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="sr-only">TikTok</span>
                <FaTiktok className="h-5 w-5 sm:h-6 sm:w-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
