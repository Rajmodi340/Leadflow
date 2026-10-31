import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { activityService } from '../services/activityService'
import { leadService } from '../services/leadService'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import toast from 'react-hot-toast'
import { format, isPast } from 'date-fns'

const ACTIVITY_TYPES = ['Call', 'Email', 'Meeting', 'Task']

const TypeBadge = ({ type }) => {
  const colors = {
    Call: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    Email: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    Meeting: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    Task: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  }
  return (
    <span className={`badge border ${colors[type] || colors.Task}`}>{type}</span>
  )
}

export default function Activities() {
  const [activities, setActivities] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ leadId: '', title: '', dueAt: '', type: 'Call', notes: '' })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const fetchActivities = useCallback(async () => {
    setLoading(true)
    try {
      const res = await activityService.getActivities(statusFilter ? { status: statusFilter } : {})
      setActivities(res.data.activities)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load activities')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await leadService.getLeads({ limit: 100 })
        setLeads(res.data.leads)
      } catch {}
    }
    fetchLeads()
  }, [])

  const validateForm = () => {
    const errs = {}
    if (!formData.leadId) errs.leadId = 'Please select a lead'
    if (!formData.title.trim()) errs.title = 'Title is required'
    if (!formData.dueAt) errs.dueAt = 'Due date is required'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validateForm()
    if (Object.keys(errs).length) { setFormErrors(errs); return }

    setSubmitting(true)
    try {
      await activityService.createActivity(formData)
      toast.success('Follow-up created')
      setShowForm(false)
      setFormData({ leadId: '', title: '', dueAt: '', type: 'Call', notes: '' })
      fetchActivities()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create follow-up')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (activity) => {
    const newStatus = activity.status === 'Pending' ? 'Completed' : 'Pending'
    try {
      const res = await activityService.updateActivity(activity._id, { status: newStatus })
      setActivities((prev) => prev.map((a) => a._id === activity._id ? res.data.activity : a))
      toast.success(`Marked as ${newStatus}`)
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async () => {
    try {
      await activityService.deleteActivity(deleteId)
      setActivities((prev) => prev.filter((a) => a._id !== deleteId))
      setDeleteId(null)
      toast.success('Follow-up deleted')
    } catch (err) {
      toast.error('Failed to delete follow-up')
    }
  }

  const pendingCount = activities.filter((a) => a.status === 'Pending').length
  const overdueCount = activities.filter((a) => a.status === 'Pending' && isPast(new Date(a.dueAt))).length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Follow-ups</h2>
          <p className="text-slate-500 text-sm mt-1">
            {pendingCount} pending{overdueCount > 0 && ` · ${overdueCount} overdue`}
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Follow-up
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="font-semibold text-slate-200 mb-4">Create Follow-up</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Lead <span className="text-red-400">*</span></label>
                <select
                  value={formData.leadId}
                  onChange={(e) => setFormData((p) => ({ ...p, leadId: e.target.value }))}
                  className={`input-field ${formErrors.leadId ? 'border-red-500' : ''}`}
                >
                  <option value="">Select a lead</option>
                  {leads.map((l) => (
                    <option key={l._id} value={l._id}>{l.name}{l.company ? ` – ${l.company}` : ''}</option>
                  ))}
                </select>
                {formErrors.leadId && <p className="error-text">{formErrors.leadId}</p>}
              </div>
              <div>
                <label className="label">Title <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Discovery call"
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  className={`input-field ${formErrors.title ? 'border-red-500' : ''}`}
                />
                {formErrors.title && <p className="error-text">{formErrors.title}</p>}
              </div>
              <div>
                <label className="label">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
                  className="input-field"
                >
                  {ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Due Date <span className="text-red-400">*</span></label>
                <input
                  type="datetime-local"
                  value={formData.dueAt}
                  onChange={(e) => setFormData((p) => ({ ...p, dueAt: e.target.value }))}
                  className={`input-field ${formErrors.dueAt ? 'border-red-500' : ''}`}
                />
                {formErrors.dueAt && <p className="error-text">{formErrors.dueAt}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="label">Notes</label>
                <input
                  type="text"
                  placeholder="Optional notes"
                  value={formData.notes}
                  onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? <><Spinner size="sm" />Saving...</> : 'Create Follow-up'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="glass-card p-4 flex items-center gap-3">
        <span className="text-slate-400 text-sm font-medium">Filter:</span>
        {['', 'Pending', 'Completed'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              statusFilter === status
                ? 'bg-brand-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            {status || 'All'}
          </button>
        ))}
      </div>

      {/* Activities list */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
        ) : activities.length === 0 ? (
          <EmptyState
            title="No follow-ups found"
            description={statusFilter ? `No ${statusFilter.toLowerCase()} follow-ups` : 'Create your first follow-up'}
            action={
              !showForm && (
                <button onClick={() => setShowForm(true)} className="btn-primary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Follow-up
                </button>
              )
            }
          />
        ) : (
          <div className="divide-y divide-slate-800/60">
            {activities.map((activity) => {
              const isOverdue = activity.status === 'Pending' && isPast(new Date(activity.dueAt))
              return (
                <div key={activity._id} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-800/20 transition-colors">
                  <button
                    onClick={() => handleToggle(activity)}
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      activity.status === 'Completed'
                        ? 'bg-green-500 border-green-500'
                        : 'border-slate-600 hover:border-brand-500'
                    }`}
                  >
                    {activity.status === 'Completed' && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className={`text-sm font-medium ${activity.status === 'Completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {activity.title}
                      </p>
                      <TypeBadge type={activity.type} />
                      {activity.status === 'Completed' && (
                        <span className="badge bg-green-500/15 text-green-400 border border-green-500/30">Completed</span>
                      )}
                      {isOverdue && (
                        <span className="badge bg-red-500/15 text-red-400 border border-red-500/30">Overdue</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      <span>
                        {activity.leadId ? (
                          <Link
                            to={`/leads/${activity.leadId._id}`}
                            className="text-brand-400 hover:text-brand-300 transition-colors"
                          >
                            {activity.leadId.name}
                          </Link>
                        ) : 'Unknown lead'}
                      </span>
                      <span className={isOverdue ? 'text-red-400' : ''}>
                        Due: {format(new Date(activity.dueAt), 'MMM d, yyyy h:mm a')}
                      </span>
                      {activity.completedAt && (
                        <span className="text-green-500">
                          ✓ {format(new Date(activity.completedAt), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                    {activity.notes && (
                      <p className="text-xs text-slate-500 mt-1">{activity.notes}</p>
                    )}
                  </div>

                  <button
                    onClick={() => setDeleteId(activity._id)}
                    className="text-slate-600 hover:text-red-400 transition-colors p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Follow-up"
        message="Are you sure you want to delete this follow-up? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmLabel="Delete"
      />
    </div>
  )
}
