import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((p) => ({ ...p, [name]: value }))
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!formData.email) errs.email = 'Email is required'
    if (!formData.password) errs.password = 'Password is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await login(formData)
      navigate('/dashboard')
    } catch (err) {
      const apiErrors = err.response?.data?.errors || []
      if (apiErrors.length) {
        const fieldErrors = {}
        apiErrors.forEach(({ field, message }) => { fieldErrors[field] = message })
        setErrors(fieldErrors)
      } else {
        toast.error(err.response?.data?.message || 'Login failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card p-8">
      <h2 className="text-2xl font-bold text-slate-100 mb-1">Welcome back</h2>
      <p className="text-slate-500 text-sm mb-8">Sign in to your LeadFlow account</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Email address</label>
          <input
            id="login-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={`input-field ${errors.email ? 'border-red-500' : ''}`}
            autoComplete="email"
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`input-field pr-10 ${errors.password ? 'border-red-500' : ''}`}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200"
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && <p className="error-text">{errors.password}</p>}
        </div>

        <button
          id="login-submit"
          type="submit"
          className="btn-primary w-full justify-center mt-2"
          disabled={loading}
        >
          {loading ? <><Spinner size="sm" />Signing in...</> : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
          Create one
        </Link>
      </p>
    </div>
  )
}
