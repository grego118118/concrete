import { test, expect } from '@playwright/test';

test.describe('Address Verification', () => {
    test('should show autocomplete dropdown and validate address in service area', async ({ page }) => {
        // Navigate to customer creation page
        await page.goto('http://localhost:3000/crm/customers/create');

        // Wait for page to load
        await page.waitForLoadState('networkidle');

        // Wait for Google Maps script to load (look for the loading spinner to disappear)
        await page.waitForTimeout(2000); // Give time for script to load

        // Find the Project Address input
        const addressInput = page.locator('input[name="address"]');
        await expect(addressInput).toBeVisible();

        // Type an address in Springfield, MA (inside service area - Hampden County)
        await addressInput.fill('123 Main Street, Springfield, MA');

        // Wait for autocomplete suggestions to appear
        await page.waitForTimeout(1500);

        // Take screenshot of dropdown state
        await page.screenshot({ path: 'tests/screenshots/address-dropdown.png', fullPage: true });

        // Check if dropdown appeared
        const dropdown = page.locator('.absolute.z-50');
        const dropdownVisible = await dropdown.isVisible().catch(() => false);

        if (dropdownVisible) {
            console.log('✅ Autocomplete dropdown is visible');

            // Click on first suggestion
            const firstSuggestion = dropdown.locator('div').first();
            await firstSuggestion.click();

            // Wait for validation
            await page.waitForTimeout(1000);
        } else {
            console.log('❌ Autocomplete dropdown did NOT appear - this is the bug');
        }

        // Take screenshot after selection
        await page.screenshot({ path: 'tests/screenshots/address-validation.png', fullPage: true });

        // Check for validation message
        const validMessage = page.locator('text=Address is within our service area');
        const invalidMessage = page.locator('text=outside our service area');

        const hasValidMessage = await validMessage.isVisible().catch(() => false);
        const hasInvalidMessage = await invalidMessage.isVisible().catch(() => false);

        console.log('Valid message visible:', hasValidMessage);
        console.log('Invalid message visible:', hasInvalidMessage);
    });

    test('should reject address outside service area', async ({ page }) => {
        await page.goto('http://localhost:3000/crm/customers/create');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const addressInput = page.locator('input[name="address"]');

        // Type an address in Boston (Suffolk County - NOT in service area)
        await addressInput.fill('123 Beacon Street, Boston, MA');
        await page.waitForTimeout(1500);

        const dropdown = page.locator('.absolute.z-50');
        const dropdownVisible = await dropdown.isVisible().catch(() => false);

        if (dropdownVisible) {
            const firstSuggestion = dropdown.locator('div').first();
            await firstSuggestion.click();
            await page.waitForTimeout(1000);
        }

        await page.screenshot({ path: 'tests/screenshots/address-outside-area.png', fullPage: true });

        // Should show error message for Suffolk County
        const invalidMessage = page.locator('text=outside our service area');
        const hasInvalidMessage = await invalidMessage.isVisible().catch(() => false);

        console.log('Invalid message for Boston:', hasInvalidMessage);
    });

    test('debug: check if Google Maps API is loading', async ({ page }) => {
        await page.goto('http://localhost:3000/crm/customers/create');

        // Listen for console logs
        page.on('console', msg => {
            console.log('Browser console:', msg.type(), msg.text());
        });

        // Listen for errors
        page.on('pageerror', err => {
            console.log('Page error:', err.message);
        });

        await page.waitForTimeout(3000);

        // Check if google.maps is defined
        const googleMapsLoaded = await page.evaluate(() => {
            return typeof (window as any).google !== 'undefined' &&
                typeof (window as any).google.maps !== 'undefined';
        });

        console.log('Google Maps API loaded:', googleMapsLoaded);

        // Check for any network errors loading the script
        await page.screenshot({ path: 'tests/screenshots/debug-page-state.png', fullPage: true });
    });
});
