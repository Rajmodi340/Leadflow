import api from './api'

export const dashboardService = {
  getSummary: async () => {
    const res = await api.get('/dashboard/summary')
    return res.data
  },
}
