export default function LoadingSpinner({ size = "small", type = "spinner" }) {
  const sizeClasses = {
    small: "h-6 w-6 md:h-8 md:w-8",
    medium: "h-12 w-12 md:h-16 md:w-16",
    large: "h-20 w-20 md:h-24 md:w-24"
  }

  if (type === "logo") {
    return (
      <div className="flex items-center justify-center">
        <div className={`relative ${sizeClasses[size]}`}>
          <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
          <img 
            src="/images/logo.png" 
            alt="Çekgetir Loading" 
            className="w-full h-full object-contain relative z-10 animate-pulse"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
        <svg 
          className={`animate-spin ${sizeClasses[size]} text-yellow-400 relative z-10`} 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    </div>
  )
} 