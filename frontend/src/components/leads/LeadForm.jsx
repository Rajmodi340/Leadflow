import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Spinner from '../ui/Spinner'

const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost']
const SOURCES = ['Website', 'Referral', 'Social Media', 'Cold Call', 'Email', 'Event', 'Other']

export default function LeadForm({ initialData = {}, onSubmit, submitLabel = 'Save Lead', loading = false }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    company: initialData.company || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    serviceInterest: initialData.serviceInterest || '',
    source: initialData.source || '',
    budget: initialData.budget !== undefined ? String(initialData.budget) : '',
    stage: initialData.stage || 'New',
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!formData.name.trim()) errs.name = 'Name is required'
    if (!formData.email && !formData.phone) {
      errs.contact = 'At least one of email or phone is required'
    }
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email'
    }
    if (formData.budget && parseFloat(formData.budget) < 0) {
      errs.budget = 'Budget cannot be negative'
    }
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    if (name === 'email' || name === 'phone') {
      setErrors((prev) => ({ ...prev, contact: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    const payload = { ...formData }
    if (!payload.budget) delete payload.budget
    else payload.budget = parseFloat(payload.budget)
    if (!payload.email) delete payload.email
    if (!payload.phone) delete payload.phone
    if (!payload.company) delete payload.company
    if (!payload.source) delete payload.source
    if (!payload.serviceInterest) delete payload.serviceInterest

    try {
      await onSubmit(payload)
    } catch (err) {
      const apiErrors = err.response?.data?.errors || []
      if (apiErrors.length > 0) {
        const fieldErrors = {}
        apiErrors.forEach(({ field, message }) => {
          fieldErrors[field] = message
        })
        setErrors(fieldErrors)
      } else {
        toast.error(err.response?.data?.message || 'Something went wrong')
      }
    }
  }

  const inputClass = (field) =>
    `input-field ${errors[field] ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label className="label">
          Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Smith"
          className={inputClass('name')}
        />
        {errors.name && <p className="error-text">{errors.name}</p>}
      </div>

      {/* Company */}
      <div>
        <label className="label">Company</label>
        <input
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
          placeholder="Acme Corp"
          className="input-field"
        />
      </div>

      {/* Contact row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            className={inputClass('email')}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>
        <div>
          <label className="label">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 555 000 0000"
            className="input-field"
          />
        </div>
      </div>
      {errors.contact && <p className="error-text">{errors.contact}</p>}

      {/* Service interest */}
      <div>
        <label className="label">Service Interest</label>
        <input
          type="text"
          name="serviceInterest"
          value={formData.serviceInterest}
          onChange={handleChange}
          placeholder="e.g. Enterprise Software, Marketing Services"
          className="input-field"
        />
      </div>

      {/* Source + Budget row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Source</label>
          <select name="source" value={formData.source} onChange={handleChange} className="input-field">
            <option value="">Select source</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Budget ($)</label>
          <input
            type="number"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            placeholder="50000"
            min="0"
            step="100"
            className={inputClass('budget')}
          />
          {errors.budget && <p className="error-text">{errors.budget}</p>}
        </div>
      </div>

      {/* Stage */}
      <div>
        <label className="label">Stage</label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {STAGES.map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => setFormData((p) => ({ ...p, stage }))}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200 ${
                formData.stage === stage
                  ? 'bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-600/20'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-secondary flex-1 sm:flex-none"
          disabled={loading}
        >
          Cancel
        </button>
        <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" />
              Saving...
            </>
          ) : submitLabel}
        </button>
      </div>
    </form>
  )
}
