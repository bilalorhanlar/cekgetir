export default function AdminAuthLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-black w-full">
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
} 