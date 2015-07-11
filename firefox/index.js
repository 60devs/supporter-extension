var buttons = require('sdk/ui/button/action');
var tabs = require('sdk/tabs');

var button = null;

function onTabChange(tab) {
  var host = tab.url.split('://')[1];
  var tabId = tab.id;

  if (/^(github|stackoverflow|gitter|tips\.60devs)/.test(host)) {
    if (!button) {
      button = buttons.ActionButton({
        id: 'mozilla-link',
        label: 'Visit Mozilla',
        icon: {
          16: './icon_38.png',
          32: './icon_38.png',
          64: './icon_64.png'
        }
      });
    }
  } else {
    if (button) {
      button.destroy();
    }
  }
}

var data = require('sdk/self').data;
var pageMod = require('sdk/page-mod');

var sites = ['https://github.com/*',
            'http://stackoverflow.com/*',
            'https://stackoverflow.com/*',
            'https://gitter.im/*',
            'https://tips.60devs.com/*'];

var onAttach = function(worker) {
  onTabChange(worker.tab);
};

for (var i = 0; i < sites.length; i++) {
  pageMod.PageMod({
    include: sites[i],
    contentScriptFile: data.url('app.js'),
    contentStyleFile: data.url('app.css'),
    onAttach: onAttach
  });
}
