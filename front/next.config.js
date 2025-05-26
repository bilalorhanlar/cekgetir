/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Punycode uyarısını gizle
    config.ignoreWarnings = [
      { module: /node_modules\/punycode/ }
    ];
    
    return config;
  },
  images: {
    domains: ['cekgetir.up.railway.app'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-src 'self' https://www.google.com/ https://*.googleapis.com/ https://*.google.com/ https://*.gstatic.com/;"
          }
        ]
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://cekgetir.up.railway.app:4000/api/:path*',
      },
      {
        source: '/.well-known/appspecific/com.chrome.devtools.json',
        destination: '/404',
      },
    ]
  },
}

module.exports = nextConfig