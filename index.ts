/* eslint-disable no-await-in-loop */
import puppeteer from 'puppeteer-extra';
import fs from 'fs';
import Tesseract from 'tesseract.js';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
// import readline from 'readline';

// readline.emitKeypressEvents(process.stdin);
// process.stdin.setRawMode(true);

interface Advert {
    title: string;
    description: string;
    url: string;
    price: number;
    author: string;
    date: string; // ISO-8601
    phone: string;
  }

let browser:any;

const pageUrl = 'https://www.avito.ru/sankt_peterburg_i_lo/lichnye_veschi';
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36';

// const itemSelector = '.js-catalog-item-enum';
const titleSelector = '.title-info-title-text';
const descriptionSelector = 'div[itemprop="description"]';
// const urlSelector = '.iva-item-sliderLink-uLz1v';
const priceSelector = 'span[itemprop="price"]';
const authorSelector = 'div[data-marker="seller-info/name"]';
const dateSelector = '.title-info-metadata-item-redesign';
const phoneButtonSelector = 'button[data-marker="item-phone-button/card"]';
const phoneSelector = 'img[data-marker="phone-popup/phone-image"]';

// console.log('Войдите в аккаунт, после нажмите пробел');

/*
Объявления на авито не живут больше месяца, поэтому в дату вставляю дату парсинга
toISOString()
*/

function convertToISO8061(input:string):string {
  const now = new Date();
  let date:string = '';
  date += now.getFullYear().toString();
  date += '-';
  date += (`0${(now.getMonth() + 1).toString()}`).slice(-2);
  date += '-';
  if (input.includes('Сегодня')) {
    date += (`0${now.getDate().toString()}`).slice(-2);
  } else
  if (input.includes('Вчера')) {
    date += (`0${(now.getDate() - 1).toString()}`).slice(-2);
  } else { date += (`0${parseInt(input, 10)}`).slice(-2); }
  date += 'T';
  const time = input.split(' ');
  date += time.pop();
  return date;
}

function recognizePhone(image:string) {
  return new Promise<string>((resolve) => {
    Tesseract.recognize(
      image,
      'eng',
    ).then(({ data: { text } }) => {
      const formattedPhone = text.replace(/ |-|\n/g, '');
      resolve(formattedPhone);
    });
  });
}

async function startParsing() {
  const result : Advert [] = [];
  try {
    const page = await browser.newPage();
    await page.goto(pageUrl, {
      waitUntil: 'domcontentloaded',
    });
    const elements = await page.$$('.iva-item-sliderLink-uLz1v');
    const adverts = [];

    for (let i = 0; i < elements.length; i += 1) {
      const item = await (await elements[i].getProperty('href')).jsonValue();
      adverts.push(item);
    }

    /*
       Переход на страницу сделал для того чтобы спарсить продавца
       Остальное можно было спарсить с каталога
    */

    for (let x = 0; x < adverts.length; x += 1) {
    // for (let x = 0; x < 2; x += 1) {
      const advert = await browser.newPage();
      await advert.goto(adverts[x], {
        waitUntil: 'domcontentloaded',
      });

      const title:string = await (await (await advert.$(titleSelector)).getProperty('innerText')).jsonValue();
      const description:string = await (await (await advert.$(descriptionSelector)).getProperty('innerText')).jsonValue();
      const priceElement = await advert.$(priceSelector);
      let price:string = '-';
      if (priceElement != null) {
        price = await (await (priceElement.getProperty('innerText'))).jsonValue();
      }
      const priceFormatted:number = parseInt(price.replace('\u00A0', ''), 10);
      const author:string = await (await (await advert.$(authorSelector)).getProperty('innerText')).jsonValue();
      const date:string = convertToISO8061(await (await (await advert.$(dateSelector)).getProperty('innerText')).jsonValue());

      /* Получение номера доступно только с входом в аккаунт */

      const button = await advert.$(phoneButtonSelector);
      let phone:string = '-';
      if (button != null) {
        await button.click();
        await advert.waitForSelector(phoneSelector).then(async () => {
          const phoneImage = await (await (await advert.$(phoneSelector)).getProperty('src')).jsonValue();
          phone = await recognizePhone(phoneImage);
        });
      }

      const url = adverts[x];

      result.push({
        title,
        description,
        url,
        price: priceFormatted,
        author,
        date,
        phone,
      });

      await advert.close();
    }
  } catch (err) { console.log(err); } finally {
    const jsonResult = JSON.stringify(result);

    fs.writeFile('./result.json', jsonResult, 'utf8', (err) => {
      if (err) {
        return console.log(err);
      }
      return console.log('Готово');
    });
  }
}

(async () => {
  try {
    browser = await puppeteer.use(StealthPlugin()).launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });

    fs.readFile('./cookies.json', 'utf8', async (err, jsonString) => {
      if (err) {
        console.log('File read failed:', err);
        return;
      }
      const cookies = JSON.parse(jsonString);
      await page.setCookie(...cookies);
      await page.setUserAgent(userAgent);
      startParsing();
    });
  } catch (err) { console.log(err); }
})();

// process.stdin.on('keypress', (str, key) => {
//   if (key.name === 'c' && key.ctrl === true) {
//     process.exit();
//   }

//   if (key.name === 'space') {
//     startParsing();
//   }
// });
