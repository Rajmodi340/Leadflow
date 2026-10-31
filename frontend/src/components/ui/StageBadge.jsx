export const STAGE_CONFIG = {
  'New': { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', dot: 'bg-blue-400' },
  'Contacted': { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30', dot: 'bg-yellow-400' },
  'Qualified': { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30', dot: 'bg-purple-400' },
  'Proposal Sent': { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30', dot: 'bg-orange-400' },
  'Won': { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30', dot: 'bg-green-400' },
  'Lost': { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-400' },
}

export default function StageBadge({ stage }) {
  const config = STAGE_CONFIG[stage] || STAGE_CONFIG['New']
  
  return (
    <span className={`badge ${config.bg} ${config.text} border ${config.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5`} />
      {stage}
    </span>
  )
}
