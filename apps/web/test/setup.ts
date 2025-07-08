import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock next/image for testing
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return 'NextImage'
  },
}))

// Mock next/navigation for testing
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}))

// Mock window.URL.createObjectURL for file handling
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'mocked-url'),
    revokeObjectURL: vi.fn(),
  },
})

// Mock window.Image for image validation
Object.defineProperty(window, 'Image', {
  value: class MockImage {
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    src: string = ''
    width: number = 1024
    height: number = 1024
    
    constructor() {
      setTimeout(() => {
        if (this.onload) {
          this.onload()
        }
      }, 0)
    }
  },
})

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
} 