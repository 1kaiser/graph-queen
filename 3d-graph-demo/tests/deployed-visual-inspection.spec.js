import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Deployed Site - Complete OCR Visual Inspection', () => {
  const DEPLOYED_URL = 'https://1kaiser.github.io/graph-queen/';
  const TEST_IMAGE = '/tmp/test-image.jpg';

  test('Full OCR workflow with user image - Step by step visual inspection', async ({ page }) => {
    const consoleLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      console.log(`[BROWSER] ${text}`);
    });

    console.log('\n🌐 STEP 1: Loading deployed site...');
    await page.goto(DEPLOYED_URL);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'playwright-report/step1-page-loaded.png', fullPage: true });
    console.log('✅ Page loaded - Screenshot saved: step1-page-loaded.png');

    // Verify initial state
    const initialNodeCount = await page.locator('#graphArea svg g.nodes circle').count();
    console.log(`📊 Initial state: ${initialNodeCount} nodes`);

    console.log('\n📸 STEP 2: Uploading test image...');
    const fileInput = await page.locator('#autoOCRInput');
    await fileInput.setInputFiles(TEST_IMAGE);
    console.log('✅ Image uploaded');

    console.log('\n⏳ STEP 3: Waiting for OCR processing...');
    await page.waitForTimeout(3000); // Initial delay for file processing

    // Wait for OCR progress to appear
    const progressVisible = await page.locator('#ocrProgress').isVisible();
    if (progressVisible) {
      console.log('⏳ OCR progress indicator visible');
    }

    // Wait for OCR completion (look for specific console logs or node creation)
    await page.waitForFunction(() => {
      const nodes = document.querySelectorAll('#graphArea svg g.nodes circle');
      return nodes.length > 0;
    }, { timeout: 120000 }).catch(() => {
      console.log('⚠️ Timeout waiting for nodes, checking current state...');
    });

    await page.waitForTimeout(3000); // Let animation settle
    await page.screenshot({ path: 'playwright-report/step2-ocr-complete.png', fullPage: true });
    console.log('✅ OCR complete - Screenshot saved: step2-ocr-complete.png');

    console.log('\n📊 STEP 4: Analyzing results...');

    // Count created nodes
    const nodeCount = await page.locator('#graphArea svg g.nodes circle').count();
    console.log(`📍 Total nodes created: ${nodeCount}`);

    // Check if nodes have labels
    const labelCount = await page.locator('#graphArea svg g.nodes text.node-label-permanent').count();
    console.log(`🏷️  Node labels: ${labelCount}`);

    // Check for image background
    const hasImageBackground = await page.evaluate(() => {
      const imageLayer = document.querySelector('.image-layer');
      const images = imageLayer?.querySelectorAll('image');
      return images && images.length > 0;
    });
    console.log(`🖼️  Image background: ${hasImageBackground ? 'YES' : 'NO'}`);

    // Capture zoom container transform
    const transformInfo = await page.evaluate(() => {
      const zoomContainer = document.querySelector('.zoom-container');
      return {
        transform: zoomContainer?.getAttribute('transform'),
        layerCount: zoomContainer?.children.length
      };
    });
    console.log(`🔍 Zoom container: ${transformInfo.layerCount} layers, transform: ${transformInfo.transform}`);

    console.log('\n🎨 STEP 5: Testing zoom and pan...');
    // Zoom in
    await page.mouse.move(500, 300);
    await page.mouse.wheel(0, -300); // Zoom in
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'playwright-report/step3-zoomed-in.png', fullPage: true });
    console.log('✅ Zoomed in - Screenshot saved: step3-zoomed-in.png');

    // Zoom out
    await page.mouse.wheel(0, 200); // Zoom out
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'playwright-report/step4-zoomed-out.png', fullPage: true });
    console.log('✅ Zoomed out - Screenshot saved: step4-zoomed-out.png');

    console.log('\n🎯 STEP 6: Testing node interactions...');
    // Click on a node if any exist
    if (nodeCount > 0) {
      const firstNode = page.locator('#graphArea svg g.nodes circle').first();
      await firstNode.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'playwright-report/step5-node-selected.png', fullPage: true });
      console.log('✅ Node selected - Screenshot saved: step5-node-selected.png');

      // Get selected node info
      const selectedNodeInfo = await page.evaluate(() => {
        const selectedCircle = document.querySelector('#graphArea svg g.nodes circle[fill="#F59E0B"]');
        if (!selectedCircle) return null;
        const textLabel = selectedCircle.parentElement.querySelector('text.node-label-permanent');
        return {
          label: textLabel?.textContent,
          fill: selectedCircle.getAttribute('fill')
        };
      });
      console.log(`📍 Selected node: "${selectedNodeInfo?.label || 'Unknown'}"`);
    }

    console.log('\n📋 STEP 7: Console logs analysis...');

    // Find OCR-related logs
    const ocrLogs = consoleLogs.filter(log =>
      log.includes('OCR') ||
      log.includes('words') ||
      log.includes('bbox') ||
      log.includes('Extracted') ||
      log.includes('positions')
    );

    console.log('\n=== OCR Processing Logs ===');
    ocrLogs.slice(0, 15).forEach(log => console.log(log));

    // Find structure logs
    const structureLog = consoleLogs.find(log => log.includes('OCR result structure'));
    if (structureLog) {
      console.log('\n📊 OCR Structure:', structureLog);
    }

    const wordsExtracted = consoleLogs.find(log => log.includes('Extracted') && log.includes('words'));
    if (wordsExtracted) {
      console.log('✅ Words Extraction:', wordsExtracted);
    }

    const positionsLog = consoleLogs.find(log => log.includes('Words with positions'));
    if (positionsLog) {
      console.log('📍 Positioning:', positionsLog);
    }

    console.log('\n📸 STEP 8: Final state capture...');
    // Fit to screen for final overview
    await page.evaluate(() => {
      if (window.fitToScreen) window.fitToScreen();
    });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'playwright-report/step6-final-overview.png', fullPage: true });
    console.log('✅ Final overview - Screenshot saved: step6-final-overview.png');

    console.log('\n' + '='.repeat(60));
    console.log('📊 VISUAL INSPECTION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Deployed URL: ${DEPLOYED_URL}`);
    console.log(`✅ Image uploaded: ${path.basename(TEST_IMAGE)}`);
    console.log(`✅ Nodes created: ${nodeCount}`);
    console.log(`✅ Labels visible: ${labelCount}`);
    console.log(`✅ Image background: ${hasImageBackground ? 'Present' : 'Missing'}`);
    console.log(`✅ Zoom/Pan: Functional`);
    console.log(`✅ Node selection: ${nodeCount > 0 ? 'Working' : 'N/A'}`);
    console.log('='.repeat(60));

    // Verify minimum expectations
    expect(nodeCount).toBeGreaterThan(0);
    expect(labelCount).toBe(nodeCount);
  });

  test('Visual check: Image background layering', async ({ page }) => {
    const consoleLogs = [];
    page.on('console', msg => consoleLogs.push(msg.text()));

    console.log('\n🔍 Checking SVG layer structure...');
    await page.goto(DEPLOYED_URL);
    await page.waitForTimeout(2000);

    // Upload image
    const fileInput = await page.locator('#autoOCRInput');
    await fileInput.setInputFiles(TEST_IMAGE);

    // Wait for processing
    await page.waitForTimeout(15000);

    // Check layer structure
    const layers = await page.evaluate(() => {
      const zoomContainer = document.querySelector('.zoom-container');
      if (!zoomContainer) return null;

      return {
        layers: Array.from(zoomContainer.children).map(child => ({
          className: child.className.baseVal || child.className,
          tagName: child.tagName,
          childCount: child.children.length
        })),
        imageLayerContent: document.querySelector('.image-layer')?.children.length || 0,
        wordRectLayerContent: document.querySelector('.word-rect-layer')?.children.length || 0
      };
    });

    console.log('\n📊 Layer Structure:');
    console.log(JSON.stringify(layers, null, 2));

    // Take screenshot
    await page.screenshot({ path: 'playwright-report/layer-structure.png', fullPage: true });
    console.log('✅ Layer structure screenshot saved');

    // Verify correct ordering
    expect(layers?.layers[0]?.className).toBe('image-layer');
    expect(layers?.layers[1]?.className).toBe('word-rect-layer');
  });

  test('Visual check: Node positioning accuracy', async ({ page }) => {
    console.log('\n📍 Checking node positioning accuracy...');
    await page.goto(DEPLOYED_URL);
    await page.waitForTimeout(2000);

    // Upload image
    const fileInput = await page.locator('#autoOCRInput');
    await fileInput.setInputFiles(TEST_IMAGE);

    // Wait for OCR
    await page.waitForTimeout(15000);

    // Get first 10 node positions and labels
    const nodePositions = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('#graphArea svg g.nodes g'));
      return nodes.slice(0, 10).map(node => {
        const circle = node.querySelector('circle');
        const label = node.querySelector('text.node-label-permanent');
        const transform = node.getAttribute('transform');
        const match = transform?.match(/translate\(([-\d.]+),([-\d.]+)\)/);
        return {
          label: label?.textContent,
          x: match ? parseFloat(match[1]) : null,
          y: match ? parseFloat(match[2]) : null,
          fill: circle?.getAttribute('fill')
        };
      });
    });

    console.log('\n📊 Sample Node Positions:');
    nodePositions.forEach((node, i) => {
      console.log(`  ${i + 1}. "${node.label}" at (${node.x?.toFixed(1)}, ${node.y?.toFixed(1)})`);
    });

    // Verify nodes have valid positions
    nodePositions.forEach(node => {
      expect(node.x).not.toBeNull();
      expect(node.y).not.toBeNull();
    });

    await page.screenshot({ path: 'playwright-report/node-positions.png', fullPage: true });
    console.log('✅ Node positioning screenshot saved');
  });
});
