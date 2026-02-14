import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/TradeOps Command Center/);
});

test('crm dashboard navigation', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Click the CRM link
    await page.click('text=Launch CRM');

    // Expect URL to contain crm/dashboard
    await expect(page).toHaveURL(/.*crm\/dashboard/);

    // Check for dashboard text
    await expect(page.locator('h1')).toContainText('Dashboard');
});

test('settings pages load correctly', async ({ page }) => {
    // Check CRM Settings
    await page.goto('http://localhost:3000/crm/settings');
    await expect(page).toHaveTitle(/TradeOps/);
    await expect(page.locator('h1')).toContainText('Settings');

    // Check Social Settings
    await page.goto('http://localhost:3000/social/settings');
    await expect(page.locator('h1')).toContainText('Social Settings');

    // Check Social Analytics
    await page.goto('http://localhost:3000/social/analytics');
    await expect(page.locator('h1')).toContainText('Analytics');
});

test('crm add buttons work', async ({ page }) => {
    // Test Add Customer Button
    await page.goto('http://localhost:3000/crm/customers');
    await page.click('text=Add Customer');
    await expect(page).toHaveURL(/.*crm\/customers\/create/);
    await expect(page.locator('h1')).toContainText('Add Customer');

    // Test New Job Button
    await page.goto('http://localhost:3000/crm/jobs');
    await page.click('text=New Job');
    await expect(page).toHaveURL(/.*crm\/jobs\/create/);
    await expect(page.locator('h1')).toContainText('New Job');

    // Test Create Quote Button
    await page.goto('http://localhost:3000/crm/quotes');
    await page.click('text=Create Quote');
    await expect(page).toHaveURL(/.*crm\/quotes\/create/);
    await expect(page.locator('h1')).toContainText('New Quote');
});
