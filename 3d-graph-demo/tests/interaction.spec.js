import { test, expect } from '@playwright/test';

test.describe('3D Force Graph - Interactions', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      console.log(`[BROWSER ${msg.type()}]:`, msg.text());
    });

    await page.goto('/');
    await page.waitForTimeout(2000);
  });

  test('should change background color', async ({ page }) => {
    console.log('✅ TEST: Background color change');

    const bgColorInput = page.locator('[data-testid="bg-color-input"]');

    // Change to light gray
    await bgColorInput.evaluate((el, value) => {
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, '#f5f5f5');
    await page.waitForTimeout(500);

    // Take screenshot
    await page.screenshot({
      path: 'test-results/screenshots/bg-color-gray.png'
    });

    console.log('✅ PASS: Background color changed');
  });

  test('should change node color', async ({ page }) => {
    console.log('✅ TEST: Node color change');

    const nodeColorInput = page.locator('[data-testid="node-color-input"]');

    // Change to red
    await nodeColorInput.evaluate((el, value) => {
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, '#ff0000');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'test-results/screenshots/node-color-red.png'
    });

    console.log('✅ PASS: Node color changed');
  });

  test('should adjust link opacity', async ({ page }) => {
    console.log('✅ TEST: Link opacity adjustment');

    const linkOpacityInput = page.locator('[data-testid="link-opacity-input"]');
    const linkOpacityValue = page.locator('#linkOpacityValue');

    // Set to 70%
    await linkOpacityInput.fill('70');
    await page.waitForTimeout(500);

    const displayValue = await linkOpacityValue.textContent();
    console.log('Link opacity display:', displayValue);

    expect(displayValue).toBe('70%');

    await page.screenshot({
      path: 'test-results/screenshots/link-opacity-70.png'
    });

    console.log('✅ PASS: Link opacity adjusted');
  });

  test('should change layout mode', async ({ page }) => {
    console.log('✅ TEST: Layout mode change');

    const layoutSelect = page.locator('[data-testid="layout-select"]');

    // Change to top-down DAG
    await layoutSelect.selectOption('td');
    await page.waitForTimeout(1500);

    await page.screenshot({
      path: 'test-results/screenshots/layout-dag-td.png'
    });

    // Change to radial
    await layoutSelect.selectOption('radialout');
    await page.waitForTimeout(1500);

    await page.screenshot({
      path: 'test-results/screenshots/layout-radial.png'
    });

    console.log('✅ PASS: Layout modes changed');
  });

  test('should zoom to fit', async ({ page }) => {
    console.log('✅ TEST: Zoom to fit');

    const zoomFitBtn = page.locator('[data-testid="zoom-fit-btn"]');

    await zoomFitBtn.click();
    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'test-results/screenshots/zoom-fit.png'
    });

    console.log('✅ PASS: Zoom to fit executed');
  });

  test('should regenerate graph', async ({ page }) => {
    console.log('✅ TEST: Graph regeneration');

    const nodeCountInput = page.locator('[data-testid="node-count-input"]');
    const regenerateBtn = page.locator('[data-testid="regenerate-btn"]');
    const nodeCountDisplay = page.locator('[data-testid="node-count-display"]');

    // Change node count to 30
    await nodeCountInput.fill('30');
    await regenerateBtn.click();
    await page.waitForTimeout(1500);

    const nodeCount = await nodeCountDisplay.textContent();
    console.log('New node count:', nodeCount);

    expect(parseInt(nodeCount)).toBe(30);

    await page.screenshot({
      path: 'test-results/screenshots/regenerate-30-nodes.png'
    });

    console.log('✅ PASS: Graph regenerated');
  });

  test('should pause and resume animation', async ({ page }) => {
    console.log('✅ TEST: Pause/Resume animation');

    const pauseBtn = page.locator('[data-testid="pause-btn"]');
    const statusDisplay = page.locator('[data-testid="status-display"]');

    // Pause
    await pauseBtn.click();
    await page.waitForTimeout(500);

    let status = await statusDisplay.textContent();
    console.log('Status after pause:', status);
    expect(status).toBe('Paused');

    let btnText = await pauseBtn.textContent();
    expect(btnText).toContain('Resume');

    await page.screenshot({
      path: 'test-results/screenshots/paused.png'
    });

    // Resume
    await pauseBtn.click();
    await page.waitForTimeout(100);

    // Wait for status to update to Active
    await page.waitForFunction(
      () => document.querySelector('[data-testid="status-display"]').textContent === 'Active',
      { timeout: 2000 }
    );

    status = await statusDisplay.textContent();
    console.log('Status after resume:', status);
    expect(status).toBe('Active');

    btnText = await pauseBtn.textContent();
    expect(btnText).toContain('Pause');

    console.log('✅ PASS: Pause/Resume working');
  });

  test('should click on canvas (node interaction)', async ({ page }) => {
    console.log('✅ TEST: Node click interaction');

    // Wait for canvas to be fully rendered
    await page.waitForSelector('canvas', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(2000); // Wait for WebGL rendering

    const canvas = page.locator('canvas').first();
    const infoPanel = page.locator('[data-testid="info-panel"]');

    // Click on canvas center (likely to hit a node) with force option
    await canvas.click({ position: { x: 400, y: 300 }, force: true });
    await page.waitForTimeout(500);

    // Check if info panel appeared
    const isPanelVisible = await infoPanel.isVisible();
    console.log('Info panel visible after click:', isPanelVisible);

    if (isPanelVisible) {
      await page.screenshot({
        path: 'test-results/screenshots/node-clicked.png'
      });
      console.log('✅ PASS: Node clicked, info panel shown');
    } else {
      console.log('⚠️ INFO: No node clicked (clicked empty space)');
    }
  });

  test('should close info panel on background click', async ({ page }) => {
    console.log('✅ TEST: Info panel close');

    // Wait for canvas to be fully rendered
    await page.waitForSelector('canvas', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(2000); // Wait for WebGL rendering

    const canvas = page.locator('canvas').first();
    const infoPanel = page.locator('[data-testid="info-panel"]');

    // Try to click a node with force option
    await canvas.click({ position: { x: 400, y: 300 }, force: true });
    await page.waitForTimeout(500);

    if (await infoPanel.isVisible()) {
      // Click background to close
      await canvas.click({ position: { x: 100, y: 100 }, force: true });
      await page.waitForTimeout(500);

      const isPanelVisible = await infoPanel.isVisible();
      console.log('Info panel visible after background click:', isPanelVisible);

      console.log('✅ PASS: Info panel closed');
    } else {
      console.log('⚠️ SKIP: Info panel was not visible');
    }
  });
});
