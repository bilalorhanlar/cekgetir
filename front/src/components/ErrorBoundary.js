'use client'

import { Component } from 'react'
import Image from 'next/image'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#202020] flex items-center justify-center p-4">
          <div className="text-center space-y-6 md:space-y-8 max-w-lg mx-auto">
            <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 md:mb-8 relative group">
              <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <Image
                src="/images/logo.png"
                alt="Çekgetir"
                width={128}
                height={128}
                className="w-full h-full object-contain relative z-10 transform group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-yellow-400 druk-font tracking-tight">
              Oops!
            </h1>
            <h2 className="text-xl md:text-2xl text-white/90 druk-font">
              Beklenmeyen Bir Hata
            </h2>
            <p className="text-sm md:text-base text-white/60 max-w-md mx-auto leading-relaxed">
              {this.state.error?.message || 'Bir hata oluştu. Lütfen sayfayı yenileyin.'}
            </p>
            <div className="pt-4 md:pt-6">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.reload()
                }}
                className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#202020] rounded-xl hover:from-yellow-500 hover:to-yellow-400 transition-all duration-300 font-semibold text-sm md:text-base shadow-lg hover:shadow-yellow-400/20 hover:scale-105 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sayfayı Yenile
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
} 