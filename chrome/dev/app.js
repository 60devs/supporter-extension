var Utils = {
    t: (key) => {
        return key;
    },

    getParentByCls: (node, cls) => {
        while(! node.classList.contains(cls)) {
            node = node.parentNode;

            if(! node)
                return null;
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
    }

    onDomChange() {
        this.initUser();
        this.initUnknownUsers();
        this.render();
    }

    discoverUsers(users) {
        var xhr = new XMLHttpRequest;

        xhr.open("POST", `https://tips.60devs.com/api/status/${this.providerType}`, true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.send(JSON.stringify(users));
        xhr.onreadystatechange = () => {
            if(xhr.readyState == 4 && xhr.status == 200)
                this.onDiscoverUsersSuccess(xhr.responseText);
        }
    }

    onDiscoverUsersSuccess(responseText) {
        var items = JSON.parse(responseText);

        for(let user in items) {
            if(items[user])
                this.users.push(user);
        }

        this.render();
    }
}

class GitterAgent extends BaseAgent {
    constructor() {
        super();
        this.providerType = "github";
    }

    start() {
        if(window.top == window)
            return ;

        new MutationObserver(this.onDomChange.bind(this)).observe(document, {
            childList: true,
            subtree: true
        });
    }

    initUser() {
        if(this.user)
            return ;

        try {
            this.user = window.top.document.querySelector(".menu-header__profile .menu-header__name").textContent.trim();
        } catch(e) {}
    }

    initUnknownUsers() {
        var nodes,
            users = [];

        nodes = document.querySelectorAll(".chat-item.burstStart:not(.t-user) .js-chat-item-from");
        nodes = [].slice.call(nodes);

        for(let node of nodes) {
            users.push(node.textContent.trim());
            Utils.getParentByCls(node, "chat-item").classList.add("t-user");
        }

        var unknownUsers = [];

        for(let user of users) {
            if(this.users.indexOf(user) == -1)
                unknownUsers.push(user);
        }

        if(unknownUsers.length > 0)
            this.discoverUsers(unknownUsers);
    }

    renderButton(user) {
        var template = document.createElement("template");

        template.innerHTML = `
            <a href="http://tips.60devs.com/#/pay/github/${user}" target="_blank" class="t-ext-button t-ext-gitter-button">
                ${Utils.t("leave tips")}
            </a>`

        return template.content;
    }

    render() {
        var nodes;

        nodes = document.querySelectorAll(".t-user .js-chat-item-from");
        nodes = [].slice.call(nodes);

        for(let node of nodes) {
            var chatItemNode = Utils.getParentByCls(node, "t-user"),
                user = node.textContent.trim();

            if(this.user == user || chatItemNode.querySelector(".t-ext-button"))
                continue;

            if(this.users.indexOf(user) > -1) {
                var button = this.renderButton(user),
                    placeholder = chatItemNode.querySelector(".chat-item__details");

                placeholder.insertBefore(button, placeholder.querySelector('.chat-item__time'));
            }
        }
    }
}

class StackOverflowAgent extends BaseAgent {
    constructor() {
        super();
        this.providerType = "stackoverflow";
    }

    start() {
        new MutationObserver(this.onDomChange.bind(this)).observe(document, {
            childList: true,
            subtree: true
        });
    }

    initUser() {
        if(this.user)
            return ;

        try {
            var href = document.querySelector(".profile-me").getAttribute("href"),
                user = href.match(/\d+/)[0];

            this.user = user;
        } catch(e) {}
    }

    initUnknownUsers() {
        var nodes,
            users = [];

        nodes = document.querySelectorAll(".answer:not(.t-user) .user-info:last-child .user-details a");
        nodes = [].slice.call(nodes);

        for(let node of nodes) {
            users.push(node.getAttribute("href").match(/\d+/)[0]);
            Utils.getParentByCls(node, "answer").classList.add("t-user");
        }

        var unknownUsers = [];

        for(let user of users) {
            if(this.users.indexOf(user) == -1)
                unknownUsers.push(user);
        }

        if(unknownUsers.length > 0)
            this.discoverUsers(unknownUsers);
    }

    renderButton(user) {
        var template = document.createElement("template");

        template.innerHTML = `
            <a href="http://tips.60devs.com/#/pay/stackoverflow/${user}" target="_blank" class="t-ext-button t-ext-stackoverflow-button">
                ${Utils.t("leave tips")}
            </a>`

        return template.content;
    }

    render() {
        var nodes;

        nodes = document.querySelectorAll(".t-user .user-info:last-child .user-details a");
        nodes = [].slice.call(nodes);

        for(let node of nodes) {
            var answerNode = Utils.getParentByCls(node, "t-user"),
                user = node.getAttribute("href").match(/\d+/)[0];

            if(this.user == user || answerNode.querySelector(".t-ext-button"))
                continue;

            if(this.users.indexOf(user) > -1) {
                var button = this.renderButton(user),
                    placeholder = answerNode.querySelector(".vt > .post-menu");

                placeholder.appendChild(button);
            }
        }
    }
}

class Application {
    constructor() {
        if(/^tips\.60devs/.test(location.hostname))
            this.init60DevsSite();
        else
            this.initAgent();
    }

    initAgent() {
        var host = location.hostname,
            agent;

        if(/^stackoverflow\.com$/.test(host))
            agent = StackOverflowAgent;

        if(/^gitter\.im$/.test(host))
            agent = GitterAgent;

        if(agent) {
            this.agent = new agent;
            this.agent.start();
        }
    }

    init60DevsSite() {
        var div = document.createElement("div");
        div.id = "extension-installed";

        document.body.appendChild(div);
    }

    getIconPath(active) {
        return active ? "../icon_active_64.png" : "../icon_64.png";
    }
}

new Application;