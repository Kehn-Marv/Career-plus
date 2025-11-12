/**
 * SkipLink Component
 * Provides keyboard users a way to skip navigation and jump to main content
 */

export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:shadow-lg"
    >
      Skip to main content
    </a>
  )
}
