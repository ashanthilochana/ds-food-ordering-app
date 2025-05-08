import { By, until } from 'selenium-webdriver';
import { setupDriver, BASE_URL, TEST_USERS, TEST_NEW_USER } from '../setup/testSetup.js';
import { logger } from '../utils/logger.js';
import assert from 'assert';

async function waitAndType(driver, selector, text) {
    const element = await driver.wait(until.elementLocated(By.css(selector)), 5000);
    await element.clear();
    await element.sendKeys(text);
}

describe('Authentication Tests', function() {
    this.timeout(30000); // Increase timeout for auth tests
    let driver;

    beforeEach(async function() {
        logger.log(`Starting test: ${this.currentTest.title}`);
        driver = await setupDriver();
    });

    afterEach(async function() {
        if (this.currentTest.state === 'failed') {
            await logger.takeScreenshot(driver, `${this.currentTest.title}-failed`);
        }
        logger.log(`Test completed: ${this.currentTest.title} (${this.currentTest.state})`);
        await driver.quit();
    });

    it('should successfully register a new user', async function() {
        await driver.get(`${BASE_URL}/signup`);
        await driver.wait(until.elementLocated(By.css('h1')), 5000);
        await logger.takeScreenshot(driver, 'register-form-initial');
        
        // Fill in registration form
        await waitAndType(driver, '#name', TEST_NEW_USER.name);
        await waitAndType(driver, '#email', TEST_NEW_USER.email);
        await waitAndType(driver, '#password', TEST_NEW_USER.password);
        await waitAndType(driver, '#confirmPassword', TEST_NEW_USER.password);
        
        // Select role
        const roleSelect = await driver.findElement(By.css('#role'));
        await roleSelect.click();
        await driver.findElement(By.css('li[data-value="customer"]')).click();
        
        await logger.takeScreenshot(driver, 'register-form-filled');
        
        // Submit form
        const submitButton = await driver.findElement(By.css('button[type="submit"]'));
        await submitButton.click();
        
        // Wait for redirect to restaurants page (auto-login after registration)
        await driver.wait(until.urlContains('/restaurants'), 10000);
        await logger.takeScreenshot(driver, 'register-success-redirect');
        
        const currentUrl = await driver.getCurrentUrl();
        assert(currentUrl.includes('/restaurants'), 'Should redirect to restaurants page after registration');
    });

    it('should successfully login as customer', async function() {
        await driver.get(`${BASE_URL}/login`);
        await driver.wait(until.elementLocated(By.css('h1')), 5000);
        await logger.takeScreenshot(driver, 'login-form-initial');
        
        // Fill in login form
        await waitAndType(driver, '#email', TEST_USERS.customer.email);
        await waitAndType(driver, '#password', TEST_USERS.customer.password);
        
        await logger.takeScreenshot(driver, 'login-form-filled');
        
        // Submit form
        const submitButton = await driver.findElement(By.css('button[type="submit"]'));
        await submitButton.click();
        
        // Wait for redirect to restaurants page
        await driver.wait(until.urlContains('/restaurants'), 10000);
        await logger.takeScreenshot(driver, 'login-success-redirect');
        
        const currentUrl = await driver.getCurrentUrl();
        assert(currentUrl.includes('/restaurants'), 'Should redirect to restaurants page after login');
    });
});
