import { By, until } from 'selenium-webdriver';
import { setupDriver, BASE_URL, TEST_USERS } from '../setup/testSetup.js';
import { logger } from '../utils/logger.js';
import assert from 'assert';

describe('Cart Functionality Tests', function() {
    this.timeout(30000); // Increase timeout for cart tests
    let driver;

    beforeEach(async function() {
        logger.log(`Starting test: ${this.currentTest.title}`);
        driver = await setupDriver();
        
        // Login as customer
        await driver.get(`${BASE_URL}/login`);
        await driver.wait(until.elementLocated(By.css('#email')), 5000);
        await driver.findElement(By.css('#email')).sendKeys(TEST_USERS.customer.email);
        await driver.findElement(By.css('#password')).sendKeys(TEST_USERS.customer.password);
        await driver.findElement(By.css('button[type="submit"]')).click();
        await driver.wait(until.urlContains('/restaurants'), 10000);
        await logger.takeScreenshot(driver, 'cart-test-login');
    });

    afterEach(async function() {
        if (this.currentTest.state === 'failed') {
            await logger.takeScreenshot(driver, `${this.currentTest.title}-failed`);
        }
        logger.log(`Test completed: ${this.currentTest.title} (${this.currentTest.state})`);
        await driver.quit();
    });

    it('should add item to cart', async function() {
        // Navigate to restaurant menu
        await driver.wait(until.elementLocated(By.css('.MuiAppBar-root')), 5000);
        await logger.takeScreenshot(driver, 'restaurants-page-initial');
        
        // Wait for restaurants to load
        await driver.wait(until.elementLocated(By.css('.MuiCard-root')), 10000);
        await logger.takeScreenshot(driver, 'restaurants-loaded');

        // Click on first restaurant
        const firstRestaurant = await driver.findElement(By.css('.MuiCard-root'));
        await firstRestaurant.click();
        
        // Wait for menu items to load
        await driver.wait(until.elementLocated(By.css('.MuiCard-root')), 10000);
        await logger.takeScreenshot(driver, 'menu-items-loaded');
        
        // Wait for menu items to load and click on first item
        await driver.wait(until.elementLocated(By.css('.MuiListItem-root')), 10000);
        const firstMenuItem = await driver.findElement(By.css('.MuiListItem-root'));
        await firstMenuItem.click();
        await logger.takeScreenshot(driver, 'menu-item-dialog');
        
        // Wait for dialog to appear and add item to cart
        await driver.wait(until.elementLocated(By.css('.MuiDialog-paper')), 10000);
        const addToCartBtn = await driver.findElement(By.css('.MuiDialog-paper button[type="submit"], .MuiDialog-paper .MuiButton-containedPrimary'));
        await addToCartBtn.click();
        await logger.takeScreenshot(driver, 'item-added-to-cart');
        
        // Wait for success message and navigate to cart
        await driver.sleep(1000); // Wait for cart update
        const cartIconBadge = await driver.findElement(By.css('.MuiBadge-badge'));
        await driver.wait(until.elementIsVisible(cartIconBadge), 10000);
        
        // Click cart icon
        const cartIcon = await driver.findElement(By.css('a[href="/cart"]'));
        await cartIcon.click();
        await driver.wait(until.urlContains('/cart'), 10000);
        
        // Wait for cart items to load
        await driver.wait(until.elementLocated(By.css('.MuiList-root')), 5000);
        await logger.takeScreenshot(driver, 'cart-items-loaded');
        
        // Verify item is in cart
        const cartItems = await driver.findElements(By.css('.MuiListItem-root'));
        assert(cartItems.length > 0, 'Cart should contain at least one item');
        await logger.takeScreenshot(driver, 'cart-verification');
    });

    // TODO: Implement cart quantity update test after fixing the UI issues
    // it('should update cart item quantity', async function() {
    //     // Test removed temporarily due to UI synchronization issues
    // });
});
