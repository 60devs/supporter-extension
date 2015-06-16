sys = require 'sys'

class Utils

class BaseAgent


class StackOverflowAgent extends BaseAgent


class GitterAgent extends BaseAgent


class Application



new Application().start()
# class Utils

#     ###
#         @param {String} str
#     ###
#     @translate: (str) ->
#         str

# ###
#     Class is responsible for rendering all pay-tips buttons.
# ###
# class RenderHelper

#     ###
#         @param {String} user
#     ###
#     @createButton: (user) ->
#         el = document.createElement "template"
#         el.innerHTML = "<a href='http://tips-for-help.com/pay.html?user=#{user}' target='_blank' class='t-button'>#{Utils.translate('pay-tips')}</a>"
#         el.content

# ###
#     Main Class to run all this stuff together.
# ###
# class Application
#     constructor: ->
#         @user = null
#         @users = []

#     ###
#        application's enter point. 
#     ###
#     start: ->
#         new MutationObserver(@onChange).observe document,
#             childList: true
#             subtree: true

#     ###
#         initializes a user who is using an extension. 
#     ###
#     initCurrentUser: ->
#         node = document.querySelector "#left-menu-profile .menu-header__name"
#         @user = node.innerText if node

#     ###
#         finds users without a status(registered or not) and makes a request in order to discover it.
#     ###
#     initUnknownUsers: ->
        # # get new users from the DOM.
        # nodes = document.querySelectorAll ".chat-item.burstStart:not(.t-unknown-user)"
        # users = []

        # for node in nodes
        #     node.classList.add "t-unknown-user"
        #     fromNode = node.querySelector ".js-chat-item-from"

        #     if fromNode
        #         user = fromNode.innerHTML
        #         users.push user

        # # request the statuses
        # setTimeout =>
        #     @users.push user for user in users
        #     @render()
        # , 1000

#     ###
#         @return {undefined}
#     ###
#     render: ->
#         nodes = document.querySelectorAll ".t-unknown-user"

#         for node in nodes
#             fromNode = node.querySelector ".js-chat-item-from"

#             unless fromNode
#                 continue

#             user = fromNode.innerText

#             # do not add button for current user.
#             if @user == user
#                 continue

#             if @users.indexOf(user) == -1
#                 continue

#             unless node.querySelector(".t-button")
#                 node.querySelector(".js-chat-item-details").appendChild RenderHelper.createButton(user)

#     ###
#         handles a situation when DOM changes.
#     ###
#     onChange: =>
#         @initCurrentUser()
#         @initUnknownUsers()
#         @render()

# new Application().start()