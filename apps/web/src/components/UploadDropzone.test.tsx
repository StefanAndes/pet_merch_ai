/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UploadDropzone } from './UploadDropzone'

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />
  },
}))

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url')
global.URL.revokeObjectURL = vi.fn()

describe('UploadDropzone', () => {
  const mockOnFilesAccepted = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with correct instructions', () => {
    render(<UploadDropzone onFilesAccepted={mockOnFilesAccepted} />)
    
    expect(screen.getByText(/Drag & drop pet photos here/)).toBeInTheDocument()
    expect(screen.getByText(/Upload 1-5 images/)).toBeInTheDocument()
    expect(screen.getByText(/Max 4MB per file/)).toBeInTheDocument()
    expect(screen.getByText(/Min 512×512px/)).toBeInTheDocument()
  })

  it('shows drag active state', async () => {
    render(<UploadDropzone onFilesAccepted={mockOnFilesAccepted} />)
    
    const dropzone = screen.getByText(/Drag & drop pet photos here/).closest('div')
    
    fireEvent.dragEnter(dropzone!)
    
    await waitFor(() => {
      expect(screen.getByText('Drop your pet photos here')).toBeInTheDocument()
    })
  })

  it('handles file drop with valid image', async () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    Object.defineProperty(file, 'size', { value: 1024 * 1024 }) // 1MB

    // Mock image loading
    const mockImage = {
      width: 1024,
      height: 1024,
      onload: null as unknown as () => void,
      onerror: null as unknown as () => void,
      src: '',
    }

    global.Image = vi.fn(() => mockImage) as unknown as typeof Image
    
    render(<UploadDropzone onFilesAccepted={mockOnFilesAccepted} />)
    
    const input = screen.getByRole('button', { hidden: true }).parentElement?.querySelector('input')
    
    fireEvent.change(input!, {
      target: { files: [file] },
    })

    // Trigger image onload
    await waitFor(() => {
      if (mockImage.onload) {
        mockImage.onload()
      }
    })

    await waitFor(() => {
      expect(screen.getByText('Valid')).toBeInTheDocument()
      expect(mockOnFilesAccepted).toHaveBeenCalledWith([file])
    })
  })

  it('rejects files that are too large', async () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 }) // 5MB

    render(<UploadDropzone onFilesAccepted={mockOnFilesAccepted} />)
    
    const input = screen.getByRole('button', { hidden: true }).parentElement?.querySelector('input')
    
    // Mock window.alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    fireEvent.change(input!, {
      target: { files: [file] },
    })

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled()
    })
  })

  it('validates image dimensions', async () => {
    const file = new File(['test'], 'small.jpg', { type: 'image/jpeg' })
    Object.defineProperty(file, 'size', { value: 1024 * 1024 }) // 1MB

    // Mock small image
    const mockImage = {
      width: 256,
      height: 256,
      onload: null as unknown as () => void,
      onerror: null as unknown as () => void,
      src: '',
    }

    global.Image = vi.fn(() => mockImage) as unknown as typeof Image
    
    render(<UploadDropzone onFilesAccepted={mockOnFilesAccepted} />)
    
    const input = screen.getByRole('button', { hidden: true }).parentElement?.querySelector('input')
    
    fireEvent.change(input!, {
      target: { files: [file] },
    })

    // Trigger image onload
    await waitFor(() => {
      if (mockImage.onload) {
        mockImage.onload()
      }
    })

    await waitFor(() => {
      expect(screen.getByText(/Image must be at least 512x512 pixels/)).toBeInTheDocument()
      expect(mockOnFilesAccepted).not.toHaveBeenCalled()
    })
  })

  it('allows removing uploaded files', async () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    Object.defineProperty(file, 'size', { value: 1024 * 1024 })

    const mockImage = {
      width: 1024,
      height: 1024,
      onload: null as any,
      onerror: null as any,
      src: '',
    }

    global.Image = vi.fn(() => mockImage) as any
    
    render(<UploadDropzone onFilesAccepted={mockOnFilesAccepted} />)
    
    const input = screen.getByRole('button', { hidden: true }).parentElement?.querySelector('input')
    
    fireEvent.change(input!, {
      target: { files: [file] },
    })

    await waitFor(() => {
      if (mockImage.onload) {
        mockImage.onload()
      }
    })

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument()
    })

    // Hover over the image to show remove button
    const imageContainer = screen.getByText('test.jpg').closest('.group')
    fireEvent.mouseEnter(imageContainer!)

    const removeButton = imageContainer!.querySelector('button')
    fireEvent.click(removeButton!)

    await waitFor(() => {
      expect(screen.queryByText('test.jpg')).not.toBeInTheDocument()
    })
  })

  it('clears all files when Clear All is clicked', async () => {
    const file1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' })
    const file2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' })
    Object.defineProperty(file1, 'size', { value: 1024 * 1024 })
    Object.defineProperty(file2, 'size', { value: 1024 * 1024 })

    const mockImage = {
      width: 1024,
      height: 1024,
      onload: null as any,
      onerror: null as any,
      src: '',
    }

    global.Image = vi.fn(() => mockImage) as any
    
    render(<UploadDropzone onFilesAccepted={mockOnFilesAccepted} />)
    
    const input = screen.getByRole('button', { hidden: true }).parentElement?.querySelector('input')
    
    fireEvent.change(input!, {
      target: { files: [file1, file2] },
    })

    await waitFor(() => {
      if (mockImage.onload) {
        mockImage.onload()
      }
    })

    await waitFor(() => {
      expect(screen.getByText('test1.jpg')).toBeInTheDocument()
      expect(screen.getByText('test2.jpg')).toBeInTheDocument()
    })

    const clearAllButton = screen.getByText('Clear All')
    fireEvent.click(clearAllButton)

    await waitFor(() => {
      expect(screen.queryByText('test1.jpg')).not.toBeInTheDocument()
      expect(screen.queryByText('test2.jpg')).not.toBeInTheDocument()
    })
  })

  it('enforces maximum file limit', async () => {
    const files = Array.from({ length: 6 }, (_, i) => 
      new File([`test${i}`], `test${i}.jpg`, { type: 'image/jpeg' })
    )
    files.forEach(file => {
      Object.defineProperty(file, 'size', { value: 1024 * 1024 })
    })

    render(<UploadDropzone onFilesAccepted={mockOnFilesAccepted} />)
    
    const input = screen.getByRole('button', { hidden: true }).parentElement?.querySelector('input')
    
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    fireEvent.change(input!, {
      target: { files },
    })

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('You can only upload up to 5 images')
    })
  })

  it('disables dropzone when disabled prop is true', () => {
    render(<UploadDropzone onFilesAccepted={mockOnFilesAccepted} disabled />)
    
    const dropzone = screen.getByText(/Drag & drop pet photos here/).closest('div')
    expect(dropzone).toHaveClass('opacity-50', 'cursor-not-allowed')
  })
}) 