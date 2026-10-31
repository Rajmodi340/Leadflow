import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { leadService } from '../services/leadService'
import LeadForm from '../components/leads/LeadForm'
import Spinner from '../components/ui/Spinner'
import toast from 'react-hot-toast'

export default function EditLead() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lead, setLead] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const res = await leadService.getLead(id)
        setLead(res.data.lead)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load lead')
      } finally {
        setLoading(false)
      }
    }
    fetchLead()
  }, [id])

  const handleSubmit = async (data) => {
    setSubmitting(true)
    try {
      await leadService.updateLead(id, data)
      toast.success('Lead updated successfully!')
      navigate(`/leads/${id}`)
    } catch (err) {
      setSubmitting(false)
      throw err
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card p-8 text-center max-w-md mx-auto">
        <p className="text-red-400">{error}</p>
        <button onClick={() => navigate('/leads')} className="btn-secondary mt-4">
          Back to Leads
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100">Edit Lead</h2>
        <p className="text-slate-500 text-sm mt-1">{lead?.name}</p>
      </div>
      <div className="glass-card p-6 lg:p-8">
        <LeadForm
          initialData={lead}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          loading={submitting}
        />
      </div>
    </div>
  )
}
