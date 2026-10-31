import { useEffect, useRef } from 'react'

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Delete', confirmClass = 'btn-danger' }) {
  const confirmRef = useRef(null)

  useEffect(() => {
    if (isOpen) confirmRef.current?.focus()
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      
      {/* Dialog */}
      <div className="relative bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in">
        {/* Icon */}
        <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.834-1.964-.834-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h3 className="text-lg font-semibold text-slate-100 text-center mb-2">{title}</h3>
        <p className="text-slate-400 text-sm text-center mb-6">{message}</p>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn-secondary flex-1 justify-center"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={`${confirmClass} flex-1 justify-center`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
