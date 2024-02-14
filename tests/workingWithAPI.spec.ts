import { test, expect, request } from '@playwright/test';
import tags from '../test-data/tags.json';
//@ts-check
// test.beforeEach(async ({page}) =>{
//   await page.route('https://conduit-api.bondaracademy.com/api/tags', async route => {  //   */**/api/tags 
//     await route.fulfill({
//       body: JSON.stringify(tags)
//     })
//   })

//   await page.goto('https://conduit.bondaracademy.com/');

// })

  test('Mock responses', async ({page}) => {

    await page.route('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0', async route => { // */**/api/articles*
    const response = await route.fetch();   
    const responseBody = await response.json();
    responseBody.articles[0].title = 'You are welcome to Abdul-Razak Playwright journey - MOCK';
    responseBody.articles[0].description = 'Abdul-Razak starts the playwright journey using Typescript and he shared his experience - MOCK';

    await route.fulfill({
      body: JSON.stringify(responseBody)
    })
  })

  await page.getByText('Global Feed').click();
  await expect(page.locator('.logo-font').first()).toHaveText('conduit');
  await expect(page.locator('app-article-list h1').first()).toHaveText('You are welcome to Abdul-Razak Playwright journey - MOCK');
  await expect(page.locator('app-article-list p').first()).toHaveText('Abdul-Razak starts the playwright journey using Typescript and he shared his experience - MOCK');
    await page.pause();
  })

  test('delete artile', async ({page, request}) =>{
    const response = await request.post(' https://conduit-api.bondaracademy.com/api/users/login', {
      data: {
        "user": {"email": "razz@gmail.com", "password": "12345"}
      }
    })
    const responseBody = await response.json();
    const accessToken = responseBody.user.token;
    console.log(accessToken);

    await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
      data: {
        "article":{"title":"Uncovering the API techniques with Playwright","description":"We dealt deeper into some of the methods and skill to use in order to understand APIs","body":"Body of the article","tagList":[]}
      },
      headers: {
        Authorization: `Token ${accessToken}`
      }
    })
  })


   
