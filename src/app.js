/* globals chrome, XMLHttpRequest, self */

/**
* For FF
*/
if (!Element.prototype.scrollIntoViewIfNeeded) {
  Element.prototype.scrollIntoViewIfNeeded = function(centerIfNeeded) {
    centerIfNeeded = arguments.length === 0 ? true : !!centerIfNeeded;

    var parent = this.parentNode,
        parentComputedStyle = window.getComputedStyle(parent, null),
        parentBorderTopWidth = parseInt(parentComputedStyle.getPropertyValue('border-top-width')),
        parentBorderLeftWidth = parseInt(parentComputedStyle.getPropertyValue('border-left-width')),
        overTop = this.offsetTop - parent.offsetTop < parent.scrollTop,
        overBottom = (this.offsetTop - parent.offsetTop + this.clientHeight - parentBorderTopWidth) > (parent.scrollTop + parent.clientHeight),
        overLeft = this.offsetLeft - parent.offsetLeft < parent.scrollLeft,
        overRight = (this.offsetLeft - parent.offsetLeft + this.clientWidth - parentBorderLeftWidth) > (parent.scrollLeft + parent.clientWidth),
        alignWithTop = overTop && !overBottom;

    if ((overTop || overBottom) && centerIfNeeded) {
      parent.scrollTop = this.offsetTop - parent.offsetTop - parent.clientHeight / 2 - parentBorderTopWidth + this.clientHeight / 2;
    }

    if ((overLeft || overRight) && centerIfNeeded) {
      parent.scrollLeft = this.offsetLeft - parent.offsetLeft - parent.clientWidth / 2 - parentBorderLeftWidth + this.clientWidth / 2;
    }

    if ((overTop || overBottom || overLeft || overRight) && !centerIfNeeded) {
      this.scrollIntoView(alignWithTop);
    }
  };
}

var Utils = {
  t: (key) => {
    return key;
  },

  getParentByCls: (node, cls) => {
    while (!node.classList.contains(cls)) {
      node = node.parentNode;

      if (!node) {
        return null;
      }
    }

    return node;
  }
}

class BaseAgent {
    constructor() {
      this.users = [];
      this.user = null;
    }

    start() {
      this.onDomChange();
      if (typeof chrome !== 'undefined') {
        // running in Google Chrome
        chrome.runtime.onMessage.addListener(this.onExtensionMessage.bind(this));
      } else {
        // FF
        self.port.on('pageActionClick', this.onExtensionMessage.bind(this));
      }
    }

    onExtensionMessage(request) {
      console.log('onExtensionMessage', request);
      if (request.action === 'pageActionClick') {
        this.onPageActionClick();
      }
    }

    onPageActionClick() {
      var button = document.querySelector('.t-ext-button');

      if (button) {
        this.hightlightButton(button);
      } else {
        alert('No users who are able to accept tips on this page.');
      }
    }

    hightlightButton(button) {
      button.scrollIntoViewIfNeeded();

      var overlay = document.createElement('div');
      overlay.classList.add('t-ext-overlay');

      document.body.appendChild(overlay);
      document.body.classList.add('t-ext-attention-showing');

      setTimeout(() => {
        document.body.classList.remove('t-ext-attention-showing');
        document.body.classList.add('t-ext-attention-hiding');

        setTimeout(() => {
          document.body.classList.remove('t-ext-attention-hiding');
          overlay.parentNode.removeChild(overlay);
        }, 500);
      }, 1000);
    }

    onDomChange() {
      this.initUser();
      this.initUnknownUsers();
      this.render();
    }

    discoverUsers(users) {
      var xhr = new XMLHttpRequest();

      xhr.open('POST', `https://tips.60devs.com/api/status/${this.providerType}`, true);
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.send(JSON.stringify(users));
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          this.onDiscoverUsersSuccess(xhr.responseText);
        }
      }
    }

    onDiscoverUsersSuccess(responseText) {
      var items = JSON.parse(responseText);

      for (let user in items) {
        if (items[user]) {
          this.users.push(user);
        }
      }

      this.render();
    }
}

class GitterAgent extends BaseAgent {
    constructor() {
      super();
      this.document = document;
      this.providerType = 'github';
    }

    start() {
      if (window.top === window) {
        return;
      }

      super.start();
      new MutationObserver(this.onDomChange.bind(this)).observe(document, {
        childList: true,
        subtree: true
      });
    }

    initUser() {
      if (this.user) {
        return;
      }

      try {
        var scripts = window.top.document.scripts;
        scripts = [].slice.call(scripts);

        for (let script of scripts) {
          var matches = script.textContent.match(/\'username\'\:\'([^\']+)\'/);

          if (matches) {
            this.user = matches[1];
            break;
          }
        }
      } catch (e) {}
    }

    initUnknownUsers() {
      var nodes,
          users = [];

      nodes = document.querySelectorAll('.chat-item.burstStart:not(.t-user) .js-chat-item-from');
      nodes = [].slice.call(nodes);

      for (let node of nodes) {
        users.push(node.textContent.trim());
        Utils.getParentByCls(node, 'chat-item').classList.add('t-user');
      }

      var unknownUsers = [];

      for (let user of users) {
        if (this.users.indexOf(user) === -1) {
          unknownUsers.push(user);
        }
      }

      if (unknownUsers.length > 0) {
        this.discoverUsers(unknownUsers);
      }
    }

    renderButton(user) {
      var template = document.createElement('template');

      template.innerHTML = `
            <a href="http://tips.60devs.com/#/pay/github/${user}" target='_blank' class="t-ext-button t-ext-gitter-button">
                ${Utils.t('leave tips')}
            </a>`
      return template.content;
    }

    render() {
      var nodes;

      nodes = document.querySelectorAll('.t-user .js-chat-item-from');
      nodes = [].slice.call(nodes);

      for (let node of nodes) {
        var chatItemNode = Utils.getParentByCls(node, 't-user');
        var user = node.textContent.trim();

        if (this.user === user || chatItemNode.querySelector('.t-ext-button')) {
          continue;
        }

        if (this.users.indexOf(user) > -1) {
          var button = this.renderButton(user);
          var placeholder = chatItemNode.querySelector('.chat-item__details');

          placeholder.insertBefore(button, placeholder.querySelector('.chat-item__time'));
        }
      }
    }
}

class GithubAgent extends BaseAgent {
    constructor() {
      super();
      this.providerType = 'github';
    }

    start() {
      super.start();
      new MutationObserver(this.onDomChange.bind(this)).observe(document, {
        childList: true,
        subtree: true
      });
    }

    initUser() {
      if (this.user) {
        return;
      }

      try {
        this.user = document.head
          .querySelector('meta[name="octolytics-actor-login"]')
          .getAttribute('content').trim();
      } catch (e) {}
    }

    initUnknownUsers() {
      if (this.isIssuesPage()) {
        this.initUnknownUsersOnIssuesPage();
      } else {
        this.initUnknownUsersOnProfilePage();
      }
    }

    isIssuesPage() {
      return !!document.getElementById('show_issue');
    }

    initUnknownUsersOnIssuesPage() {
      var nodes;
      var users = [];

      nodes = document.querySelectorAll('#show_issue .js-comment-container:not(.t-user) .timeline-comment-avatar');
      nodes = [].slice.call(nodes);

      for (let node of nodes) {
        users.push(node.getAttribute('alt').substring(1));
        Utils.getParentByCls(node, 'js-comment-container').classList.add('t-user');
      }

      var unknownUsers = [];

      for (let user of users) {
        if (this.users.indexOf(user) === -1) {
          unknownUsers.push(user);
        }
      }

      if (unknownUsers.length > 0) {
        this.discoverUsers(unknownUsers);
      }
    }

    initUnknownUsersOnProfilePage() {
      var userNode = document
        .querySelector('.profilecols .vcard-names .vcard-username:not(.t-user)');
      var user;

      if (!userNode) {
        return;
      }

      userNode.classList.add('t-user');
      user = userNode.textContent.trim();

      if (this.users.indexOf(user) === -1) {
        this.discoverUsers([user]);
      }
    }

    renderButton(user) {
      var template = document.createElement('template');

      template.innerHTML = `
            <a href="http://tips.60devs.com/#/pay/github/${user}" target="_blank" class="t-ext-button t-ext-github-button">
              ${Utils.t('leave tips')}
            </a>`;
      return template.content;
    }

    render() {
      if (this.isIssuesPage()) {
        this.renderOnIssuesPage();
      } else {
        this.renderOnProfilePage();
      }
    }

    renderOnIssuesPage() {
      var nodes;
      var users = [];

      nodes = document.querySelectorAll('#show_issue .t-user');
      nodes = [].slice.call(nodes);

      for (let node of nodes) {
        var user = node.querySelector('.timeline-comment-avatar').getAttribute('alt');
        user = user.substring(1).trim();

        if (this.user === user || node.querySelector('.t-ext-button')) {
          continue;
        }

        if (this.users.indexOf(user) > -1) {
          node.appendChild(this.renderButton(user));
        }
      }
    }

    renderOnProfilePage() {
      try {
        var profileNode = document.querySelector('.profilecols .vcard');
        var userNode = profileNode.querySelector('.vcard-names .vcard-username');
        var user = userNode.textContent.trim();

        if (this.user === user
          || this.users.indexOf(user) === -1
          || profileNode.querySelector('.t-ext-button')) {
          return;
        }

        profileNode.insertBefore(this.renderButton(user),
          profileNode.querySelector('.vcard-details'));
      } catch (e) {}
    }
}

class StackOverflowAgent extends BaseAgent {
    constructor() {
      super();
      this.providerType = 'stackoverflow';
    }

    start() {
      super.start();
      new MutationObserver(this.onDomChange.bind(this)).observe(document, {
        childList: true,
        subtree: true
      });
    }

    initUser() {
      if (this.user) {
        return ;
      }

      try {
        let href = document.querySelector('.profile-me').getAttribute('href');
        let user = href.match(/\d+/)[0];

        this.user = user;
      } catch (e) {}
    }

    initUnknownUsers() {
      var nodes;
      var users = [];

      nodes = document.querySelectorAll('.answer:not(.t-user) .user-info:last-child .user-details a');
      nodes = [].slice.call(nodes);

      for (let node of nodes) {
        users.push(node.getAttribute('href').match(/\d+/)[0]);
        Utils.getParentByCls(node, 'answer').classList.add('t-user');
      }

      var unknownUsers = [];

      for (let user of users) {
        if (this.users.indexOf(user) === -1) {
          unknownUsers.push(user);
        }
      }

      if (unknownUsers.length > 0) {
        this.discoverUsers(unknownUsers);
      }
    }

    renderButton(user) {
      var template = document.createElement('template');

      template.innerHTML = `
            <a href="http://tips.60devs.com/#/pay/stackoverflow/${user}" target="_blank" class="t-ext-button t-ext-stackoverflow-button">
                ${Utils.t('leave tips')}
            </a>`;
      return template.content;
    }

    render() {
      var nodes;

      nodes = document.querySelectorAll('.t-user .user-info:last-child .user-details a');
      nodes = [].slice.call(nodes);

      for (let node of nodes) {
        var answerNode = Utils.getParentByCls(node, 't-user');
        var user = node.getAttribute('href').match(/\d+/)[0];

        if (this.user === user || answerNode.querySelector('.t-ext-button')) {
          continue;
        }

        if (this.users.indexOf(user) > -1) {
          let button = this.renderButton(user);
          let placeholder = answerNode.querySelector('.vt > .post-menu');

          placeholder.appendChild(button);
        }
      }
    }
}

class Application {
    constructor() {
      if (/^tips\.60devs/.test(location.hostname)) {
        this.init60DevsSite();
      } else {
        this.initAgent();
      }
    }

    initAgent() {
      var host = location.hostname;
      var Agent;

      if (/^stackoverflow\.com$/.test(host)) {
        Agent = StackOverflowAgent;
      }

      if (/^gitter\.im$/.test(host)) {
        Agent = GitterAgent;
      }

      if (/^github\.com/.test(host)) {
        Agent = GithubAgent;
      }

      if (Agent) {
        this.agent = new Agent();
        this.agent.start();
      }
    }

    init60DevsSite() {
      var div = document.createElement('div');
      div.id = 'extension-installed';

      document.body.appendChild(div);
    }

    getIconPath(active) {
      return active ? '../icon_active_64.png' : '../icon_64.png';
    }
}

var app = new Application();
