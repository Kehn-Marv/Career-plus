import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

export interface FileValidatorProps {
  file: File | null
  onValidationComplete: (valid: boolean, error?: string) => void
  validationType: 'resume' | 'job-description'
}

export default function FileValidator({
  file,
  onValidationComplete,
  validationType
}: FileValidatorProps) {
  const [status, setStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle')
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    if (!file) {
      setStatus('idle')
      return
    }

    validateFile()
  }, [file])

  const validateFile = async () => {
    if (!file) return

    setStatus('validating')
    setMessage('Validating file...')

    try {
      // Import validators dynamically
      const { validateResumeFile, validateJobDescriptionFile } = await import('@/lib/validators/file-validator')
      
      // Validate file
      const result = validationType === 'resume' 
        ? await validateResumeFile(file)
        : await validateJobDescriptionFile(file)

      if (!result.valid) {
        setStatus('invalid')
        setMessage(result.error || 'File validation failed')
        onValidationComplete(false, result.error)
        return
      }

      if (result.warnings && result.warnings.length > 0) {
        setMessage(result.warnings[0])
      } else {
        setMessage('File validated successfully')
      }

      setStatus('valid')
      onValidationComplete(true)

    } catch (error: any) {
      setStatus('invalid')
      setMessage(error.message || 'Validation error occurred')
      onValidationComplete(false, error.message)
    }
  }

  if (status === 'idle' || !file) {
    return null
  }

  return (
    <div className="mt-2">
      {status === 'validating' && (
        <div className="flex items-center space-x-2 text-gray-600 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{message}</span>
        </div>
      )}

      {status === 'valid' && (
        <div className="flex items-center space-x-2 text-success text-sm">
          <CheckCircle className="h-4 w-4" />
          <span>{message}</span>
        </div>
      )}

      {status === 'invalid' && (
        <div className="flex items-start space-x-2 text-error text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}
    </div>
  )
}
