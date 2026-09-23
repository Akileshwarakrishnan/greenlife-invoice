import { test, expect, type Page } from "@playwright/test";

test.use({ channel: "chrome", viewport: { width: 1440, height: 1000 } });

async function login(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: "Admin demo", exact: true }).click();
  await page
    .getByRole("button", { name: "Sign in to Dashboard", exact: true })
    .click();
  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("heading", { name: "Your store, at a glance." }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Store summary" }),
  ).toHaveAttribute("aria-busy", "false");
}

async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBeTruthy();
}

test("sign-in controls, account help and invalid credentials", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Forgot password?" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Contact your store administrator",
  );
  await page.getByRole("button", { name: "Admin demo", exact: true }).click();
  await expect(page.getByLabel("Email address", { exact: true })).toHaveValue(
    "admin@greenlife.com",
  );
  await page
    .getByRole("button", { name: "Show password", exact: true })
    .click();
  await expect(page.locator("#login-password")).toHaveAttribute("type", "text");
  await page
    .getByRole("button", { name: "Hide password", exact: true })
    .click();
  await expect(page.locator("#login-password")).toHaveAttribute(
    "type",
    "password",
  );
  await page.locator("#login-password").fill("incorrect-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page).toHaveURL("/login");
});

test("remember me controls session persistence", async ({ page, context }) => {
  await page.goto("/login");
  await page.getByLabel("Remember me", { exact: true }).uncheck();
  await page.getByRole("button", { name: "Admin demo", exact: true }).click();
  await page.getByRole("button", { name: "Sign in to Dashboard", exact: true }).click();
  await expect(page).toHaveURL("/");
  expect(await page.evaluate(() => !!sessionStorage.getItem("greenlife_token") && !localStorage.getItem("greenlife_token"))).toBeTruthy();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Your store, at a glance." })).toBeVisible();
  const otherTab = await context.newPage();
  await otherTab.goto("/");
  await expect(otherTab).toHaveURL("/login");
  await otherTab.close();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL("/login");
  expect(await page.evaluate(() => sessionStorage.getItem("greenlife_token"))).toBeNull();
  await login(page);
  expect(await page.evaluate(() => !!localStorage.getItem("greenlife_token") && !sessionStorage.getItem("greenlife_token"))).toBeTruthy();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Your store, at a glance." })).toBeVisible();
});

test("sign-in fits desktop and mobile screens", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Sign in", exact: true })).toBeVisible();
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 800 });
    await noOverflow(page);
    await expect(page.getByRole("button", { name: "Sign in to Dashboard", exact: true })).toBeInViewport();
    await expect(page.getByRole("link", { name: "Create an account" })).toBeInViewport();
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: "test-results/reference-login-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "test-results/reference-login-mobile.png" });
});

test("dashboard, reporting periods, themes and language", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  await login(page);
  await page.getByRole("button", { name: "Weekly", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Weekly", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Monthly", exact: true }).click();
  await expect(page.locator(".revenue-chart")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  await expect(page.locator(".recharts-xAxis-tick-labels text").first()).toBeVisible();
  await expect(page.locator(".recharts-area-curve")).toHaveAttribute("d", /[LC]/);
  await noOverflow(page);
  await page.screenshot({
    path: "test-results/redesign-dashboard-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.locator(".primary-button").first()).toHaveCSS("color", "rgb(25, 38, 30)");
  await expect(page.locator(".workspace-quicklinks strong").first()).toHaveCSS("color", "rgb(230, 238, 225)");
  await page.screenshot({
    path: "test-results/redesign-dashboard-dark.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await page.getByRole("button", { name: "தமிழ்", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "ta");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "உங்கள் கடை, ஒரே பார்வையில்.",
  );
  await page.getByRole("button", { name: "English", exact: true }).click();
  expect(errors).toEqual([]);
});

test("workspace routes retain their forms and tables on desktop and mobile", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  await login(page);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/invoices",
      "/customers",
      "/products",
      "/purchases",
      "/reports",
      "/orders/new",
      "/orders",
      "/profile",
      "/settings",
      "/ai-extraction",
      "/automation",
      "/manual",
    ]) {
      await page.goto(route);
      await expect(page.locator("#workspace-content h1")).toBeVisible();
      await expect(page.locator("vite-error-overlay")).toHaveCount(0);
      await noOverflow(page);
    }
  }
  expect(errors).toEqual([]);
});

test("mobile navigation, keyboard dismissal and logout", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await noOverflow(page);
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/redesign-dashboard-mobile.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "Overview", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("link", { name: "Overview", exact: true }),
  ).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open navigation", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("navigation", { name: "Mobile navigation", exact: true })
    .getByRole("link", { name: "Stock" })
    .click();
  await expect(page).toHaveURL("/products");
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL("/login");
  await page.goto("/");
  await expect(page).toHaveURL("/login");
});

test("signup and Tamil public pages fit narrow viewports", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/signup");
  await expect(
    page.getByRole("heading", { name: "Join the team." }),
  ).toBeVisible();
  await expect(page.getByLabel("Full name")).toBeVisible();
  await expect(page.getByLabel("Your role")).toHaveValue("staff");
  await noOverflow(page);
  await page.getByRole("button", { name: "தமிழ்", exact: true }).click();
  await noOverflow(page);
  await page.goto("/login");
  await expect(page.locator("html")).toHaveAttribute("lang", "ta");
  await noOverflow(page);
});
