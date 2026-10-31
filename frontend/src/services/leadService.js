import api from './api'

export const leadService = {
  getLeads: async (params = {}) => {
    const res = await api.get('/leads', { params })
    return res.data
  },

  getLead: async (id) => {
    const res = await api.get(`/leads/${id}`)
    return res.data
  },

  createLead: async (data) => {
    const res = await api.post('/leads', data)
    return res.data
  },

  updateLead: async (id, data) => {
    const res = await api.patch(`/leads/${id}`, data)
    return res.data
  },

  deleteLead: async (id) => {
    const res = await api.delete(`/leads/${id}`)
    return res.data
  },
}
