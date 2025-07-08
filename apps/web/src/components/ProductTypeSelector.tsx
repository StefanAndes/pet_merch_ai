'use client'

import React, { useState } from 'react'
import { Button } from 'ui'
import { Check, Info } from 'lucide-react'
import Image from 'next/image'

export interface ProductType {
  id: string
  name: string
  category: string
  basePrice: number
  description: string
  sizes: string[]
  colors: string[]
  mockupImage: string
  popular?: boolean
}

const PRODUCT_TYPES: ProductType[] = [
  {
    id: 'classic-tee',
    name: 'Classic T-Shirt',
    category: 'apparel',
    basePrice: 25.99,
    description: 'Comfortable cotton t-shirt, perfect for everyday wear',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Black', 'Navy', 'Gray', 'Red'],
    mockupImage: 'https://via.placeholder.com/300x300?text=T-Shirt',
    popular: true
  },
  {
    id: 'premium-hoodie',
    name: 'Premium Hoodie',
    category: 'apparel',
    basePrice: 45.99,
    description: 'Cozy fleece hoodie with kangaroo pocket',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Navy', 'Gray', 'Maroon'],
    mockupImage: 'https://via.placeholder.com/300x300?text=Hoodie',
    popular: true
  },
  {
    id: 'ceramic-mug',
    name: 'Ceramic Mug',
    category: 'drinkware',
    basePrice: 15.99,
    description: 'High-quality ceramic mug, dishwasher safe',
    sizes: ['11oz', '15oz'],
    colors: ['White', 'Black'],
    mockupImage: 'https://via.placeholder.com/300x300?text=Mug'
  },
  {
    id: 'tote-bag',
    name: 'Canvas Tote Bag',
    category: 'accessories',
    basePrice: 18.99,
    description: 'Durable canvas tote bag for everyday use',
    sizes: ['Standard'],
    colors: ['Natural', 'Black', 'Navy'],
    mockupImage: 'https://via.placeholder.com/300x300?text=Tote+Bag'
  },
  {
    id: 'phone-case',
    name: 'Phone Case',
    category: 'accessories',
    basePrice: 22.99,
    description: 'Protective phone case with custom design',
    sizes: ['iPhone 14', 'iPhone 15', 'Samsung Galaxy S23', 'Samsung Galaxy S24'],
    colors: ['Clear', 'Black', 'White'],
    mockupImage: 'https://via.placeholder.com/300x300?text=Phone+Case'
  },
  {
    id: 'poster',
    name: 'Art Poster',
    category: 'wall-art',
    basePrice: 12.99,
    description: 'High-quality print on premium paper',
    sizes: ['8x10', '11x14', '16x20', '18x24'],
    colors: ['Full Color'],
    mockupImage: 'https://via.placeholder.com/300x300?text=Poster'
  }
]

interface ProductTypesSelectorProps {
  selectedProducts: string[]
  onProductToggle: (productId: string) => void
  onContinue: () => void
  showPricing?: boolean
}

export function ProductTypeSelector({
  selectedProducts,
  onProductToggle,
  onContinue,
  showPricing = true
}: ProductTypesSelectorProps) {
  const [filter, setFilter] = useState<string>('all')
  const [showDetails, setShowDetails] = useState<string | null>(null)

  const categories = [
    { id: 'all', name: 'All Products', count: PRODUCT_TYPES.length },
    { id: 'apparel', name: 'Apparel', count: PRODUCT_TYPES.filter(p => p.category === 'apparel').length },
    { id: 'drinkware', name: 'Drinkware', count: PRODUCT_TYPES.filter(p => p.category === 'drinkware').length },
    { id: 'accessories', name: 'Accessories', count: PRODUCT_TYPES.filter(p => p.category === 'accessories').length },
    { id: 'wall-art', name: 'Wall Art', count: PRODUCT_TYPES.filter(p => p.category === 'wall-art').length }
  ]

  const filteredProducts = filter === 'all' 
    ? PRODUCT_TYPES 
    : PRODUCT_TYPES.filter(product => product.category === filter)

  const getTotalPrice = () => {
    return PRODUCT_TYPES
      .filter(product => selectedProducts.includes(product.id))
      .reduce((sum, product) => sum + product.basePrice, 0)
  }

  const handleQuickSelect = (type: 'popular' | 'affordable' | 'premium') => {
    let productsToSelect: string[] = []
    
    switch (type) {
      case 'popular':
        productsToSelect = PRODUCT_TYPES.filter(p => p.popular).map(p => p.id)
        break
      case 'affordable':
        productsToSelect = PRODUCT_TYPES.filter(p => p.basePrice < 20).map(p => p.id)
        break
      case 'premium':
        productsToSelect = PRODUCT_TYPES.filter(p => p.basePrice >= 30).map(p => p.id)
        break
    }
    
    // Toggle all selected products
    productsToSelect.forEach(productId => {
      onProductToggle(productId)
    })
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">Choose Your Products</h2>
        <p className="text-gray-600">
          Select the products you'd like to create with your design
        </p>
      </div>

      {/* Quick Select Options */}
      <div className="mb-6 flex flex-wrap gap-3 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickSelect('popular')}
        >
          Select Popular Items
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickSelect('affordable')}
        >
          Budget-Friendly ($20 or less)
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickSelect('premium')}
        >
          Premium Items
        </Button>
      </div>

      {/* Category Filter */}
      <div className="mb-6 flex flex-wrap gap-2 justify-center">
        {categories.map(category => (
          <Button
            key={category.id}
            variant={filter === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(category.id)}
          >
            {category.name} ({category.count})
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredProducts.map(product => {
          const isSelected = selectedProducts.includes(product.id)
          return (
            <div
              key={product.id}
              className={`
                relative bg-white rounded-lg shadow-md overflow-hidden cursor-pointer
                transition-all duration-200 hover:shadow-lg
                ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
              `}
              onClick={() => onProductToggle(product.id)}
            >
              {/* Popular Badge */}
              {product.popular && (
                <div className="absolute top-4 left-4 z-10 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  Popular
                </div>
              )}

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4 z-10 bg-blue-500 text-white rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}

              {/* Product Image */}
              <div className="aspect-square relative bg-gray-100">
                <Image
                  src={product.mockupImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  {showPricing && (
                    <span className="text-lg font-bold text-blue-600">
                      ${product.basePrice.toFixed(2)}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {product.sizes.length > 1 ? `${product.sizes.length} sizes` : product.sizes[0]}
                    {' • '}
                    {product.colors.length > 1 ? `${product.colors.length} colors` : product.colors[0]}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowDetails(showDetails === product.id ? null : product.id)
                    }}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>

                {/* Expanded Details */}
                {showDetails === product.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="mb-3">
                      <h4 className="font-medium text-sm mb-2">Available Sizes:</h4>
                      <div className="flex flex-wrap gap-1">
                        {product.sizes.map(size => (
                          <span
                            key={size}
                            className="px-2 py-1 bg-gray-100 text-xs rounded"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Available Colors:</h4>
                      <div className="flex flex-wrap gap-1">
                        {product.colors.map(color => (
                          <span
                            key={color}
                            className="px-2 py-1 bg-gray-100 text-xs rounded"
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary and Continue */}
      <div className="bg-gray-50 rounded-lg p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-lg font-semibold">
            {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
          </p>
          {showPricing && selectedProducts.length > 0 && (
            <p className="text-sm text-gray-600">
              Starting at ${getTotalPrice().toFixed(2)} total
            </p>
          )}
        </div>
        
        <Button
          onClick={onContinue}
          disabled={selectedProducts.length === 0}
          className="px-8 py-3 text-lg"
        >
          Continue to Checkout
        </Button>
      </div>
    </div>
  )
}

export { PRODUCT_TYPES } 