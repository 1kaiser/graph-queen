import { test, expect } from '@playwright/test';

test.describe('Local Build - Image Background Test', () => {
  const LOCAL_URL = 'http://localhost:5173/';
  const TEST_IMAGE = '/tmp/test-image.jpg';

  test('Verify image background is displayed in automatic OCR workflow', async ({ page }) => {
    console.log('\n🧪 Testing image background fix on LOCAL build...');

    // Load local site
    await page.goto(LOCAL_URL);
    await page.waitForTimeout(1000);
    console.log('✅ Page loaded');

    // Upload test image
    const fileInput = await page.locator('#autoOCRInput');
    await fileInput.setInputFiles(TEST_IMAGE);
    console.log('✅ Image uploaded');

    // Wait for OCR to complete (look for nodes)
    await page.waitForFunction(() => {
      const nodes = document.querySelectorAll('#graphArea svg g.nodes circle');
      return nodes.length > 0;
    }, { timeout: 120000 });

    await page.waitForTimeout(2000); // Let rendering settle

    // Count nodes
    const nodeCount = await page.locator('#graphArea svg g.nodes circle').count();
    console.log(`📍 Total nodes created: ${nodeCount}`);

    // Check for image background in image-layer
    const imageLayerInfo = await page.evaluate(() => {
      const imageLayer = document.querySelector('.image-layer');
      const images = imageLayer?.querySelectorAll('image');

      if (!images || images.length === 0) {
        return { hasImage: false, count: 0 };
      }

      const imageElement = images[0];
      return {
        hasImage: true,
        count: images.length,
        width: imageElement.getAttribute('width'),
        height: imageElement.getAttribute('height'),
        x: imageElement.getAttribute('x'),
        y: imageElement.getAttribute('y'),
        opacity: imageElement.getAttribute('opacity'),
        class: imageElement.getAttribute('class')
      };
    });

    console.log('🖼️  Image layer info:', JSON.stringify(imageLayerInfo, null, 2));

    // Take screenshot
    await page.screenshot({ path: 'playwright-report/local-image-background-test.png', fullPage: true });
    console.log('📸 Screenshot saved: local-image-background-test.png');

    // Assertions
    expect(nodeCount).toBeGreaterThan(0);
    expect(imageLayerInfo.hasImage).toBeTruthy();
    expect(imageLayerInfo.count).toBe(1);
    expect(imageLayerInfo.class).toBe('ocr-background');

    console.log('✅ Image background fix VERIFIED!');
    console.log(`   - Nodes created: ${nodeCount}`);
    console.log(`   - Image background: PRESENT`);
    console.log(`   - Image size: ${imageLayerInfo.width} x ${imageLayerInfo.height}`);
    console.log(`   - Image position: (${imageLayerInfo.x}, ${imageLayerInfo.y})`);
    console.log(`   - Image opacity: ${imageLayerInfo.opacity}`);
  });
});
