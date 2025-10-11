import { test, expect } from '@playwright/test';

test.describe('Deployed Site - Image Background Quick Test', () => {
  const DEPLOYED_URL = 'https://1kaiser.github.io/graph-queen/';
  const TEST_IMAGE = '/tmp/test-image.jpg';

  test('Quick test: Verify image background appears after automatic OCR', async ({ page }) => {
    console.log('\n🧪 Testing image background on DEPLOYED site...');

    // Load deployed site
    await page.goto(DEPLOYED_URL);
    await page.waitForTimeout(2000);
    console.log('✅ Deployed page loaded');

    // Upload test image
    const fileInput = await page.locator('#autoOCRInput');
    await fileInput.setInputFiles(TEST_IMAGE);
    console.log('✅ Image uploaded');

    // Wait for OCR to complete (look for nodes)
    await page.waitForFunction(() => {
      const nodes = document.querySelectorAll('#graphArea svg g.nodes circle');
      return nodes.length > 0;
    }, { timeout: 120000 });

    await page.waitForTimeout(3000); // Let rendering settle

    // Count nodes
    const nodeCount = await page.locator('#graphArea svg g.nodes circle').count();
    console.log(`📍 Total nodes created: ${nodeCount}`);

    // Check for image background in image-layer
    const imageLayerInfo = await page.evaluate(() => {
      const imageLayer = document.querySelector('.image-layer');
      const images = imageLayer?.querySelectorAll('image');

      return {
        hasImage: images && images.length > 0,
        count: images?.length || 0,
        imageDetails: images && images.length > 0 ? {
          width: images[0].getAttribute('width'),
          height: images[0].getAttribute('height'),
          x: images[0].getAttribute('x'),
          y: images[0].getAttribute('y'),
          opacity: images[0].getAttribute('opacity'),
          class: images[0].getAttribute('class'),
          href: images[0].getAttribute('href')?.substring(0, 30) + '...'
        } : null
      };
    });

    console.log('🖼️  Image layer info:', JSON.stringify(imageLayerInfo, null, 2));

    // Take screenshot
    await page.screenshot({ path: 'playwright-report/deployed-image-background-test.png', fullPage: true });
    console.log('📸 Screenshot saved: deployed-image-background-test.png');

    // Report results
    if (imageLayerInfo.hasImage) {
      console.log('\n✅ SUCCESS! Image background fix is working on deployed site!');
      console.log(`   - Nodes created: ${nodeCount}`);
      console.log(`   - Image background: PRESENT ✓`);
      console.log(`   - Image size: ${imageLayerInfo.imageDetails.width} x ${imageLayerInfo.imageDetails.height}`);
      console.log(`   - Image position: (${imageLayerInfo.imageDetails.x}, ${imageLayerInfo.imageDetails.y})`);
      console.log(`   - Image opacity: ${imageLayerInfo.imageDetails.opacity}`);
    } else {
      console.log('\n⚠️  Image background is still missing (may need more time for deployment to propagate)');
    }

    // Assertions
    expect(nodeCount).toBeGreaterThan(0);
    expect(imageLayerInfo.hasImage).toBeTruthy();
    expect(imageLayerInfo.count).toBe(1);
  });
});
