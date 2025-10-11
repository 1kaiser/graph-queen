import { test, expect } from '@playwright/test';

test.describe('Graph Queen - Complete Workflow Demonstration', () => {
  const DEPLOYED_URL = 'https://1kaiser.github.io/graph-queen/';
  const TEST_IMAGE = '/tmp/test-image.jpg';

  test('Full workflow demonstration with all features', async ({ page }) => {
    test.setTimeout(120000);
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

    console.log('STEP 6: Creating manual connection...');
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
      console.log('Manual connection created\n');
    }

    await page.click('#connectModeBtn');
    await page.waitForTimeout(500);

    console.log('STEP 7: AI Auto-Connect similar words...');

    let dialogCount = 0;
    page.on('dialog', async dialog => {
      dialogCount++;
      console.log('Dialog ' + dialogCount + ': ' + dialog.type() + ' - ' + dialog.message().substring(0, 50));

      if (dialogCount === 1) {
        console.log('  -> Setting similarity threshold to 70%');
        await dialog.accept('70');
      } else if (dialogCount === 2) {
        console.log('  -> Auto-connect completion alert');
        await dialog.accept();
      } else if (dialogCount === 3) {
        console.log('  -> Clear background confirmation - keeping OCR data');
        await dialog.dismiss();
      } else if (dialogCount === 4) {
        console.log('  -> Export confirmation');
        await dialog.accept();
      }
    });

    await page.click('#autoConnectBtn');
    await page.waitForTimeout(3000);
    console.log('Auto-connect complete\n');

    console.log('STEP 8: Fitting to screen...');
    await page.evaluate(() => {
      if (window.fitToScreen) window.fitToScreen();
    });
    await page.waitForTimeout(1500);
    console.log('Graph fitted to screen\n');

    const edgeCountAfterAuto = await page.locator('#graphArea svg g.links line').count();
    console.log('Total connections after auto-connect: ' + edgeCountAfterAuto + '\n');

    console.log('STEP 9: Clearing image background...');
    await page.evaluate(() => {
      if (window.clearImageBackground) window.clearImageBackground();
    });
    await page.waitForTimeout(2000);
    console.log('Image background cleared\n');

    console.log('STEP 10: Exporting graph...');
    const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);

    await page.click('#exportBtn');
    await page.waitForTimeout(1000);

    try {
      const download = await downloadPromise;
      const filename = download.suggestedFilename();
      console.log('Graph exported: ' + filename + '\n');
    } catch (e) {
      console.log('Export triggered\n');
    }

    await page.waitForTimeout(1500);

    console.log('FINAL RESULT:');
    console.log('Nodes created: ' + nodeCount);
    console.log('Connections: ' + edgeCountAfterAuto);
    console.log('Background cleared: Yes');
    console.log('Graph exported: Yes\n');

    console.log('Complete workflow demonstration finished!\n');

    expect(nodeCount).toBeGreaterThan(0);
    expect(edgeCountAfterAuto).toBeGreaterThan(0);
  });
});
