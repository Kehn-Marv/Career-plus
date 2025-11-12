import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface FileUploaderProps {
  onFileSelect: (file: File) => void
  onFileRemove: () => void
  acceptedFileTypes?: string[]
  maxSizeMB?: number
  minSizeKB?: number
  label: string
  description?: string
  currentFile?: File | null
  error?: string | null
  disabled?: boolean
}

export default function FileUploader({
  onFileSelect,
  onFileRemove,
  acceptedFileTypes = ['.pdf', '.doc', '.docx'],
  maxSizeMB = 5,
  minSizeKB = 1,
  label,
  description,
  currentFile,
  error,
  disabled = false
}: FileUploaderProps) {
  const [dragError, setDragError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setDragError(null)

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        setDragError(`File is too large. Maximum size is ${maxSizeMB}MB`)
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setDragError(`Invalid file type. Accepted: ${acceptedFileTypes.join(', ')}`)
      } else {
        setDragError('File upload failed. Please try again.')
      }
      return
    }

    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0])
    }
  }, [onFileSelect, maxSizeMB, acceptedFileTypes])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      // Map file extensions to MIME types
      const mimeTypes: Record<string, string[]> = {
        '.pdf': ['application/pdf'],
        '.doc': ['application/msword'],
        '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        '.txt': ['text/plain']
      }
      const mime = mimeTypes[type] || []
      mime.forEach(m => {
        acc[m] = []
      })
      return acc
    }, {} as Record<string, string[]>),
    maxSize: maxSizeMB * 1024 * 1024,
    multiple: false,
    disabled
  })

  const displayError = error || dragError

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {!currentFile ? (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragActive && !isDragReject && 'border-primary bg-primary-50',
            isDragReject && 'border-error bg-error-50',
            !isDragActive && !displayError && 'border-gray-300 hover:border-primary',
            displayError && 'border-error',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} />
          
          <Upload className={cn(
            'mx-auto h-12 w-12 mb-4',
            isDragActive && !isDragReject && 'text-primary',
            isDragReject && 'text-error',
            !isDragActive && 'text-gray-400'
          )} />

          {isDragActive ? (
            <p className="text-primary font-medium">Drop file here...</p>
          ) : (
            <>
              <p className="text-gray-700 font-medium mb-1">
                Drag & drop or click to upload
              </p>
              {description && (
                <p className="text-sm text-gray-500 mb-2">{description}</p>
              )}
              <p className="text-xs text-gray-500">
                Accepted: {acceptedFileTypes.join(', ')} • {minSizeKB}KB - {maxSizeMB}MB
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <File className="h-8 w-8 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(currentFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={onFileRemove}
              disabled={disabled}
              className="ml-4 p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
              aria-label="Remove file"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {displayError && (
        <div className="mt-2 flex items-start space-x-2 text-error text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  )
}
