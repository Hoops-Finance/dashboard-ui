"use client"

import { ReactNode } from 'react'

interface DebugBoundaryProps {
  name: string
  children: ReactNode
}

export function DebugBoundary({ name, children }: DebugBoundaryProps) {
  console.log(`Rendering ${name}`)
  
  return (
    <div style={{ border: '1px solid red', padding: '10px', margin: '10px' }}>
      <div style={{ backgroundColor: 'red', color: 'white', padding: '5px' }}>
        {name}
      </div>
      {children}
    </div>
  )
}

