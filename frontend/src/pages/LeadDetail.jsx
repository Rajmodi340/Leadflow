import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { leadService } from '../services/leadService'
import { activityService } from '../services/activityService'
import Spinner from '../components/ui/Spinner'
import StageBadge from '../components/ui/StageBadge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const ACTIVITY_TYPES = ['Call', 'Email', 'Meeting', 'Task']

const TypeIcon = ({ type }) => {
  const icons = {
    Call: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />,
    Email: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
    Meeting: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
    Task: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
  }
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {icons[type]}
    </svg>
  )
}

export default function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lead, setLead] = useState(null)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showActivityForm, setShowActivityForm] = useState(false)
  const [activityForm, setActivityForm] = useState({ title: '', dueAt: '', type: 'Call', notes: '' })
  const [activityErrors, setActivityErrors] = useState({})
  const [submittingActivity, setSubmittingActivity] = useState(false)
  const [deleteLeadOpen, setDeleteLeadOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [leadRes, actRes] = await Promise.all([
          leadService.getLead(id),
          activityService.getActivities({ leadId: id }),
        ])
        setLead(leadRes.data.lead)
        setActivities(actRes.data.activities)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load lead')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [id])

  const handleDeleteLead = async () => {
    setDeleting(true)
    try {
      await leadService.deleteLead(id)
      toast.success('Lead deleted')
      navigate('/leads')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete lead')
      setDeleting(false)
    }
  }

  const handleToggleActivity = async (activity) => {
    const newStatus = activity.status === 'Pending' ? 'Completed' : 'Pending'
    try {
      const res = await activityService.updateActivity(activity._id, { status: newStatus })
      setActivities((prev) => prev.map((a) => a._id === activity._id ? res.data.activity : a))
      toast.success(`Marked as ${newStatus}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update activity')
    }
  }

  const handleDeleteActivity = async (activityId) => {
    try {
      await activityService.deleteActivity(activityId)
      setActivities((prev) => prev.filter((a) => a._id !== activityId))
      toast.success('Follow-up deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete activity')
    }
  }

  const handleActivitySubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!activityForm.title.trim()) errs.title = 'Title is required'
    if (!activityForm.dueAt) errs.dueAt = 'Due date is required'
    if (Object.keys(errs).length) { setActivityErrors(errs); return }

    setSubmittingActivity(true)
    try {
      const res = await activityService.createActivity({ ...activityForm, leadId: id })
      setActivities((prev) => [...prev, res.data.activity])
      setShowActivityForm(false)
      setActivityForm({ title: '', dueAt: '', type: 'Call', notes: '' })
      toast.success('Follow-up created')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create follow-up')
    } finally {
      setSubmittingActivity(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  if (error) return (
    <div className="glass-card p-8 text-center max-w-md mx-auto">
      <p className="text-red-400">{error}</p>
      <button onClick={() => navigate('/leads')} className="btn-secondary mt-4">Back to Leads</button>
    </div>
  )

  const infoItems = [
    { label: 'Email', value: lead.email },
    { label: 'Phone', value: lead.phone },
    { label: 'Company', value: lead.company },
    { label: 'Service Interest', value: lead.serviceInterest },
    { label: 'Source', value: lead.source },
    { label: 'Budget', value: lead.budget != null ? `$${lead.budget.toLocaleString()}` : null },
    { label: 'Created', value: format(new Date(lead.createdAt), 'MMM d, yyyy') },
    { label: 'Last Updated', value: format(new Date(lead.updatedAt), 'MMM d, yyyy') },
  ].filter((i) => i.value)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <button onClick={() => navigate('/leads')} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Leads
      </button>

      {/* Lead header */}
      <div className="glass-card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold text-slate-100">{lead.name}</h2>
              <StageBadge stage={lead.stage} />
            </div>
            {lead.company && (
              <p className="text-slate-400 mt-1">{lead.company}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Link to={`/leads/${id}/edit`} className="btn-secondary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Link>
            <button onClick={() => setDeleteLeadOpen(true)} className="btn-danger">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/60">
          {infoItems.map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
              <p className="text-slate-200 text-sm mt-1 font-medium">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Activities */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
          <h3 className="font-semibold text-slate-200">Follow-ups ({activities.length})</h3>
          <button
            onClick={() => setShowActivityForm(!showActivityForm)}
            className="btn-primary text-sm py-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Follow-up
          </button>
        </div>

        {/* Add activity form */}
        {showActivityForm && (
          <form onSubmit={handleActivitySubmit} className="p-6 border-b border-slate-800/60 bg-slate-800/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Title <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Follow-up call"
                  value={activityForm.title}
                  onChange={(e) => setActivityForm((p) => ({ ...p, title: e.target.value }))}
                  className={`input-field ${activityErrors.title ? 'border-red-500' : ''}`}
                />
                {activityErrors.title && <p className="error-text">{activityErrors.title}</p>}
              </div>
              <div>
                <label className="label">Due Date <span className="text-red-400">*</span></label>
                <input
                  type="datetime-local"
                  value={activityForm.dueAt}
                  onChange={(e) => setActivityForm((p) => ({ ...p, dueAt: e.target.value }))}
                  className={`input-field ${activityErrors.dueAt ? 'border-red-500' : ''}`}
                />
                {activityErrors.dueAt && <p className="error-text">{activityErrors.dueAt}</p>}
              </div>
              <div>
                <label className="label">Type</label>
                <select
                  value={activityForm.type}
                  onChange={(e) => setActivityForm((p) => ({ ...p, type: e.target.value }))}
                  className="input-field"
                >
                  {ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Notes</label>
                <input
                  type="text"
                  placeholder="Optional notes"
                  value={activityForm.notes}
                  onChange={(e) => setActivityForm((p) => ({ ...p, notes: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowActivityForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" disabled={submittingActivity}>
                {submittingActivity ? <><Spinner size="sm" />Saving...</> : 'Create Follow-up'}
              </button>
            </div>
          </form>
        )}

        {activities.length === 0 && !showActivityForm ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No follow-ups yet. Click "Add Follow-up" to schedule one.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {activities.map((activity) => {
              const isOverdue = activity.status === 'Pending' && new Date(activity.dueAt) < new Date()
              return (
                <div key={activity._id} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-800/20 transition-colors">
                  {/* Toggle checkbox */}
                  <button
                    onClick={() => handleToggleActivity(activity)}
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-medium ${activity.status === 'Completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {activity.title}
                      </p>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <TypeIcon type={activity.type} />
                        {activity.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs flex-wrap">
                      <span className={`${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                        {isOverdue && '⚠ '}
                        Due: {format(new Date(activity.dueAt), 'MMM d, yyyy h:mm a')}
                      </span>
                      {activity.completedAt && (
                        <span className="text-green-500">
                          Completed: {format(new Date(activity.completedAt), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                    {activity.notes && (
                      <p className="text-xs text-slate-500 mt-1">{activity.notes}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteActivity(activity._id)}
                    className="text-slate-600 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Delete lead confirm */}
      <ConfirmDialog
        isOpen={deleteLeadOpen}
        title="Delete Lead"
        message={`Are you sure you want to delete "${lead.name}"? All associated follow-ups will also be deleted.`}
        onConfirm={handleDeleteLead}
        onCancel={() => setDeleteLeadOpen(false)}
        confirmLabel={deleting ? 'Deleting...' : 'Delete Lead'}
      />
    </div>
  )
}
