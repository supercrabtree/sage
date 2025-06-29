import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests - Layout Consistency', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('Chat page - Desktop view', async ({ page }) => {
    await expect(page).toHaveScreenshot('chat-desktop.png');
  });

  test('Chat page - Mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page).toHaveScreenshot('chat-mobile.png');
  });

  test('Chat page - Tablet view', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page).toHaveScreenshot('chat-tablet.png');
  });

  test('Sidebar closed state', async ({ page }) => {
    // Ensure sidebar is closed (default state)
    await expect(page).toHaveScreenshot('sidebar-closed.png');
  });

  test('Sidebar open state', async ({ page }) => {
    // Click hamburger button to open sidebar
    await page.click('[data-testid="hamburger-button"]');
    // Wait for sidebar animation to complete
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('sidebar-open.png');
  });

  test('Sidebar open state - Mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.click('[data-testid="hamburger-button"]');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('sidebar-open-mobile.png');
  });

  test('Chat input focus state', async ({ page }) => {
    // Focus on the input field
    await page.click('[data-testid="chat-input"]');
    await expect(page).toHaveScreenshot('input-focused.png');
  });

  test('Chat input with text', async ({ page }) => {
    // Type some text in the input
    await page.fill('[data-testid="chat-input"]', 'Test message for layout testing');
    await expect(page).toHaveScreenshot('input-with-text.png');
  });

  test('Send button hover state', async ({ page }) => {
    // Fill input first to enable send button
    await page.fill('[data-testid="chat-input"]', 'Test');
    // Hover over send button
    await page.hover('[data-testid="send-button"]');
    await expect(page).toHaveScreenshot('send-button-hover.png');
  });

  test('Chat with messages', async ({ page }) => {
    // If there are existing messages, capture them
    // Otherwise this will show empty state
    await expect(page).toHaveScreenshot('chat-with-content.png');
  });

  test('Large viewport - Desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page).toHaveScreenshot('large-desktop.png');
  });

  test('Small mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await expect(page).toHaveScreenshot('small-mobile.png');
  });

  test('Chat layout with typing animation', async ({ page }) => {
    // Look for typing animation if it exists
    const typingElement = page.locator('[class*="typing"]').first();
    if (await typingElement.isVisible()) {
      await expect(page).toHaveScreenshot('typing-animation.png');
    } else {
      // Skip this test if typing animation is not present
      test.skip();
    }
  });
}); 