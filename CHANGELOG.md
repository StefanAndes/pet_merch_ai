# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - Sprint 3 In Progress

### Added
- N/A

### Changed
- N/A  

### Fixed
- N/A

## [0.2.0] - 2025-01-07 - Sprint 2 Complete! 🎉 E-Commerce MVP Ready

### Added
- **🎉 MAJOR MILESTONE: Complete E-Commerce Workflow**
- **FE-5**: Complete checkout flow component (3 points)
  - 3-step checkout process: Review → Shipping → Payment
  - Comprehensive order summary with tax and shipping calculation  
  - Complete shipping information collection form
  - Order completion and confirmation workflow
  - Terms and conditions handling
- **BE-4**: Stripe payment integration (5 points)
  - Professional payment processing with card validation
  - Card number formatting and brand detection (Visa, Mastercard, etc.)
  - CVV and expiry date validation with real-time feedback
  - Test card support for development (4242424242424242, etc.)
  - Error handling and security features
  - Payment success/failure workflow
- **FE-3**: ResultsGallery component with shopping cart (3 points)
  - AI design display with grid/detailed view toggle
  - Interactive product mockup selection with add-to-cart
  - Download and share capabilities
  - Preview modal with zoom functionality
  - Real-time price calculation and cart management
  - Regeneration workflow integration
- **FE-4**: ProductTypeSelector component (2 points)
  - 6 product types with realistic pricing (T-shirts $25.99, Hoodies $45.99, etc.)
  - Smart filtering by category (Apparel, Accessories, Home)
  - Quick-select options and expandable product details
  - Integration with mockup generation system
- **FE-2**: StylePicker component with interactive style selection (3 points)
  - Grid layout with 3 predefined styles (Metal, Pop Art, Watercolor)
  - Hover effects with preview overlays and selection indicators
  - Responsive design with mobile-first approach
  - Comprehensive test coverage with 10 test cases
- **BE-3**: Enhanced job status polling endpoint (2 points)
  - Realistic 5-stage processing simulation
  - Progress tracking (0-100%) with detailed status updates
  - Better error handling and TypeScript type definitions
  - Enhanced GET endpoint with progress data
- Complete 5-step user journey: Upload → Style → Generate → Results → Checkout
- Shopping cart functionality with multi-product selection
- Order management with ID generation and confirmation
- Enhanced testing suite with 25+ test cases covering full workflow
- Mobile-responsive design with professional animations

### Changed
- **Upgraded from 4-step to 5-step workflow** including complete checkout
- Enhanced main application state management for e-commerce flow
- Updated progress tracking to include payment processing step
- Complete rewrite of main page with comprehensive step flow
- Enhanced API routes with realistic processing simulation
- Improved test infrastructure (Vitest configuration)
- Better responsive design with gradient backgrounds
- Updated TypeScript types for better type safety

### Fixed
- Payment processing validation and error handling
- Checkout flow navigation and state persistence  
- Order total calculations with shipping and tax
- Test setup configuration for Windows PowerShell environment
- Image validation edge cases in upload component
- Memory leaks in image preview handling
- Navigation flow between upload and style selection

## [0.1.0] - 2025-01-07 - Sprint 1 Complete

### Added
- **FE-1**: UploadDropzone component with image validation
  - Drag and drop support for 1-5 images
  - Client-side validation for file size (4MB) and dimensions (512x512)
  - Preview thumbnails with status indicators
  - Comprehensive unit tests
- **BE-1**: POST /api/generate endpoint
  - Handles file uploads and creates design records
  - Returns design ID with PENDING status
  - Mock implementation simulates processing workflow
  - Full API test coverage
- **BE-2**: Supabase database schema
  - Complete schema for users, designs, and orders tables
  - Row Level Security (RLS) policies
  - Automatic user creation on signup
  - Rollback migration included

### Changed
- N/A

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- N/A

## [0.0.0] - 2025-01-07

### Added
- Project initialization 