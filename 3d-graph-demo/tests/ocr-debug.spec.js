import { test, expect } from '@playwright/test';
import path from 'path';

test('Debug OCR bbox extraction - capture console logs', async ({ page }) => {
  // Capture all console messages
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    console.log(`[BROWSER] ${text}`);
  });

  // Navigate to the app
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);

  console.log('\n=== Starting OCR Debug Test ===\n');

  // Use the test image with text
  const testImagePath = path.resolve('/home/kaiser/claude_projects/graph_work/3d-graph-demo/node_modules/scribe.js-ocr/scrollview-web/example_data/bill.png');

  console.log(`📷 Using test image: ${testImagePath}`);

  // Upload via the auto OCR input (📸 Upload Image/PDF button)
  const fileInput = await page.locator('#autoOCRInput');
  await fileInput.setInputFiles(testImagePath);

  console.log('⏳ Waiting for OCR to complete...');

  // Wait for OCR to complete (look for specific console log)
  await page.waitForFunction(() => {
    return window.console._logs?.some(log =>
      log.includes('Total words:') ||
      log.includes('Created') ||
      log.includes('OCR failed')
    ) || document.querySelector('#ocrProgress')?.style.display === 'none';
  }, { timeout: 60000 }).catch(() => {
    console.log('⚠️ Timeout waiting for OCR completion');
  });

  await page.waitForTimeout(2000);

  console.log('\n=== Console Logs Analysis ===\n');

  // Find and display key logs
  const structureLog = consoleLogs.find(log => log.includes('OCR result structure'));
  if (structureLog) {
    console.log('📊 ' + structureLog);
  }

  const sampleWordLog = consoleLogs.find(log => log.includes('Sample word structure') || log.includes('Sample word from'));
  if (sampleWordLog) {
    console.log('🔍 ' + sampleWordLog);
  }

  const totalWordsLog = consoleLogs.find(log => log.includes('Total words:'));
  if (totalWordsLog) {
    console.log('📝 ' + totalWordsLog);
  }

  const bboxWarning = consoleLogs.find(log => log.includes('Words found but NO bboxes'));
  if (bboxWarning) {
    console.log('⚠️ ' + bboxWarning);
  }

  const fullObjectLog = consoleLogs.find(log => log.includes('First word full object'));
  if (fullObjectLog) {
    console.log('📦 ' + fullObjectLog);
  }

  const createdLog = consoleLogs.find(log => log.includes('Words with positions:'));
  if (createdLog) {
    console.log('✅ ' + createdLog);
  }

  // Check if nodes were created
  const nodeCount = await page.locator('#graphArea svg g.nodes circle').count();
  console.log(`\n📊 Result: ${nodeCount} nodes created\n`);

  // Take screenshot
  await page.screenshot({ path: 'playwright-report/ocr-debug-result.png' });
  console.log('📸 Screenshot saved: ocr-debug-result.png');

  // Export all relevant logs
  const relevantLogs = consoleLogs.filter(log =>
    log.includes('OCR') ||
    log.includes('words') ||
    log.includes('bbox') ||
    log.includes('Sample') ||
    log.includes('Total') ||
    log.includes('positions')
  );

  console.log('\n=== All Relevant Logs ===');
  relevantLogs.forEach(log => console.log(log));

  expect(nodeCount).toBeGreaterThan(0);
});
