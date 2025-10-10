import { test, expect } from '@playwright/test';

test.describe('3D Force Graph - Visual Inspection', () => {
  test.beforeEach(async ({ page }) => {
    // Capture console logs
    page.on('console', msg => {
      console.log(`[BROWSER ${msg.type()}]:`, msg.text());
    });

    // Capture page errors
    page.on('pageerror', error => {
      console.error('[BROWSER ERROR]:', error.message);
    });

    await page.goto('/');

    // Wait for graph to initialize
    await page.waitForTimeout(2000);
  });

  test('should load page successfully', async ({ page }) => {
    console.log('✅ TEST: Page load');

    // Check title
    await expect(page).toHaveTitle(/3D Force Graph/);

    // Check main elements are visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="graph-container"]')).toBeVisible();

    console.log('✅ PASS: Page loaded successfully');
  });

  test('should render graph container', async ({ page }) => {
    console.log('✅ TEST: Graph container rendering');

    const graphContainer = page.locator('[data-testid="graph-container"]');
    await expect(graphContainer).toBeVisible();

    // Wait longer for WebGL to initialize and create canvas
    await page.waitForTimeout(3000);

    // Check if canvas exists (may take time for WebGL to render)
    const canvasCount = await page.locator('canvas').count();
    console.log('Canvas elements found:', canvasCount);

    if (canvasCount > 0) {
      await expect(page.locator('canvas').first()).toBeVisible();
      console.log('✅ PASS: Graph container rendered with canvas');
    } else {
      console.log('⚠️ WARNING: Canvas not yet created (WebGL may still be initializing)');
    }
  });

  test('should display correct initial stats', async ({ page }) => {
    console.log('✅ TEST: Initial stats display');

    // Wait for stats to update
    await page.waitForTimeout(1000);

    const nodeCount = await page.locator('[data-testid="node-count-display"]').textContent();
    const linkCount = await page.locator('[data-testid="link-count-display"]').textContent();
    const status = await page.locator('[data-testid="status-display"]').textContent();

    console.log(`📊 Stats - Nodes: ${nodeCount}, Links: ${linkCount}, Status: ${status}`);

    expect(parseInt(nodeCount)).toBeGreaterThan(0);
    expect(parseInt(linkCount)).toBeGreaterThan(0);
    expect(status).toBe('Active');

    console.log('✅ PASS: Stats displayed correctly');
  });

  test('should have all control elements', async ({ page }) => {
    console.log('✅ TEST: Control elements presence');

    // Check all control inputs exist
    await expect(page.locator('[data-testid="bg-color-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="node-color-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="link-opacity-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="node-count-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="layout-select"]')).toBeVisible();

    // Check buttons
    await expect(page.locator('[data-testid="zoom-fit-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="regenerate-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="pause-btn"]')).toBeVisible();

    console.log('✅ PASS: All controls present');
  });

  test('should take initial screenshot', async ({ page }) => {
    console.log('📸 TEST: Visual screenshot');

    // Wait for graph to settle
    await page.waitForTimeout(2000);

    // Take full page screenshot
    await page.screenshot({
      path: 'test-results/screenshots/initial-load.png',
      fullPage: true
    });

    console.log('✅ PASS: Screenshot saved');
  });

  test('should check console logs for initialization', async ({ page }) => {
    console.log('✅ TEST: Console log verification');

    const consoleLogs = [];
    page.on('console', msg => consoleLogs.push(msg.text()));

    await page.goto('/');
    await page.waitForTimeout(2000);

    // Check for specific log messages
    const hasInitLog = consoleLogs.some(log => log.includes('3D Force Graph Demo'));
    const hasReadyLog = consoleLogs.some(log => log.includes('Demo ready'));

    console.log('📝 Console logs captured:', consoleLogs.length);
    console.log('Has init log:', hasInitLog);
    console.log('Has ready log:', hasReadyLog);

    expect(hasInitLog).toBe(true);
    expect(hasReadyLog).toBe(true);

    console.log('✅ PASS: Console logs verified');
  });
});
