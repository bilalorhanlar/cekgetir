'use client';

import { useState, useEffect } from 'react';

// Window objesine gtag ve fbq tiplerini ekle
declare global {
  interface Window {
    gtag: (command: string, action: string, params?: any) => void;
    fbq: (command: string, action: string) => void;
  }
}

const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowConsent(true);
    } else if (consent === 'rejected') {
      // Çerezleri reddettiğinde analitik ve izleme çerezlerini devre dışı bırak
      disableAnalytics();
    }
  }, []);

  const disableAnalytics = () => {
    // Google Analytics'i devre dışı bırak
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied'
      });
    }

    // Facebook Pixel'i devre dışı bırak
    if (window.fbq) {
      window.fbq('consent', 'revoke');
    }

    // Diğer izleme çerezlerini temizle
    const cookiesToRemove = [
      '_ga',
      '_gid',
      '_fbp',
      '_fb',
      'analytics',
      'tracking'
    ];

    cookiesToRemove.forEach(cookie => {
      document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });

    // localStorage'dan izleme verilerini temizle
    Object.keys(localStorage).forEach(key => {
      if (key.includes('analytics') || key.includes('tracking')) {
        localStorage.removeItem(key);
      }
    });
  };

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowConsent(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    disableAnalytics();
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 z-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          Bu web sitesi, size en iyi deneyimi sunmak için çerezleri kullanmaktadır. 
          Daha fazla bilgi için{' '}
          <a href="/gizlilik-politikasi" className="text-blue-600 hover:underline">
            gizlilik politikamızı
          </a>{' '}
          inceleyebilirsiniz.
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleReject}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Reddet
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Kabul Et
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent; 