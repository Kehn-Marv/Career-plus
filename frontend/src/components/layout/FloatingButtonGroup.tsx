import { ReactNode } from 'react'

interface FloatingButtonGroupProps {
  children: ReactNode
}

/**
 * Container for floating action buttons
 * Handles responsive positioning to prevent overlap
 * 
 * Layout:
 * - Mobile (<640px): Vertical stack, bottom-right, 12px spacing
 * - Tablet/Desktop (≥640px): Horizontal row, bottom-right, 16px spacing
 * 
 * Z-index: 1000 for proper layering above content
 */
export default function FloatingButtonGroup({ children }: FloatingButtonGroupProps) {
  return (
    <div
      className="fixed bottom-4 right-4 z-[1000] 
                 flex flex-col-reverse sm:flex-row 
                 gap-3 sm:gap-4
                 items-end sm:items-center"
      role="group"
      aria-label="Floating action buttons"
    >
      {children}
    </div>
  )
}
