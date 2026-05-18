import React, { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat'
  hoverable?: boolean
}

export function Card({ className = '', variant = 'default', hoverable = false, ...props }: CardProps) {
  const base = "bg-white overflow-hidden transition-all duration-200"
  
  const variants = {
    default: "rounded-xl border border-slate-200 shadow-sm",
    flat: "rounded-lg border border-slate-200/60"
  }

  const hoverEffect = hoverable ? "hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 cursor-pointer" : ""

  return (
    <div className={`${base} ${variants[variant]} ${hoverEffect} ${className}`} {...props} />
  )
}

export function CardHeader({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardBody({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 ${className}`} {...props} />
  )
}