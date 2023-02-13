const puppeteer = require("puppeteer"); // importe o pacote puppeteer
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
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
  let haveNext = false; // flag para decidir se existe uma próxima página ou não
  let links = []; // vetor onde armazenaremos  todos os links coletados

  do {
    haveNext = false; // a flag vai para falso sempre ao entrar no loop
    const urls = await page.$$eval("article>div>h2>a", (el) => {
      return el.map((a) => a.getAttribute("href"));
    }); // fazemos a chechagem pelas urls dessa página normalmente

    links = links.concat(urls); //concatenamos o resultado dessa página com o das páginas anteriores

    // a linha abaixo utiliza o seletor da seta >> para o elemento com a função $
    const button_next_page = await page.$(
      "ul.paginacao.listingBar>li>a.proximo"
    );

    //se o elemento existir (for !== null)
    if (button_next_page) {
      //aguarda pelo término da execução das duas coisas abaixo antes de prosseguir
      await Promise.all([
        page.waitForNavigation(), //espera que a navegação entre as páginas tenha terminado
        page.$eval("ul.paginacao.listingBar>li>a.proximo", (e) => e.click()), //encontra a seta >> com com $eval e clica no elemento
      ]);
      haveNext = true; // caso tenha encontrado a seta >>, a flag vira true e o código do loop é executado novamente
    }
  } while (haveNext);
  const urls = await page.$$eval("article>div>h2>a", (el) => {
    return el.map((a) => a.getAttribute("href"));
  });

  //await page.screenshot({ path: "example.png" });

  browser.close();
  return links;
};

let conteudo = async (caminhos) => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const pageConteudo = await browser.newPage();
  await pageConteudo.setViewport({
    width: 1366,
    height: 768,
    deviceScaleFactor: 1,
  });
  const posts = [];

  for (index = 0; index <= 43; index++) {
    console.log(caminhos[index]);
    await pageConteudo.goto(caminhos[index]);
    await pageConteudo.waitForSelector("article");

    const title = await pageConteudo.$eval(
      "article > h1",
      (title) => title.innerText
    );
    const urlAtual = caminhos[index];

    const content = await pageConteudo.$eval(
      "#parent-fieldname-text > div",
      (el) => el.innerText
    );

    const post = {
      title,
      urlAtual,
      content,
    };
    posts.push(post);
  }
  browser.close();
  return posts;
};

scrape()
  .then((value) => {
    console.log(value[0]);
    conteudo(value)
      .then((resultado) => {
        const csvWriter = createCsvWriter({
          path: "file.csv",
          header: [
            { id: "title", title: "Titulo" },
            { id: "urlAtual", title: "URL" },
            { id: "content", title: "Conteudo" },
          ],
        });
        // salva no arquivo acima os valores recebidos do scraper
        csvWriter
          .writeRecords(resultado) // retorna uma promise
          .then(() => {
            console.log("...Feito");
          });
      })
      .catch((error) => console.log(error));
  })
  .catch((error) => console.log(error));

//document.querySelectorAll("article>div>h2>a");
//"https://www.gov.br/mma/pt-br/assuntos/noticias"
//"ul.paginacao.listingBar>li>a.proximo"
//document.querySelector("ul.paginacao.listingBar>li>a.proximo")

//titulo
//document.querySelector("article > h1")
//imagem
//document.querySelector("div#media > img")
//conteudo
//document.querySelector("#parent-fieldname-text > div")
