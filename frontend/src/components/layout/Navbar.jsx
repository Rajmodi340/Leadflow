import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/leads': 'Leads',
  '/leads/new': 'Add Lead',
  '/activities': 'Follow-ups',
}

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const title = Object.entries(pageTitles).find(([path]) =>
    location.pathname === path ||
    (path !== '/dashboard' && location.pathname.startsWith(path))
  )?.[1] || 'LeadFlow'

  const handleLogout = async () => {
    setDropdownOpen(false)
    await logout()
  }

  return (
    <header className="h-16 border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-sm flex items-center px-4 lg:px-6 gap-4 flex-shrink-0">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Page title */}
      <h1 className="text-lg font-semibold text-slate-100 flex-1">{title}</h1>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Quick add lead button */}
        <Link
          to="/leads/new"
          className="hidden sm:flex btn-primary text-sm py-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Lead
        </Link>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800 transition-colors duration-200"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-200 leading-none">{user?.name}</p>
            </div>
            <svg className="w-4 h-4 text-slate-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 animate-fade-in">
                <div className="px-4 py-3 border-b border-slate-700">
                  <p className="text-sm font-medium text-slate-100">{user?.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
