const { Builder, By, until } = require('selenium-webdriver');
const edge = require('selenium-webdriver/edge');
const path = require('path');

async function automateShopifyCheckout() {
    const service = new edge.ServiceBuilder(path.resolve('C:\\WebDriver\\msedgedriver.exe')).build();

    let options = new edge.Options();
    options.addArguments('start-maximized'); // Ensure the Edge browser window is maximized

    let driver = await new Builder()
        .forBrowser('MicrosoftEdge')
        .setEdgeOptions(options)
        .usingServer(`http://localhost:9515`) // or appropriate server URL if using a remote server
        .build();

    try {
        // Navigate to your Shopify store
        console.log('Navigating to the Shopify store');
        await driver.get('https://teststore581112.myshopify.com');

        // Add an item to the cart
        console.log('Adding an item to the cart');
        await driver.wait(until.elementLocated(By.css('a[href="/products/test-car-product"]')), 30000);
        let productLink = await driver.findElement(By.css('a[href="/products/test-car-product"]'));
        await driver.executeScript("arguments[0].click();", productLink);

        // Wait for the "Add to Cart" button and click it
        console.log('Waiting for "Add to Cart" button');
        await driver.wait(until.elementLocated(By.css('button[name="add"]')), 30000);
        let addToCartButton = await driver.findElement(By.css('button[name="add"]'));
        await driver.executeScript("arguments[0].click();", addToCartButton);

        // Verify the item is added to the cart
        console.log('Verifying the item is added to the cart');
        await driver.wait(until.elementLocated(By.css('div.cart-count-bubble span[aria-hidden="true"]')), 30000);
        let cartCountElement = await driver.findElement(By.css('div.cart-count-bubble span[aria-hidden="true"]'));
        let cartCount = await cartCountElement.getText();
        console.log('Cart count:', cartCount);
        if (parseInt(cartCount) === 0) {
            throw new Error('Cart is still empty after adding the item.');
        }

        // Go to the cart page
        console.log('Going to the cart page');
        await driver.wait(until.elementLocated(By.css('a[href="/cart"]')), 30000);
        let cartLink = await driver.findElement(By.css('a[href="/cart"]'));
        await driver.executeScript("arguments[0].click();", cartLink);

        // Ensure the cart page is loaded
        await driver.wait(until.urlContains('/cart'), 30000);

        // Proceed to checkout
        console.log('Proceeding to checkout');
        await driver.wait(until.elementLocated(By.css('button[name="checkout"]')), 30000);
        let checkoutButton = await driver.findElement(By.css('button[name="checkout"]'));
        await driver.executeScript("arguments[0].click();", checkoutButton);

        // Ensure the checkout page is loaded
        await driver.wait(until.urlContains('/checkouts/'), 30000);

        // Fill in the checkout form
        console.log('Filling in the checkout form');
        await driver.wait(until.elementLocated(By.id('email')), 30000);
        let emailField = await driver.findElement(By.id('email'));
        await emailField.clear();
        await emailField.sendKeys('nihal123@gmail.com');

        await driver.wait(until.elementLocated(By.id('TextField0')), 30000);
        let firstNameField = await driver.findElement(By.id('TextField0'));
        await firstNameField.clear();
        await firstNameField.sendKeys('Muhammed');

        await driver.wait(until.elementLocated(By.id('TextField1')), 30000);
        let lastNameField = await driver.findElement(By.id('TextField1'));
        await lastNameField.clear();
        await lastNameField.sendKeys('Nihal');
        await driver.wait(until.elementLocated(By.id('shipping-address1')), 30000);
        let addressField = await driver.findElement(By.id('shipping-address1'));
        await addressField.clear();
        await addressField.sendKeys('123 Main St');

        await driver.wait(until.elementLocated(By.id('TextField2')), 30000);
        let address2Field = await driver.findElement(By.id('TextField2'));
        await address2Field.clear();
        await address2Field.sendKeys('Homestay');

        await driver.wait(until.elementLocated(By.id('TextField3')), 30000);
        let cityField = await driver.findElement(By.id('TextField3'));
        await cityField.clear();
        await cityField.sendKeys('Know Where');

        await driver.wait(until.elementLocated(By.id('TextField4')), 30000);
        let zipField = await driver.findElement(By.id('TextField4'));
        await zipField.clear();
        await zipField.sendKeys('670101');

        // Complete the order
        console.log('Completing the order');
        await driver.wait(until.elementLocated(By.id('checkout-pay-button')), 30000);
        let payButton = await driver.findElement(By.id('checkout-pay-button'));

        // Ensure the button is visible and clickable
        await driver.executeScript("arguments[0].scrollIntoView(true);", payButton);
        await driver.wait(until.elementIsVisible(payButton), 30000);
        await driver.wait(until.elementIsEnabled(payButton), 30000);

        // Click the button
        await driver.executeScript("arguments[0].click();", payButton);

        // Debug: print the current URL
        let currentUrl = await driver.getCurrentUrl();
        console.log('Current URL after completing the order:', currentUrl);

        // // Wait for the thank-you page to load
        // console.log('Waiting for the thank-you page');
        // await driver.wait(until.urlContains('/thank-you'), 60000);

        console.log('Order placed successfully');
    } catch (error) {
        console.error('Error during automation:', error);
    } finally {
        await driver.quit();
    }
}

automateShopifyCheckout();
