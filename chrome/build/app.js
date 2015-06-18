"use strict";

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Utils = {
    t: function t(key) {
        return key;
    },

    getParentByCls: function getParentByCls(node, cls) {
        while (!node.classList.contains(cls)) {
            node = node.parentNode;

            if (!node) return null;
        }

        return node;
    }
};

var BaseAgent = (function () {
    function BaseAgent() {
        _classCallCheck(this, BaseAgent);

        this.users = [];
        this.user = null;
    }

    _createClass(BaseAgent, [{
        key: "start",
        value: function start() {}
    }, {
        key: "onDomChange",
        value: function onDomChange() {
            this.initUser();
            this.initUnknownUsers();
            this.render();
        }
    }, {
        key: "discoverUsers",
        value: function discoverUsers(users) {
            var _this = this;

            var xhr = new XMLHttpRequest();

            xhr.open("POST", "https://tips.60devs.com/api/status/" + this.providerType, true);
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.send(JSON.stringify(users));
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) _this.onDiscoverUsersSuccess(xhr.responseText);
            };
        }
    }, {
        key: "onDiscoverUsersSuccess",
        value: function onDiscoverUsersSuccess(responseText) {
            var items = JSON.parse(responseText);

            for (var user in items) {
                if (items[user]) this.users.push(user);
            }

            this.render();
        }
    }]);

    return BaseAgent;
})();

var GitterAgent = (function (_BaseAgent) {
    function GitterAgent() {
        _classCallCheck(this, GitterAgent);

        _get(Object.getPrototypeOf(GitterAgent.prototype), "constructor", this).call(this);
        this.providerType = "github";
    }

    _inherits(GitterAgent, _BaseAgent);

    _createClass(GitterAgent, [{
        key: "start",
        value: function start() {
            if (window.top == window) return;

            new MutationObserver(this.onDomChange.bind(this)).observe(document, {
                childList: true,
                subtree: true
            });
        }
    }, {
        key: "initUser",
        value: function initUser() {
            if (this.user) return;

            try {
                this.user = window.top.document.querySelector(".menu-header__profile .menu-header__name").textContent.trim();
            } catch (e) {}
        }
    }, {
        key: "initUnknownUsers",
        value: function initUnknownUsers() {
            var nodes,
                users = [];

            nodes = document.querySelectorAll(".chat-item.burstStart:not(.t-user) .js-chat-item-from");
            nodes = [].slice.call(nodes);

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var node = _step.value;

                    users.push(node.textContent.trim());
                    Utils.getParentByCls(node, "chat-item").classList.add("t-user");
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator["return"]) {
                        _iterator["return"]();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            var unknownUsers = [];

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = users[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var user = _step2.value;

                    if (this.users.indexOf(user) == -1) unknownUsers.push(user);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                        _iterator2["return"]();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            if (unknownUsers.length > 0) this.discoverUsers(unknownUsers);
        }
    }, {
        key: "renderButton",
        value: function renderButton(user) {
            var template = document.createElement("template");

            template.innerHTML = "\n            <a href=\"http://tips.60devs.com/#/pay/github/" + user + "\" target=\"_blank\" class=\"t-ext-button t-ext-gitter-button\">\n                " + Utils.t("leave tips") + "\n            </a>";

            return template.content;
        }
    }, {
        key: "render",
        value: function render() {
            var nodes;

            nodes = document.querySelectorAll(".t-user .js-chat-item-from");
            nodes = [].slice.call(nodes);

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = nodes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var node = _step3.value;

                    var chatItemNode = Utils.getParentByCls(node, "t-user"),
                        user = node.textContent.trim();

                    if (this.user == user || chatItemNode.querySelector(".t-ext-button")) continue;

                    if (this.users.indexOf(user) > -1) {
                        var button = this.renderButton(user),
                            placeholder = chatItemNode.querySelector(".chat-item__details");

                        placeholder.insertBefore(button, placeholder.querySelector(".chat-item__time"));
                    }
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
                        _iterator3["return"]();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }
        }
    }]);

    return GitterAgent;
})(BaseAgent);

var StackOverflowAgent = (function (_BaseAgent2) {
    function StackOverflowAgent() {
        _classCallCheck(this, StackOverflowAgent);

        _get(Object.getPrototypeOf(StackOverflowAgent.prototype), "constructor", this).call(this);
        this.providerType = "stackoverflow";
    }

    _inherits(StackOverflowAgent, _BaseAgent2);

    _createClass(StackOverflowAgent, [{
        key: "start",
        value: function start() {
            new MutationObserver(this.onDomChange.bind(this)).observe(document, {
                childList: true,
                subtree: true
            });
        }
    }, {
        key: "initUser",
        value: function initUser() {
            if (this.user) return;

            try {
                var href = document.querySelector(".profile-me").getAttribute("href"),
                    user = href.match(/\d+/)[0];

                this.user = user;
            } catch (e) {}
        }
    }, {
        key: "initUnknownUsers",
        value: function initUnknownUsers() {
            var nodes,
                users = [];

            nodes = document.querySelectorAll(".answer:not(.t-user) .user-info:last-child .user-details a");
            nodes = [].slice.call(nodes);

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = nodes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var node = _step4.value;

                    users.push(node.getAttribute("href").match(/\d+/)[0]);
                    Utils.getParentByCls(node, "answer").classList.add("t-user");
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
                        _iterator4["return"]();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            var unknownUsers = [];

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = users[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var user = _step5.value;

                    if (this.users.indexOf(user) == -1) unknownUsers.push(user);
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5["return"]) {
                        _iterator5["return"]();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            if (unknownUsers.length > 0) this.discoverUsers(unknownUsers);
        }
    }, {
        key: "renderButton",
        value: function renderButton(user) {
            var template = document.createElement("template");

            template.innerHTML = "\n            <a href=\"http://tips.60devs.com/#/pay/stackoverflow/" + user + "\" target=\"_blank\" class=\"t-ext-button t-ext-stackoverflow-button\">\n                " + Utils.t("leave tips") + "\n            </a>";

            return template.content;
        }
    }, {
        key: "render",
        value: function render() {
            var nodes;

            nodes = document.querySelectorAll(".t-user .user-info:last-child .user-details a");
            nodes = [].slice.call(nodes);

            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = nodes[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var node = _step6.value;

                    var answerNode = Utils.getParentByCls(node, "t-user"),
                        user = node.getAttribute("href").match(/\d+/)[0];

                    if (this.user == user || answerNode.querySelector(".t-ext-button")) continue;

                    if (this.users.indexOf(user) > -1) {
                        var button = this.renderButton(user),
                            placeholder = answerNode.querySelector(".vt > .post-menu");

                        placeholder.appendChild(button);
                    }
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6["return"]) {
                        _iterator6["return"]();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }
        }
    }]);

    return StackOverflowAgent;
})(BaseAgent);

var Application = (function () {
    function Application() {
        _classCallCheck(this, Application);

        if (/^tips\.60devs/.test(location.hostname)) this.init60DevsSite();else this.initAgent();
    }

    _createClass(Application, [{
        key: "initAgent",
        value: function initAgent() {
            var host = location.hostname,
                agent;

            if (/^stackoverflow\.com$/.test(host)) agent = StackOverflowAgent;

            if (/^gitter\.im$/.test(host)) agent = GitterAgent;

            if (agent) {
                this.agent = new agent();
                this.agent.start();
            }

            // chrome.runtime.sendMessage("changeicon", this.getIconPath(!! agent));
        }
    }, {
        key: "init60DevsSite",
        value: function init60DevsSite() {
            window.tipsExtensionInstalled = true;
        }
    }, {
        key: "getIconPath",
        value: function getIconPath(active) {
            return active ? "../icon_active_64.png" : "../icon_64.png";
        }
    }]);

    return Application;
})();

new Application();