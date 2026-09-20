import { test, expect } from '@playwright/test';

// Helper to log in cleanly across desktop and mobile viewports
async function loginAsAdmin(page: any) {
  await page.goto('/login');
  // Click visible Admin demo button
  const adminDemoBtn = page.locator('button:visible').filter({ hasText: 'Admin' }).or(page.locator('button:visible').filter({ hasText: 'நிர்வாகி' })).first();
  await expect(adminDemoBtn).toBeVisible({ timeout: 5000 });
  await adminDemoBtn.click();

  // Submit via visible submit button
  const submitBtn = page.locator('button:visible[type="submit"]').first();
  await expect(submitBtn).toBeVisible({ timeout: 5000 });
  await submitBtn.click();

  // Wait for Dashboard
  await page.waitForURL('/', { timeout: 10000 });
}

test.describe('GreenLife Natural Foods - Production Verification Suite', () => {

  test('1. Auth Login Flow - Demo Fill and Dashboard Access', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/GreenLife/);

    // Verify login page elements (desktop or mobile)
    await expect(page.locator(':visible').filter({ hasText: 'GreenLife' }).first()).toBeVisible();

    // Click Admin Demo Fill button
    const adminDemoBtn = page.locator('button:visible').filter({ hasText: 'Admin' }).or(page.locator('button:visible').filter({ hasText: 'நிர்வாகி' })).first();
    await expect(adminDemoBtn).toBeVisible();
    await adminDemoBtn.click();

    // Verify email and password filled
    const emailInput = page.locator('input:visible[type="email"]').first();
    await expect(emailInput).toHaveValue('admin@greenlife.com');

    // Submit login form
    const submitBtn = page.locator('button:visible[type="submit"]').first();
    await submitBtn.click();

    // Verify redirected to Dashboard
    await page.waitForURL('/', { timeout: 10000 });
    await expect(page).toHaveURL('/');
  });

  test('2. Light and Dark Theme Toggle Engine', async ({ page }) => {
    await loginAsAdmin(page);

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
    await loginAsAdmin(page);

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
    await loginAsAdmin(page);

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
    await loginAsAdmin(page);

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
    await loginAsAdmin(page);

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
    await loginAsAdmin(page);

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
    await loginAsAdmin(page);

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
    await loginAsAdmin(page);

    // Click logout in navbar
    const logoutBtn = page.locator('button[title*="Sign Out"]').or(page.locator('button[title*="Logout"]')).or(page.locator('button[title*="வெளியேறு"]')).or(page.locator('svg.lucide-log-out').locator('xpath=..')).first();
    await logoutBtn.click();

    // Verify redirected back to Login
    await page.waitForURL('/login', { timeout: 10000 });
    await expect(page).toHaveURL('/login');
  });

  test('10. Mobile Phone Viewport (Leafora Theme & Bottom Dock)', async ({ page }) => {
    // Set iPhone mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/login');

    // Verify mobile botanical card elements
    const mobileHeader = page.locator(':visible').filter({ hasText: 'GreenLife' }).first();
    await expect(mobileHeader).toBeVisible();

    // Fill demo credentials on mobile
    const adminDemoChip = page.locator('button:visible').filter({ hasText: 'Admin' }).or(page.locator('button:visible').filter({ hasText: 'நிர்வாகி' })).first();
    await expect(adminDemoChip).toBeVisible();
    await adminDemoChip.click();

    // Submit on mobile
    await page.locator('button:visible[type="submit"]').first().click();
    await page.waitForURL('/', { timeout: 10000 });

    // Verify Mobile Bottom Dock is present and visible
    const bottomNav = page.locator('nav:visible').filter({ hasText: 'Home' }).or(page.locator('nav:visible').filter({ hasText: 'முகப்பு' })).first();
    await expect(bottomNav).toBeVisible();

    // Verify Mobile Botanical Hero Card
    await expect(page.locator('text=Bring Natural Living Home').or(page.locator('text=இயற்கை வழி வாழ்வியல் இல்லம்')).first()).toBeVisible();

    // Verify Mobile Category Pills
    await expect(page.locator('text=All').or(page.locator('text=எல்லாமே')).first()).toBeVisible();

    // Test Navigation via Mobile Dock to Products
    const productsTab = page.locator('nav[aria-label="Mobile Bottom Navigation"] a[href="/products"]').first();
    await productsTab.click();
    await page.waitForURL('/products');
    await expect(page.locator('text=Cold Pressed Coconut Oil').first()).toBeVisible();

    // Test Navigation via Mobile Dock to New Bill
    const newBillTab = page.locator('nav[aria-label="Mobile Bottom Navigation"] a[href="/orders/new"]').first();
    await newBillTab.click();
    await page.waitForURL('/orders/new');

    // Verify Mobile Floating Sticky Checkout Dock
    await expect(page.locator('text=Grand Total').or(page.locator('text=மொத்த பில் தொகை')).first()).toBeVisible();
  });

});
