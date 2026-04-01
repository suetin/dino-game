import { useEffect, useState } from 'react'
import { CheckCircle2, CircleAlert, Info } from 'lucide-react'
import { cva } from 'class-variance-authority'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

type ToastVariant = 'default' | 'success' | 'error'

const toastAlertVariants = cva(
  'flex items-center gap-3 rounded-xl border px-5 py-4 text-left text-base shadow-xl backdrop-blur-sm',
  {
    variants: {
      variant: {
        default:
          'border-slate-300 bg-white/95 text-slate-900 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-100',
        success:
          'border-emerald-300 bg-emerald-50/95 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/95 dark:text-emerald-50',
        error:
          'border-rose-300 bg-rose-50/95 text-rose-950 dark:border-rose-800 dark:bg-rose-950/95 dark:text-rose-50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface ToastProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  message: string
  variant?: ToastVariant
  durationMs?: number
}

const getToastIcon = (variant: ToastVariant) => {
  if (variant === 'success') {
    return CheckCircle2
  }

  if (variant === 'error') {
    return CircleAlert
  }

  return Info
}

export const Toast = ({
  open,
  onOpenChange,
  message,
  variant = 'default',
  durationMs = 3000,
}: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    if (!open) {
      setIsVisible(false)
      setIsLeaving(false)
      return
    }

    setIsVisible(true)
    setIsLeaving(false)

    const fadeTimeoutId = window.setTimeout(() => setIsLeaving(true), Math.max(durationMs - 300, 0))
    const hideTimeoutId = window.setTimeout(() => {
      setIsVisible(false)
      setIsLeaving(false)
      onOpenChange?.(false)
    }, durationMs)

    return () => {
      window.clearTimeout(fadeTimeoutId)
      window.clearTimeout(hideTimeoutId)
    }
  }, [durationMs, onOpenChange, open])

  if (!isVisible) {
    return null
  }

  const Icon = getToastIcon(variant)

  return (
    <div className="pointer-events-none fixed left-1/2 top-6 z-50 w-full max-w-xl -translate-x-1/2 px-4">
      <Alert
        className={cn(
          toastAlertVariants({ variant }),
          isLeaving
            ? 'animate-out slide-out-to-top-2 fade-out duration-300'
            : 'animate-in slide-in-from-top-2 fade-in duration-300'
        )}>
        <Icon className="h-5 w-5 shrink-0" />
        <AlertDescription className="min-w-0 flex-1 text-inherit font-medium leading-6 [&_p]:leading-relaxed">
          {message}
        </AlertDescription>
      </Alert>
    </div>
  )
}
