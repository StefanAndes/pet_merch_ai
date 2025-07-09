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
    
    const royalStyle = screen.getByText('Royal Portrait')
    fireEvent.click(royalStyle.closest('div')!)
    
    expect(mockOnStyleSelect).toHaveBeenCalledWith('ROYAL')
  })

  it('shows selection indicator for selected style', () => {
    render(<StylePicker selectedStyle="KNIGHT" onStyleSelect={mockOnStyleSelect} />)
    
    // Check that the selected style has the checkmark
    const knightSection = screen.getByText('Medieval Knight').closest('div')
    expect(knightSection).toHaveClass('ring-2', 'ring-primary', 'ring-offset-2')
  })

  it('shows confirmation message when style is selected', () => {
    render(<StylePicker selectedStyle="SUPERHERO" onStyleSelect={mockOnStyleSelect} />)
    
    expect(screen.getByText('Superhero Style Selected')).toBeInTheDocument()
    expect(screen.getByText(/Your pet photos will be transformed into a superhero design/)).toBeInTheDocument()
  })

  it('disables interaction when disabled prop is true', () => {
    render(<StylePicker disabled={true} onStyleSelect={mockOnStyleSelect} />)
    
    const royalStyle = screen.getByText('Royal Portrait')
    fireEvent.click(royalStyle.closest('div')!)
    
    expect(mockOnStyleSelect).not.toHaveBeenCalled()
    
    // Check that styles have disabled styling
    const styleCards = screen.getAllByText(/Style/).map(el => el.closest('div'))
    styleCards.forEach(card => {
      expect(card).toHaveClass('opacity-50', 'cursor-not-allowed')
    })
  })

  it('shows hover effects on style cards', () => {
    render(<StylePicker onStyleSelect={mockOnStyleSelect} />)
    
    const royalStyle = screen.getByText('Royal Portrait').closest('div')!
    
    // Initially, overlay should be hidden
    const overlay = royalStyle.querySelector('.absolute.inset-0')
    expect(overlay).toHaveClass('opacity-0')
    
    // Hover should show overlay
    fireEvent.mouseEnter(royalStyle)
    expect(overlay).toHaveClass('opacity-100')
    
    // Mouse leave should hide overlay
    fireEvent.mouseLeave(royalStyle)
    expect(overlay).toHaveClass('opacity-0')
  })

  it('does not show hover effects when disabled', () => {
    render(<StylePicker disabled={true} onStyleSelect={mockOnStyleSelect} />)
    
    const royalStyle = screen.getByText('Royal Portrait').closest('div')!
    
    fireEvent.mouseEnter(royalStyle)
    
    // Overlay should remain hidden when disabled
    const overlay = royalStyle.querySelector('.absolute.inset-0')
    expect(overlay).toHaveClass('opacity-0')
  })

  it('handles all style types correctly', () => {
    const styleTypes: StyleType[] = ['ROYAL', 'KNIGHT', 'SUPERHERO']
    
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
    
    const royalStyle = screen.getByText('Royal Portrait').closest('div')!
    
    fireEvent.mouseEnter(royalStyle)
    
    // Should show the example text
    const royalStyleData = STYLES.find(s => s.id === 'ROYAL')!
    expect(screen.getByText(royalStyleData.example)).toBeInTheDocument()
  })

  it('applies correct CSS classes for responsive design', () => {
    render(<StylePicker onStyleSelect={mockOnStyleSelect} />)
    
    const grid = screen.getByText('Choose Your Style').parentElement?.querySelector('.grid')
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-3', 'gap-6')
  })
}) 