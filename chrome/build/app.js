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
        value: function start() {
            this.onDomChange();
            chrome.runtime.onMessage.addListener(this.onExtensionMessage.bind(this));
        }
    }, {
        key: "onExtensionMessage",
        value: function onExtensionMessage(request) {
            if (request.action == "pageActionClick") this.onPageActionClick();
        }
    }, {
        key: "onPageActionClick",
        value: function onPageActionClick() {
            var button = document.querySelector(".t-ext-button");

            if (button) this.hightlightButton(button);else alert("No users who are able to accept tips on this page.");
        }
    }, {
        key: "hightlightButton",
        value: function hightlightButton(button) {
            button.scrollIntoViewIfNeeded();

            var overlay = document.createElement("div");
            overlay.classList.add("t-ext-overlay");

            document.body.appendChild(overlay);
            document.body.classList.add("t-ext-attention-showing");

            setTimeout(function () {
                document.body.classList.remove("t-ext-attention-showing");
                document.body.classList.add("t-ext-attention-hiding");

                setTimeout(function () {
                    document.body.classList.remove("t-ext-attention-hiding");
                    overlay.parentNode.removeChild(overlay);
                }, 500);
            }, 1000);
        }
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
        this.document = document;
        this.providerType = "github";
    }

    _inherits(GitterAgent, _BaseAgent);

    _createClass(GitterAgent, [{
        key: "start",
        value: function start() {
            if (window.top == window) return;

            _get(Object.getPrototypeOf(GitterAgent.prototype), "start", this).call(this);
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
                var scripts = window.top.document.scripts;
                scripts = [].slice.call(scripts);

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = scripts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var script = _step.value;

                        var matches = script.textContent.match(/\"username\"\:\"([^\"]+)\"/);

                        if (matches) {
                            this.user = matches[1];
                            break;
                        }
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
            } catch (e) {}
        }
    }, {
        key: "initUnknownUsers",
        value: function initUnknownUsers() {
            var nodes,
                users = [];

            nodes = document.querySelectorAll(".chat-item.burstStart:not(.t-user) .js-chat-item-from");
            nodes = [].slice.call(nodes);

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = nodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var node = _step2.value;

                    users.push(node.textContent.trim());
                    Utils.getParentByCls(node, "chat-item").classList.add("t-user");
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

            var unknownUsers = [];

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = users[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var user = _step3.value;

                    if (this.users.indexOf(user) == -1) unknownUsers.push(user);
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

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = nodes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var node = _step4.value;

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
        }
    }]);

    return GitterAgent;
})(BaseAgent);

var GithubAgent = (function (_BaseAgent2) {
    function GithubAgent() {
        _classCallCheck(this, GithubAgent);

        _get(Object.getPrototypeOf(GithubAgent.prototype), "constructor", this).call(this);
        this.providerType = "github";
    }

    _inherits(GithubAgent, _BaseAgent2);

    _createClass(GithubAgent, [{
        key: "start",
        value: function start() {
            _get(Object.getPrototypeOf(GithubAgent.prototype), "start", this).call(this);
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
                this.user = document.head.querySelector("meta[name='octolytics-actor-login']").getAttribute("content").trim();
            } catch (e) {}
        }
    }, {
        key: "initUnknownUsers",
        value: function initUnknownUsers() {
            if (this.isIssuesPage()) this.initUnknownUsersOnIssuesPage();else this.initUnknownUsersOnProfilePage();
        }
    }, {
        key: "isIssuesPage",
        value: function isIssuesPage() {
            return !!document.getElementById("show_issue");
        }
    }, {
        key: "initUnknownUsersOnIssuesPage",
        value: function initUnknownUsersOnIssuesPage() {
            var nodes,
                users = [];

            nodes = document.querySelectorAll("#show_issue .js-comment-container:not(.t-user) .timeline-comment-avatar");
            nodes = [].slice.call(nodes);

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = nodes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var node = _step5.value;

                    users.push(node.getAttribute("alt").substring(1));
                    Utils.getParentByCls(node, "js-comment-container").classList.add("t-user");
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

            var unknownUsers = [];

            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = users[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var user = _step6.value;

                    if (this.users.indexOf(user) == -1) unknownUsers.push(user);
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

            if (unknownUsers.length > 0) this.discoverUsers(unknownUsers);
        }
    }, {
        key: "initUnknownUsersOnProfilePage",
        value: function initUnknownUsersOnProfilePage() {
            var userNode = document.querySelector(".profilecols .vcard-names .vcard-username:not(.t-user)"),
                user;

            if (!userNode) return;

            userNode.classList.add("t-user");
            user = userNode.textContent.trim();

            if (this.users.indexOf(user) == -1) this.discoverUsers([user]);
        }
    }, {
        key: "renderButton",
        value: function renderButton(user) {
            var template = document.createElement("template");

            template.innerHTML = "\n            <a href=\"http://tips.60devs.com/#/pay/github/" + user + "\" target=\"_blank\" class=\"t-ext-button t-ext-github-button\">\n                " + Utils.t("leave tips") + "\n            </a>";

            return template.content;
        }
    }, {
        key: "render",
        value: function render() {
            if (this.isIssuesPage()) this.renderOnIssuesPage();else this.renderOnProfilePage();
        }
    }, {
        key: "renderOnIssuesPage",
        value: function renderOnIssuesPage() {
            var nodes,
                users = [];

            nodes = document.querySelectorAll("#show_issue .t-user");
            nodes = [].slice.call(nodes);

            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = nodes[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var node = _step7.value;

                    var user = node.querySelector(".timeline-comment-avatar").getAttribute("alt");
                    user = user.substring(1).trim();

                    if (this.user == user || node.querySelector(".t-ext-button")) continue;

                    if (this.users.indexOf(user) > -1) node.appendChild(this.renderButton(user));
                }
            } catch (err) {
                _didIteratorError7 = true;
                _iteratorError7 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion7 && _iterator7["return"]) {
                        _iterator7["return"]();
                    }
                } finally {
                    if (_didIteratorError7) {
                        throw _iteratorError7;
                    }
                }
            }
        }
    }, {
        key: "renderOnProfilePage",
        value: function renderOnProfilePage() {
            try {
                var profileNode = document.querySelector(".profilecols .vcard"),
                    userNode = profileNode.querySelector(".vcard-names .vcard-username"),
                    user = userNode.textContent.trim();

                if (this.user == user || this.users.indexOf(user) == -1 || profileNode.querySelector(".t-ext-button")) return;

                profileNode.insertBefore(this.renderButton(user), profileNode.querySelector(".vcard-details"));
            } catch (e) {}
        }
    }]);

    return GithubAgent;
})(BaseAgent);

var StackOverflowAgent = (function (_BaseAgent3) {
    function StackOverflowAgent() {
        _classCallCheck(this, StackOverflowAgent);

        _get(Object.getPrototypeOf(StackOverflowAgent.prototype), "constructor", this).call(this);
        this.providerType = "stackoverflow";
    }

    _inherits(StackOverflowAgent, _BaseAgent3);

    _createClass(StackOverflowAgent, [{
        key: "start",
        value: function start() {
            _get(Object.getPrototypeOf(StackOverflowAgent.prototype), "start", this).call(this);
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

            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
                for (var _iterator8 = nodes[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                    var node = _step8.value;

                    users.push(node.getAttribute("href").match(/\d+/)[0]);
                    Utils.getParentByCls(node, "answer").classList.add("t-user");
                }
            } catch (err) {
                _didIteratorError8 = true;
                _iteratorError8 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion8 && _iterator8["return"]) {
                        _iterator8["return"]();
                    }
                } finally {
                    if (_didIteratorError8) {
                        throw _iteratorError8;
                    }
                }
            }

            var unknownUsers = [];

            var _iteratorNormalCompletion9 = true;
            var _didIteratorError9 = false;
            var _iteratorError9 = undefined;

            try {
                for (var _iterator9 = users[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                    var user = _step9.value;

                    if (this.users.indexOf(user) == -1) unknownUsers.push(user);
                }
            } catch (err) {
                _didIteratorError9 = true;
                _iteratorError9 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion9 && _iterator9["return"]) {
                        _iterator9["return"]();
                    }
                } finally {
                    if (_didIteratorError9) {
                        throw _iteratorError9;
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

            var _iteratorNormalCompletion10 = true;
            var _didIteratorError10 = false;
            var _iteratorError10 = undefined;

            try {
                for (var _iterator10 = nodes[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                    var node = _step10.value;

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
                _didIteratorError10 = true;
                _iteratorError10 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion10 && _iterator10["return"]) {
                        _iterator10["return"]();
                    }
                } finally {
                    if (_didIteratorError10) {
                        throw _iteratorError10;
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

            if (/^github\.com/.test(host)) agent = GithubAgent;

            if (agent) {
                this.agent = new agent();
                this.agent.start();
            }
        }
    }, {
        key: "init60DevsSite",
        value: function init60DevsSite() {
            var div = document.createElement("div");
            div.id = "extension-installed";

            document.body.appendChild(div);
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