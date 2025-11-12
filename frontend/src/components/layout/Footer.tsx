export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto" role="contentinfo">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
          <div className="mb-4 md:mb-0">
            <p>© 2025 Career+. Open source and free forever.</p>
          </div>
          
          <nav className="flex items-center space-x-6" aria-label="Footer navigation">
            <a href="#" className="hover:text-primary transition-colors" aria-label="View GitHub repository">
              GitHub
            </a>
            <a href="#" className="hover:text-primary transition-colors" aria-label="Read documentation">
              Documentation
            </a>
            <a href="#" className="hover:text-primary transition-colors" aria-label="View privacy policy">
              Privacy
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
