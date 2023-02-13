const puppeteer = require("puppeteer"); // importe o pacote puppeteer

let scrape = async () => {
  // crie uma função assíncrona que irá realizar o scraping
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1366,
    height: 768,
    deviceScaleFactor: 1,
  });
  await page.goto("https://www.gov.br/mma/pt-br/assuntos/noticias");
  const urls = await page.$$eval("article>div>h2>a", (el) => {
    return el.map((a) => a.getAttribute("href"));
  });

  await page.screenshot({ path: "example.png" });

  browser.close();
  return urls;
};

scrape()
  .then((value) => {
    console.log(value);
  })
  .catch((error) => console.log(error));

//document.querySelectorAll("article>div>h2>a");
//"https://www.gov.br/mma/pt-br/assuntos/noticias"
//"ul.paginacao.listingBar>li>a.proximo"
//document.querySelector("ul.paginacao.listingBar>li>a.proximo")
