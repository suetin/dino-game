import React, { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface WrapperContentProps {
  children: ReactNode
  className?: string
}

export const WrapperContent = ({ children, className }: WrapperContentProps) => {
  return <div className={cn('flex-1 flex flex-col', className)}>{children}</div>
}
