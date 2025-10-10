import { test, expect } from '@playwright/test';

const LOCAL_URL = 'http://localhost:5173/';
const DEPLOYED_URL = 'https://1kaiser.github.io/graph-queen/';

// Test both local and deployed versions
for (const { name, url } of [
  { name: 'Local', url: LOCAL_URL },
  { name: 'Deployed', url: DEPLOYED_URL }
]) {
  test.describe(`${name} Build Tests`, () => {

    test(`${name}: Page loads successfully`, async ({ page }) => {
      await page.goto(url);
      await expect(page).toHaveTitle(/Graph Queen/);
    });

    test(`${name}: Main UI elements are visible`, async ({ page }) => {
      await page.goto(url);

      // Check for main buttons
      await expect(page.locator('button:has-text("Upload Image/PDF")')).toBeVisible();
      await expect(page.locator('button:has-text("Connect Mode")')).toBeVisible();
      await expect(page.locator('button:has-text("Auto-Connect Similar")')).toBeVisible();
      await expect(page.locator('button:has-text("Export Graph")')).toBeVisible();

      // Check for graph area
      await expect(page.locator('#graphArea')).toBeVisible();
      await expect(page.locator('#graphArea svg')).toBeVisible();
    });

    test(`${name}: Top toggle buttons work`, async ({ page }) => {
      await page.goto(url);

      // Test OCR panel toggle
      await page.click('button:has-text("📸 OCR")');
      await expect(page.locator('#ocr-slide-panel')).toHaveClass(/visible/);
      await page.click('.slide-close-btn');
      await expect(page.locator('#ocr-slide-panel')).not.toHaveClass(/visible/);

      // Test Help panel toggle
      await page.click('button:has-text("❓ Help")');
      await expect(page.locator('#help-slide-panel')).toHaveClass(/visible/);
      await page.click('.slide-close-btn');

      // Test Settings panel toggle
      await page.click('button:has-text("⚙️ Settings")');
      await expect(page.locator('#settings-slide-panel')).toHaveClass(/visible/);

      // Check for p5.js demo container
      await expect(page.locator('#p5-demo-container')).toBeVisible();
      await page.click('.slide-close-btn');
    });

    test(`${name}: Connect mode toggles correctly`, async ({ page }) => {
      await page.goto(url);

      const connectBtn = page.locator('#connectModeBtn');
      await expect(connectBtn).toContainText('OFF');

      await connectBtn.click();
      await expect(connectBtn).toContainText('ON');
      await expect(connectBtn).toHaveClass(/active/);

      await connectBtn.click();
      await expect(connectBtn).toContainText('OFF');
    });

    test(`${name}: Text box is functional`, async ({ page }) => {
      await page.goto(url);

      const textBox = page.locator('#textBox');
      await expect(textBox).toBeVisible();
      await expect(textBox).toHaveAttribute('placeholder', /Type text/);

      // Type in text box
      await textBox.fill('Test Node');
      await expect(textBox).toHaveValue('Test Node');
    });

    test(`${name}: Console shows initialization messages`, async ({ page }) => {
      const messages = [];
      page.on('console', msg => messages.push(msg.text()));

      await page.goto(url);
      await page.waitForTimeout(1000);

      // Check for key initialization messages
      const hasInitMessage = messages.some(msg =>
        msg.includes('Graph Queen') && msg.includes('initialization')
      );
      expect(hasInitMessage).toBeTruthy();
    });

    test(`${name}: SVG background color is correct`, async ({ page }) => {
      await page.goto(url);

      const svg = page.locator('#graphArea svg');
      const bgColor = await svg.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );

      // Should be #F8FAFC (rgb(248, 250, 252))
      expect(bgColor).toBe('rgb(248, 250, 252)');
    });

    test(`${name}: PDF.js worker is configured correctly`, async ({ page }) => {
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto(url);
      await page.waitForTimeout(2000);

      // Check for PDF.js version mismatch errors
      const hasPDFError = consoleErrors.some(msg =>
        msg.includes('API version') && msg.includes('Worker version')
      );
      expect(hasPDFError).toBeFalsy();
    });

    test(`${name}: Modern color palette is applied`, async ({ page }) => {
      await page.goto(url);

      // Create a test node by typing in text box
      await page.fill('#textBox', 'Color Test');
      await page.press('#textBox', 'Enter');
      await page.waitForTimeout(500);

      // Check if node exists
      const nodes = await page.locator('#graphArea svg g.nodes circle').count();
      expect(nodes).toBeGreaterThan(0);

      // Check node color (should be indigo #6366F1)
      const nodeColor = await page.locator('#graphArea svg g.nodes circle').first().evaluate(
        el => el.getAttribute('fill')
      );
      expect(nodeColor).toBe('#6366F1');
    });

    test(`${name}: Permanent labels are visible`, async ({ page }) => {
      await page.goto(url);

      // Create a test node
      await page.fill('#textBox', 'Label Test');
      await page.press('#textBox', 'Enter');
      await page.waitForTimeout(500);

      // Check for permanent label
      const label = await page.locator('#graphArea svg g.nodes text.node-label-permanent').first();
      await expect(label).toBeVisible();
      await expect(label).toContainText('Label Test');
    });

    test(`${name}: Export Graph button is functional`, async ({ page }) => {
      await page.goto(url);

      // Create a test node first
      await page.fill('#textBox', 'Export Test');
      await page.press('#textBox', 'Enter');
      await page.waitForTimeout(500);

      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 });

      // Click export button
      await page.click('#exportBtn');

      // Handle the alert
      page.once('dialog', dialog => dialog.accept());

      // Wait for download
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/graph_queen_.*\.json/);
    });

  });
}
