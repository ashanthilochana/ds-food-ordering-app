import { By, until } from 'selenium-webdriver';
import { setupDriver, BASE_URL, TEST_USERS, pauseForDemo } from '../setup/testSetup.js';
import { logger } from '../utils/logger.js';
import assert from 'assert';

describe('Restaurant Menu Tests (Slow Mode)', function() {
    before(function() {
        logger.init(); // Initialize logger and clean up old screenshots
    });

    this.timeout(60000); // Increase timeout for slow mode
    let driver;

    beforeEach(async function() {
        logger.setCurrentTest(this.currentTest.title);
        logger.log(`Starting test: ${this.currentTest.title}`);
        driver = await setupDriver();
        
        // Login as customer with visible delays
        await driver.get(`${BASE_URL}/login`);
        await pauseForDemo(driver, 1000);
        
        await driver.wait(until.elementLocated(By.css('#email')), 10000);
        const emailInput = await driver.findElement(By.css('#email'));
        await emailInput.sendKeys(TEST_USERS.customer.email);
        await pauseForDemo(driver, 1000);
        
        const passwordInput = await driver.findElement(By.css('#password'));
        await passwordInput.sendKeys(TEST_USERS.customer.password);
        await pauseForDemo(driver, 1000);
        
        await driver.findElement(By.css('button[type="submit"]')).click();
        await driver.wait(until.urlContains('/restaurants'), 10000);
        await logger.takeScreenshot(driver, 'restaurant-test-login');
        await pauseForDemo(driver, 1000);
    });

    afterEach(async function() {
        if (this.currentTest.state === 'failed') {
            await logger.takeScreenshot(driver, `${this.currentTest.title}-failed`);
        }
        logger.log(`Test completed: ${this.currentTest.title} (${this.currentTest.state})`);
        await pauseForDemo(driver, 2000); // Pause before closing browser
        await driver.quit();
    });

    it('should display restaurant list', async function() {
        // Wait for restaurants to load
        await driver.wait(until.elementLocated(By.css('.MuiCard-root')), 10000);
        await logger.takeScreenshot(driver, 'restaurants-loaded');
        await pauseForDemo(driver, 2000);

        // Verify multiple restaurants are displayed
        const restaurants = await driver.findElements(By.css('.MuiCard-root'));
        assert(restaurants.length > 0, 'Should display at least one restaurant');
        
        // Highlight each restaurant card
        for (const restaurant of restaurants) {
            await driver.executeScript("arguments[0].style.border='2px solid red'", restaurant);
            await pauseForDemo(driver, 500);
        }
    });

    it('should show restaurant details', async function() {
        // Wait for restaurants to load
        await driver.wait(until.elementLocated(By.css('.MuiCard-root')), 10000);
        await pauseForDemo(driver, 1000);
        
        // Click first restaurant
        const firstRestaurant = await driver.findElement(By.css('.MuiCard-root'));
        await driver.executeScript("arguments[0].style.border='2px solid red'", firstRestaurant);
        await pauseForDemo(driver, 1000);
        await firstRestaurant.click();
        
        await logger.takeScreenshot(driver, 'restaurant-details');
        await pauseForDemo(driver, 2000);

        // Verify restaurant details are displayed
        await driver.wait(until.elementLocated(By.css('h4, h5, h6')), 10000);
        const restaurantName = await driver.findElement(By.css('h4, h5, h6'));
        const nameText = await restaurantName.getText();
        assert(nameText.length > 0, 'Restaurant name should be displayed');
    });

    it('should filter restaurants by search', async function() {
        // Wait for search input
        await driver.wait(until.elementLocated(By.css('input[type="text"]')), 10000);
        const searchInput = await driver.findElement(By.css('input[type="text"]'));
        await driver.executeScript("arguments[0].style.border='2px solid red'", searchInput);
        await pauseForDemo(driver, 1000);
        
        // Get initial restaurant count
        const initialRestaurants = await driver.findElements(By.css('.MuiCard-root'));
        const initialCount = initialRestaurants.length;
        
        // Enter search term
        await searchInput.sendKeys('Pizza');
        await pauseForDemo(driver, 2000);
        await logger.takeScreenshot(driver, 'restaurant-search-results');
        
        // Get filtered restaurant count
        const filteredRestaurants = await driver.findElements(By.css('.MuiCard-root'));
        assert(filteredRestaurants.length <= initialCount, 'Search should filter restaurants');
    });
});
