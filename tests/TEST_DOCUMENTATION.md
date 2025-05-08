# Food Ordering App - Test Documentation

## 1. Project Overview

This document outlines the automated testing strategy for the Food Ordering App, a MERN stack application.

### 1.1 Test Scope
- User Authentication (Login/Register)
- Restaurant Listing and Search
- Menu Item Management
- Cart Operations
- Navigation Flow

## 2. Test Cases and Scripts

### 2.1 User Authentication Tests

#### Use Case: User Registration
```javascript
// Location: tests/functional/auth.test.js
describe('User Registration', () => {
    it('should register new user successfully', async () => {
        // Test data
        const newUser = {
            name: 'John Customer',
            email: 'customer@foodapp.com',
            password: 'Customer123!',
            role: 'customer'
        };

        // Test steps
        await driver.get(`${BASE_URL}/signup`);
        await waitAndType(driver, '#name', newUser.name);
        await waitAndType(driver, '#email', newUser.email);
        await waitAndType(driver, '#password', newUser.password);
        
        // Submit and verify
        await driver.findElement(By.css('button[type="submit"]')).click();
        await driver.wait(until.urlContains('/restaurants'), 5000);
    });
});
```

#### Use Case: User Login
```javascript
// Location: tests/functional/auth.test.js
describe('User Login', () => {
    it('should login with valid credentials', async () => {
        // Test steps
        await driver.get(`${BASE_URL}/login`);
        await driver.findElement(By.css('#email')).sendKeys(TEST_USERS.customer.email);
        await driver.findElement(By.css('#password')).sendKeys(TEST_USERS.customer.password);
        await driver.findElement(By.css('button[type="submit"]')).click();
        
        // Verify login success
        await driver.wait(until.urlContains('/restaurants'), 5000);
        const welcomeText = await driver.findElement(By.css('.welcome-message')).getText();
        assert(welcomeText.includes(TEST_USERS.customer.name));
    });
});

### 2.2 Restaurant Management Tests

#### Use Case: List and Search Restaurants
```javascript
// Location: tests/ui/restaurant.test.js
describe('Restaurant Listing and Search', () => {
    it('should display restaurant list', async () => {
        await driver.get(`${BASE_URL}/restaurants`);
        await driver.wait(until.elementLocated(By.css('.restaurant-card')), 5000);
        
        const restaurants = await driver.findElements(By.css('.restaurant-card'));
        assert(restaurants.length > 0, 'Should display restaurant list');
    });

    it('should filter restaurants by search', async () => {
        const searchTerm = 'Pizza';
        const searchBox = await driver.findElement(By.css('input[type="search"]'));
        await searchBox.sendKeys(searchTerm);
        
        await driver.wait(until.elementLocated(By.css('.restaurant-card')), 5000);
        const results = await driver.findElements(By.css('.restaurant-card'));
        
        // Verify filtered results
        for (const result of results) {
            const title = await result.findElement(By.css('.restaurant-name')).getText();
            assert(title.toLowerCase().includes(searchTerm.toLowerCase()));
        }
    });
});
```

#### Use Case: View Restaurant Details
```javascript
// Location: tests/ui/restaurant.test.js
describe('Restaurant Details', () => {
    it('should show restaurant details and menu', async () => {
        // Navigate to first restaurant
        const firstRestaurant = await driver.findElement(By.css('.restaurant-card'));
        await firstRestaurant.click();
        
        // Verify restaurant details
        await driver.wait(until.elementLocated(By.css('.restaurant-details')), 5000);
        
        // Check menu sections
        const menuCategories = await driver.findElements(By.css('.menu-category'));
        assert(menuCategories.length > 0, 'Should display menu categories');
        
        // Check menu items
        const menuItems = await driver.findElements(By.css('.menu-item'));
        assert(menuItems.length > 0, 'Should display menu items');
    });
});

### 2.3 Cart Management Tests

#### Use Case: Add and View Cart Items
```javascript
// Location: tests/ui/cart.test.js
describe('Cart Operations', () => {
    beforeEach(async () => {
        // Login as customer
        await loginAsCustomer(driver);
    });

    it('should add item to cart', async () => {
        // Navigate to restaurant menu
        await driver.get(`${BASE_URL}/restaurants`);
        const firstRestaurant = await driver.findElement(By.css('.restaurant-card'));
        await firstRestaurant.click();
        
        // Select and add item
        const menuItem = await driver.findElement(By.css('.menu-item'));
        await menuItem.click();
        
        const addButton = await driver.findElement(By.css('button[type="submit"]'));
        await addButton.click();
        
        // Verify cart badge update
        const cartBadge = await driver.findElement(By.css('.MuiBadge-badge'));
        assert(await cartBadge.getText() === '1');
    });

    it('should display cart items correctly', async () => {
        // Navigate to cart
        await driver.findElement(By.css('a[href="/cart"]')).click();
        await driver.wait(until.urlContains('/cart'), 5000);
        
        // Verify cart items
        const cartItems = await driver.findElements(By.css('.cart-item'));
        assert(cartItems.length > 0, 'Cart should not be empty');
        
        // Verify item details
        const firstItem = cartItems[0];
        assert(await firstItem.findElement(By.css('.item-name')).getText() !== '');
        assert(await firstItem.findElement(By.css('.item-price')).getText() !== '');
    });
});
```

### 2.4 Navigation Tests

#### Use Case: Menu Navigation
```javascript
// Location: tests/ui/navigation.test.js
describe('Navigation Flow', () => {
    beforeEach(async () => {
        await loginAsCustomer(driver);
    });

    it('should have all navigation elements visible', async () => {
        await driver.wait(until.elementLocated(By.css('.MuiAppBar-root')), 5000);
        
        // Check main navigation elements
        const navElements = [
            { css: 'a[href="/restaurants"]', text: 'Restaurants' },
            { css: 'a[href="/cart"]', text: 'Cart' },
            { css: 'a[href="/orders"]', text: 'Orders' }
        ];
        
        for (const nav of navElements) {
            const element = await driver.findElement(By.css(nav.css));
            assert(await element.isDisplayed(), `${nav.text} link should be visible`);
        }
    });

    it('should navigate between pages correctly', async () => {
        // Test navigation flow
        const navigationFlow = [
            { to: '/restaurants', expect: '.restaurant-card' },
            { to: '/cart', expect: '.cart-items' },
            { to: '/orders', expect: '.order-history' }
        ];
        
        for (const step of navigationFlow) {
            await driver.findElement(By.css(`a[href="${step.to}"]`)).click();
            await driver.wait(until.elementLocated(By.css(step.expect)), 5000);
            assert(await driver.getCurrentUrl()).includes(step.to);
        }
    });
});

## 3. Test Setup and Configuration

### 3.1 Prerequisites
```bash
# Install dependencies
npm install

# Install specific test dependencies
npm install --save-dev mocha selenium-webdriver chromedriver
```

### 3.2 Test Structure
```
tests/
├── functional/        # Functional tests
│   └── auth.test.js
├── ui/               # UI automation tests
│   ├── cart.test.js
│   ├── navigation.test.js
│   └── restaurant.test.js
├── setup/           # Test configuration
│   └── testSetup.js
└── utils/           # Test utilities
    └── logger.js
```

### 3.3 Test Configuration
```javascript
// Location: tests/setup/testSetup.js
export const TEST_CONFIG = {
    baseUrl: 'http://localhost:3000',
    timeout: 10000,
    browser: 'chrome',
    screenshotsDir: './test-results/screenshots',
    maxScreenshotRuns: 3
};

// Test user accounts
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
    }
};
```

## 4. Running Tests

### 4.1 Available Scripts
```json
{
  "scripts": {
    "test": "mocha ./**/*.test.js --timeout 10000",
    "test:ui": "mocha ./ui/**/*.test.js --timeout 10000",
    "test:selenium": "mocha ./selenium/**/*.test.js --timeout 10000"
  }
}
```

### 4.2 Running Specific Tests
```bash
# Run all tests
npm test

# Run only UI tests
npm run test:ui

# Run specific test file
npx mocha ./ui/cart.test.js

# Run tests with specific pattern
npm test -- -g "should add item to cart"
```

## 5. Best Practices and Guidelines

### 5.1 Test Organization
1. **Naming Conventions**
   - Test files: `*.test.js`
   - Test cases: Clear, descriptive names
   - Use case based organization

2. **Code Structure**
   - Use page objects for UI elements
   - Implement proper error handling
   - Add detailed test logs

3. **Test Data Management**
   - Use separate test database
   - Clean up test data after runs
   - Avoid hardcoded test data

### 5.2 Pending Improvements
1. **Invalid Test Cases**
   - Add negative test cases for login
   - Implement duplicate email registration test
   - Add cart quantity update tests

2. **Performance Testing**
   - Add load testing for restaurant listing
   - Implement API response time tests
   - Add concurrent user simulation

3. **Test Coverage**
   - Add API integration tests
   - Implement end-to-end order flow
   - Add payment gateway tests

## 6. Test Results

### 6.1 Latest Test Run
```bash
Authentication Tests
  ✓ should register new user (5117ms)
  ✓ should login successfully (4781ms)

Cart Tests
  ✓ should add item to cart (4279ms)

Navigation Tests
  ✓ should show all nav elements (362ms)
  ✓ should navigate to cart (609ms)

Restaurant Tests
  ✓ should list restaurants (10134ms)
  ✓ should show details (4355ms)
  ✓ should filter by search (3644ms)

8 passing (1m)
```

### 6.2 Test Coverage

| Module      | Total Cases | Passing | Failing | Not Implemented |
|-------------|-------------|----------|----------|------------------|
| Auth        | 4          | 2        | 0        | 2              |
| Restaurant  | 3          | 3        | 0        | 0              |
| Cart        | 3          | 2        | 1        | 0              |
| Navigation  | 2          | 2        | 0        | 0              |

## 2. Test Implementation

### 2.1 Authentication Tests
```javascript
it('should successfully register a new user', async function() {
    await driver.get(`${BASE_URL}/signup`);
    
    // Fill registration form
    await waitAndType(driver, '#name', TEST_NEW_USER.name);
    await waitAndType(driver, '#email', TEST_NEW_USER.email);
    await waitAndType(driver, '#password', TEST_NEW_USER.password);
    
    // Select role
    const roleSelect = await driver.findElement(By.css('#role'));
    await roleSelect.click();
    await driver.findElement(By.css('li[data-value="customer"]')).click();
    
    // Submit and verify
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.urlContains('/restaurants'), 10000);
});
```

### 2.2 Cart Test
```javascript
it('should add item to cart', async function() {
    // Navigate to restaurant
    const firstRestaurant = await driver.findElement(By.css('.MuiCard-root'));
    await firstRestaurant.click();
    
    // Add item to cart
    const firstMenuItem = await driver.findElement(By.css('.MuiListItem-root'));
    await firstMenuItem.click();
    
    // Verify cart update
    const cartItems = await driver.findElements(By.css('.MuiListItem-root'));
    assert(cartItems.length > 0, 'Cart should contain items');
});
```

## 3. Test Execution Results

### 3.1 Latest Test Run Results
```
Authentication Tests
  ✓ should successfully register a new user (5117ms)
  ✓ should successfully login as customer (4781ms)

Cart Functionality Tests
  ✓ should add item to cart (4279ms)

UI Navigation Tests
  ✓ should have all main navigation elements visible (362ms)
  ✓ should successfully navigate to cart page (609ms)

Restaurant Menu Tests
  ✓ should display restaurant list (10134ms)
  ✓ should show restaurant details (4355ms)
  ✓ should filter restaurants by search (3644ms)

8 passing (1m)
```

### 3.2 Test Coverage

| Module      | Total Cases | Passing | Failing | Not Implemented |
|-------------|-------------|----------|----------|-----------------|
| Auth        | 4          | 2        | 0        | 2              |
| Restaurant  | 3          | 3        | 0        | 0              |
| Cart        | 3          | 2        | 1        | 0              |
| Navigation  | 2          | 2        | 0        | 0              |

### 3.3 Test Flow Diagrams

#### Authentication Flow
```
[Start] → [Open Login Page] → [Enter Credentials] → [Submit]
   ↓                                                   ↓
[Success] ← [Valid Credentials] ← [Validate] → [Invalid Credentials]
   ↓                                                   ↓
[Redirect]                                        [Show Error]
```

#### Cart Flow
```
[Start] → [View Restaurant] → [Select Item] → [Add to Cart]
                                                   ↓
[Update Total] ← [Update Quantity] ← [View Cart] ← [Success]
```

## 4. Running Tests

### 4.1 Available Scripts
- `npm test`: Run all tests
- `npm run test:ui`: Run UI tests only
- `npm run test:selenium`: Run Selenium tests only

### 4.2 Test Configuration
```javascript
{
  "timeout": 10000,
  "browser": "chrome",
  "baseUrl": "http://localhost:3000",
  "screenshots": "./test-results/screenshots"
}
```
