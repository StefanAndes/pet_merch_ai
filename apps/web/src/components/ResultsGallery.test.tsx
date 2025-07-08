import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ResultsGallery } from './ResultsGallery'
import { vi } from 'vitest'

// Mock next/image
vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}))

// Mock navigator.share and clipboard
Object.defineProperty(navigator, 'share', {
  writable: true,
  value: vi.fn(),
})

Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  value: {
    writeText: vi.fn(),
  },
})

// Mock window.alert
window.alert = vi.fn()

describe('ResultsGallery', () => {
  const mockGeneratedImages = [
    {
      id: 'gen-1',
      url: 'https://example.com/design1.png',
      prompt: 'metal band t-shirt design for pet',
      style: 'METAL'
    },
    {
      id: 'gen-2',
      url: 'https://example.com/design2.png',
      prompt: 'pop art style design for pet',
      style: 'POP_ART'
    }
  ]

  const mockMockups = [
    {
      id: 'mock-1',
      url: 'https://example.com/tshirt.png',
      productType: 'tee',
      productName: 'Classic T-Shirt',
      price: 25.99
    },
    {
      id: 'mock-2',
      url: 'https://example.com/hoodie.png',
      productType: 'hoodie',
      productName: 'Cozy Hoodie',
      price: 45.99
    },
    {
      id: 'mock-3',
      url: 'https://example.com/mug.png',
      productType: 'mug',
      productName: 'Ceramic Mug',
      price: 15.99
    }
  ]

  const defaultProps = {
    designId: 'test-design-123',
    style: 'METAL',
    generatedImages: mockGeneratedImages,
    mockups: mockMockups,
    onProceedToCheckout: vi.fn(),
    onRegenerateDesign: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state correctly', () => {
    render(<ResultsGallery {...defaultProps} isLoading={true} />)
    
    expect(screen.getByText('Loading Your Results')).toBeInTheDocument()
    expect(screen.getByText('Preparing your generated designs...')).toBeInTheDocument()
  })

  it('renders header with correct style information', () => {
    render(<ResultsGallery {...defaultProps} />)
    
    expect(screen.getByText('Your Pet AI Designs')).toBeInTheDocument()
    expect(screen.getByText('Generated in metal style')).toBeInTheDocument()
  })

  it('renders generated designs section', () => {
    render(<ResultsGallery {...defaultProps} />)
    
    expect(screen.getByText('AI Generated Designs')).toBeInTheDocument()
    expect(screen.getByText('Detailed View')).toBeInTheDocument()
    expect(screen.getByText('Regenerate')).toBeInTheDocument()
    
    // Check if images are rendered
    expect(screen.getByAltText('Generated METAL design')).toBeInTheDocument()
    expect(screen.getByAltText('Generated POP_ART design')).toBeInTheDocument()
  })

  it('toggles between grid and detailed view', () => {
    render(<ResultsGallery {...defaultProps} />)
    
    const toggleButton = screen.getByText('Detailed View')
    fireEvent.click(toggleButton)
    
    expect(screen.getByText('Grid View')).toBeInTheDocument()
    expect(screen.getByText('METAL Design')).toBeInTheDocument()
    expect(screen.getByText('metal band t-shirt design for pet')).toBeInTheDocument()
  })

  it('renders product mockups section', () => {
    render(<ResultsGallery {...defaultProps} />)
    
    expect(screen.getByText('Product Mockups')).toBeInTheDocument()
    expect(screen.getByText('Select All')).toBeInTheDocument()
    expect(screen.getByText('0 of 3 selected')).toBeInTheDocument()
    
    // Check if mockups are rendered
    expect(screen.getByText('Classic T-Shirt')).toBeInTheDocument()
    expect(screen.getByText('Cozy Hoodie')).toBeInTheDocument()
    expect(screen.getByText('Ceramic Mug')).toBeInTheDocument()
  })

  it('handles mockup selection', () => {
    render(<ResultsGallery {...defaultProps} />)
    
    const tshirtMockup = screen.getByText('Classic T-Shirt').closest('div')!
    fireEvent.click(tshirtMockup)
    
    expect(screen.getByText('1 of 3 selected')).toBeInTheDocument()
    expect(screen.getByText('1 item selected')).toBeInTheDocument()
    expect(screen.getByText('Total: $25.99')).toBeInTheDocument()
  })

  it('handles select all functionality', () => {
    render(<ResultsGallery {...defaultProps} />)
    
    const selectAllButton = screen.getByText('Select All')
    fireEvent.click(selectAllButton)
    
    expect(screen.getByText('3 of 3 selected')).toBeInTheDocument()
    expect(screen.getByText('3 items selected')).toBeInTheDocument()
    expect(screen.getByText('Total: $87.97')).toBeInTheDocument()
    expect(screen.getByText('Deselect All')).toBeInTheDocument()
  })

  it('calculates total price correctly', () => {
    render(<ResultsGallery {...defaultProps} />)
    
    // Select T-shirt and mug
    const tshirtMockup = screen.getByText('Classic T-Shirt').closest('div')!
    const mugMockup = screen.getByText('Ceramic Mug').closest('div')!
    
    fireEvent.click(tshirtMockup)
    fireEvent.click(mugMockup)
    
    expect(screen.getByText('Total: $41.98')).toBeInTheDocument()
  })

  it('calls onProceedToCheckout with selected mockups', () => {
    const mockOnProceedToCheckout = vi.fn()
    render(<ResultsGallery {...defaultProps} onProceedToCheckout={mockOnProceedToCheckout} />)
    
    // Select a mockup
    const tshirtMockup = screen.getByText('Classic T-Shirt').closest('div')!
    fireEvent.click(tshirtMockup)
    
    // Click proceed to checkout
    const checkoutButton = screen.getByText('Proceed to Checkout')
    fireEvent.click(checkoutButton)
    
    expect(mockOnProceedToCheckout).toHaveBeenCalledWith(['mock-1'])
  })

  it('disables checkout button when no mockups selected', () => {
    render(<ResultsGallery {...defaultProps} />)
    
    const checkoutButton = screen.getByText('Proceed to Checkout')
    expect(checkoutButton).toBeDisabled()
  })

  it('calls onRegenerateDesign when regenerate button is clicked', () => {
    const mockOnRegenerateDesign = vi.fn()
    render(<ResultsGallery {...defaultProps} onRegenerateDesign={mockOnRegenerateDesign} />)
    
    const regenerateButton = screen.getByText('Regenerate')
    fireEvent.click(regenerateButton)
    
    expect(mockOnRegenerateDesign).toHaveBeenCalled()
  })

  it('handles download functionality', () => {
    // Mock createElement and click
    const mockLink = {
      click: vi.fn(),
      href: '',
      download: ''
    }
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
    
    render(<ResultsGallery {...defaultProps} />)
    
    // Find and click download button
    const downloadButtons = screen.getAllByRole('button')
    const downloadButton = downloadButtons.find(button => 
      button.querySelector('svg')?.classList.contains('lucide-download')
    )
    
    fireEvent.click(downloadButton!)
    
    expect(mockLink.click).toHaveBeenCalled()
    expect(mockLink.download).toBe('pet-design-test-design-123.png')
  })

  it('handles share functionality with navigator.share', async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined)
    ;(navigator.share as any) = mockShare
    
    render(<ResultsGallery {...defaultProps} />)
    
    // Find and click share button
    const shareButtons = screen.getAllByRole('button')
    const shareButton = shareButtons.find(button => 
      button.querySelector('svg')?.classList.contains('lucide-share-2')
    )
    
    fireEvent.click(shareButton!)
    
    await waitFor(() => {
      expect(mockShare).toHaveBeenCalledWith({
        title: 'My Pet AI Design',
        text: 'Check out this metal design I created for my pet!',
        url: 'https://example.com/design1.png'
      })
    })
  })

  it('handles share functionality fallback to clipboard', async () => {
    // Mock navigator.share to not exist
    ;(navigator.share as any) = undefined
    const mockWriteText = vi.fn().mockResolvedValue(undefined)
    ;(navigator.clipboard.writeText as any) = mockWriteText
    
    render(<ResultsGallery {...defaultProps} />)
    
    // Find and click share button
    const shareButtons = screen.getAllByRole('button')
    const shareButton = shareButtons.find(button => 
      button.querySelector('svg')?.classList.contains('lucide-share-2')
    )
    
    fireEvent.click(shareButton!)
    
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('https://example.com/design1.png')
      expect(window.alert).toHaveBeenCalledWith('Design URL copied to clipboard!')
    })
  })

  it('opens preview modal when image is clicked', () => {
    render(<ResultsGallery {...defaultProps} />)
    
    const designImage = screen.getByAltText('Generated METAL design')
    fireEvent.click(designImage)
    
    // Check if modal is opened
    const modal = screen.getByText('Preview').closest('div')
    expect(modal).toBeInTheDocument()
  })

  it('closes preview modal when clicked outside', () => {
    render(<ResultsGallery {...defaultProps} />)
    
    // Open modal
    const designImage = screen.getByAltText('Generated METAL design')
    fireEvent.click(designImage)
    
    // Click outside modal
    const modal = screen.getByText('Preview').closest('div')!
    fireEvent.click(modal)
    
    // Modal should be closed
    expect(screen.queryByText('Preview')).not.toBeInTheDocument()
  })

  it('displays correct product information', () => {
    render(<ResultsGallery {...defaultProps} />)
    
    expect(screen.getByText('$25.99')).toBeInTheDocument()
    expect(screen.getByText('$45.99')).toBeInTheDocument()
    expect(screen.getByText('$15.99')).toBeInTheDocument()
    expect(screen.getByText('tee')).toBeInTheDocument()
    expect(screen.getByText('hoodie')).toBeInTheDocument()
    expect(screen.getByText('mug')).toBeInTheDocument()
  })
}) 