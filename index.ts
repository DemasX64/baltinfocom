import * as puppeteer from 'puppeteer';
import * as fs from 'fs';

interface Advert {
    title: string;
    description: string;
    url: string;
    price: number;
    author: string;
    date: string; // ISO-8601
    phone: string;
  }

const url = "https://www.avito.ru/sankt_peterburg_i_lo/lichnye_veschi";

const itemSelector = ".js-catalog-item-enum";
const titleSelector = ".title-info-title-text";
const descriptionSelector = 'div[itemprop="description"]';
const urlSelector = ".iva-item-sliderLink-uLz1v";
const priceSelector = 'span[itemprop="price"]';
const authorSelector = 'div[data-marker="seller-info/name"]';
const dateSelector = ".title-info-metadata-item-redesign";
//const phoneButtonSelector = 'button[data-marker="item-phone-button/card"]';
//const phoneSelector = 'img[data-marker="phone-image"]';

(async () => {
    try {
      const browser = await puppeteer.launch({ headless: false,});
      const page = await browser.newPage();
      
      await page.goto(url);
      let elements = await page.$$(".iva-item-sliderLink-uLz1v")
      let adverts = []

      for (let i =0;i<elements.length;i++){
        let url = await (await elements[i].getProperty('href')).jsonValue()
        adverts.push(url)
      }

      console.log(console.log(adverts.length))

      let result:Advert[] = []

      /*
       Переход на страницу сделал для того чтобы спарсить продавца
       Остальное можно было спарсить с каталога
      */

      //for(let x = 0;x<adverts.length;x++){
        for(let x = 0;x<2;x++){
        const advert = await browser.newPage();
        await advert.goto(adverts[x],{
          waitUntil: 'domcontentloaded'
      });
        
        // let title:string = await (await (await adverts[x].$(titleSelector)).getProperty('title')).jsonValue()


        let title:string = await (await (await advert.$(titleSelector)).getProperty('innerText')).jsonValue()
        let description:string = await (await (await advert.$(descriptionSelector)).getProperty('innerText')).jsonValue()
        let price:number = parseInt(await (await (await advert.$(priceSelector)).getProperty('innerText')).jsonValue())
        let author:string = await (await (await advert.$(authorSelector)).getProperty('innerText')).jsonValue()
        let date:string = convertToISO8061(await (await (await advert.$(dateSelector)).getProperty('innerText')).jsonValue())

        /* Получение номера доступно только с входом в аккаунт*/

        //let button = await advert.$(phoneButtonSelector);
        // let phone:string
        // if(button!=null){
        //   await button.click()
        //   await advert.waitForSelector(phoneSelector).then(async ()=>{
        //     phone = await (await (await advert.$(phoneSelector)).getProperty('src')).jsonValue()
        //   })
        // }
        // else{
        //   phone = "Не указан"
        // }        
                
        let url = adverts[x]
        
        result.push({
          title:title,
          description:description,
          url:url,
          price:price,
          author:author,
          date:date,
          phone:""
        })

        await advert.close()
      }

      const jsonResult = JSON.stringify(result);

      fs.writeFile("./result.json", jsonResult, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("Готово");
    }); 
    }
    catch(err) { console.log(err); }
})();


/*
Объявления на авито не живут больше месяца, поэтому в дату вставляю дату парсинга
*/

function convertToISO8061(input):string{
  let now = new Date()
  let date:string = ""
  date+=now.getFullYear().toString()
  date+="-"
  date+=("0"+(now.getMonth()+1).toString()).slice(-2)
  date+="-"
  if(input.includes("Сегодня"))
    date+=("0"+now.getDate().toString()).slice(-2)
  else
    if(input.includes("Вчера"))
      date+=("0"+(now.getDate()-1).toString()).slice(-2)
    else
      date+=("0"+parseInt(input)).slice(-2)
  date+="T"
  let time = input.split(" ")
  date+=time.pop()
  console.log(date)
  return date
}
