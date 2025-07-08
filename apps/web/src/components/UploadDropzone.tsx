'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { Button } from 'ui'
import { X, Upload, AlertCircle, CheckCircle } from 'lucide-react'
import Image from 'next/image'

const MAX_FILES = 5
const MAX_FILE_SIZE = 4 * 1024 * 1024 // 4MB
const MIN_DIMENSION = 200 // Temporarily lowered for testing

interface UploadedFile {
  id: string
  file: File
  preview: string
  status: 'validating' | 'valid' | 'invalid'
  error?: string
}

interface UploadDropzoneProps {
  onFilesAccepted: (files: File[]) => void
  disabled?: boolean
}

export function UploadDropzone({ onFilesAccepted, disabled = false }: UploadDropzoneProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isValidating, setIsValidating] = useState(false)

  const validateImage = async (file: File): Promise<{ valid: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const img = new window.Image()
      const url = URL.createObjectURL(file)
      
      img.onload = () => {
        URL.revokeObjectURL(url)
        
        if (img.width < MIN_DIMENSION || img.height < MIN_DIMENSION) {
          resolve({ 
            valid: false, 
            error: `Image must be at least ${MIN_DIMENSION}x${MIN_DIMENSION} pixels` 
          })
          return
        }
        
        // TODO: Add face detection here in a future update
        // For now, we'll just validate dimensions
        resolve({ valid: true })
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve({ valid: false, error: 'Invalid image file' })
      }
      
      img.src = url
    })
  }

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (uploadedFiles.length + acceptedFiles.length > MAX_FILES) {
      alert(`You can only upload up to ${MAX_FILES} images`)
      return
    }

    setIsValidating(true)

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(({ file, errors }) => {
        const errorMessage = errors.map(e => e.message).join(', ')
        return `${file.name}: ${errorMessage}`
      }).join('\n')
      alert(errors)
    }

    // Process accepted files
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      status: 'validating' as const
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])

    // Validate each file
    const validatedFiles = await Promise.all(
      newFiles.map(async (uploadedFile) => {
        const validation = await validateImage(uploadedFile.file)
        return {
          ...uploadedFile,
          status: (validation.valid ? 'valid' : 'invalid') as 'valid' | 'invalid',
          error: validation.error
        }
      })
    )

    setUploadedFiles(prev => {
      const updatedFiles = [...prev]
      validatedFiles.forEach(validatedFile => {
        const index = updatedFiles.findIndex(f => f.id === validatedFile.id)
        if (index !== -1) {
          updatedFiles[index] = validatedFile
        }
      })
      return updatedFiles
    })

    setIsValidating(false)

    // Notify parent of valid files
    const validFiles = validatedFiles
      .filter(f => f.status === 'valid')
      .map(f => f.file)
    
    if (validFiles.length > 0) {
      onFilesAccepted(validFiles)
    }
  }, [uploadedFiles.length, onFilesAccepted])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES - uploadedFiles.length,
    disabled: disabled || uploadedFiles.length >= MAX_FILES
  })

  const removeFile = (id: string) => {
    setUploadedFiles(prev => {
      const file = prev.find(f => f.id === id)
      if (file) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter(f => f.id !== id)
    })
  }

  const clearAll = () => {
    uploadedFiles.forEach(file => {
      URL.revokeObjectURL(file.preview)
    })
    setUploadedFiles([])
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
          ${disabled || uploadedFiles.length >= MAX_FILES ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        <p className="text-lg font-medium text-gray-900 mb-2">
          {isDragActive
            ? 'Drop your pet photos here'
            : 'Drag & drop pet photos here, or click to select'}
        </p>
        
        <p className="text-sm text-gray-500">
          Upload 1-{MAX_FILES} images • Max {MAX_FILE_SIZE / 1024 / 1024}MB per file • Min {MIN_DIMENSION}×{MIN_DIMENSION}px
        </p>
        
        {uploadedFiles.length >= MAX_FILES && (
          <p className="text-sm text-orange-600 mt-2">
            Maximum number of files reached
          </p>
        )}
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              Uploaded Files ({uploadedFiles.length}/{MAX_FILES})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              disabled={isValidating}
            >
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="relative group rounded-lg overflow-hidden border border-gray-200"
              >
                <div className="aspect-square relative">
                  <Image
                    src={file.preview}
                    alt={file.file.name}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => removeFile(file.id)}
                      className="absolute top-2 right-2 p-1 bg-white rounded-full text-gray-700 hover:text-red-600"
                      disabled={isValidating}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Status indicator */}
                  <div className="absolute bottom-2 left-2 right-2">
                    {file.status === 'validating' && (
                      <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center">
                        <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Validating...
                      </div>
                    )}
                    {file.status === 'valid' && (
                      <div className="bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Valid
                      </div>
                    )}
                    {file.status === 'invalid' && (
                      <div className="bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {file.error || 'Invalid'}
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 p-2 truncate">
                  {file.file.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 