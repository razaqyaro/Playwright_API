import { test, expect, request } from '@playwright/test';
import tags from '../test-data/tags.json';
//@ts-check
test.beforeEach(async ({page}) =>{
  await page.route('https://conduit-api.bondaracademy.com/api/tags', async route => {  //   */**/api/tags 
    await route.fulfill({
      body: JSON.stringify(tags)
    })
  })
  await page.goto('https://conduit.bondaracademy.com/');
})

  test('Modify responses', async ({page}) => {
    await page.route('*/**/api/articles*', async route => { // */**/api/articles*
    const response = await route.fetch();   
    const responseBody = await response.json();
    responseBody.articles[0].title = 'You are welcome to Abdul-Razak Playwright journey - MOCK';
    responseBody.articles[0].description = 'Abdul-Razak starts the playwright journey using Typescript and he shared his experience - MOCK';

    await route.fulfill({
      body: JSON.stringify(responseBody)
    })
    console.log(responseBody)
  })

  await page.getByText('Global Feed').click();
  await expect(page.locator('.logo-font').first()).toHaveText('conduit');
  await expect(page.locator('app-article-list h1').first()).toHaveText('You are welcome to Abdul-Razak Playwright journey - MOCK');
  await expect(page.locator('app-article-list p').first()).toHaveText('Abdul-Razak starts the playwright journey using Typescript and he shared his experience - MOCK');
  
})

  test('delete article', async ({page, request}) =>{
    const response = await request.post(' https://conduit-api.bondaracademy.com/api/users/login', {
      data: {
        "user": {"email": "razz@gmail.com", "password": "12345"}
      }
    })
    const responseBody = await response.json();
    const accessToken = responseBody.user.token;
    console.log(accessToken);

    const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
      data: {
        "article":{"title":"Uncovering the API techniques with Playwright","description":"We dealt deeper into some of the methods and skill to use in order to understand APIs","body":"Body of the article","tagList":[]}
      },
      headers: {
        Authorization: `Token ${accessToken}`
      }
    })
    expect(articleResponse.status()).toEqual(201);

    await page.getByText('Global Feed').click();
    await page.getByText('Uncovering the API techniques with Playwright').click();
    await page.getByRole('button', {name: "Delete Article"}).first().click();
    await page.getByText('Global Feed').click();

    await expect(page.locator('app-article-list h1').first()).not.toContainText('Uncovering the API techniques with Playwright');


  })

  test('create article via UI and delete via API', async({page, request}) => {
    await page.getByText('New Article').click();
    await page.getByRole('textbox', {name: "Article Title"}).fill('I love catching bugs');
    await page.getByRole('textbox', {name: "What's this article about?"}).fill('Skills, techniques for catching bugs');
    await page.getByRole('textbox', {name: "Write your article (in markdown)"}).fill('Hey guys, you wanna catch bugs then sharpen your eyes');
    await page.getByRole('button', {name: "Publish Article"}).click();
    const articleResponse = await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles/');
    const articleResponseBody = await articleResponse.json();
    const slugID = articleResponseBody.article.slug;
    await page.waitForTimeout(4000);
    await expect(page.locator('.article-page h1')).toContainText('I love catching bugs');
    await page.getByText('Home').click();
    await page.getByText('Global Feed').click();

    await expect(page.locator('app-article-list h1').first()).toContainText('I love catching bugs');

    const response = await request.post(' https://conduit-api.bondaracademy.com/api/users/login', {
      data: {
        "user": {"email": "razz@gmail.com", "password": "12345"}
      }
    })
    const responseBody = await response.json();
    const accessToken = responseBody.user.token;

    const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugID}`, {
      headers: {
        Authorization: `Token ${accessToken}`
      }
    })

    expect(deleteArticleResponse.status()).toEqual(204);

   

  })


   
