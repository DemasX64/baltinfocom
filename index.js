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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var puppeteer = require("puppeteer");
var fs = require("fs");
var url = "https://www.avito.ru/sankt_peterburg_i_lo/lichnye_veschi";
var itemSelector = ".js-catalog-item-enum";
var titleSelector = ".title-info-title-text";
var descriptionSelector = 'div[itemprop="description"]';
var urlSelector = ".iva-item-sliderLink-uLz1v";
var priceSelector = 'span[itemprop="price"]';
var authorSelector = 'div[data-marker="seller-info/name"]';
var dateSelector = ".title-info-metadata-item-redesign";
//const phoneButtonSelector = 'button[data-marker="item-phone-button/card"]';
//const phoneSelector = 'img[data-marker="phone-image"]';
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var browser, page, elements, adverts, i, url_1, result, x, advert, title, description, price, _a, author, date, _b, url_2, jsonResult, err_1;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 31, , 32]);
                return [4 /*yield*/, puppeteer.launch({ headless: false })];
            case 1:
                browser = _c.sent();
                return [4 /*yield*/, browser.newPage()];
            case 2:
                page = _c.sent();
                return [4 /*yield*/, page.goto(url)];
            case 3:
                _c.sent();
                return [4 /*yield*/, page.$$(".iva-item-sliderLink-uLz1v")];
            case 4:
                elements = _c.sent();
                adverts = [];
                i = 0;
                _c.label = 5;
            case 5:
                if (!(i < elements.length)) return [3 /*break*/, 9];
                return [4 /*yield*/, elements[i].getProperty('href')];
            case 6: return [4 /*yield*/, (_c.sent()).jsonValue()];
            case 7:
                url_1 = _c.sent();
                adverts.push(url_1);
                _c.label = 8;
            case 8:
                i++;
                return [3 /*break*/, 5];
            case 9:
                console.log(console.log(adverts.length));
                result = [];
                x = 0;
                _c.label = 10;
            case 10:
                if (!(x < 2)) return [3 /*break*/, 30];
                return [4 /*yield*/, browser.newPage()];
            case 11:
                advert = _c.sent();
                return [4 /*yield*/, advert.goto(adverts[x], {
                        waitUntil: 'domcontentloaded'
                    })];
            case 12:
                _c.sent();
                return [4 /*yield*/, advert.$(titleSelector)];
            case 13: return [4 /*yield*/, (_c.sent()).getProperty('innerText')];
            case 14: return [4 /*yield*/, (_c.sent()).jsonValue()];
            case 15:
                title = _c.sent();
                return [4 /*yield*/, advert.$(descriptionSelector)];
            case 16: return [4 /*yield*/, (_c.sent()).getProperty('innerText')];
            case 17: return [4 /*yield*/, (_c.sent()).jsonValue()];
            case 18:
                description = _c.sent();
                _a = parseInt;
                return [4 /*yield*/, advert.$(priceSelector)];
            case 19: return [4 /*yield*/, (_c.sent()).getProperty('innerText')];
            case 20: return [4 /*yield*/, (_c.sent()).jsonValue()];
            case 21:
                price = _a.apply(void 0, [_c.sent()]);
                return [4 /*yield*/, advert.$(authorSelector)];
            case 22: return [4 /*yield*/, (_c.sent()).getProperty('innerText')];
            case 23: return [4 /*yield*/, (_c.sent()).jsonValue()];
            case 24:
                author = _c.sent();
                _b = convertToISO8061;
                return [4 /*yield*/, advert.$(dateSelector)];
            case 25: return [4 /*yield*/, (_c.sent()).getProperty('innerText')];
            case 26: return [4 /*yield*/, (_c.sent()).jsonValue()];
            case 27:
                date = _b.apply(void 0, [_c.sent()]);
                url_2 = adverts[x];
                result.push({
                    title: title,
                    description: description,
                    url: url_2,
                    price: price,
                    author: author,
                    date: date,
                    phone: ""
                });
                return [4 /*yield*/, advert.close()];
            case 28:
                _c.sent();
                _c.label = 29;
            case 29:
                x++;
                return [3 /*break*/, 10];
            case 30:
                jsonResult = JSON.stringify(result);
                fs.writeFile("./result.json", jsonResult, 'utf8', function (err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log("Готово");
                });
                return [3 /*break*/, 32];
            case 31:
                err_1 = _c.sent();
                console.log(err_1);
                return [3 /*break*/, 32];
            case 32: return [2 /*return*/];
        }
    });
}); })();
/*
Объявления на авито не живут больше месяца, поэтому в дату вставляю дату парсинга
*/
function convertToISO8061(input) {
    var now = new Date();
    var date = "";
    date += now.getFullYear().toString();
    date += "-";
    date += ("0" + (now.getMonth() + 1).toString()).slice(-2);
    date += "-";
    if (input.includes("Сегодня"))
        date += ("0" + now.getDate().toString()).slice(-2);
    else if (input.includes("Вчера"))
        date += ("0" + (now.getDate() - 1).toString()).slice(-2);
    else
        date += ("0" + parseInt(input)).slice(-2);
    date += "T";
    var time = input.split(" ");
    date += time.pop();
    console.log(date);
    return date;
}
