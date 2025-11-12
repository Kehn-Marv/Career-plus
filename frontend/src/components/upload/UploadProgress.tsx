import { Loader2 } from 'lucide-react'

export interface UploadProgressProps {
  progress: number // 0-100
  message?: string
  show: boolean
}

export default function UploadProgress({
  progress,
  message = 'Processing...',
  show
}: UploadProgressProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center space-x-3 mb-4">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
          <h3 className="text-lg font-semibold text-gray-900">
            {message}
          </h3>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-sm text-gray-600 mt-2 text-center">
          {progress}% complete
        </p>
      </div>
    </div>
  )
}
