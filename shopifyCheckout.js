const { Builder, By, until } = require('selenium-webdriver');
const edge = require('selenium-webdriver/edge');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

async function startEdgeDriverService() {
    return new Promise((resolve, reject) => {
        const edgeDriverPath = path.resolve('C:/WebDriver/msedgedriver.exe');
        console.log(`Starting EdgeDriver service from ${edgeDriverPath}`);
        const command = `"${edgeDriverPath}" --port=9151`;
        const edgeProcess = exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error starting EdgeDriver: ${error.message}`);
                reject(error);
            }
            console.log(`EdgeDriver output: ${stdout}`);
            console.error(`EdgeDriver error output: ${stderr}`);
        });

        edgeProcess.stdout.on('data', (data) => {
            console.log(`EdgeDriver stdout: ${data}`);
            if (data.includes('WebDriver was started successfully.')) {
                console.log('EdgeDriver service started successfully.');
                resolve(edgeProcess);
            }
        });

        edgeProcess.stderr.on('data', (data) => {
            console.error(`EdgeDriver stderr: ${data}`);
        });

        edgeProcess.on('error', (error) => {
            console.error(`EdgeDriver process error: ${error}`);
            reject(error);
        });

        edgeProcess.on('close', (code) => {
            console.log(`EdgeDriver process exited with code ${code}`);
            if (code !== 0) {
                reject(new Error(`EdgeDriver exited with code ${code}`));
            }
        });
    });
}

async function takeScreenshot(driver, filename) {
    let screenshot = await driver.takeScreenshot();
    fs.writeFileSync(filename, screenshot, 'base64');
}

async function automateShopifyCheckout() {
    let edgeProcess;
    let driver;
    try {
        edgeProcess = await startEdgeDriverService();

        let options = new edge.Options();
        options.addArguments('start-maximized'); // Ensure the Edge browser window is maximized

        driver = await new Builder()
            .forBrowser('MicrosoftEdge')
            .setEdgeOptions(options)
            .usingServer('http://localhost:9151') // Correctly set the server URL
            .build();

        console.log('Navigating to the Shopify store');
        await driver.get('https://teststore581112.myshopify.com');
        console.log('Navigated to the Shopify store');

        console.log('Adding an item to the cart');
        await driver.wait(until.elementLocated(By.css('a[href="/products/test-car-product"]')), 30000);
        let productLink = await driver.findElement(By.css('a[href="/products/test-car-product"]'));
        await driver.executeScript("arguments[0].click();", productLink);
        console.log('Clicked on the product link');

        console.log('Waiting for "Add to Cart" button');
        await driver.wait(until.elementLocated(By.css('button[name="add"]')), 30000);
        let addToCartButton = await driver.findElement(By.css('button[name="add"]'));
        await driver.executeScript("arguments[0].click();", addToCartButton);
        console.log('Clicked on "Add to Cart" button');

        console.log('Verifying the item is added to the cart');
        await driver.wait(until.elementLocated(By.css('div.cart-count-bubble span[aria-hidden="true"]')), 30000);
        let cartCountElement = await driver.findElement(By.css('div.cart-count-bubble span[aria-hidden="true"]'));
        let cartCount = await cartCountElement.getText();
        console.log('Cart count:', cartCount);
        if (parseInt(cartCount) === 0) {
            throw new Error('Cart is still empty after adding the item.');
        }

        console.log('Going to the cart page');
        await driver.wait(until.elementLocated(By.css('a[href="/cart"]')), 30000);
        let cartLink = await driver.findElement(By.css('a[href="/cart"]'));
        await driver.executeScript("arguments[0].click();", cartLink);
        console.log('Clicked on cart link');

        await driver.wait(until.urlContains('/cart'), 30000);
        console.log('Cart page loaded');

        console.log('Proceeding to checkout');
        await driver.wait(until.elementLocated(By.css('button[name="checkout"]')), 30000);
        let checkoutButton = await driver.findElement(By.css('button[name="checkout"]'));
        await driver.executeScript("arguments[0].click();", checkoutButton);
        console.log('Clicked on checkout button');

        await driver.wait(until.urlContains('/checkouts/'), 30000);
        console.log('Checkout page loaded');

        console.log('Filling in the checkout form');
        await driver.wait(until.elementLocated(By.id('email')), 30000);
        let emailField = await driver.findElement(By.id('email'));
        await emailField.clear();
        await emailField.sendKeys('nihal123@gmail.com');
        console.log('Entered email');

        await driver.wait(until.elementLocated(By.id('TextField0')), 30000);
        let firstNameField = await driver.findElement(By.id('TextField0'));
        await firstNameField.clear();
        await firstNameField.sendKeys('Muhammed');
        console.log('Entered first name');

        await driver.wait(until.elementLocated(By.id('TextField1')), 30000);
        let lastNameField = await driver.findElement(By.id('TextField1'));
        await lastNameField.clear();
        await lastNameField.sendKeys('Nihal');
        console.log('Entered last name');

        await driver.wait(until.elementLocated(By.id('shipping-address1')), 30000);
        let addressField = await driver.findElement(By.id('shipping-address1'));
        await addressField.clear();
        await addressField.sendKeys('123 Main St');
        console.log('Entered address');

        await driver.wait(until.elementLocated(By.id('TextField2')), 30000);
        let address2Field = await driver.findElement(By.id('TextField2'));
        await address2Field.clear();
        await address2Field.sendKeys('Homestay');
        console.log('Entered address line 2');

        await driver.wait(until.elementLocated(By.id('TextField3')), 30000);
        let cityField = await driver.findElement(By.id('TextField3'));
        await cityField.clear();
        await cityField.sendKeys('Know Where');
        console.log('Entered city');

        await driver.wait(until.elementLocated(By.id('TextField4')), 30000);
        let zipField = await driver.findElement(By.id('TextField4'));
        await zipField.clear();
        await zipField.sendKeys('670101');
        console.log('Entered zip code');

        // // Add a short wait to ensure any async validation processes are completed
        await driver.sleep(2000);

        // // Check for any visible error messages related to the zip code
        // let zipError = await driver.findElements(By.css('.field--error[data-field="shipping_address[zip]"]'));
        // if (zipError.length > 0) {
        //     console.error('Zip code validation failed.');
        //     await takeScreenshot(driver, 'zip_error.png');
        //     throw new Error('Zip code validation failed.');
        // }

        console.log('Completing the order');
        await driver.wait(until.elementLocated(By.id('checkout-pay-button')), 30000);
        let payButton = await driver.findElement(By.id('checkout-pay-button'));

        await driver.executeScript("arguments[0].scrollIntoView(true);", payButton);
        await driver.wait(until.elementIsVisible(payButton), 30000);
        await driver.wait(until.elementIsEnabled(payButton), 30000);

        await driver.executeScript("arguments[0].click();", payButton);
        console.log('Clicked on pay button');

        let currentUrl = await driver.getCurrentUrl();
        console.log('Current URL after completing the order:', currentUrl);

        // Wait for the thank-you page to load
        console.log('Waiting for the thank-you page');

        await driver.sleep(2000);
        await driver.executeScript("arguments[0].click();", payButton);
        console.log('Clicked on pay button again');

        await driver.wait(until.urlContains('/thank-you'), 120000); // Increased timeout

        console.log('Order placed successfully');
    } catch (error) {
        console.error('Error during automation:', error);
        if (driver) {
            await takeScreenshot(driver, 'error_screenshot.png');
        }
    } finally {
        if (driver) {
            await driver.quit();
            console.log('Driver quit successfully');
        }
        if (edgeProcess) {
            edgeProcess.kill();
            console.log('EdgeDriver process killed successfully');
        }
    }
}

automateShopifyCheckout();
