import api from './api'

export const activityService = {
  getActivities: async (params = {}) => {
    const res = await api.get('/activities', { params })
    return res.data
  },

  createActivity: async (data) => {
    const res = await api.post('/activities', data)
    return res.data
  },

  updateActivity: async (id, data) => {
    const res = await api.patch(`/activities/${id}`, data)
    return res.data
  },

  deleteActivity: async (id) => {
    const res = await api.delete(`/activities/${id}`)
    return res.data
  },
}
