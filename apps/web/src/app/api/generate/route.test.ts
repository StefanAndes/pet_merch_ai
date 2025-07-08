import { describe, it, expect } from 'vitest'
import { POST, GET } from './route'
import { NextRequest } from 'next/server'

describe('/api/generate', () => {
  describe('POST', () => {
    it('returns 400 when no files are provided', async () => {
      const formData = new FormData()
      const request = new NextRequest('http://localhost:3000/api/generate', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('No files provided')
    })

    it('returns 400 when too many files are provided', async () => {
      const formData = new FormData()
      for (let i = 0; i < 6; i++) {
        const file = new File(['test'], `test${i}.jpg`, { type: 'image/jpeg' })
        formData.append('files', file)
      }

      const request = new NextRequest('http://localhost:3000/api/generate', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Maximum 5 files allowed')
    })

    it('returns 400 for invalid file types', async () => {
      const formData = new FormData()
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      formData.append('files', file)

      const request = new NextRequest('http://localhost:3000/api/generate', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid file type')
    })

    it('returns 400 for files that are too large', async () => {
      const formData = new FormData()
      const largeFile = new File(['x'.repeat(5 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
      Object.defineProperty(largeFile, 'size', { value: 5 * 1024 * 1024 })
      formData.append('files', largeFile)

      const request = new NextRequest('http://localhost:3000/api/generate', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('File too large')
    })

    it('successfully creates a design with valid files', async () => {
      const formData = new FormData()
      const file1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' })
      const file2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' })
      formData.append('files', file1)
      formData.append('files', file2)
      formData.append('style', 'METAL')

      const request = new NextRequest('http://localhost:3000/api/generate', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('designId')
      expect(data.status).toBe('PENDING')
      expect(data.message).toBe('Design generation started')
    })

    it('uses default style when none provided', async () => {
      const formData = new FormData()
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      formData.append('files', file)

      const request = new NextRequest('http://localhost:3000/api/generate', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('designId')
    })
  })

  describe('GET', () => {
    it('returns 400 when no design ID is provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Design ID required')
    })

    it('returns 404 for non-existent design', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate?id=non-existent')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Design not found')
    })

    it('returns design data for existing design', async () => {
      // First create a design
      const formData = new FormData()
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      formData.append('files', file)

      const createRequest = new NextRequest('http://localhost:3000/api/generate', {
        method: 'POST',
        body: formData
      })

      const createResponse = await POST(createRequest)
      const createData = await createResponse.json()
      const designId = createData.designId

      // Then retrieve it
      const getRequest = new NextRequest(`http://localhost:3000/api/generate?id=${designId}`)
      const getResponse = await GET(getRequest)
      const getData = await getResponse.json()

      expect(getResponse.status).toBe(200)
      expect(getData.id).toBe(designId)
      expect(getData.status).toBe('PENDING')
      expect(getData.uploadedImages).toHaveLength(1)
    })
  })
}) 