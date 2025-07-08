# Sprint Tasks for Pet Merch AI MVP

## Sprint 0 - Initial Setup (48h)
- [x] Create Vercel project and link repository
- [x] Scaffold Next.js monorepo with pnpm and Turbo
- [x] Add Tailwind CSS and shadcn/ui setup
- [x] Create PWA shell with manifest.json
- [ ] Configure environment variables in Vercel
- [ ] Ensure Lighthouse PWA audit ≥80

## Sprint 1 - Week 1

### FE-1: UploadDropzone Component
**Points**: 5  
**Description**: Create a dropzone component with client-side image validation
**Acceptance Criteria**:
- Accepts 1-5 images via drag-and-drop or file picker
- Validates: max 4MB per file, min 512×512 resolution
- Shows preview thumbnails
- Basic face detection using face-api.js
- Error handling for invalid files
**Files**: `apps/web/components/UploadDropzone.tsx`

### BE-1: POST /api/generate Endpoint
**Points**: 3  
**Description**: Create API endpoint to initiate design generation
**Acceptance Criteria**:
- Accepts uploaded images
- Creates design record with status=PENDING
- Returns design ID
- Proper error handling
**Files**: `apps/web/src/app/api/generate/route.ts`

### BE-2: Supabase Schema Migration
**Points**: 2  
**Description**: Create database schema for the application
**Acceptance Criteria**:
- Tables: users, designs, orders
- RLS policies configured
- Migration script created
**Files**: `infra/supabase/migrations/001_initial_schema.sql`

## Sprint 2 - Week 2

### WK-1: Gen Worker on RunPod
**Points**: 8  
**Description**: Create AI generation worker
**Acceptance Criteria**:
- Pulls messages from SQS queue
- Generates images using SDXL + LoRA
- Uploads results to S3
- Updates design status in Supabase
**Files**: `workers/gen_worker/`

### BE-3: Poll Job Status Endpoint
**Points**: 2  
**Description**: Create endpoint to check generation status
**Acceptance Criteria**:
- GET /api/generate/[jobId]
- Returns current status and results if ready
- Proper caching headers
**Files**: `apps/web/src/app/api/generate/[jobId]/route.ts`

### FE-2: Style Picker Grid
**Points**: 3  
**Description**: Create style selection component
**Acceptance Criteria**:
- Shows available styles: Metal Tee, Pop Art, Water-color
- Visual preview for each style
- Single selection
- Mobile responsive
**Files**: `apps/web/components/StylePicker.tsx`

## Sprint 3 - Week 3

### WK-2: Mockup Worker
**Points**: 5  
**Description**: Create mockup composition worker
**Acceptance Criteria**:
- Takes AI-generated art and product templates
- Creates realistic product mockups
- Generates thumbnails
- Uses ImageMagick for composition
**Files**: `workers/mockup_worker/`

### FE-3: Product Gallery
**Points**: 4  
**Description**: Display generated product mockups
**Acceptance Criteria**:
- Grid layout with loading states
- Fullscreen preview on tap
- Download option
- Share functionality
**Files**: `apps/web/components/ProductGallery.tsx`

### BE-4: Stripe Checkout Integration
**Points**: 5  
**Description**: Implement payment flow
**Acceptance Criteria**:
- Creates Stripe checkout session
- Handles success/cancel redirects
- Stores payment metadata
**Files**: `apps/web/src/app/api/checkout/route.ts`

## Sprint 4 - Week 4

### BE-5: Printful Order Creation
**Points**: 6  
**Description**: Integrate with Printful API
**Acceptance Criteria**:
- Webhook handler for successful payments
- Creates order in Printful
- Saves order ID and status
- Error handling and retries
**Files**: `apps/web/src/app/api/webhooks/stripe/route.ts`

### FE-4: Order Confirmation Page
**Points**: 3  
**Description**: Post-purchase confirmation screen
**Acceptance Criteria**:
- Shows order summary
- Estimated delivery date
- Order tracking link
- Email confirmation sent
**Files**: `apps/web/src/app/order/[orderId]/page.tsx`

### FE-5: PWA Enhancements
**Points**: 4  
**Description**: Optimize PWA functionality
**Acceptance Criteria**:
- Offline support for key pages
- Install prompt
- Push notifications setup
- App shortcuts
**Files**: `apps/web/public/service-worker.js`

## Sprint 5 - Week 5

### FE-6: User Dashboard
**Points**: 5  
**Description**: Create user account area
**Acceptance Criteria**:
- View past orders
- Reorder functionality
- Download past designs
- Account settings
**Files**: `apps/web/src/app/dashboard/page.tsx`

### BE-6: Email Notifications
**Points**: 3  
**Description**: Implement transactional emails
**Acceptance Criteria**:
- Order confirmation email
- Shipping updates
- Design ready notification
**Files**: `apps/web/src/lib/email.ts`

### QA-1: End-to-End Test Suite
**Points**: 5  
**Description**: Comprehensive E2E tests
**Acceptance Criteria**:
- Full user journey tests
- Payment flow testing
- Mobile responsive tests
- Cross-browser validation
**Files**: `apps/web/e2e/`

## Sprint 6 - Week 6

### PERF-1: Performance Optimization
**Points**: 4  
**Description**: Optimize app performance
**Acceptance Criteria**:
- Image optimization
- Code splitting
- Lazy loading
- CDN setup
**Files**: Various

### SEC-1: Security Audit
**Points**: 3  
**Description**: Security hardening
**Acceptance Criteria**:
- API rate limiting
- Input validation
- CORS configuration
- Security headers
**Files**: Various

### DOCS-1: Documentation
**Points**: 2  
**Description**: Complete documentation
**Acceptance Criteria**:
- API documentation
- Deployment guide
- User guide
- Contributing guidelines
**Files**: `docs/`

## Milestones

### Milestone 1: Core Upload & Generation (End of Week 2)
- User can upload photos
- AI generates designs
- Basic UI functional

### Milestone 2: Commerce Ready (End of Week 4)
- Full purchase flow working
- Printful integration complete
- Orders processing

### Milestone 3: MVP Launch (End of Week 6)
- All features complete
- Performance optimized
- Documentation complete
- Ready for public launch 