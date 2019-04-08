const express        = require('express');
const bodyParser     = require('body-parser');
// const moment         = require('moment');
// const uuidv4         = require('uuid/v4');
const fs             = require('fs');
const process            = require('process');
const puppeteer      = require('puppeteer');
const app            = express();

import Debug from 'debug';
import Facebook from 'src/facebook/index';

const port = 3004;
let browser = null;
let proxy = '--proxy-server=213.184.97.80:57131' // or false; fb_israel - +972559830641:asdnix12
// let proxy = false // or false

/* Init debug instance */
const _d = new Debug('app:crawler');

app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Wrapper for async/wait routes
 *
 * @param fn
 * @returns {function(*=, *=, *=)}
 */
function asyncWrap(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}

/**
 *
 */
app.post('/run', asyncWrap(async (req, res) => {




    let body = req.body
    console.log(body)
    const facebook = new Facebook(browser, !!proxy)
    facebook.setRequestBody(body)

    await facebook.newTab()

    try {
        const cookies = JSON.parse(fs.readFileSync('cookies.json'))
        await cookies.forEach(async cookie => await facebook.setCookie(cookie))

        console.log('Give cookies from cache');

        /* If we dont wait, the browser can't apply the cookies (?).
          Is my setCookie wrong? (async await??) */
        await facebook.goMain(true)
    } catch (e) {
        /* Try to login if cookies parse failed or no cookies saved before.
          In this case, I havent check for token expire situation. PR welcome! */
        console.log('Load cookies fail. Need login...')
        await facebook.goMain()

        try {
            await facebook.login()
            fs.writeFileSync('cookies.json', JSON.stringify(await facebook.getCookies()))
            console.log('Login successfully. Cookie saved to cookies.json')
        } catch (e) {
            console.log(e)
            console.log('Can\'t login');
        }
    }

    try {
        await facebook.putKeywordInToSearch()
    } catch (e) {
        console.log(e)
    }

    let month = 10
    let photos = []

    try {
        await facebook.openSearchTab('photos')
        await facebook.selectPlace('photos')
        await facebook.selectDate(month, 'photos')
        await facebook.convertUrl()
        await facebook.openAllPhotos()
        photos = await facebook.grabPhotos()

        console.log(photos.length)
    } catch (e) {
        month = -4

        console.log('Server Error First Block')
        console.log('Reset Month: -4')
        console.log(e)
    }

    try {
        await facebook.openSearchTab('posts')
        await facebook.selectPlace('posts')
        await facebook.selectDate(month, 'posts')

        await facebook.convertUrl()

        await facebook.openAllFeeds()

        photos = photos.concat(await facebook.grabSearchFeed())

        console.log(photos.length)

    } catch (e) {
        console.log('Server Error Second Block')
        console.log(e)
    }

    try {
        await facebook.openSearchTab('events')
        await facebook.selectPlace('events')
        await facebook.selectDate(month, 'events')
        //
        let events = await facebook.getEventsPlace()

        photos = photos.concat(await facebook.getEventImages(events))

        console.log(photos.length)

        //


    } catch (e) {
        console.log('Server Error Three Block')
        console.log(e)
    }
    //
    // await facebook.closeTab()
    console.log('closeTab');

    return res.send(photos);
}));

const server = app.listen(port, () => {
    (async () => {
        try {
            console.log('Open Browser');

            let args = [
                '--disable-notifications',
                '--disable-rtc-smoothness-algorithm',
                '--enforce-webrtc-ip-permission-check',
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ]

            if (proxy) {
                args.push(proxy)
            }

            console.log(args)
            browser = await puppeteer.launch({
                headless: false,
                // headless: true,
                // dumpio: true,
                timeout: 24000000,
                args: args
            });
        } catch (e) {
            console.log(e);
        }

        process.on('exit', () => server.stop())

    })();
    console.log('We are live on ' + port);
});

// increase the timeout to 4 minutes
server.timeout = 24000000;