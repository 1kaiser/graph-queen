import { test, expect } from '@playwright/test';

test.describe('3D Force Graph - Console Log Verification', () => {

  test('should capture all console logs', async ({ page }) => {
    console.log('✅ TEST: Console log capture');

    const consoleLogs = {
      log: [],
      warn: [],
      error: [],
      info: []
    };

    page.on('console', msg => {
      const text = msg.text();
      const type = msg.type();

      consoleLogs[type] = consoleLogs[type] || [];
      consoleLogs[type].push(text);

      // Print to test output
      console.log(`[${type.toUpperCase()}]`, text);
    });

    page.on('pageerror', error => {
      console.error('[PAGE ERROR]:', error.message);
      consoleLogs.error.push(error.message);
    });

    await page.goto('/');
    await page.waitForTimeout(3000);

    // Verify expected logs
    const allLogs = [...consoleLogs.log, ...consoleLogs.info];

    console.log('\\n📊 CONSOLE LOG SUMMARY:');
    console.log('  - Total logs:', allLogs.length);
    console.log('  - Warnings:', consoleLogs.warn.length);
    console.log('  - Errors:', consoleLogs.error.length);

    // Check for initialization logs
    const hasInitLog = allLogs.some(log => log.includes('Starting initialization'));
    const hasGenerateLog = allLogs.some(log => log.includes('Generating graph data'));
    const hasInitializedLog = allLogs.some(log => log.includes('initialized successfully'));
    const hasReadyLog = allLogs.some(log => log.includes('Demo ready'));

    console.log('\\n✅ EXPECTED LOGS:');
    console.log('  - Has init log:', hasInitLog);
    console.log('  - Has generate log:', hasGenerateLog);
    console.log('  - Has initialized log:', hasInitializedLog);
    console.log('  - Has ready log:', hasReadyLog);

    expect(hasInitLog).toBe(true);
    expect(hasGenerateLog).toBe(true);
    expect(hasInitializedLog).toBe(true);
    expect(hasReadyLog).toBe(true);

    // Should have no errors
    expect(consoleLogs.error.length).toBe(0);

    console.log('\\n✅ PASS: All console logs captured and verified');
  });

  test('should log color changes', async ({ page }) => {
    console.log('✅ TEST: Color change console logs');

    const colorChangeLogs = [];

    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('color changed')) {
        colorChangeLogs.push(text);
        console.log('[COLOR CHANGE]:', text);
      }
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    // Change background color
    await page.locator('[data-testid="bg-color-input"]').evaluate((el, value) => {
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, '#f0f0f0');
    await page.waitForTimeout(300);

    // Change node color
    await page.locator('[data-testid="node-color-input"]').evaluate((el, value) => {
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, '#ff5733');
    await page.waitForTimeout(300);

    console.log('\\n📊 Color change logs captured:', colorChangeLogs.length);
    colorChangeLogs.forEach(log => console.log('  -', log));

    expect(colorChangeLogs.length).toBeGreaterThan(0);

    console.log('✅ PASS: Color changes logged');
  });

  test('should log layout changes', async ({ page }) => {
    console.log('✅ TEST: Layout change console logs');

    const layoutChangeLogs = [];

    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Layout changed')) {
        layoutChangeLogs.push(text);
        console.log('[LAYOUT CHANGE]:', text);
      }
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    // Change layouts
    const layouts = ['td', 'lr', 'radialout'];
    for (const layout of layouts) {
      await page.locator('[data-testid="layout-select"]').selectOption(layout);
      await page.waitForTimeout(500);
    }

    console.log('\\n📊 Layout change logs captured:', layoutChangeLogs.length);
    layoutChangeLogs.forEach(log => console.log('  -', log));

    expect(layoutChangeLogs.length).toBe(3);

    console.log('✅ PASS: Layout changes logged');
  });

  test('should log regeneration', async ({ page }) => {
    console.log('✅ TEST: Regeneration console logs');

    const regenerateLogs = [];

    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Regenerating') || text.includes('Generated')) {
        regenerateLogs.push(text);
        console.log('[REGENERATE]:', text);
      }
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    // Regenerate with different node counts
    const nodeCounts = [25, 75];
    for (const count of nodeCounts) {
      await page.locator('[data-testid="node-count-input"]').fill(String(count));
      await page.locator('[data-testid="regenerate-btn"]').click();
      await page.waitForTimeout(1000);
    }

    console.log('\\n📊 Regeneration logs captured:', regenerateLogs.length);
    regenerateLogs.forEach(log => console.log('  -', log));

    expect(regenerateLogs.length).toBeGreaterThan(0);

    console.log('✅ PASS: Regeneration logged');
  });

  test('should log pause/resume actions', async ({ page }) => {
    console.log('✅ TEST: Pause/Resume console logs');

    const animationLogs = [];

    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Pausing') || text.includes('Resuming')) {
        animationLogs.push(text);
        console.log('[ANIMATION]:', text);
      }
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    // Pause
    await page.locator('[data-testid="pause-btn"]').click();
    await page.waitForTimeout(300);

    // Resume
    await page.locator('[data-testid="pause-btn"]').click();
    await page.waitForTimeout(300);

    console.log('\\n📊 Animation logs captured:', animationLogs.length);
    animationLogs.forEach(log => console.log('  -', log));

    expect(animationLogs.length).toBe(2);

    console.log('✅ PASS: Pause/Resume actions logged');
  });

  test('should have no JavaScript errors', async ({ page }) => {
    console.log('✅ TEST: JavaScript error check');

    const errors = [];

    page.on('pageerror', error => {
      errors.push(error.message);
      console.error('[JS ERROR]:', error.message);
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.error('[CONSOLE ERROR]:', msg.text());
      }
    });

    await page.goto('/');
    await page.waitForTimeout(3000);

    // Perform various interactions
    await page.locator('[data-testid="bg-color-input"]').evaluate((el, value) => {
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, '#ffffff');
    await page.locator('[data-testid="layout-select"]').selectOption('td');
    await page.locator('[data-testid="regenerate-btn"]').click();
    await page.waitForTimeout(2000);

    console.log('\\n📊 Total errors detected:', errors.length);
    if (errors.length > 0) {
      console.log('\\n❌ ERRORS FOUND:');
      errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    }

    expect(errors.length).toBe(0);

    console.log('✅ PASS: No JavaScript errors detected');
  });
});
