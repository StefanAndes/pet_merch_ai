import { render, screen, fireEvent } from '@testing-library/react'
import { ProductTypeSelector, PRODUCT_TYPES } from './ProductTypeSelector'
import { vi } from 'vitest'

describe('ProductTypeSelector', () => {
  const mockOnProductToggle = vi.fn()
  const mockOnContinue = vi.fn()

  const defaultProps = {
    selectedProducts: [],
    onProductToggle: mockOnProductToggle,
    onContinue: mockOnContinue,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders header and instructions', () => {
    render(<ProductTypeSelector {...defaultProps} />)
    
    expect(screen.getByText('Choose Your Products')).toBeInTheDocument()
    expect(screen.getByText('Select the products you\'d like to create with your design')).toBeInTheDocument()
  })

  it('renders quick select options', () => {
    render(<ProductTypeSelector {...defaultProps} />)
    
    expect(screen.getByText('Select Popular Items')).toBeInTheDocument()
    expect(screen.getByText('Budget-Friendly ($20 or less)')).toBeInTheDocument()
    expect(screen.getByText('Premium Items')).toBeInTheDocument()
  })

  it('renders category filters with correct counts', () => {
    render(<ProductTypeSelector {...defaultProps} />)
    
    expect(screen.getByText('All Products (6)')).toBeInTheDocument()
    expect(screen.getByText('Apparel (2)')).toBeInTheDocument()
    expect(screen.getByText('Drinkware (1)')).toBeInTheDocument()
    expect(screen.getByText('Accessories (2)')).toBeInTheDocument()
    expect(screen.getByText('Wall Art (1)')).toBeInTheDocument()
  })

  it('renders all product types', () => {
    render(<ProductTypeSelector {...defaultProps} />)
    
    expect(screen.getByText('Classic T-Shirt')).toBeInTheDocument()
    expect(screen.getByText('Premium Hoodie')).toBeInTheDocument()
    expect(screen.getByText('Ceramic Mug')).toBeInTheDocument()
    expect(screen.getByText('Canvas Tote Bag')).toBeInTheDocument()
    expect(screen.getByText('Phone Case')).toBeInTheDocument()
    expect(screen.getByText('Art Poster')).toBeInTheDocument()
  })

  it('shows popular badges for popular items', () => {
    render(<ProductTypeSelector {...defaultProps} />)
    
    const popularBadges = screen.getAllByText('Popular')
    expect(popularBadges).toHaveLength(2) // T-shirt and hoodie
  })

  it('displays product prices when showPricing is true', () => {
    render(<ProductTypeSelector {...defaultProps} showPricing={true} />)
    
    expect(screen.getByText('$25.99')).toBeInTheDocument()
    expect(screen.getByText('$45.99')).toBeInTheDocument()
    expect(screen.getByText('$15.99')).toBeInTheDocument()
  })

  it('hides product prices when showPricing is false', () => {
    render(<ProductTypeSelector {...defaultProps} showPricing={false} />)
    
    expect(screen.queryByText('$25.99')).not.toBeInTheDocument()
    expect(screen.queryByText('$45.99')).not.toBeInTheDocument()
  })

  it('calls onProductToggle when product is clicked', () => {
    render(<ProductTypeSelector {...defaultProps} />)
    
    const tshirtCard = screen.getByText('Classic T-Shirt').closest('div')!
    fireEvent.click(tshirtCard)
    
    expect(mockOnProductToggle).toHaveBeenCalledWith('classic-tee')
  })

  it('shows selection indicator for selected products', () => {
    render(<ProductTypeSelector {...defaultProps} selectedProducts={['classic-tee']} />)
    
    const tshirtCard = screen.getByText('Classic T-Shirt').closest('div')!
    expect(tshirtCard).toHaveClass('ring-2', 'ring-blue-500', 'ring-offset-2')
  })

  it('filters products by category', () => {
    render(<ProductTypeSelector {...defaultProps} />)
    
    // Click on Apparel filter
    const apparelFilter = screen.getByText('Apparel (2)')
    fireEvent.click(apparelFilter)
    
    // Should show only apparel items
    expect(screen.getByText('Classic T-Shirt')).toBeInTheDocument()
    expect(screen.getByText('Premium Hoodie')).toBeInTheDocument()
    expect(screen.queryByText('Ceramic Mug')).not.toBeInTheDocument()
  })

  it('shows product details when info button is clicked', () => {
    render(<ProductTypeSelector {...defaultProps} />)
    
    // Find and click info button for t-shirt
    const tshirtCard = screen.getByText('Classic T-Shirt').closest('div')!
    const infoButton = tshirtCard.querySelector('button')!
    fireEvent.click(infoButton)
    
    expect(screen.getByText('Available Sizes:')).toBeInTheDocument()
    expect(screen.getByText('Available Colors:')).toBeInTheDocument()
    expect(screen.getByText('S')).toBeInTheDocument()
    expect(screen.getByText('White')).toBeInTheDocument()
  })

  it('handles quick select for popular items', () => {
    render(<ProductTypeSelector {...defaultProps} />)
    
    const popularButton = screen.getByText('Select Popular Items')
    fireEvent.click(popularButton)
    
    // Should call onProductToggle for each popular item
    expect(mockOnProductToggle).toHaveBeenCalledWith('classic-tee')
    expect(mockOnProductToggle).toHaveBeenCalledWith('premium-hoodie')
  })

  it('handles quick select for budget-friendly items', () => {
    render(<ProductTypeSelector {...defaultProps} />)
    
    const budgetButton = screen.getByText('Budget-Friendly ($20 or less)')
    fireEvent.click(budgetButton)
    
    // Should call onProductToggle for items under $20
    expect(mockOnProductToggle).toHaveBeenCalledWith('ceramic-mug')
    expect(mockOnProductToggle).toHaveBeenCalledWith('tote-bag')
    expect(mockOnProductToggle).toHaveBeenCalledWith('poster')
  })

  it('handles quick select for premium items', () => {
    render(<ProductTypeSelector {...defaultProps} />)
    
    const premiumButton = screen.getByText('Premium Items')
    fireEvent.click(premiumButton)
    
    // Should call onProductToggle for items $30+
    expect(mockOnProductToggle).toHaveBeenCalledWith('premium-hoodie')
  })

  it('calculates total price correctly', () => {
    render(<ProductTypeSelector {...defaultProps} selectedProducts={['classic-tee', 'ceramic-mug']} />)
    
    expect(screen.getByText('2 products selected')).toBeInTheDocument()
    expect(screen.getByText('Starting at $41.98 total')).toBeInTheDocument()
  })

  it('disables continue button when no products selected', () => {
    render(<ProductTypeSelector {...defaultProps} selectedProducts={[]} />)
    
    const continueButton = screen.getByText('Continue to Checkout')
    expect(continueButton).toBeDisabled()
  })

  it('enables continue button when products are selected', () => {
    render(<ProductTypeSelector {...defaultProps} selectedProducts={['classic-tee']} />)
    
    const continueButton = screen.getByText('Continue to Checkout')
    expect(continueButton).not.toBeDisabled()
  })

  it('calls onContinue when continue button is clicked', () => {
    render(<ProductTypeSelector {...defaultProps} selectedProducts={['classic-tee']} />)
    
    const continueButton = screen.getByText('Continue to Checkout')
    fireEvent.click(continueButton)
    
    expect(mockOnContinue).toHaveBeenCalled()
  })

  it('displays correct product count in summary', () => {
    render(<ProductTypeSelector {...defaultProps} selectedProducts={['classic-tee', 'ceramic-mug', 'poster']} />)
    
    expect(screen.getByText('3 products selected')).toBeInTheDocument()
  })

  it('handles singular vs plural product text', () => {
    render(<ProductTypeSelector {...defaultProps} selectedProducts={['classic-tee']} />)
    
    expect(screen.getByText('1 product selected')).toBeInTheDocument()
  })

  it('shows product descriptions', () => {
    render(<ProductTypeSelector {...defaultProps} />)
    
    expect(screen.getByText('Comfortable cotton t-shirt, perfect for everyday wear')).toBeInTheDocument()
    expect(screen.getByText('Cozy fleece hoodie with kangaroo pocket')).toBeInTheDocument()
  })

  it('shows size and color information', () => {
    render(<ProductTypeSelector {...defaultProps} />)
    
    expect(screen.getByText('5 sizes • 5 colors')).toBeInTheDocument()
    expect(screen.getByText('4 sizes • 4 colors')).toBeInTheDocument()
    expect(screen.getByText('2 sizes • 2 colors')).toBeInTheDocument()
  })
}) 