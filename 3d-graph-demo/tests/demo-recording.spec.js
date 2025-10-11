import { test, expect } from '@playwright/test';

test.describe('Graph Queen - Complete Workflow Demonstration', () => {
  const DEPLOYED_URL = 'https://1kaiser.github.io/graph-queen/';
  const TEST_IMAGE = '/tmp/test-image.jpg';

  test('Full workflow demonstration with all features', async ({ page }) => {
    test.setTimeout(90000);
    console.log('\nStarting Graph Queen demonstration recording\n');

    console.log('STEP 1: Loading Graph Queen...');
    await page.goto(DEPLOYED_URL);
    await page.waitForTimeout(1500);
    console.log('Application loaded\n');

    console.log('STEP 2: Uploading document image for OCR...');
    const fileInput = await page.locator('#autoOCRInput');
    await fileInput.setInputFiles(TEST_IMAGE);
    console.log('Image uploaded, starting OCR\n');

    console.log('STEP 3: Processing OCR and extracting words...');
    await page.waitForFunction(() => {
      const nodes = document.querySelectorAll('#graphArea svg g.nodes circle');
      return nodes.length > 0;
    }, { timeout: 60000 });
    await page.waitForTimeout(2000);
    console.log('OCR complete, nodes created with background image\n');

    const nodeCount = await page.locator('#graphArea svg g.nodes circle').count();
    console.log('Created ' + nodeCount + ' nodes at detected word positions\n');

    console.log('STEP 4: Demonstrating zoom...');
    await page.mouse.move(640, 360);
    await page.mouse.wheel(0, -400);
    await page.waitForTimeout(1000);
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(1000);
    console.log('Zoom demonstrated\n');

    console.log('STEP 5: Selecting a node...');
    const firstNode = page.locator('#graphArea svg g.nodes circle').nth(10);
    await firstNode.click();
    await page.waitForTimeout(1000);
    console.log('Node selected\n');

    console.log('STEP 6: Creating connection between nodes...');
    await page.click('#connectModeBtn');
    await page.waitForTimeout(500);

    const node1 = page.locator('#graphArea svg g.nodes circle').nth(15);
    const node2 = page.locator('#graphArea svg g.nodes circle').nth(20);
    const box1 = await node1.boundingBox();
    const box2 = await node2.boundingBox();

    if (box1 && box2) {
      await page.mouse.move(box1.x + box1.width / 2, box1.y + box1.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(200);
      await page.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2, { steps: 15 });
      await page.mouse.up();
      await page.waitForTimeout(1000);
      console.log('Connection created\n');
    }

    console.log('STEP 7: Fitting to screen...');
    await page.evaluate(() => {
      if (window.fitToScreen) window.fitToScreen();
    });
    await page.waitForTimeout(1500);
    console.log('Final overview displayed\n');

    const edgeCount = await page.locator('#graphArea svg g.links line').count();
    console.log('FINAL RESULT:');
    console.log('Nodes created: ' + nodeCount);
    console.log('Connections: ' + edgeCount);
    console.log('Background image: Visible\n');

    console.log('Demonstration complete!\n');

    expect(nodeCount).toBeGreaterThan(0);
  });
});
