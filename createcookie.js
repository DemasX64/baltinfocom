/* eslint-disable indent */
const puppeteer = require('puppeteer-extra');
const fs = require('fs');
const readline = require('readline');
const stealth = require('puppeteer-extra-plugin-stealth');

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

let page;
let browser;

async function writeCookies() {
    const userAgent = await browser.userAgent();
    const cookies = await page.cookies();
    const cookieJson = JSON.stringify(cookies);
    fs.writeFileSync('cookies.json', cookieJson);
    fs.writeFileSync('useragent.json', userAgent);
    }

(async () => {
    browser = await puppeteer.use(stealth()).launch({ headless: false });
    page = await browser.newPage();
    await page.goto('https://www.avito.ru/sankt_peterburg_i_lo/lichnye_veschi', { waitUntil: 'networkidle2' });
  })();

  process.stdin.on('keypress', (str, key) => {
    if (key.name === 'c' && key.ctrl === true) {
      process.exit();
    }

    if (key.name === 'space') {
        writeCookies();
    }
  });
