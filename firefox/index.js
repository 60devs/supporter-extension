var buttons = require('sdk/ui/button/action');
var tabs = require('sdk/tabs');
var data = require('sdk/self').data;
var pageMod = require('sdk/page-mod');

var myTabs = {};

function createButton() {
  return buttons.ActionButton({
    id: 'tips-link',
    label: 'Highlight Tip Links',
    disabled: true,
    icon: {
      16: './icon_38.png',
      32: './icon_38.png',
      64: './icon_64.png'
    },
    onClick: function handleClick(state) {
      var worker = myTabs[tabs.activeTab.id];
      worker.port.emit('pageActionClick', {
        action: 'pageActionClick'
      });
    }
  });
}

var button = null;

function onAttach(worker) {
  var tab = worker.tab;
  var host = tab.url.split('://')[1];
  var tabId = tab.id;

  if (/^(github|stackoverflow|gitter|tips\.60devs)/.test(host)) {
    if (!button) {
      button = createButton();
    }

    button.state(tab, {
      disabled: false,
      icon: {
        16: './icon_38.png',
        32: './icon_38.png',
        64: './icon_64.png'
      }
    });
  } else {
    if (button) {
      button.destroy();
    }

    button = null;
  }

  myTabs[tabId] = worker;

  worker.on('detach', function() {
    if (button) {
      button.destroy();
    }

    button = null;
  });
}

var { List } = require('sdk/util/list');

pageMod.PageMod({
  include: ['https://github.com/*',
            'http://stackoverflow.com/*',
            'https://stackoverflow.com/*',
            'https://gitter.im/*',
            'https://tips.60devs.com/*'],
  contentScriptFile: data.url('app.js'),
  contentStyleFile: data.url('app.css'),
  onAttach: onAttach
});
