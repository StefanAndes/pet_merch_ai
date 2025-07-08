'use client'

import React, { useState } from 'react'
import { Button } from 'ui'
import { CreditCard, Shield, Loader2 } from 'lucide-react'

interface StripePaymentProps {
  amount: number // Amount in dollars
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
  disabled?: boolean
  agreeToTerms: boolean
}

interface CardInfo {
  number: string
  expiry: string
  cvv: string
  name: string
  zipCode: string
}

export function StripePayment({ amount, onSuccess, onError, disabled, agreeToTerms }: StripePaymentProps) {
  const [cardInfo, setCardInfo] = useState<CardInfo>({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
    zipCode: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<Partial<CardInfo>>({})

  const formatCardNumber = (value: string) => {
    // Remove all non-digit characters
    const cleanValue = value.replace(/\D/g, '')
    
    // Add spaces every 4 digits
    const formattedValue = cleanValue.replace(/(\d{4})(?=\d)/g, '$1 ')
    
    // Limit to 19 characters (16 digits + 3 spaces)
    return formattedValue.slice(0, 19)
  }

  const formatExpiry = (value: string) => {
    // Remove all non-digit characters
    const cleanValue = value.replace(/\D/g, '')
    
    // Add slash after 2 digits
    if (cleanValue.length >= 2) {
      return cleanValue.slice(0, 2) + '/' + cleanValue.slice(2, 4)
    }
    
    return cleanValue
  }

  const validateCard = (): boolean => {
    const newErrors: Partial<CardInfo> = {}
    
    // Validate card number (simplified - just check length)
    const cleanNumber = cardInfo.number.replace(/\s/g, '')
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      newErrors.number = 'Invalid card number'
    }
    
    // Validate expiry
    const [month, year] = cardInfo.expiry.split('/')
    const currentYear = new Date().getFullYear() % 100
    const currentMonth = new Date().getMonth() + 1
    
    if (!month || !year || parseInt(month) < 1 || parseInt(month) > 12) {
      newErrors.expiry = 'Invalid expiry date'
    } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      newErrors.expiry = 'Card has expired'
    }
    
    // Validate CVV
    if (cardInfo.cvv.length < 3 || cardInfo.cvv.length > 4) {
      newErrors.cvv = 'Invalid CVV'
    }
    
    // Validate name
    if (cardInfo.name.trim().length < 2) {
      newErrors.name = 'Please enter cardholder name'
    }
    
    // Validate ZIP
    if (cardInfo.zipCode.length < 5) {
      newErrors.zipCode = 'Invalid ZIP code'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!agreeToTerms) {
      onError('Please agree to the terms and conditions')
      return
    }
    
    if (!validateCard()) {
      onError('Please correct the card information')
      return
    }
    
    setIsProcessing(true)
    
    try {
      // Simulate Stripe payment processing
      // In a real implementation, you would:
      // 1. Create a payment intent on your backend
      // 2. Use Stripe.js to confirm the payment
      // 3. Handle the response
      
      await simulateStripePayment()
      
      // Generate a mock payment intent ID
      const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      onSuccess(paymentIntentId)
    } catch (error) {
      console.error('Payment failed:', error)
      onError('Payment failed. Please check your card details and try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const simulateStripePayment = async (): Promise<void> => {
    // Simulate network delay and processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate random failures for testing (5% failure rate)
    if (Math.random() < 0.05) {
      throw new Error('Card declined')
    }
    
    // Simulate specific card number failures for testing
    const cleanNumber = cardInfo.number.replace(/\s/g, '')
    if (cleanNumber === '4000000000000002') {
      throw new Error('Card declined')
    }
    if (cleanNumber === '4000000000000127') {
      throw new Error('Incorrect CVC')
    }
    if (cleanNumber === '4000000000000069') {
      throw new Error('Expired card')
    }
  }

  const updateCardField = (field: keyof CardInfo, value: string) => {
    let formattedValue = value
    
    if (field === 'number') {
      formattedValue = formatCardNumber(value)
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value)
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4)
    } else if (field === 'zipCode') {
      formattedValue = value.replace(/\D/g, '').slice(0, 5)
    }
    
    setCardInfo(prev => ({ ...prev, [field]: formattedValue }))
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const getCardBrand = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '')
    
    if (cleanNumber.startsWith('4')) return 'Visa'
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return 'Mastercard'
    if (cleanNumber.startsWith('3')) return 'American Express'
    if (cleanNumber.startsWith('6')) return 'Discover'
    
    return null
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-2 text-blue-800">
          <Shield className="h-4 w-4" />
          <span className="text-sm font-medium">Secure Payment</span>
        </div>
        <p className="text-blue-700 text-sm mt-1">
          Your payment information is encrypted and secure
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Cardholder Name
        </label>
        <input
          type="text"
          required
          value={cardInfo.name}
          onChange={(e) => updateCardField('name', e.target.value)}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="John Doe"
          disabled={isProcessing}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Card Number
        </label>
        <div className="relative">
          <input
            type="text"
            required
            value={cardInfo.number}
            onChange={(e) => updateCardField('number', e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.number ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="4242 4242 4242 4242"
            disabled={isProcessing}
          />
          {getCardBrand(cardInfo.number) && (
            <div className="absolute right-3 top-3 text-sm text-gray-500">
              {getCardBrand(cardInfo.number)}
            </div>
          )}
        </div>
        {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number}</p>}
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-2">
            Expiry Date
          </label>
          <input
            type="text"
            required
            value={cardInfo.expiry}
            onChange={(e) => updateCardField('expiry', e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.expiry ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="MM/YY"
            disabled={isProcessing}
          />
          {errors.expiry && <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            CVV
          </label>
          <input
            type="text"
            required
            value={cardInfo.cvv}
            onChange={(e) => updateCardField('cvv', e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.cvv ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="123"
            disabled={isProcessing}
          />
          {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          ZIP Code
        </label>
        <input
          type="text"
          required
          value={cardInfo.zipCode}
          onChange={(e) => updateCardField('zipCode', e.target.value)}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.zipCode ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="12345"
          disabled={isProcessing}
        />
        {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 mt-6">
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Test Card Numbers:</strong></p>
          <p>• 4242 4242 4242 4242 (Success)</p>
          <p>• 4000 0000 0000 0002 (Declined)</p>
          <p>• 4000 0000 0000 0127 (Incorrect CVC)</p>
          <p>• Any future expiry date and 3-digit CVV</p>
        </div>
      </div>
      
      <Button
        type="submit"
        disabled={disabled || isProcessing || !agreeToTerms}
        className="w-full mt-6"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Pay ${amount.toFixed(2)}
          </>
        )}
      </Button>
    </form>
  )
} 