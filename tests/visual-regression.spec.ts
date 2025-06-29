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

test.describe('Knowledge Page Visual Regression Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and then to knowledge page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open sidebar and navigate to knowledge page
    await page.click('[data-testid="hamburger-button"]');
    await page.waitForTimeout(300);
    await page.click('[data-testid="knowledge-nav"]');
    await page.waitForTimeout(500);
  });

  test('Knowledge page - Empty state desktop', async ({ page }) => {
    await expect(page).toHaveScreenshot('knowledge-empty-desktop.png');
  });

  test('Knowledge page - Empty state mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page).toHaveScreenshot('knowledge-empty-mobile.png');
  });

  test('Knowledge page - Empty state tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page).toHaveScreenshot('knowledge-empty-tablet.png');
  });

  test('Knowledge page - Add tag form open', async ({ page }) => {
    await page.click('[data-testid="add-tag-button"]');
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot('knowledge-add-tag-form.png');
  });

  test('Knowledge page - Add tag form with input', async ({ page }) => {
    await page.click('[data-testid="add-tag-button"]');
    await page.waitForTimeout(300);
    await page.fill('[data-testid="tag-title-input"]', 'React useEffect cleanup patterns');
    await expect(page).toHaveScreenshot('knowledge-add-tag-form-filled.png');
  });

  test('Knowledge page - AI quiz welcome state', async ({ page }) => {
    // Scroll to AI quiz section
    await page.locator('[data-testid="start-quiz-button"]').scrollIntoViewIfNeeded();
    await expect(page).toHaveScreenshot('knowledge-ai-quiz-welcome.png');
  });

  test('Knowledge page - AI quiz started', async ({ page }) => {
    await page.locator('[data-testid="start-quiz-button"]').scrollIntoViewIfNeeded();
    await page.click('[data-testid="start-quiz-button"]');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('knowledge-ai-quiz-started.png');
  });

  test('Knowledge page - Large viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page).toHaveScreenshot('knowledge-large-desktop.png');
  });

  test('Knowledge page - Small mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await expect(page).toHaveScreenshot('knowledge-small-mobile.png');
  });

  test('Knowledge page - Mobile with add tag form', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.click('[data-testid="add-tag-button"]');
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot('knowledge-mobile-add-form.png');
  });

  test('Knowledge page - Mobile AI quiz started', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.locator('[data-testid="start-quiz-button"]').scrollIntoViewIfNeeded();
    await page.click('[data-testid="start-quiz-button"]');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('knowledge-mobile-quiz-started.png');
  });

  test('Knowledge page - Sidebar open state', async ({ page }) => {
    // Open sidebar over knowledge page
    await page.click('[data-testid="hamburger-button"]');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('knowledge-sidebar-open.png');
  });
}); 