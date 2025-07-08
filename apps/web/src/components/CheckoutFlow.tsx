'use client'

import React, { useState } from 'react'
import { Button } from 'ui'
import { ArrowLeft, CreditCard, Truck, Shield, Check, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { StripePayment } from './StripePayment'

interface CheckoutItem {
  id: string
  productName: string
  productType: string
  price: number
  mockupUrl: string
  designUrl: string
  quantity: number
  selectedSize?: string
  selectedColor?: string
}

interface ShippingInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface CheckoutFlowProps {
  items: CheckoutItem[]
  onBack: () => void
  onOrderComplete: (orderId: string) => void
}

type CheckoutStep = 'review' | 'shipping' | 'payment' | 'processing' | 'complete'

export function CheckoutFlow({ items, onBack, onOrderComplete }: CheckoutFlowProps) {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('review')
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  })
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = subtotal > 50 ? 0 : 7.99
  const tax = subtotal * 0.08 // 8% tax rate
  const total = subtotal + shipping + tax

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateShippingInfo()) {
      setCurrentStep('payment')
    }
  }

  const validateShippingInfo = () => {
    const required = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zipCode']
    return required.every(field => shippingInfo[field as keyof ShippingInfo].trim() !== '')
  }

  const handlePaymentSuccess = (paymentIntentId: string) => {
    console.log('Payment successful:', paymentIntentId)
    setCurrentStep('processing')
    
    // Simulate order processing after successful payment
    setTimeout(() => {
      const orderId = `order_${Date.now()}`
      setCurrentStep('complete')
      onOrderComplete(orderId)
    }, 2000)
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error)
    setPaymentError(error)
  }

  const updateShippingField = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }))
  }

  const stepIndicator = (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {/* Review */}
        <div className={`flex items-center space-x-2 ${currentStep === 'review' ? 'text-blue-600' : currentStep === 'shipping' || currentStep === 'payment' || currentStep === 'processing' || currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'review' ? 'bg-blue-100 border-2 border-blue-600' : currentStep === 'shipping' || currentStep === 'payment' || currentStep === 'processing' || currentStep === 'complete' ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
            {currentStep === 'shipping' || currentStep === 'payment' || currentStep === 'processing' || currentStep === 'complete' ? <Check className="h-4 w-4" /> : '1'}
          </div>
          <span className="font-medium">Review</span>
        </div>
        
        <div className="w-8 h-px bg-gray-300"></div>
        
        {/* Shipping */}
        <div className={`flex items-center space-x-2 ${currentStep === 'shipping' ? 'text-blue-600' : currentStep === 'payment' || currentStep === 'processing' || currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'shipping' ? 'bg-blue-100 border-2 border-blue-600' : currentStep === 'payment' || currentStep === 'processing' || currentStep === 'complete' ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
            {currentStep === 'payment' || currentStep === 'processing' || currentStep === 'complete' ? <Check className="h-4 w-4" /> : '2'}
          </div>
          <span className="font-medium">Shipping</span>
        </div>
        
        <div className="w-8 h-px bg-gray-300"></div>
        
        {/* Payment */}
        <div className={`flex items-center space-x-2 ${currentStep === 'payment' || currentStep === 'processing' ? 'text-blue-600' : currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'payment' || currentStep === 'processing' ? 'bg-blue-100 border-2 border-blue-600' : currentStep === 'complete' ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
            {currentStep === 'complete' ? <Check className="h-4 w-4" /> : '3'}
          </div>
          <span className="font-medium">Payment</span>
        </div>
      </div>
    </div>
  )

  if (currentStep === 'processing') {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        {stepIndicator}
        <div className="text-center py-16">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold mb-4">Processing Your Order</h2>
          <p className="text-gray-600 mb-6">
            Please don't close this window while we process your payment...
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Shield className="h-4 w-4" />
            <span>Secure payment processing</span>
          </div>
        </div>
      </div>
    )
  }

  if (currentStep === 'complete') {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold mb-4">Order Complete!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your order. You'll receive a confirmation email shortly.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              Your custom pet merchandise will be printed and shipped within 3-5 business days.
            </p>
          </div>
          <Button onClick={() => window.location.href = '/'}>
            Create Another Design
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {stepIndicator}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStep === 'review' && (
            <div>
              <div className="flex items-center mb-6">
                <Button variant="ghost" onClick={onBack} className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Results
                </Button>
                <h2 className="text-2xl font-semibold">Review Your Order</h2>
              </div>

              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id} className="bg-white border rounded-lg p-4 flex items-center space-x-4">
                    <div className="w-20 h-20 relative">
                      <Image
                        src={item.mockupUrl}
                        alt={item.productName}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.productName}</h3>
                      <p className="text-sm text-gray-600 capitalize">{item.productType}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Button onClick={() => setCurrentStep('shipping')} className="w-full">
                  Continue to Shipping
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'shipping' && (
            <div>
              <div className="flex items-center mb-6">
                <Button variant="ghost" onClick={() => setCurrentStep('review')} className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <h2 className="text-2xl font-semibold">Shipping Information</h2>
              </div>

              <form onSubmit={handleShippingSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.firstName}
                      onChange={(e) => updateShippingField('firstName', e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.lastName}
                      onChange={(e) => updateShippingField('lastName', e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={shippingInfo.email}
                    onChange={(e) => updateShippingField('email', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <input
                    type="text"
                    required
                    value={shippingInfo.address}
                    onChange={(e) => updateShippingField('address', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.city}
                      onChange={(e) => updateShippingField('city', e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">State</label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.state}
                      onChange={(e) => updateShippingField('state', e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ZIP Code</label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.zipCode}
                      onChange={(e) => updateShippingField('zipCode', e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Continue to Payment
                </Button>
              </form>
            </div>
          )}

          {currentStep === 'payment' && (
            <div>
              <div className="flex items-center mb-6">
                <Button variant="ghost" onClick={() => setCurrentStep('shipping')} className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <h2 className="text-2xl font-semibold">Payment Method</h2>
              </div>

              <div className="space-y-6">
                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <div className="flex items-center space-x-3">
                      <input type="radio" checked={paymentMethod === 'card'} readOnly />
                      <CreditCard className="h-5 w-5" />
                      <span className="font-medium">Credit/Debit Card</span>
                    </div>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer ${paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    onClick={() => setPaymentMethod('paypal')}
                  >
                    <div className="flex items-center space-x-3">
                      <input type="radio" checked={paymentMethod === 'paypal'} readOnly />
                      <div className="w-5 h-5 bg-blue-600 rounded"></div>
                      <span className="font-medium">PayPal</span>
                    </div>
                  </div>
                </div>

                {/* Payment Error Display */}
                {paymentError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">{paymentError}</p>
                  </div>
                )}

                {/* Card Form (when card is selected) */}
                {paymentMethod === 'card' && (
                  <div className="border rounded-lg p-4">
                    <StripePayment
                      amount={total}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      disabled={isProcessing}
                      agreeToTerms={agreeToTerms}
                    />
                  </div>
                )}

                {/* PayPal Option (when PayPal is selected) */}
                {paymentMethod === 'paypal' && (
                  <div className="border rounded-lg p-4">
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="w-8 h-8 bg-blue-600 rounded"></div>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">PayPal Integration</h3>
                      <p className="text-gray-600 mb-4">
                        PayPal integration will be available in the next update
                      </p>
                      <Button disabled className="w-full">
                        Pay with PayPal - Coming Soon
                      </Button>
                    </div>
                  </div>
                )}

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.productName} (×{item.quantity})</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {shipping === 0 && (
              <div className="mt-4 p-3 bg-green-100 text-green-800 text-sm rounded-lg flex items-center">
                <Truck className="h-4 w-4 mr-2" />
                Free shipping on orders over $50!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 