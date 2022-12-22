import readline from "readline";
import { faker } from "@faker-js/faker";
import playwright from "playwright";
import fs from "fs";

function randomIntFromInterval(min, max) {
  const num = Math.floor(Math.random() * (max - min + 1) + min);
  if (num < 10) {
    return `0${num}`;
  }
  return num;
}

var randomFixedInteger = function (length) {
  return Math.floor(
    Math.pow(10, length - 1) +
      Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1)
  );
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function readLineAsync(message) {
  return new Promise((resolve, reject) => {
    rl.question(message, (answer) => {
      resolve(answer);
    });
  });
}

const initScrapping = async () => {
  const quantity = await readLineAsync("Cuantas cervezas queres? :)");
  if (quantity > 0) {
    const url = "https://www.canjeapromo.com.ar/BudweiserSampling2q";
    const browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext();

    for (let i = 0; i < quantity; i++) {
      console.log("Cerveza numero: ", i + 1);

      const page = await context.newPage();
      await page.goto(url);
      await page.waitForSelector("#remember");

      const digit1Input = await page.locator(
        "input[aria-label='Please enter verification code. Digit 1']"
      );
      const digit2Input = await page.locator("input[aria-label='Digit 2']");
      const digit3Input = await page.locator("input[aria-label='Digit 3']");
      const digit4Input = await page.locator("input[aria-label='Digit 4']");

      digit1Input.fill("2");
      digit2Input.fill("0");
      digit3Input.fill("0");
      digit4Input.fill("1");

      const continueButton = await page.locator("//p[text()='Continuar']");
      continueButton.click();

      await page.waitForSelector("div.react-select__control");

      const name = `Juansito Doe`;

      const email = faker.internet.email(
        faker.name.fullName(),
        undefined,
        "gmail.com"
      );

      const day = String(randomIntFromInterval(1, 30));
      const month = String(randomIntFromInterval(1, 12));
      const year = String(randomIntFromInterval(1970, 2000));

      const cellPhone = String(randomFixedInteger(10));

      const provinceSelect = await page
        .locator("div.react-select__control")
        .nth(1);

      // write inside inputs
      await page.type("#phone", cellPhone);
      await page.type("#name", name);
      await page.type("#day", day);
      await page.type("#monn", month);
      await page.type("#anio", year);
      await page.type("#email", email);

      // select province

      const locateProvince = async () => {
        try {
          await provinceSelect.click();
          const buenos_aires = await page.locator(
            "#react-select-city-option-0"
          );
          await buenos_aires.click({
            timeout: 100,
          });
        } catch (error) {
          await locateProvince();
        }
      };

      await locateProvince();

      const terms = await page.locator("#tyc");
      await terms.click();

      const submitPath = "//p[text()='Registrarme']";
      const submitButton = await page.locator(submitPath);
      await submitButton.click();

      await page.waitForNavigation();

      if (!fs.existsSync("./screenshots")) {
        fs.mkdirSync("./screenshots");
      }
      const filesinFolder = fs.readdirSync("./screenshots");
      const fileName = `cerveza${filesinFolder.length + 1}.png`;

      await page.screenshot({ path: `./screenshots/${fileName}` });
      await page.close();
    }

    await context.close();
    await browser.close();
  }

  rl.close();
};

initScrapping();
