import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load and display the main elements', async ({ page }) => {
    await page.goto('/')

    // Check that the page title is correct
    await expect(page).toHaveTitle(/Pet Merch AI/)

    // Check that the main heading is visible
    const heading = page.locator('h1')
    await expect(heading).toContainText('Pet Merch AI')

    // Check that the tagline is visible
    const tagline = page.locator('text=Upload your pet photos')
    await expect(tagline).toBeVisible()

    // Check that the Get Started button is visible and clickable
    const getStartedButton = page.locator('button', { hasText: 'Get Started' })
    await expect(getStartedButton).toBeVisible()
    await expect(getStartedButton).toBeEnabled()
  })

  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Check that content is still visible on mobile
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()

    const button = page.locator('button', { hasText: 'Get Started' })
    await expect(button).toBeVisible()
  })

  test('should have proper meta tags for PWA', async ({ page }) => {
    await page.goto('/')

    // Check manifest link
    const manifestLink = page.locator('link[rel="manifest"]')
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json')

    // Check theme color
    const themeColor = page.locator('meta[name="theme-color"]')
    await expect(themeColor).toHaveAttribute('content', '#000000')

    // Check viewport meta
    const viewport = page.locator('meta[name="viewport"]')
    await expect(viewport).toHaveAttribute('content', /width=device-width/)
  })
}) 