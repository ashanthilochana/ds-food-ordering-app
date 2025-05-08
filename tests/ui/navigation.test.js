import { By, until } from 'selenium-webdriver';
import { setupDriver, BASE_URL, TEST_USERS } from '../setup/testSetup.js';
import { logger } from '../utils/logger.js';
import assert from 'assert';

describe('UI Navigation Tests', function() {
    this.timeout(30000); // Increase timeout for UI tests
    let driver;

    beforeEach(async function() {
        logger.log(`Starting test: ${this.currentTest.title}`);
        driver = await setupDriver();
        
        // Login as customer first
        await driver.get(`${BASE_URL}/login`);
        await driver.wait(until.elementLocated(By.css('#email')), 5000);
        await driver.findElement(By.css('#email')).sendKeys(TEST_USERS.customer.email);
        await driver.findElement(By.css('#password')).sendKeys(TEST_USERS.customer.password);
        await driver.findElement(By.css('button[type="submit"]')).click();
        await driver.wait(until.urlContains('/restaurants'), 10000);
        await logger.takeScreenshot(driver, 'navigation-test-login');
    });

    afterEach(async function() {
        if (this.currentTest.state === 'failed') {
            await logger.takeScreenshot(driver, `${this.currentTest.title}-failed`);
        }
        logger.log(`Test completed: ${this.currentTest.title} (${this.currentTest.state})`);
        await driver.quit();
    });

    it('should have all main navigation elements visible', async function() {
        // Wait for AppBar to be visible
        await driver.wait(until.elementLocated(By.css('.MuiAppBar-root')), 5000);
        await logger.takeScreenshot(driver, 'navigation-menu-visible');
        
        // Check main navigation elements
        const navElements = await driver.findElements(By.css('.MuiToolbar-root button'));
        assert(navElements.length > 0, 'Navigation menu should be visible');

        // Check if profile icon is accessible
        const profileIcon = await driver.findElement(By.css('[aria-label="account"]'));
        assert(profileIcon, 'Profile menu should be visible');
        
        await logger.takeScreenshot(driver, 'profile-menu-visible');
    });

    it('should successfully navigate to cart page', async function() {
        // Wait for AppBar to be visible
        await driver.wait(until.elementLocated(By.css('.MuiAppBar-root')), 5000);
        await logger.takeScreenshot(driver, 'before-cart-navigation');
        
        // Click on cart icon
        const cartIcon = await driver.findElement(By.css('.MuiIconButton-root .MuiBadge-root'));
        await cartIcon.click();
        
        // Wait for cart page to load
        await driver.wait(until.urlContains('/cart'), 10000);
        await logger.takeScreenshot(driver, 'cart-page-loaded');
        
        // Verify cart page elements
        await driver.wait(until.elementLocated(By.css('.MuiContainer-root')), 5000);
        const cartTitleElements = await driver.findElements(By.css('.MuiTypography-h4, .MuiTypography-h5, .MuiTypography-h6'));
        let foundCartTitle = false;
        
        for (const element of cartTitleElements) {
            const text = await element.getText();
            if (text.toLowerCase().includes('cart') || text.toLowerCase().includes('shopping')) {
                foundCartTitle = true;
                break;
            }
        }
        
        assert(foundCartTitle, 'Cart page title should be visible');
        
        await logger.takeScreenshot(driver, 'cart-page-verified');
    });
});
