#Writing Google Chrome Extension on ES6

Last few months we're working really hard on [an amazing service (Tips by 60 Devs)](https://tips.60devs.com) that gives you a way to thank developers by sending small money rewards (tips) on biggest IT-portals: 

[Stack Overflow](http://stackoverflow.com)
[Github](https://github.com)
[Gitter](https://gitter.im)

In this post I would like to share an experience of how we developed Google Chrome Extension for our platform, what problems we had and how we solved them.

###The idea
We want to give users a way to leave tips on biggest developer portals and after very short "How can we do this?" - discussion we've come up with an idea, that browser extension will be the best thing we could use here, as it allows us to work with website's DOM,  change CSS, make AJAX requests, have communication channels page-extension, extension-page and it's very easy to install thought [Chrome Web Store](https://chrome.google.com/webstore/category/apps).

###Technical specification
Every time when user opens one of supported websites ([GitHub](https://github.com), [Stack Overflow](https://stackoverflow.com) or [Gitter](https://gitter.im)) or changes the page inside of that website, an extension should display small unobtrusive **leave tips** button for all users how are able to receive tips (members of our platform) which leads to a payment page. Also, browser extension should display small icon in the address bar when it's active (user is on our partner-website). An extension-owner is able to click on that icon in order to highlight all **leave tips** buttons on a page, so he knows where to find them.

###How do we start?
Nowadays, browsers still don't support ES6 (except latest version of Google Chrome), so in order to develop on ES6, we need to install a transpiler, which is a tool that transforms your ES6 - source code to it's ES5 equivalent, so all browsers can understand it and execute. You can find different JS transpilers across the web, but for our [tips - extension](https://chrome.google.com/webstore/detail/tips-by-60-devs/bhmlepbhififbpnimkomaimigemimmcf) we've chosen [BabelJS](https://babeljs.io), as it's simple, well-documented and there are a lot of examples of how to use it. Also, we (developers) are pretty lazy, so let's install [GulpJS](https://gulpjs.com) - an amazing automation tool to make our workflow faster.

    npm install -g gulp
    npm install -g gulp-babel

When this is all done, let's write very simple gulpfile.js that will use babeljs to transform our ES6-files (when we change them) to ES5-format from chrome/dev to chrome/build folder.

    var gulp = require("gulp"),
    babel = require("gulp-babel");

    gulp.task("watch", function() {
        gulp.watch("./chrome/dev/*.js", function(file) {
            gulp.src(file.path)
                .pipe(babel())
                .on("error", console.error.bind(console))
                .pipe(gulp.dest("./chrome/build"));
        });
    });

###Developing an extension
Now, we could actually start developing an extension. The key file in the extension it's a manifest, that provides  meta information for the browser. Here is how it can look:

    {
        "manifest_version": 2,
        "name": "Tips by 60 Devs",
        "description": "Be rewarded for helping others. Start receiving gratuities from thankful individuals.",
        "version": "1.3",

        "page_action": {
            "default_title": "Tips by 60devs",
            "default_icon": {
                "38": "icon_38.png"
            }
        },

        "permissions": [
            "tabs",
            "activeTab",
            "https://tips.60devs.com/*"
        ],

        "icons": {
            "64": "icon_64.png",
            "128": "icon_128.png"
        },

        "content_scripts": [{
            "matches": [
                "https://github.com/*",
                "http://stackoverflow.com/*",
                "https://stackoverflow.com/*",
                "https://gitter.im/*",
                "https://tips.60devs.com/*"
            ],
            "js": ["build/app.js"],
            "css": ["build/app.css"],
            "all_frames": true
        }],

        "background": {
            "scripts": ["build/background.js"]
        }
    }


You are able to read all information about keys from the manifest on [developer.chrome.com](https://developer.chrome.com/extensions/manifest), and I will stop only on some very important ones.

**page_action** - represents an icon in browser's address bar, that could have a click-handler, and could be visible or hidden.

**content_scripts** - describes which (js, css) files will be executed by the browser when user opens an url specified in matches - array.

**background** - describes scripts that work always until you close the browser. 
