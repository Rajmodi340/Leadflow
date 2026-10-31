import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { leadService } from '../services/leadService'
import LeadForm from '../components/leads/LeadForm'
import toast from 'react-hot-toast'

export default function AddLead() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await leadService.createLead(data)
      toast.success('Lead created successfully!')
      navigate(`/leads/${res.data.lead._id}`)
    } catch (err) {
      setLoading(false)
      throw err
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100">Add New Lead</h2>
        <p className="text-slate-500 text-sm mt-1">Fill in the details to create a new lead</p>
      </div>
      <div className="glass-card p-6 lg:p-8">
        <LeadForm
          onSubmit={handleSubmit}
          submitLabel="Create Lead"
          loading={loading}
        />
      </div>
    </div>
  )
}
