import { test, expect } from '@playwright/test';

test.describe('GreenLife Natural Foods - Production Verification Suite', () => {

  test('1. Auth Login Flow - Demo Fill and Dashboard Access', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/GreenLife/);

    // Verify login page elements
    await expect(page.locator('text=Sign in').first()).toBeVisible();

    // Click Admin Demo Fill button
    const adminDemoBtn = page.locator('text=Admin Demo').or(page.locator('text=நிர்வாகி')).first();
    await expect(adminDemoBtn).toBeVisible();
    await adminDemoBtn.click();

    // Verify email and password filled
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveValue('admin@greenlife.com');

    // Submit login form
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Verify redirected to Dashboard
    await page.waitForURL('/', { timeout: 10000 });
    await expect(page).toHaveURL('/');
  });

  test('2. Light and Dark Theme Toggle Engine', async ({ page }) => {
    await page.goto('/login');
    await page.locator('text=Admin Demo').or(page.locator('text=நிர்வாகி')).first().click();
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('/');

    const html = page.locator('html');

    // Toggle button in Navbar
    const themeBtn = page.locator('button[title*="Mode"]').or(page.locator('button:has-text("Dark")')).or(page.locator('button:has-text("Light")')).or(page.locator('button:has-text("இரவு")')).or(page.locator('button:has-text("பகல்")')).first();
    await expect(themeBtn).toBeVisible();

    // 1. Switch to Dark Mode
    await themeBtn.click();
    await page.waitForTimeout(500);

    const isDark = await html.evaluate((el) => el.classList.contains('dark'));
    expect(isDark).toBeTruthy();

    // Verify dark mode background
    const bodyBgDark = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
    expect(bodyBgDark).not.toBe('rgb(255, 255, 255)');
    expect(bodyBgDark).not.toBe('rgb(247, 245, 239)');

    // 2. Switch back to Light Mode
    await themeBtn.click();
    await page.waitForTimeout(500);
    const isDarkAfter = await html.evaluate((el) => el.classList.contains('dark'));
    expect(isDarkAfter).toBeFalsy();
  });

  test('3. Language Switcher (English <-> Tamil)', async ({ page }) => {
    await page.goto('/login');
    await page.locator('text=Admin Demo').or(page.locator('text=நிர்வாகி')).first().click();
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('/');

    const langBtn = page.locator('button[title*="Tamil"]').or(page.locator('button[title*="English"]')).or(page.locator('button:has-text("தமிழ்")')).or(page.locator('button:has-text("English")')).first();
    await expect(langBtn).toBeVisible();

    // Switch to Tamil
    await langBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=முக்கிய வேலைகள்').or(page.locator('text=புதிய பில் போடுங்க')).first()).toBeVisible();

    // Switch back to English
    await langBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=MAIN ACTIONS').or(page.locator('text=Make New Bill')).first()).toBeVisible();
  });

  test('4. Product Catalog Listing & Search Filtering', async ({ page }) => {
    await page.goto('/login');
    await page.locator('text=Admin Demo').or(page.locator('text=நிர்வாகி')).first().click();
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('/');

    await page.goto('/products');
    await page.waitForURL('/products');

    // Verify organic products exist in catalog
    await expect(page.locator('text=Cold Pressed Coconut Oil').first()).toBeVisible();
    await expect(page.locator('text=Cold Pressed Groundnut Oil').first()).toBeVisible();

    // Test Search input
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('Coconut');
    await page.waitForTimeout(300);

    await expect(page.locator('text=Cold Pressed Coconut Oil').first()).toBeVisible();
    await expect(page.locator('text=Cold Pressed Groundnut Oil')).not.toBeVisible();
  });

  test('5. Customer Management - Create New Customer', async ({ page }) => {
    await page.goto('/login');
    await page.locator('text=Admin Demo').or(page.locator('text=நிர்வாகி')).first().click();
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('/');

    await page.goto('/customers');
    await page.waitForURL('/customers');

    // Click "+ Add New Customer" button in page header
    const addCustBtn = page.locator('button:has-text("Add New Customer")').or(page.locator('button:has-text("புதிய வாடிக்கையாளர்")')).first();
    await expect(addCustBtn).toBeVisible();
    await addCustBtn.click();

    // Modal opens - fill details
    const nameInput = page.locator('input[placeholder*="Raja"]').or(page.locator('input[placeholder*="ராஜா"]')).first();
    await nameInput.fill('Suresh Kumar');

    const phoneInput = page.locator('input[placeholder*="98421"]').first();
    await phoneInput.fill('9842155443');

    const addressInput = page.locator('textarea').first();
    await addressInput.fill('45 Kovai Main Road, Kangeyam');

    // Click "Save Customer"
    const saveBtn = page.locator('button[type="submit"]:has-text("Save Customer")').or(page.locator('button[type="submit"]:has-text("வாடிக்கையாளரைச் சேமி")')).first();
    await saveBtn.click();

    // Verify customer appears in table/list
    await expect(page.locator('text=Suresh Kumar').first()).toBeVisible({ timeout: 10000 });
  });

  test('6. New Order Billing Flow - Item Selection & Calculation', async ({ page }) => {
    await page.goto('/login');
    await page.locator('text=Admin Demo').or(page.locator('text=நிர்வாகி')).first().click();
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('/');

    await page.goto('/orders/new');
    await page.waitForURL('/orders/new');

    // Step 1: Select Customer by index
    const custSelect = page.locator('select').first();
    await custSelect.selectOption({ index: 1 });
    await page.waitForTimeout(500);

    // Step 2: Choose Product from catalog dropdown
    const productSelect = page.locator('select').nth(1);
    await productSelect.selectOption({ index: 1 });
    await page.waitForTimeout(500);

    // Verify Bill Summary appears
    await expect(page.locator('text=TOTAL BILL AMOUNT').or(page.locator('text=மொத்தம் செலுத்த வேண்டிய')).first()).toBeVisible();

    // Verify Save Bill button is ready
    const saveBillBtn = page.locator('button:has-text("Save Bill & Print Now")').or(page.locator('button:has-text("பில்லைச் சேமித்து")')).first();
    await expect(saveBillBtn).toBeVisible();

    // Submit the bill!
    await saveBillBtn.click();

    // Wait for redirect to invoice detail or invoices list
    await page.waitForURL(/\/invoices/, { timeout: 10000 });
  });

  test('7. Invoices Ledger Verification', async ({ page }) => {
    await page.goto('/login');
    await page.locator('text=Admin Demo').or(page.locator('text=நிர்வாகி')).first().click();
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('/');

    await page.goto('/invoices');
    await page.waitForURL('/invoices');

    // Verify Invoices list header
    await expect(page.locator('text=Invoices & Billing Ledger').or(page.locator('text=பில்லிங் லெட்ஜர்')).first()).toBeVisible();

    // Verify the invoice for Suresh Kumar is present
    await expect(page.locator('text=Suresh Kumar').first()).toBeVisible({ timeout: 5000 });

    // Verify WhatsApp button is present
    await expect(page.locator('text=WhatsApp').or(page.locator('text=வாட்ஸ்அப்')).first()).toBeVisible();
  });

  test('8. User Profile & Settings Navigation', async ({ page }) => {
    await page.goto('/login');
    await page.locator('text=Admin Demo').or(page.locator('text=நிர்வாகி')).first().click();
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('/');

    // Profile
    await page.goto('/profile');
    await page.waitForURL('/profile');
    await expect(page.locator('text=Akileshwar (Admin)').or(page.locator('text=admin@greenlife.com')).first()).toBeVisible();

    // Settings
    await page.goto('/settings');
    await page.waitForURL('/settings');
    await expect(page.locator('text=GreenLife Natural Foods').first()).toBeVisible();
  });

  test('9. Secure Logout Flow', async ({ page }) => {
    await page.goto('/login');
    await page.locator('text=Admin Demo').or(page.locator('text=நிர்வாகி')).first().click();
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('/');

    // Click logout in navbar
    const logoutBtn = page.locator('button[title*="Sign Out"]').or(page.locator('button[title*="Logout"]')).or(page.locator('button[title*="வெளியேறு"]')).or(page.locator('svg.lucide-log-out').locator('xpath=..')).first();
    await logoutBtn.click();

    // Verify redirected back to Login
    await page.waitForURL('/login', { timeout: 10000 });
    await expect(page).toHaveURL('/login');
    await expect(page.locator('text=Sign in').first()).toBeVisible();
  });

});
