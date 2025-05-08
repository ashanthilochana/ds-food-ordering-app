import { Builder, Browser } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { logger } from '../utils/logger.js';

// Helper function to add visible delays in tests
export async function pauseForDemo(driver, ms = 1000) {
    console.log(`Pausing for ${ms}ms to show the action...`);
    await driver.sleep(ms);
}

export async function setupDriver() {
    const options = new chrome.Options();
    options.addArguments('--start-maximized'); // Start with maximized window

    const driver = await new Builder()
        .forBrowser(Browser.CHROME)
        .setChromeOptions(options)
        .build();

    logger.log('Browser session started');

    // Add a helper method to the driver for visible delays
    driver.visibleDelay = async (ms) => {
        console.log(`Waiting for ${ms}ms...`);
        await driver.sleep(ms);
    };

    return driver;
}

export const BASE_URL = 'http://localhost:3000'; // Update with your Vite dev server port

export const TEST_USERS = {
    customer: {
        email: 'customer@foodapp.com',
        password: 'Customer123!',
        role: 'customer'
    },
    restaurant: {
        email: 'restaurant@foodapp.com',
        password: 'Restaurant123!',
        role: 'restaurant_admin'
    },
    delivery: {
        email: 'delivery@foodapp.com',
        password: 'Delivery123!',
        role: 'delivery_person'
    }
};

export const TEST_NEW_USER = {
    name: 'Test User',
    email: `test.user.${Date.now()}@test.com`,
    password: 'TestUser123!',
    role: 'customer'
};
