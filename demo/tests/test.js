import { expect, test } from '@playwright/test';

test('about page has expected h1', async ({ page }) => {
	await page.goto('/about');
	expect(await page.textContent('h1')).toBe('About this app');
});

test('submits sverdle guess', async ({ page }) => {
	await page.goto('/sverdle');
	const input = page.locator('input[name=guess]').first();
	await expect(input).not.toBeDisabled();

	await page.keyboard.type('AZURE');
	await page.keyboard.press('Enter');

	await expect(input).toBeDisabled();
});
