import { expect, test } from '@playwright/test';

test('about page has expected h1', async ({ page }) => {
	await page.goto('/about');
	expect(await page.textContent('h1')).toBe('About this app');
});

test('submits sverdle guess', async ({ page }) => {
	await page.goto('/sverdle');
	const input = page.locator('input[name=guess]').first();
	await expect(input).not.toBeDisabled();
	await input.focus();

	await page.keyboard.type('AZURE');
	await page.keyboard.press('Enter');

	await expect(input).toHaveValue('a');
	await expect(input).toBeDisabled();
});

test('can call custom API azure function', async ({ request }) => {
	const response = await request.post('/api/HelloWorld', {
		data: {
			name: 'Geoff'
		}
	});
	expect(response.ok()).toBeTruthy();
});
