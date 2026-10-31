import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { leadService } from '../services/leadService'
import Spinner from '../components/ui/Spinner'
import StageBadge from '../components/ui/StageBadge'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import toast from 'react-hot-toast'

const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost']

export default function Leads() {
  const navigate = useNavigate()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [deleteName, setDeleteName] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 })

  const fetchLeads = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const res = await leadService.getLeads({ search, stage: stageFilter, ...params })
      setLeads(res.data.leads)
      setPagination(res.data.pagination)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load leads')
    } finally {
      setLoading(false)
    }
  }, [search, stageFilter])

  useEffect(() => {
    const timer = setTimeout(() => fetchLeads(), 300)
    return () => clearTimeout(timer)
  }, [fetchLeads])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await leadService.deleteLead(deleteId)
      toast.success('Lead deleted successfully')
      setDeleteId(null)
      fetchLeads()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete lead')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Leads</h2>
          <p className="text-slate-500 text-sm mt-1">{pagination.total} total leads</p>
        </div>
        <Link to="/leads/new" className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Lead
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="leads-search"
            type="text"
            placeholder="Search by name or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          id="leads-stage-filter"
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="input-field w-full sm:w-48"
        >
          <option value="">All Stages</option>
          {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Leads Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : leads.length === 0 ? (
          <EmptyState
            title={search || stageFilter ? 'No leads match your filters' : 'No leads yet'}
            description={search || stageFilter ? 'Try adjusting your search or filters' : 'Add your first lead to start tracking your pipeline'}
            action={
              !search && !stageFilter && (
                <Link to="/leads/new" className="btn-primary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Lead
                </Link>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-800">
                <tr>
                  <th className="table-header text-left">Name</th>
                  <th className="table-header text-left hidden md:table-cell">Company</th>
                  <th className="table-header text-left hidden lg:table-cell">Contact</th>
                  <th className="table-header text-left">Stage</th>
                  <th className="table-header text-left hidden xl:table-cell">Source</th>
                  <th className="table-header text-left hidden xl:table-cell">Budget</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id} className="table-row">
                    <td className="table-cell">
                      <Link
                        to={`/leads/${lead._id}`}
                        className="font-medium text-slate-200 hover:text-brand-400 transition-colors"
                      >
                        {lead.name}
                      </Link>
                    </td>
                    <td className="table-cell hidden md:table-cell text-slate-400">
                      {lead.company || '—'}
                    </td>
                    <td className="table-cell hidden lg:table-cell text-slate-400 text-xs">
                      {lead.email || lead.phone}
                    </td>
                    <td className="table-cell">
                      <StageBadge stage={lead.stage} />
                    </td>
                    <td className="table-cell hidden xl:table-cell text-slate-400">
                      {lead.source || '—'}
                    </td>
                    <td className="table-cell hidden xl:table-cell text-slate-400">
                      {lead.budget != null ? `$${lead.budget.toLocaleString()}` : '—'}
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/leads/${lead._id}`)}
                          className="p-1.5 text-slate-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-colors"
                          title="View"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => navigate(`/leads/${lead._id}/edit`)}
                          className="p-1.5 text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => { setDeleteId(lead._id); setDeleteName(lead.name) }}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => fetchLeads({ page: pagination.page - 1 })}
              disabled={pagination.page <= 1}
              className="btn-secondary py-1.5 px-3 disabled:opacity-40"
            >
              ← Prev
            </button>
            <button
              onClick={() => fetchLeads({ page: pagination.page + 1 })}
              disabled={pagination.page >= pagination.totalPages}
              className="btn-secondary py-1.5 px-3 disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Lead"
        message={`Are you sure you want to delete "${deleteName}"? This will also delete all associated follow-ups.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmLabel={deleting ? 'Deleting...' : 'Delete Lead'}
      />
    </div>
  )
}
