import Base from '../base'
import selectors from './selectors'
import NodeGeocoder from 'node-geocoder'
import { URL } from 'url'

/**
 * Facebook Parser
 */
export default class Facebook extends Base {

    /**
     * Facebook Constructor
     *
     * @param browser
     */
    constructor(browser, proxy) {
        super(browser)

        this.selectors = selectors
        this.proxy = proxy
    }

    /**
     * Open New Tab
     *
     * @returns {Promise.<Facebook>}
     */
    async newTab() {

        console.log('Open New Tab');
        this.page = await this.browser.newPage()

        await this.page.setViewport({
            isLandscape: true,
            /* Just set this page size based on my best experience :) */
            width: 1200,
            height: 800
        })

        // await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/5')

        // await this.page.setRequestInterceptionEnabled(true);
        // this.page.on('request', request => {
        //     console.log(request.resourceType === 'manifest');
        //     // let headers = req.headers;
        //     // headers['referer'] = 'http://www.example.com/';
        //     // headers['cookie'] = 'somekey=somevalue';
        //     // req.continue({
        //     //     headers: headers
        //     // });
        //
        //     request.continue()
        // });
        /* If we dont wait, the browser can't apply the cookies (?).
          Is my setCookie wrong? (async await??) */
        await this.page.waitFor(this.randomTimeout(2000, 3000))
    }

    /**
     * Close tab
     *
     * @returns {Promise.<void>}
     */
    async closeTab() {
        console.log('Close Tab')
        await this.page.close()
    }

    /**
     * Set Cookies params
     *
     * @param cookie
     * @returns {Promise.<void>}
     */
    async setCookie(cookie) {
        this.page.setCookie(cookie)
    }

    /**
     * Get cookies from current page
     *
     * @returns {Promise.<*>}
     */
    async getCookies() {
        return await this.page.cookies()
    }

    /**
     * Put email & pwd to login form
     *
     * @returns {Promise.<void>}
     */
    async login() {
        await this.page.waitFor('#email', { timeout: this.randomTimeout(5000, 10000) })

        await this.page.type('#email', this.body.email, {delay: this.defaultTypeDelay})
        await this.page.type('#pass', this.body.pwd, {delay: this.defaultTypeDelay})
        await this.page.click('#loginbutton')

        await this.page.waitFor('#userNav', { timeout: this.randomTimeout(10000, 13000) })
    }

    async convertUrl() {
        await this.page.waitFor(this.randomTimeout(10000, 15000))
        let TodayDate = new Date();

        let currentUrl = await this.page.evaluate(() => {
            return document.location.href
        })


        const myURL = new URL(currentUrl)
        let dateParams = JSON.parse(myURL.searchParams.get('filters_rp_creation_time'))
        let args = JSON.parse(dateParams.args)
        args['start_month'] = args['end_month']
        args['end_month'] = `${TodayDate.getFullYear()}-${TodayDate.getMonth()+1}`

        args = JSON.stringify(args)
        dateParams.args = args
        myURL.searchParams.set('filters_rp_creation_time', JSON.stringify(dateParams))

        await this.open(myURL.href)



        // console.log(currentUrl)

    }

    /**
     * Search keyword
     *
     * @returns {Promise.<void>}
     */
    async putKeywordInToSearch() {
        await this.page.waitFor(this.randomTimeout(5000, 10000))

        console.log(`putKeywordInToSearch: ${this.body.keyword}`);
        // await this.page.waitFor('#userNav', { timeout: this.randomTimeout() })
        await this.page.type('._1frb', ' ' + this.body.keyword, {delay: this.defaultTypeDelay})
        await this.page.waitFor('._42ft._4jy0._4w98._4jy3._517h._51sy._4w97', { timeout: this.randomTimeout(5000, 10000) })
        await this.page.click('._42ft._4jy0._4w98._4jy3._517h._51sy._4w97')
        await this.page.waitFor('._5_6e', { timeout: this.randomTimeout(5000, 10000) })
    }

    /**
     * Switch tab into search page
     *
     * @param tab
     * @returns {Promise.<void>}
     */
    async openSearchTab(tab) {
        const tabsSelector = {
            'photos': 4,
            'posts': 2,
            'events': !this.proxy ? 10 : 11
        }

        console.log(`openSearchTab: wait for ${this.selectors.tabs.main.origin[1]}`)

        if (!this.proxy) {
            await this.page.waitFor(this.selectors.tabs.main.origin[1], { timeout: this.randomTimeout(2000, 3000) })
            await this.page.waitFor(`._5vwz._45hc:nth-child(${tabsSelector[tab]}) a`, { timeout: this.randomTimeout(4000, 6000) } )
            await this.page.click(`._5vwz._45hc:nth-child(${tabsSelector[tab]}) a`)
            await this.page.waitFor(this.randomTimeout(2000, 3000))
        } else {
            await this.page.waitFor(this.selectors.tabs.main.origin[1], { timeout: this.randomTimeout(5000, 6000) })
            await this.page.waitFor(`._5vwz._45hc:nth-child(${tabsSelector[tab]}) a`, { timeout: this.randomTimeout(5000, 7000) } )
            await this.page.click(`._5vwz._45hc:nth-child(${tabsSelector[tab]}) a`)
            await this.page.waitFor(this.randomTimeout(2000, 3000))
        }


    }

    /**
     * Switcher selectors
     *
     * @param list
     * @param index
     * @param alternativeIndex
     * @returns {Promise.<*>}
     */
    async waitMainElement(list, index, alternativeIndex) {
        alternativeIndex = alternativeIndex || 'origin'

        await this.page.waitFor(this.randomTimeout(1000, 2000))

        let test = await this.page.$$(list[alternativeIndex][index])
        await test[2].click()

        await this.page.waitFor(1000)

        let test1 = await this.page.$$('._42ft._4jy0._55pi._5vto._55_p._2agf._4o_4._p._4jy3._517h._51sy')
        await test1[0].click()
        await this.page.waitFor(1000)

        let test2 = await this.page.$$('._54nc')
        console.log(test2)
        await test2[9].click()

        // test1[0].click()

        // console.log(test1)
        // console.log(test2)
        // let photos = await this.page.evaluate((selector) => {
        //     const anchors = Array.from(document.querySelectorAll('._1u6r')) //selector
        //
        //     if (typeof eventFire === 'undefined') {
        //         function eventFire(el, etype){
        //             if (el.fireEvent) {
        //                 el.fireEvent('on' + etype);
        //             } else {
        //                 var evObj = document.createEvent('Events');
        //                 evObj.initEvent(etype, true, false);
        //                 el.dispatchEvent(evObj);
        //             }
        //         }
        //     }
        //
        //     eventFire(anchors[2], 'click')
        //
        //     return true
        // }, list[alternativeIndex][index]);

        // await this.page.click(selector[])

        try {
            let timeout = this.randomTimeout(30000, 35000)
            if (alternativeIndex === 'origin') {

            }

            console.log(`waitMainElement: wait for ${list[alternativeIndex][index]} , timeout: ${timeout}`)
            let a = await this.page.waitForSelector(list[alternativeIndex][index], { timeout: timeout })

            if (a === undefined) {
                throw new Error('Wait undefined')
            }

            return alternativeIndex
        } catch (e) {
            console.error(`Error waitMainElement: ${list[alternativeIndex][index]}`);

            let key = 'alternative'

            if (alternativeIndex === key) {
                key = 'alternative1'
            }

            if (alternativeIndex === 'alternative1') {
                return false
            }

            return await this.waitMainElement(list, index, key)
        }
    }

    /**
     * Fill date filter
     *
     * @param month
     * @param tab
     * @returns {Promise.<void>}
     */
    async selectDate(month, tab) {

        if (tab === 'events') {
            await this.page.waitFor(this.randomTimeout(3000, 5000))
            let TodayDate = new Date();

            let selectors = await this.page.$$('._4f3b')
            console.log('selectDate events: click to ._4f3b')

            if (!this.proxy) {
                await selectors[9].click()
            } else {
                await selectors[8].click()
            }


            await this.page.waitFor(this.randomTimeout(2000, 3000))

            let currentUrl = await this.page.evaluate(() => {
                return document.location.href
            })

            // if start month in current year TodayDate.getFullYear();if last year TodayDate.getFullYear() - 1
            let startDate = `${TodayDate.getFullYear() - 1}-`+ month + '-' + 1
            let endDate = `${TodayDate.getFullYear()}-${TodayDate.getMonth()+1}-${TodayDate.getDay()+1}`
// console.log(currentUrl)
            const myURL = new URL(currentUrl)

            let dateParams = JSON.parse(myURL.searchParams.get('filters_rp_events_date'))

            dateParams.args = startDate + '~' + endDate

            myURL.searchParams.set('filters_rp_events_date', JSON.stringify(dateParams))

            await this.open(myURL.href)
        } else {
            await this.page.waitFor(5000)
            if (tab === 'posts') {
                let selectors = await this.page.$$('._1u6r')
                console.log('selectDate posts: click to ._1u6r')
                await selectors[3].click()

                await this.page.waitFor(1000)

                let selectorMonthOrYear = await this.page.$$('._42ft._4jy0._55pi._5vto._55_p._2agf._4o_4._p._4jy3._517h._51sy')
                console.log('selectDate: click to ._42ft._4jy0._55pi._5vto._55_p._2agf._4o_4._p._4jy3._517h._51sy')

                await selectorMonthOrYear[1].click()

                await this.page.waitFor(1000)
                let selectorsYear = await this.page.$$('._54nh')
                await selectorsYear[1].click()

                await this.page.waitFor(4000)

                // choose month
                let selectors2 = await this.page.$$('._1u6r')
                console.log('selectDate 2 photos: click to ._1u6r')
                await selectors2[3].click()

                let selectorMonthOrYear2 = await this.page.$$('._42ft._4jy0._55pi._5vto._55_p._2agf._4o_4._p._4jy3._517h._51sy')
                console.log('selectDate 2: click to ._42ft._4jy0._55pi._5vto._55_p._2agf._4o_4._p._4jy3._517h._51sy')

                await selectorMonthOrYear2[0].click()

                await this.page.waitFor(1000)
                let selectorsMonths = await this.page.$$('._54nc')

                await selectorsMonths[month + 15].click()
            }
            if (tab === 'photos') {
                // choose year
                let selectors = await this.page.$$('._1u6r')
                console.log('selectDate photos: click to ._1u6r')
                await selectors[2].click()

                await this.page.waitFor(1000)

                let selectorMonthOrYear = await this.page.$$('._42ft._4jy0._55pi._5vto._55_p._2agf._4o_4._p._4jy3._517h._51sy')
                console.log('selectDate: click to ._42ft._4jy0._55pi._5vto._55_p._2agf._4o_4._p._4jy3._517h._51sy')

                await selectorMonthOrYear[1].click()

                await this.page.waitFor(1000)
                let selectorsYear = await this.page.$$('._54nh')
                await selectorsYear[1].click()

                await this.page.waitFor(2000)

                // choose month
                let selector2 = await this.page.$$('._1u6r')
                console.log('selectDate 2 photos: click to ._1u6r')
                await selector2[2].click()

                let selectorMonthOrYear2 = await this.page.$$('._42ft._4jy0._55pi._5vto._55_p._2agf._4o_4._p._4jy3._517h._51sy')
                console.log('selectDate 2: click to ._42ft._4jy0._55pi._5vto._55_p._2agf._4o_4._p._4jy3._517h._51sy')

                await selectorMonthOrYear2[0].click()

                await this.page.waitFor(1000)
                let selectorsMonths = await this.page.$$('._54nc')

                await selectorsMonths[month + 15].click()

                // await selectorsMonths[month].dispose()
                //
                // let selectors = await this.page.$$('._1u6r')
                // console.log('selectDate photos: click to ._1u6r')
                // await selectors[2].click()
                //
                // let selectorYear = await this.page.$$('._42ft._4jy0._55pi._5vto._55_p._2agf._4o_4._p._4jy3._517h._51sy')
                // console.log('selectDate 2: click to ._42ft._4jy0._55pi._5vto._55_p._2agf._4o_4._p._4jy3._517h._51sy')
                // await selectorYear[0].click()
                // let selectorsMonths = await this.page.$$('._54nc')
                //
                // await selectorsMonths[month].click()
                //
                // await selectorsMonths[month].dispose()

            }



            // await this.page.waitFor(1000)
            //
            // let selectors = await this.page.$$('._1u6r')
            // console.log('selectDate photos: click to ._1u6r')
            // await selectors[2].click()
            //
            // let selectorYear = await this.page.$$('._42ft._4jy0._55pi._5vto._55_p._2agf._4o_4._p._4jy3._517h._51sy')
            // console.log('selectDate 2: click to ._42ft._4jy0._55pi._5vto._55_p._2agf._4o_4._p._4jy3._517h._51sy')
            // await selectorYear[0].click()
            // let selectorsMonths = await this.page.$$('._54nc')
            //
            // await selectorsMonths[month].click()
            //
            // await selectorsMonths[month].dispose()
        }



        // let selectorType = await this.waitMainElement(this.selectors.tabs[tab].selectDate, 0)

        // console.log(`selectDate: click to ${this.selectors.tabs[tab].selectDate[selectorType][0]}`)
        // await this.page.click(this.selectors.tabs[tab].selectDate[selectorType][0])
        //
        // console.log(`selectDate: click to ${this.selectors.tabs[tab].selectDate[selectorType][1]}`)
        // await this.page.click(this.selectors.tabs[tab].selectDate[selectorType][1])
        //
        // console.log(`selectDate: selected ${this.selectors.tabs[tab].selectDate[selectorType][2]}`)
        // let monthElements = await this.page.$$(this.selectors.tabs[tab].selectDate[selectorType][2])
        //
        // try {
        //     monthElements[month].constructor.prototype.boundingBox = async function() {
        //         return await this.executionContext().evaluate(element => {
        //             const rect = element.getBoundingClientRect();
        //             const x = Math.max(rect.left, 0);
        //             const width = Math.min(rect.right, window.innerWidth) - x;
        //             const y = Math.max(rect.top, 0);
        //             const height = Math.min(rect.bottom, window.innerHeight) - y;
        //             return { x: x, width: width, y: y, height: height };
        //         }, this);
        //     };
        //
        //     console.log(`selectDate: click to ${this.selectors.tabs[tab].selectDate[selectorType][2]} [${month}]`)
        //     await monthElements[month].click()

            // console.log(`selectDate: dispose ${this.selectors.tabs[tab].selectDate[selectorType][2]} [${month}]`)
            // await monthElements[month].dispose()
        // } catch (e) {
        //     console.log('error');
        //     console.log(e);
        // }
    }

    async getEventsPlace() {

        await this.scrollPage()

        try {
            const href = await this.page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('._52eh._5bcu a'))

                console.log(anchors)
                return anchors.map((item) => {

                    return {
                        'href': item.href,
                    }
                });
            });
            return href
        } catch (e) {
            console.error('Error getEventsPlace: error href')
        }


    }

    /**
     * Get Geocode data from point
     *
     * @returns {Promise.<T>}
     */
    async getGeocodeCity() {
        const location = this.body.center.split(',')

        let geocoder = NodeGeocoder({
            provider: 'google',
            apiKey: 'AIzaSyBcNmZXlXO_i1-ERqhwsxQETCZHeyUGJGw', // for Mapquest, OpenCage, Google Premier
        })

        return await geocoder.reverse({lat: location[0], lon:location[1]})
    }

    /**
     * Fill place filter
     *
     * @param tab
     * @returns {Promise.<boolean>}
     */
    async selectPlace(tab) {
        await this.page.waitFor(this.randomTimeout(2000, 3000))

        let city
        try {
            const geo = await this.getGeocodeCity()
            city = geo[0]['city']
        } catch (e) {
            return true
        }




        // let selectorType = await this.waitMainElement(this.selectors.tabs[tab].selectPlace, 0)
        //
        // console.log(`selectPlace: click to ${this.selectors.tabs[tab].selectPlace[selectorType][0]}`)
        // this.page.click(this.selectors.tabs[tab].selectPlace[selectorType][0])
        //
        // console.log(`selectPlace: wait for ${this.selectors.tabs[tab].selectPlace[selectorType][1]}`)
        // await this.page.waitFor(this.selectors.tabs[tab].selectPlace[selectorType][1], { timeout: this.randomTimeout(2000, 3000) })
        //
        // console.log(`selectPlace: type ${this.selectors.tabs[tab].selectPlace[selectorType][1]}`)

        //
        // console.log(`selectPlace: wait for ${this.selectors.tabs[tab].selectPlace[selectorType][2]}`)
        // await this.page.waitFor(this.selectors.tabs[tab].selectPlace[selectorType][2], { timeout: this.randomTimeout(2000, 3000) })
        //
        // console.log(`selectPlace: select ${this.selectors.tabs[tab].selectPlace[selectorType][2]}`)

        //
        // console.log(`selectPlace: click to ${this.selectors.tabs[tab].selectPlace[selectorType][2]}[0]`)

        if (tab === 'posts') {
            let selectors = await this.page.$$('._1u6r')
            await selectors[2].click()
        }

        if (tab === 'photos') {
            let selectors = await this.page.$$('._1u6r')
            await selectors[1].click()
        }

        if (tab === 'events') {
            let selectors = await this.page.$$('._1u6r')
            await selectors[0].click()
        }

        await this.page.type('.inputtext.textInput', ' ' + city, {delay: this.defaultTypeDelay })
        await this.page.waitFor(this.randomTimeout(5000, 8000))

        const locationList = await this.page.$$('.compact .page')

        await locationList[0].click()

        await this.page.waitFor(this.randomTimeout(2000, 3000))
    }

    /**
     * Click "Open all photos" on photos tab
     *
     * @returns {Promise.<void>}
     */
    async openAllPhotos() {
        await this.page.waitFor(this.randomTimeout(2000, 3000))

        console.log('openAllPhotos: select ._24ok')
        if (await this.page.$('._24ok')) {
            console.log('openAllPhotos: click to ._24ok')
            await this.page.click('._24ok')

            console.log('selectPlace: wait for #initial_browse_result')
            await this.page.waitFor('#initial_browse_result', { timeout: this.randomTimeout(2000, 3000) })
        }
    }

    /**
     * Click "Open all photos" on photos tab
     *
     * @returns {Promise.<void>}
     */
    async openAllFeeds() {
        await this.page.waitFor(this.randomTimeout(2000, 3000))

        console.log('openAllFeeds: select ._4-u3._4kft._2ph_ a')
        if (await this.page.$('._4-u3._4kft._2ph_ a')) {
            console.log('openAllFeeds: click to ._4-u3._4kft._2ph_ a')
            await this.page.click('._4-u3._4kft._2ph_ a')

            console.log('openAllFeeds: wait for #initial_browse_result')
            await this.page.waitFor('#initial_browse_result', { timeout: this.randomTimeout(2000, 3000) })
        }
    }

    /**
     * Auto scroll any page
     *
     * @returns {Promise.<boolean>}
     */
    async scrollPage() {
        await this.page.waitFor(this.randomTimeout(2000, 3000))

        if (await this.page.$(this.selectors.tabs.main.origin[0])) {
            return true
        } else {
            console.log('scrollPhotos: scrolled')
            await this.page.evaluate(() => {
                return new Promise((resolve, reject) => {
                    let totalHeight = 0;
                    let distance = 500;
                    let timer = setInterval(() => {
                        let scrollHeight = document.body.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;

                        console.log(totalHeight, scrollHeight);
                        if (totalHeight >= scrollHeight) {
                            clearInterval(timer);
                            resolve();
                        }
                    }, 3000);
                })
            });

            return true
        }
    }

    async getEventImages(posts) {

        let photos = []

        for (let i = 0; i < posts.length; i++) {
            const url = posts[i]['href'];
            await this.open(url)

            // let allPhotosHref = null
            // await this.page.waitFor(this.randomTimeout(3000, 5000))
            // await this.page.goBack({timeout: 0})

            // let selec = await this.page.$$('._2a2q')
            // console.log(selec[0])

            await this.page.waitFor(this.randomTimeout(2000, 3000))
            await this.scrollPage()


            let href = await this.page.evaluate(() => {

                    const selectors = Array.from(document.querySelectorAll('._4b4x'))

                 return selectors.map((item) => {
                        if (item.href.match('photos') || item.href.match('posts')) {
                            return {
                                'href': item.href
                            }
                        }
                         // if (item.href.match('posts')) {
                         //     return {
                         //         'href': item.href
                         //     }
                         // }
                    })
            });

            let allPhotosEventsLink  = null
            let allPostsEventsLink  = null

            if (href !== null) {
                href.forEach((item) => {

                    if (item !== null) {
                        if (item.href.match('photos')) {
                            allPhotosEventsLink = item.href
                        } else {
                            allPostsEventsLink = item.href
                        }
                    }
                })

                if (allPhotosEventsLink !== null) {
                    await this.open(allPhotosEventsLink)
                    await this.page.waitFor(this.randomTimeout(1000, 2000))
                    photos = photos.concat(await this.grabPhotos())
                }

                if (allPostsEventsLink !== null) {
                    await this.open(allPostsEventsLink)
                    await this.page.waitFor(this.randomTimeout(1000, 2000))
                    photos = photos.concat(await this.grabEventPost())
                }
                // await this.scrollPage()


                // photos = photos.concat(await this.page.evaluate(() => {
                //     const anchors = Array.from(document.querySelectorAll('._401d'))
                //
                //     return anchors.map((item) => {
                //         if (item.querySelector('a._23q')) {
                //             return {
                //                 'href': item.querySelector('a._23q').href,
                //                 'src': item.querySelector('a._23q img.img').src
                //             }
                //         }
                //     });
                // }));


            }

            await this.page.waitFor(this.randomTimeout(4000, 5000))

        }

        return photos;

}

    async clickAllPosts() {
        try {
            console.log('Click posts')
            let countPosts = await this.page.evaluate(() => {
                const miniPosts = Array.from(document.querySelectorAll('._307z'))

                miniPosts.map((item) => {
                    console.log(item)
                    item.click()
                });
                return miniPosts.length
            });

            console.log(countPosts)

            await this.page.waitFor(this.randomTimeout(countPosts * 400))
        } catch (e) {
            console.error('Error clickAllPosts:')
        }
    }

    /**
     * Parse content from Feed tab
     *
     * @returns {Promise.<*>}
     */
    async grabSearchFeed() {
        await this.page.waitFor(this.randomTimeout(2000, 3000))

        let photos = []

        console.log('grabSearchFeed')

        await this.scrollPage()

        await this.page.waitFor(this.randomTimeout(2000, 3000))

        if (this.proxy) {

            const seeAllSelectorsHref = await this.page.evaluate(() => {
                        const anchors = Array.from(document.querySelectorAll('._5dw8 a'))

                        console.log(anchors)
                        return anchors.map((item) => {
                            console.log(item)
                            return {
                                'href': item.href
                            }
                        });
                    });

            if (seeAllSelectorsHref.length) {
                for (let i = 0; i < seeAllSelectorsHref.length; i++) {
                    await this.page.goto(seeAllSelectorsHref[i].href)
                    console.log('Go to all posts part ' + i)
                    await this.scrollPage()

                    await this.page.waitFor(this.randomTimeout(2000, 3000))

                    await this.clickAllPosts()

                    photos = photos.concat(await this.grabPostsPhoto())
                }

            } else {
                await this.clickAllPosts()
                console.log('Go to all posts')

                photos = photos.concat(await this.grabPostsPhoto())
            }

            // let selectors = await this.page.$$('._5dw8')
            //
            // if (selectors.length) {
            //     await selectors[0].click()
            //     console.log('Click SeeAll: click to ._5dw8')
            // }
            //
            // // await this.scrollPage()
            //
            // await this.page.waitFor(this.randomTimeout(2000, 3000))



            // await this.page.goBack()
//             await this.page.goBack()
//             await this.page.waitFor(this.randomTimeout(2000, 3000))
//
// console.log(2)
//             await this.scrollPage()
//             console.log(3)
//
//             let selectors2 = await this.page.$$('._5dw8')
//
//             if (selectors2.length > 1) {
//                 await selectors2[1].click()
//                 console.log('Click SeeAll 2: click to ._5dw8')
//             }
//
//             // await this.scrollPage()
//
//             await this.page.waitFor(this.randomTimeout(2000, 3000))
//
//             await this.clickAllPosts()
//
//             photos = photos.concat(await this.grabPostsPhoto())

        } else {
            photos = photos.concat(await this.grabPostsPhoto())
        }



        // try {
        //     const photos3 = await this.page.evaluate(() => {
        //         const anchors = Array.from(document.querySelectorAll('._4-eo._2t9n'))
        //
        //         console.log(anchors)
        //         return anchors.map((item) => {
        //             console.log(item)
        //             return {
        //                 'href': item.href,
        //                 'src': item.dataset['ploi']
        //             }
        //         });
        //     });
        //     photos = photos.concat(photos3)
        // } catch (e) {
        //     console.error('Error grabSearchFeed: error5 single photos3 part 2')
        // }

        // console.log(photos)
        return photos
    }

    async grabPostsPhoto() {

        let photos = []

        try {
            photos = await this.page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('._5dec._xcx'))

                return anchors.map((item) => {
                    if (!item.href.match('video')) {
                        return {
                            'href': item.href,
                            'src': item.dataset['ploi']
                        }
                    }
                });
            });
            // photos = photos.concat(photos1)
        } catch (e) {
            console.error('Error grabSearchFeed: error2 group photos')
        }

        try {
            const photos1 = await this.page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('._4-eo._2t9n'))

                return anchors.map((item) => {
                    return {
                        'href': item.href,
                        'src': item.dataset['ploi']
                    }
                });
            });
            // console.log(photos2)
            photos = photos.concat(photos1)
        } catch (e) {
            console.error('Error grabSearchFeed: error3 single photos1')
        }

        try {
            const photos2 = await this.page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('._5mly._40ja'))

                return anchors.map((item) => {
                    return {
                        'href': item.querySelector('a._400z._2-40').href,
                        'src': item.querySelector('._4lpe._3htz img').src
                    }
                });
            });
            photos = photos.concat(photos2)
        } catch (e) {
            console.error('Error grabSearchFeed: error4 photos2 by videos')
        }

        return photos
    }

    async grabEventPost() {
        await this.page.waitFor(this.randomTimeout(2000, 3000))

        let photos = []

        console.log('grabSearchFeed')

        await this.scrollPage()

        try {
            photos = await this.page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('._5dec._xcx'))

                return anchors.map((item) => {
                    if (!item.href.match('video')) {
                        return {
                            'href': item.href,
                            'src': item.dataset['ploi']
                        }
                    }
                });
            });
            // photos = photos.concat(photos1)
        } catch (e) {
            console.error('Error grabSearchFeed: error2 group photos')
        }

        try {
            const photos1 = await this.page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('._4-eo._2t9n'))

                return anchors.map((item) => {
                    return {
                        'href': item.href,
                        'src': item.dataset['ploi']
                    }
                });
            });
            // console.log(photos2)
            photos = photos.concat(photos1)
        } catch (e) {
            console.error('Error grabSearchFeed: error3 single photos1')
        }

        try {
            const photos2 = await this.page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('._5mly._40ja'))

                return anchors.map((item) => {
                    return {
                        'href': item.querySelector('a._400z._2-40').href,
                        'src': item.querySelector('._4lpe._3htz img').src
                    }
                });
            });
            photos = photos.concat(photos2)
        } catch (e) {
            console.error('Error grabSearchFeed: error4 photos2 by videos')
        }

        return photos
    }

    /**
     * Parse content from Photos tab
     *
     * @returns {Promise.<*>}
     */
    async grabPhotos() {
        await this.page.waitFor(this.randomTimeout(2000, 3000))

        let photos = []

        console.log('grabPhotos: select ._401d')
        // await this.page.waitForSelector('._401d')

        if (await !this.page.$('._401d')) {
            return []
        }

        await this.scrollPage()

        try {
             const photos1 = await this.page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('._401d'))

                return anchors.map((item) => {
                    if (item.querySelector('a._23q')) {
                        return {
                            'href': item.querySelector('a._23q').href,
                            'src': item.querySelector('a._23q img.img').src
                        }
                    }
                });
            });
            photos = photos.concat(photos1)
        } catch (e) {
            console.error('Error grabPhotos: error1 single photos1')
        }



        try {
            const photos2 = await this.page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('._5t31'))

                return anchors.map((item) => {
                    console.log(item)
                    return {
                        'href': item.href,
                        'src': item.querySelector('._5t31 img').src
                    }
                });
            });
            photos = photos.concat(photos2)
        } catch (e) {
            console.error('Error grabPhotos: error2 single photos2')
        }

        return photos;
    }

    /**
     * Open main page
     *
     * @returns {Promise.<void>}
     */
    async goMain(wait) {
        if (wait !== undefined) {
            await this.page.waitFor(this.randomTimeout(2000, 3000))
        }

        await this.open('https://facebook.com')
    }

    /**
     * Open any URL
     *
     * @param url
     * @returns {Promise.<void>}
     */
    async open(url) {
        await this.page.goto(url, { waitUntil: 'networkidle2' })
    }
}