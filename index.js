"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-await-in-loop */
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const fs_1 = __importDefault(require("fs"));
const tesseract_js_1 = __importDefault(require("tesseract.js"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
let browser;
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
function convertToISO8061(input) {
    const now = new Date();
    let date = '';
    date += now.getFullYear().toString();
    date += '-';
    date += (`0${(now.getMonth() + 1).toString()}`).slice(-2);
    date += '-';
    if (input.includes('Сегодня')) {
        date += (`0${now.getDate().toString()}`).slice(-2);
    }
    else if (input.includes('Вчера')) {
        date += (`0${(now.getDate() - 1).toString()}`).slice(-2);
    }
    else {
        date += (`0${parseInt(input, 10)}`).slice(-2);
    }
    date += 'T';
    const time = input.split(' ');
    date += time.pop();
    return date;
}
function recognizePhone(image) {
    return new Promise((resolve) => {
        tesseract_js_1.default.recognize(image, 'eng').then(({ data: { text } }) => {
            const formattedPhone = text.replace(/ |-|\n/g, '');
            resolve(formattedPhone);
        });
    });
}
function startParsing() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = [];
        try {
            const page = yield browser.newPage();
            yield page.goto(pageUrl, {
                waitUntil: 'domcontentloaded',
            });
            const elements = yield page.$$('.iva-item-sliderLink-uLz1v');
            const adverts = [];
            for (let i = 0; i < elements.length; i += 1) {
                const item = yield (yield elements[i].getProperty('href')).jsonValue();
                adverts.push(item);
            }
            /*
               Переход на страницу сделал для того чтобы спарсить продавца
               Остальное можно было спарсить с каталога
            */
            for (let x = 0; x < adverts.length; x += 1) {
                // for (let x = 0; x < 2; x += 1) {
                const advert = yield browser.newPage();
                yield advert.goto(adverts[x], {
                    waitUntil: 'domcontentloaded',
                });
                const title = yield (yield (yield advert.$(titleSelector)).getProperty('innerText')).jsonValue();
                const description = yield (yield (yield advert.$(descriptionSelector)).getProperty('innerText')).jsonValue();
                const priceElement = yield advert.$(priceSelector);
                let price = '-';
                if (priceElement != null) {
                    price = yield (yield (priceElement.getProperty('innerText'))).jsonValue();
                }
                const priceFormatted = parseInt(price.replace('\u00A0', ''), 10);
                const author = yield (yield (yield advert.$(authorSelector)).getProperty('innerText')).jsonValue();
                const date = convertToISO8061(yield (yield (yield advert.$(dateSelector)).getProperty('innerText')).jsonValue());
                /* Получение номера доступно только с входом в аккаунт */
                const button = yield advert.$(phoneButtonSelector);
                let phone = '-';
                if (button != null) {
                    yield button.click();
                    yield advert.waitForSelector(phoneSelector).then(() => __awaiter(this, void 0, void 0, function* () {
                        const phoneImage = yield (yield (yield advert.$(phoneSelector)).getProperty('src')).jsonValue();
                        phone = yield recognizePhone(phoneImage);
                    }));
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
                yield advert.close();
            }
        }
        catch (err) {
            console.log(err);
        }
        finally {
            const jsonResult = JSON.stringify(result);
            fs_1.default.writeFile('./result.json', jsonResult, 'utf8', (err) => {
                if (err) {
                    return console.log(err);
                }
                return console.log('Готово');
            });
        }
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        browser = yield puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)()).launch({ headless: false });
        const page = yield browser.newPage();
        yield page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
        fs_1.default.readFile('./cookies.json', 'utf8', (err, jsonString) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.log('File read failed:', err);
                return;
            }
            const cookies = JSON.parse(jsonString);
            yield page.setCookie(...cookies);
            yield page.setUserAgent(userAgent);
            startParsing();
        }));
    }
    catch (err) {
        console.log(err);
    }
}))();
// process.stdin.on('keypress', (str, key) => {
//   if (key.name === 'c' && key.ctrl === true) {
//     process.exit();
//   }
//   if (key.name === 'space') {
//     startParsing();
//   }
// });
