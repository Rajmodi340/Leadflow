import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboardService } from '../services/dashboardService'
import Spinner from '../components/ui/Spinner'
import StageBadge from '../components/ui/StageBadge'
import { format } from 'date-fns'

const MetricCard = ({ title, value, icon, color, subtitle }) => (
  <div className="metric-card">
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-100">{value ?? '–'}</p>
      <p className="text-sm font-medium text-slate-300 mt-0.5">{title}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  </div>
)

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dashboardService.getSummary()
        setData(res.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-red-400">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-secondary mt-4">
          Retry
        </button>
      </div>
    )
  }

  const metrics = [
    {
      title: 'Total Leads',
      value: data?.totalLeads,
      color: 'bg-brand-500/20 border border-brand-500/30',
      icon: <svg className="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
    {
      title: 'Active Leads',
      value: data?.activeLeads,
      color: 'bg-blue-500/20 border border-blue-500/30',
      subtitle: 'Excluding Won & Lost',
      icon: <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    },
    {
      title: 'Won Leads',
      value: data?.wonLeads,
      color: 'bg-green-500/20 border border-green-500/30',
      icon: <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
    },
    {
      title: 'Pending Follow-ups',
      value: data?.pendingFollowUps,
      color: 'bg-yellow-500/20 border border-yellow-500/30',
      icon: <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      title: 'Overdue Follow-ups',
      value: data?.overdueFollowUps,
      color: 'bg-red-500/20 border border-red-500/30',
      icon: <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.834-1.964-.834-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Overview</h2>
          <p className="text-slate-500 text-sm mt-1">Your pipeline at a glance</p>
        </div>
        <Link to="/leads/new" className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Lead
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {metrics.map((m) => (
          <MetricCard key={m.title} {...m} />
        ))}
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
            <h3 className="font-semibold text-slate-200">Recent Leads</h3>
            <Link to="/leads" className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors">
              View all →
            </Link>
          </div>
          {data?.recentLeads?.length > 0 ? (
            <div className="divide-y divide-slate-800/60">
              {data.recentLeads.map((lead) => (
                <Link
                  key={lead._id}
                  to={`/leads/${lead._id}`}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-800/30 transition-colors group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 group-hover:text-brand-400 transition-colors truncate">
                      {lead.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{lead.company || 'No company'}</p>
                  </div>
                  <StageBadge stage={lead.stage} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-slate-500 text-sm">
              No leads yet.{' '}
              <Link to="/leads/new" className="text-brand-400 hover:text-brand-300">
                Add your first lead
              </Link>
            </div>
          )}
        </div>

        {/* Stage Distribution */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800/60">
            <h3 className="font-semibold text-slate-200">Stage Distribution</h3>
          </div>
          {data?.stageDistribution?.length > 0 ? (
            <div className="px-6 py-4 space-y-3">
              {data.stageDistribution.map(({ _id: stage, count }) => {
                const pct = data.totalLeads ? Math.round((count / data.totalLeads) * 100) : 0
                const colors = {
                  'New': 'bg-blue-500',
                  'Contacted': 'bg-yellow-500',
                  'Qualified': 'bg-purple-500',
                  'Proposal Sent': 'bg-orange-500',
                  'Won': 'bg-green-500',
                  'Lost': 'bg-red-500',
                }
                return (
                  <div key={stage}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-300">{stage}</span>
                      <span className="text-sm text-slate-400">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${colors[stage] || 'bg-brand-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-slate-500 text-sm">
              No stage data yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
