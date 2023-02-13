const puppeteer = require("puppeteer"); // importe o pacote puppeteer
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

let scrape = async () => {
  // crie uma função assíncrona que irá realizar o scraping
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto("https://www.gov.br/mma/pt-br/assuntos/noticias"); // define a página que queremos acessar e a função goto navega até essa página
  const urls = await page.$$eval("article>div>h2>a", (el) => {
    return el.map((a) => a.getAttribute("href"));
  });
  //links com paginas proximas
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
  const posts = []; // vetor que conterá as postagens que são a resposta
  //for para caminhar em cada uma das URLS

  for (let index = 0; index < links.length; index++) {
    await page.goto(links[index]); // caminha para a URL
    console.log(index);
    //await page.waitForSelector("#parent-fieldname-text"); //espera até que o texto esteja disponível para ser selecionado
    const title = await page.evaluate(() => {
      const element = document.querySelector("article > h1");
      if (element) {
        return element.textContent;
      }
      return "";
    });
    const image = await page.evaluate(() => {
      const element = document.querySelector("div#media > img");
      if (element) {
        return element.textContent;
      }
      return "";
    });
    const content = await page.evaluate(() => {
      const element = document.querySelector("#parent-fieldname-text > div");
      if (element) {
        return element.textContent;
      }
      return "";
    });
    //console.log(title);
    //console.log(image);
    //console.log(content);
    /*
    const title = await page.$eval("article > h1", (title) => title.innerText); //seleciona o elemento que contém o título e aplica nele a função innerText, que retorna o texto do elemento
    const image = await page.$eval("div#media > img", (image) =>
      image.getAttribute("src")
    ); // seleciona o elemento da imagem e busca o atributo src da imagem, que contém a url da mesma.

    const content = await page.$eval(
      "#parent-fieldname-text > div",
      (el) => el.innerText
    ); // seleciona o conteúdo da postagem e pega o texto desse elemento
      */
    if (title != "" && content != "") {
      const post = {
        title,
        image,
        content,
      }; // cria um objeto com as informações acima
      console.log(post);
      posts.push(post); // adiciona o objeto no vetor
    }
  }

  browser.close(); // fecha o browser, indicando que finalizamos o scraping

  return posts;
};
async function pegarConteudo(page) {}
scrape()
  .then((value) => {
    console.log(value);
    // cria o arquivo e adiciona um HEADER com os titulos das colunas e atribui a constante csvWriter
    const csvWriter = createCsvWriter({
      path: "file.csv",
      header: [
        { id: "title", title: "Titulo" },
        { id: "image", title: "Imagem" },
        { id: "content", title: "Conteudo" },
      ],
    });
    // salva no arquivo acima os valores recebidos do scraper
    csvWriter
      .writeRecords(value) // retorna uma promise
      .then(() => {
        console.log("...Feito");
      });
  })
  .catch((error) => console.log(error));

//for (const url of links)
