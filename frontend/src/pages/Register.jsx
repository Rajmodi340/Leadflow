import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const validate = () => {
    const errs = {}
    if (!formData.name.trim()) errs.name = 'Name is required'
    else if (formData.name.trim().length < 2) errs.name = 'Name must be at least 2 characters'
    if (!formData.email) errs.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errs.email = 'Invalid email address'
    if (!formData.password) errs.password = 'Password is required'
    else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((p) => ({ ...p, [name]: value }))
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await register({ name: formData.name, email: formData.email, password: formData.password })
      navigate('/dashboard')
    } catch (err) {
      const apiErrors = err.response?.data?.errors || []
      if (apiErrors.length) {
        const fieldErrors = {}
        apiErrors.forEach(({ field, message }) => { fieldErrors[field] = message })
        setErrors(fieldErrors)
      } else {
        toast.error(err.response?.data?.message || 'Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = () => {
    const p = formData.password
    if (!p) return null
    if (p.length < 6) return { level: 'weak', color: 'bg-red-500', text: 'Too short' }
    if (p.length < 8) return { level: 'fair', color: 'bg-yellow-500', text: 'Fair' }
    if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(p)) return { level: 'strong', color: 'bg-green-500', text: 'Strong' }
    return { level: 'good', color: 'bg-brand-500', text: 'Good' }
  }

  const strength = passwordStrength()

  return (
    <div className="glass-card p-8">
      <h2 className="text-2xl font-bold text-slate-100 mb-1">Create your account</h2>
      <p className="text-slate-500 text-sm mb-8">Start managing your leads with LeadFlow</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Full Name</label>
          <input
            id="register-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Smith"
            className={`input-field ${errors.name ? 'border-red-500' : ''}`}
            autoComplete="name"
          />
          {errors.name && <p className="error-text">{errors.name}</p>}
        </div>

        <div>
          <label className="label">Email address</label>
          <input
            id="register-email"
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
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              className={`input-field pr-10 ${errors.password ? 'border-red-500' : ''}`}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showPassword ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                ) : (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </>
                )}
              </svg>
            </button>
          </div>
          {strength && (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${
                  strength.level === 'weak' ? 'w-1/4' :
                  strength.level === 'fair' ? 'w-2/4' :
                  strength.level === 'good' ? 'w-3/4' : 'w-full'
                }`} />
              </div>
              <span className="text-xs text-slate-400">{strength.text}</span>
            </div>
          )}
          {errors.password && <p className="error-text">{errors.password}</p>}
        </div>

        <div>
          <label className="label">Confirm Password</label>
          <input
            id="register-confirm-password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`}
            autoComplete="new-password"
          />
          {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
        </div>

        <button
          id="register-submit"
          type="submit"
          className="btn-primary w-full justify-center mt-2"
          disabled={loading}
        >
          {loading ? <><Spinner size="sm" />Creating account...</> : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
