const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
const express = require("express");
const fetch = require("node-fetch");

const app = express();
const fs = require("fs");
const { promisify } = require("util");

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin());

let browser;

const args = ["--no-sandbox", "--window-size=1920,1240"];

const options = {
  args,
  headless: false,
  ignoreHTTPSErrors: true,
  userDataDir: "./tmp",
};

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const saveCookies = async (page) => {
  const cookies = await page.cookies();
  await writeFileAsync("./cookies.json", JSON.stringify(cookies, null, 2));
  console.log("Saved cookies");
};

const loadCookies = async (page) => {
  await readFileAsync("./cookies.json")
    .then((cookieStr) => JSON.parse(cookieStr))
    .then(async (cookies) => {
      return await page.setCookie(...cookies);
    })
    .catch((e) => console.log(e));
};

const restartBrowser = async () => {
  console.log("Restarting browser...");

  if (browser) {
    console.log("Closing old browser...");
    browser.close();
  }

  browser = await puppeteer.launch(options);
};

const openPage = async (url, page) => {
  console.log({ "Opening Page": url });
  await page.goto(url);
};

(async () => {
  app.get("/save", async (req, res) => {
    await saveCookies(page);
  });

  app.listen(4000, () => console.log("Xbox bot listening on port 4000!"));

  await restartBrowser();
  let page = await browser.newPage();
  await loadCookies(page);

  //   await openPage(
  //     "https://compassxe-ssb.tamu.edu/StudentRegistrationSsb/ssb/registration",
  //     page
  //   );
  fetch(
    "https://compassxe-ssb.tamu.edu/StudentRegistrationSsb/ssb/searchResults/searchResults?txt_subject=BIOL&txt_courseNumber=319&txt_term=202131&startDatepicker=&endDatepicker=&uniqueSessionId=mtjoe1627916594771&pageOffset=0&pageMaxSize=50&sortColumn=subjectDescription&sortDirection=asc"
  )
    .then((res) => res.json())
    .then((res) => console.log(res));
  //   console.log(bichRes);
  // const bich = await openPage(`https://compassxe-ssb.tamu.edu/StudentRegistrationSsb/ssb/searchResults/searchResults?txt_subject=BICH&txt_courseNumber=412&txt_term=202131&startDatepicker=&endDatepicker=&uniqueSessionId=dkido1627914499047&pageOffset=0&pageMaxSize=50&sortColumn=subjectDescription&sortDirection=asc`)
  // const biol = await openPage(`https://compassxe-ssb.tamu.edu/StudentRegistrationSsb/ssb/searchResults/searchResults?txt_subject=BIOL&txt_courseNumber=319&txt_term=202131&startDatepicker=&endDatepicker=&uniqueSessionId=dkido1627914499047&pageOffset=0&pageMaxSize=50&sortColumn=subjectDescription&sortDirection=asc`)
  //   await new Promise((r) => setTimeout(r, 5000));
  //   console.log("here");
  //   await page.click("#portlet_u31l1n80 > span:nth-child(1) > div > a");
  //   await page.type("#username", "ashleyykingg");
  //   await page.type("#password", "Alk8282001");
  //   await page.click("#fm1 > button");
})();
