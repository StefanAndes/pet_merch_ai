import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CheckoutFlow } from './CheckoutFlow'

const mockItems = [
  {
    id: 'item1',
    productName: 'Custom Pet T-Shirt',
    productType: 'T-Shirt',
    price: 25.99,
    mockupUrl: '/mockup1.jpg',
    designUrl: '/design1.jpg',
    quantity: 1,
    selectedSize: 'M',
    selectedColor: 'White'
  },
  {
    id: 'item2', 
    productName: 'Custom Pet Mug',
    productType: 'Mug',
    price: 15.99,
    mockupUrl: '/mockup2.jpg',
    designUrl: '/design2.jpg',
    quantity: 2,
    selectedSize: undefined,
    selectedColor: 'White'
  }
]

describe('CheckoutFlow', () => {
  const mockOnBack = vi.fn()
  const mockOnOrderComplete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders review step initially', () => {
    render(
      <CheckoutFlow
        items={mockItems}
        onBack={mockOnBack}
        onOrderComplete={mockOnOrderComplete}
      />
    )

    expect(screen.getByText('Review Your Order')).toBeInTheDocument()
    expect(screen.getByText('Custom Pet T-Shirt')).toBeInTheDocument()
    expect(screen.getByText('Custom Pet Mug')).toBeInTheDocument()
    expect(screen.getByText('$25.99')).toBeInTheDocument()
    expect(screen.getByText('$31.98')).toBeInTheDocument() // 2 × $15.99
  })

  it('calculates order totals correctly', () => {
    render(
      <CheckoutFlow
        items={mockItems}
        onBack={mockOnBack}
        onOrderComplete={mockOnOrderComplete}
      />
    )

    // Subtotal: $25.99 + (2 × $15.99) = $57.97
    expect(screen.getByText('$57.97')).toBeInTheDocument()
    
    // Free shipping on orders over $50
    expect(screen.getByText('FREE')).toBeInTheDocument()
    
    // Tax: 8% of $57.97 = $4.64
    expect(screen.getByText('$4.64')).toBeInTheDocument()
    
    // Total: $57.97 + $0 + $4.64 = $62.61
    expect(screen.getByText('$62.61')).toBeInTheDocument()
  })

  it('shows paid shipping for orders under $50', () => {
    const smallOrder = [mockItems[0]] // Just $25.99
    
    render(
      <CheckoutFlow
        items={smallOrder}
        onBack={mockOnBack}
        onOrderComplete={mockOnOrderComplete}
      />
    )

    expect(screen.getByText('$7.99')).toBeInTheDocument() // Shipping cost
    expect(screen.queryByText('FREE')).not.toBeInTheDocument()
  })

  it('navigates from review to shipping step', () => {
    render(
      <CheckoutFlow
        items={mockItems}
        onBack={mockOnBack}
        onOrderComplete={mockOnOrderComplete}
      />
    )

    fireEvent.click(screen.getByText('Continue to Shipping'))
    expect(screen.getByText('Shipping Information')).toBeInTheDocument()
  })

  it('validates shipping information before proceeding to payment', () => {
    render(
      <CheckoutFlow
        items={mockItems}
        onBack={mockOnBack}
        onOrderComplete={mockOnOrderComplete}
      />
    )

    // Navigate to shipping
    fireEvent.click(screen.getByText('Continue to Shipping'))

    // Try to submit without filling required fields
    fireEvent.click(screen.getByText('Continue to Payment'))
    
    // Should stay on shipping step
    expect(screen.getByText('Shipping Information')).toBeInTheDocument()
  })

  it('allows navigation to payment step after filling shipping info', () => {
    render(
      <CheckoutFlow
        items={mockItems}
        onBack={mockOnBack}
        onOrderComplete={mockOnOrderComplete}
      />
    )

    // Navigate to shipping
    fireEvent.click(screen.getByText('Continue to Shipping'))

    // Fill required fields
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText('Address'), { target: { value: '123 Main St' } })
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Anytown' } })
    fireEvent.change(screen.getByLabelText('State'), { target: { value: 'CA' } })
    fireEvent.change(screen.getByLabelText('ZIP Code'), { target: { value: '12345' } })

    fireEvent.click(screen.getByText('Continue to Payment'))
    expect(screen.getByText('Payment Method')).toBeInTheDocument()
  })

  it('prevents payment without agreeing to terms', () => {
    render(
      <CheckoutFlow
        items={mockItems}
        onBack={mockOnBack}
        onOrderComplete={mockOnOrderComplete}
      />
    )

    // Navigate to payment step
    fireEvent.click(screen.getByText('Continue to Shipping'))
    // Fill shipping info and continue...
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText('Address'), { target: { value: '123 Main St' } })
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Anytown' } })
    fireEvent.change(screen.getByLabelText('State'), { target: { value: 'CA' } })
    fireEvent.change(screen.getByLabelText('ZIP Code'), { target: { value: '12345' } })
    fireEvent.click(screen.getByText('Continue to Payment'))

    // Try to complete order without agreeing to terms
    const completeButton = screen.getByText(/Complete Order/)
    fireEvent.click(completeButton)

    // Should show alert (this would need to be mocked in a real test)
    expect(mockOnOrderComplete).not.toHaveBeenCalled()
  })

  it('allows payment method selection', () => {
    render(
      <CheckoutFlow
        items={mockItems}
        onBack={mockOnBack}
        onOrderComplete={mockOnOrderComplete}
      />
    )

    // Navigate to payment
    fireEvent.click(screen.getByText('Continue to Shipping'))
    // Fill shipping and continue...
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText('Address'), { target: { value: '123 Main St' } })
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Anytown' } })
    fireEvent.change(screen.getByLabelText('State'), { target: { value: 'CA' } })
    fireEvent.change(screen.getByLabelText('ZIP Code'), { target: { value: '12345' } })
    fireEvent.click(screen.getByText('Continue to Payment'))

    // Check payment method options
    expect(screen.getByText('Credit/Debit Card')).toBeInTheDocument()
    expect(screen.getByText('PayPal')).toBeInTheDocument()

    // Test PayPal selection
    fireEvent.click(screen.getByText('PayPal'))
    // Card form should not be visible when PayPal is selected
    expect(screen.queryByLabelText('Card Number')).not.toBeInTheDocument()
  })

  it('shows card form when credit card is selected', () => {
    render(
      <CheckoutFlow
        items={mockItems}
        onBack={mockOnBack}
        onOrderComplete={mockOnOrderComplete}
      />
    )

    // Navigate to payment
    fireEvent.click(screen.getByText('Continue to Shipping'))
    // Fill shipping and continue...
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText('Address'), { target: { value: '123 Main St' } })
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Anytown' } })
    fireEvent.change(screen.getByLabelText('State'), { target: { value: 'CA' } })
    fireEvent.change(screen.getByLabelText('ZIP Code'), { target: { value: '12345' } })
    fireEvent.click(screen.getByText('Continue to Payment'))

    // Credit card should be selected by default
    expect(screen.getByLabelText('Card Number')).toBeInTheDocument()
    expect(screen.getByLabelText('Expiry Date')).toBeInTheDocument()
    expect(screen.getByLabelText('CVV')).toBeInTheDocument()
  })

  it('completes order flow when terms are agreed', async () => {
    // Mock the alert function
    window.alert = vi.fn()
    
    render(
      <CheckoutFlow
        items={mockItems}
        onBack={mockOnBack}
        onOrderComplete={mockOnOrderComplete}
      />
    )

    // Navigate through full flow
    fireEvent.click(screen.getByText('Continue to Shipping'))
    
    // Fill shipping info
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText('Address'), { target: { value: '123 Main St' } })
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Anytown' } })
    fireEvent.change(screen.getByLabelText('State'), { target: { value: 'CA' } })
    fireEvent.change(screen.getByLabelText('ZIP Code'), { target: { value: '12345' } })
    
    fireEvent.click(screen.getByText('Continue to Payment'))

    // Agree to terms
    fireEvent.click(screen.getByLabelText(/I agree to the/))

    // Complete order
    fireEvent.click(screen.getByText(/Complete Order/))

    // Should show processing
    expect(screen.getByText('Processing Your Order')).toBeInTheDocument()

    // Wait for completion
    await waitFor(() => {
      expect(mockOnOrderComplete).toHaveBeenCalledWith(expect.stringMatching(/^order_/))
    }, { timeout: 4000 })
  })

  it('calls onBack when back button is clicked', () => {
    render(
      <CheckoutFlow
        items={mockItems}
        onBack={mockOnBack}
        onOrderComplete={mockOnOrderComplete}
      />
    )

    fireEvent.click(screen.getByText('Back to Results'))
    expect(mockOnBack).toHaveBeenCalled()
  })

  it('shows free shipping notification for qualifying orders', () => {
    render(
      <CheckoutFlow
        items={mockItems}
        onBack={mockOnBack}
        onOrderComplete={mockOnOrderComplete}
      />
    )

    expect(screen.getByText('Free shipping on orders over $50!')).toBeInTheDocument()
  })

  it('displays step indicator correctly', () => {
    render(
      <CheckoutFlow
        items={mockItems}
        onBack={mockOnBack}
        onOrderComplete={mockOnOrderComplete}
      />
    )

    // Check step indicator shows current step
    expect(screen.getByText('Review')).toBeInTheDocument()
    expect(screen.getByText('Shipping')).toBeInTheDocument()
    expect(screen.getByText('Payment')).toBeInTheDocument()
  })
}) 