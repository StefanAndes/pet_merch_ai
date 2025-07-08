import { render, screen, fireEvent } from '@testing-library/react'
import { StylePicker, type StyleType, STYLES } from './StylePicker'
import { vi } from 'vitest'

describe('StylePicker', () => {
  const mockOnStyleSelect = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all style options', () => {
    render(<StylePicker onStyleSelect={mockOnStyleSelect} />)
    
    expect(screen.getByText('Choose Your Style')).toBeInTheDocument()
    expect(screen.getByText('Select a design style for your pet merchandise')).toBeInTheDocument()
    
    // Check all styles are rendered
    STYLES.forEach(style => {
      expect(screen.getByText(style.name)).toBeInTheDocument()
      expect(screen.getByText(style.description)).toBeInTheDocument()
      expect(screen.getByText(style.prompt)).toBeInTheDocument()
    })
  })

  it('calls onStyleSelect when a style is clicked', () => {
    render(<StylePicker onStyleSelect={mockOnStyleSelect} />)
    
    const metalStyle = screen.getByText('Metal Band')
    fireEvent.click(metalStyle.closest('div')!)
    
    expect(mockOnStyleSelect).toHaveBeenCalledWith('METAL')
  })

  it('shows selection indicator for selected style', () => {
    render(<StylePicker selectedStyle="POP_ART" onStyleSelect={mockOnStyleSelect} />)
    
    // Check that the selected style has the checkmark
    const popArtSection = screen.getByText('Pop Art').closest('div')
    expect(popArtSection).toHaveClass('ring-2', 'ring-primary', 'ring-offset-2')
  })

  it('shows confirmation message when style is selected', () => {
    render(<StylePicker selectedStyle="WATERCOLOR" onStyleSelect={mockOnStyleSelect} />)
    
    expect(screen.getByText('Watercolor Style Selected')).toBeInTheDocument()
    expect(screen.getByText(/Your pet photos will be transformed into a watercolor design/)).toBeInTheDocument()
  })

  it('disables interaction when disabled prop is true', () => {
    render(<StylePicker disabled={true} onStyleSelect={mockOnStyleSelect} />)
    
    const metalStyle = screen.getByText('Metal Band')
    fireEvent.click(metalStyle.closest('div')!)
    
    expect(mockOnStyleSelect).not.toHaveBeenCalled()
    
    // Check that styles have disabled styling
    const styleCards = screen.getAllByText(/Style/).map(el => el.closest('div'))
    styleCards.forEach(card => {
      expect(card).toHaveClass('opacity-50', 'cursor-not-allowed')
    })
  })

  it('shows hover effects on style cards', () => {
    render(<StylePicker onStyleSelect={mockOnStyleSelect} />)
    
    const metalStyle = screen.getByText('Metal Band').closest('div')!
    
    // Initially, overlay should be hidden
    const overlay = metalStyle.querySelector('.absolute.inset-0')
    expect(overlay).toHaveClass('opacity-0')
    
    // Hover should show overlay
    fireEvent.mouseEnter(metalStyle)
    expect(overlay).toHaveClass('opacity-100')
    
    // Mouse leave should hide overlay
    fireEvent.mouseLeave(metalStyle)
    expect(overlay).toHaveClass('opacity-0')
  })

  it('does not show hover effects when disabled', () => {
    render(<StylePicker disabled={true} onStyleSelect={mockOnStyleSelect} />)
    
    const metalStyle = screen.getByText('Metal Band').closest('div')!
    
    fireEvent.mouseEnter(metalStyle)
    
    // Overlay should remain hidden when disabled
    const overlay = metalStyle.querySelector('.absolute.inset-0')
    expect(overlay).toHaveClass('opacity-0')
  })

  it('handles all style types correctly', () => {
    const styleTypes: StyleType[] = ['METAL', 'POP_ART', 'WATERCOLOR']
    
    styleTypes.forEach(styleType => {
      const { rerender } = render(<StylePicker selectedStyle={styleType} onStyleSelect={mockOnStyleSelect} />)
      
      const selectedStyle = STYLES.find(s => s.id === styleType)!
      expect(screen.getByText(`${selectedStyle.name} Style Selected`)).toBeInTheDocument()
      
      rerender(<StylePicker onStyleSelect={mockOnStyleSelect} />)
    })
  })

  it('renders style preview images with correct alt text', () => {
    render(<StylePicker onStyleSelect={mockOnStyleSelect} />)
    
    STYLES.forEach(style => {
      const image = screen.getByAltText(`${style.name} style preview`)
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', style.previewImage)
    })
  })

  it('displays example text on hover', () => {
    render(<StylePicker onStyleSelect={mockOnStyleSelect} />)
    
    const metalStyle = screen.getByText('Metal Band').closest('div')!
    
    fireEvent.mouseEnter(metalStyle)
    
    // Should show the example text
    const metalStyleData = STYLES.find(s => s.id === 'METAL')!
    expect(screen.getByText(metalStyleData.example)).toBeInTheDocument()
  })

  it('applies correct CSS classes for responsive design', () => {
    render(<StylePicker onStyleSelect={mockOnStyleSelect} />)
    
    const grid = screen.getByText('Choose Your Style').parentElement?.querySelector('.grid')
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-3', 'gap-6')
  })
}) 