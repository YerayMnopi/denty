import type { Page } from "@playwright/test";

/**
 * Navigate to a URL and wait for the app to be fully hydrated.
 * TanStack Start SSR renders HTML server-side, then hydrates client-side.
 * We wait for JS to be fully loaded and interactive.
 */
export async function gotoAndWaitForHydration(page: Page, url: string) {
	await page.goto(url);
	await page.waitForLoadState("networkidle");
	// Wait for client-side hydration — TanStack Start attaches event listeners
	// after the client bundle loads and React hydrates the server-rendered HTML
	await page.waitForFunction(
		() => document.readyState === "complete",
		{ timeout: 30_000 },
	);
	// Buffer for React to finish attaching event handlers post-hydration
	await page.waitForTimeout(1000);
}
