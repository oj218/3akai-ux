/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/*global Config, $, sData, sakai window widget localizedStrings  AppleVerticalScrollbar fluid AppleScrollArea AppleInfoButton AppleGlassButton*/

    ///////////////////////
    // Global variables //
    //////////////////////

    // Global variable
    var url = "http://localhost:8080";
    var globToken;
    var first = true;
    var open = false;
    var PrevOnlineUsers;
    var time = [];
    var pulltime = "2100-10-10T10:10:10.000Z";

    var $macChat = $("#mac_chat");
    var $macUsers = $('#mac_users');
    var $macChatWindows = $('#mac_chat_windows');
    var $macChatInput = $('.mac_chat_input');
    var $macChatWith = $('.mac_chat_with');
    var $macContent = $('#mac_content');
    var $macChatContent = $('.mac_chat_content');
    var $macChatWindow = $('.mac_chat_window');
    var $macChatPeopleIcon = $('#mac_chat_people_icon');
    var onlineUsers;

    /* CSS STYLES */
   var macChatHide = 'mac_chat_hide';

    // Templates
    var $macChatTemplate = $('#mac_chat_template');
    var $macUsersOnlineTemplate = $('#mac_users_online_template');
    var $macChatWindowTemplate = $('#mac_chat_window_template');
    var $chatContentTemplate = $("#chat_content_template");

    /**
     * Format the input date to a AM/PM Date
     * @param {Date} d Date that needs to be formatted
     */
    var parseToAMPM = function(d){
        var current_hour = d.getHours();
        var am_or_pm = "";
        if (current_hour < 12) {
            am_or_pm = "AM";
        }
        else {
            am_or_pm = "PM";
        }
        if (current_hour === 0) {
            current_hour = 12;
        }
        if (current_hour > 12) {
            current_hour = current_hour - 12;
        }

        var current_minutes = d.getMinutes() + "";
        if (current_minutes.length === 1) {
            current_minutes = "0" + current_minutes;
        }

        return current_hour + ":" + current_minutes + am_or_pm;
    };


    /**
     * Create a chat message
     * @param {Object} isMessageFromOtherUser Is the message from another user
     * @param {Object} otherUserName The name of the other user
     * @param {Object} inputmessage The text that needs to be added to the message
     * @param {Object} inputdate The date of the message
     */
    var createChatMessage = function(isMessageFromOtherUser, otherUserName, inputmessage, inputdate,addId){

        var message = {};
        message.id = addId;

        // Check if the message is from the other user
        if (isMessageFromOtherUser) {
            message.name = otherUserName;
        }
        else {
            message.name = "Me";
        }

        message.message = inputmessage;

        /** Parse the date to get the hours and minutes */
        //var messageDate = new Date(inputdate);
        //2009-07-27T13:48:47.999+01:00
        var messageDate = false;
        if (typeof inputdate === "string") {
            messageDate = new Date(parseInt(inputdate.substring(0, 4), 10), parseInt(inputdate.substring(5, 7), 10) - 1, parseInt(inputdate.substring(8, 10), 10), parseInt(inputdate.substring(11, 13), 10), parseInt(inputdate.substring(14, 16), 10), parseInt(inputdate.substring(17, 19), 10));
        }
        else {
            messageDate = new Date(inputdate);
        }
        message.time = parseToAMPM(messageDate);

        return message;
    };

    /**
     * Return the render of a certain chat message
     * @param {Object} message Message that needs to be rendered
     */
    var renderChatMessage = function(message){
        return $.TemplateRenderer($chatContentTemplate, message);
    };

    /**
     * Add a chat message
     * @param {Object} el Element where the element needs to be attached to
     * @param {Object} message Message that needs to be appended
     */
    var addChatMessage = function(el, message,addId){
        if (el.length > 0) {
            messageHTML = createChatMessage(false, message['sakai:from'], message["sakai:body"], message["sakai:created"],addId);
            el.append(renderChatMessage(messageHTML));
            el.attr("scrollTop", el.attr("scrollHeight"));
        }
    };

    /**
     * 
     * @param {Object} data, The response from the ajax call
     * @param {Object} $chatWindow, This is the jQuery object to which the message will be appended to
     */
    var sendMessageAjax = function(data,$chatWindow){

        $.ajax({
            url: url + "/_user" + getProfile().user.properties.path + "/message.create.html",
                        beforeSend:function(xhr){
                // Set a new field in the header with a token that is generated when the user is logged in in sakai
                xhr.setRequestHeader("x-sakai-token",globToken);
            },
            type: "POST",
            success: function(data){

                // Append the message to the chatbox
                addChatMessage($('.mac_chat_content',$chatWindow.parent()),data.message,true);

                $chatWindow.val('');
            },
            error: function(xhr, textStatus, thrownError){
                alert("An error has occured when sending the message.");
            },
            data: data
        });
        
    };

    /**
     * This function is executed when a user does a keypress
     * @param {Object} ev
     */
    var sendMessage = function(ev){

        //Check if enter is pressed
        if (ev.keyCode === 13) {

            // Check to who the message has to be sent
            var to = $('.mac_chat_with',$(this).parent()).html();

            // Get the message
            var text = $(this).val();
            if(text){

                    var data = {
                        "sakai:type": "chat",
                        "sakai:sendstate": "pending",
                        "sakai:messagebox": "outbox",
                        "sakai:to": "chat:" + to,
                        "sakai:from": getProfile().profile.userid,
                        "sakai:subject": "",
                        "sakai:body": text,
                        "sakai:category": "chat",
                        "_charset_": "utf-8"
                    };

        sendMessageAjax(data,$(this));

            }
        }
    };

    /**
     *  This function will hide the chat
     */
    var hideChat = function(){
        $('.mac_chat_content',$(this).parent()).hide();
        $('.mac_chat_input',$(this).parent()).hide();
        $('.mac_chat_with',$(this).parent()).addClass(macChatHide);
    };

    /**
     * This function will show the chat
     */
    var showChat = function(){
        $('.mac_chat_content',$(this).parent()).show();
        $('.mac_chat_input',$(this).parent()).show();
        $('.mac_chat_with',$(this).parent()).removeClass(macChatHide);
    };

    /**
     * Check if a chat conversation exists
     * @param {Object} user
     * @example checkExistance('admin')
     */
    var checkExistance = function(user){
        $macChatWindow = $('.mac_chat_window');
         var check ;

        //Loop over all the conversation and see if there's a div with the id with the userid in 
        $($macChatWindow).each(function(index,test){
            if($(this).attr('id').split('_')[$($(this).attr('id').split('_')).length-1] === user){
                check = true;
                return false;
            }else{
                check = false;
            }
        });
        return check;
    };

    /**
     * This function will create a chat frame if there is no chat frame for the conversation
     */
    var startChat = function(){

        // Check if the chatwindow for that user allready exists
        if (!checkExistance($(this).html())) {
            var user = {
                'user': $(this).html()
            };
            $macChatWindows.append($.TemplateRenderer($macChatWindowTemplate, user));
            $macChatWith = $('.mac_chat_with');
            $macChatWindow = $('.mac_chat_window');
            if($($macChatWindow).length){

                // Add a chat frame next to the other chat frame
                $($macChatWindow[$($macChatWindow).length-1]).css('left',($($macChatWindow).length -1) *150 + 'px');
                $('.mac_chat_with',$('#chat_with_'+user.user)).toggle(hideChat, showChat);
                $('.mac_chat_input',$('#chat_with_'+user.user)).bind("keydown", sendMessage);
            }
        }
    };

    /**
     * This function will append a received message to the right frame
     * @param {Object} htmlMessage
     * @param {Object} userId
     */
    var appendMessageToHTML = function(htmlMessage,userId){

        user = {
            'user':userId
        }

        // When the users sends a message it's appended to the frame
        // But every 3 sec there's a check if there are new message
        // This will return this just sent message too, it's essential this isn't shown too
        // So when it's appended to the frame it gets a unique id
        // If this id exists it shouldn't be appended to the frame a second time

        if (!$('#mac_delete').length) {

            // check if there's alleady a converstion with this user
            // IF there is one append the message to that conversation
            if (checkExistance(userId)) {
                $('.mac_chat_content', $('#chat_with_' + userId)).append(htmlMessage);
            }
            // else make a new conversation
            else {
                $macChatWindows.append($.TemplateRenderer($macChatWindowTemplate, user));
                $macChatWith = $('.mac_chat_with');
                $macChatWindow = $('.mac_chat_window');
                if ($($macChatWindow).length) {
                    $($macChatWindow[$($macChatWindow).length - 1]).css('left', ($($macChatWindow).length - 1) * 150 + 'px');
                    $('.mac_chat_with', $('#chat_with_' + user.user)).toggle(hideChat, showChat);
                    $('.mac_chat_input', $('#chat_with_' + user.user)).bind("keydown", sendMessage);
                }
                $('.mac_chat_content', $('#chat_with_' + userId)).append(htmlMessage);
            }
        }else{
            $('#mac_delete').removeAttr('id');
        }

        $('.mac_chat_content', $('#chat_with_' + userId)).attr("scrollTop", $('.mac_chat_content', $('#chat_with_' + userId)).attr("scrollHeight"));
        
    };

    /**
     * The purpose of this function is to render html based on an object
     * @param {Object} data
     */
    var renderReceivedChatMessage = function(data){
        var userid;

        // Check if there are chat messages
        if(data.results){

            // Loop over them to check if it's from the user himself or another user
            // This can happen when a user sends a chat message from another platform( mobile, website)
            $(data.results).each(function(){
                var isMessageFromOtherUser;
                var profile = getProfile();

               if(this.userFrom[0].userid === profile.profile['rep:userId']){
                        isMessageFromOtherUsertrue = false 
                        chatwithusername = 'me';
                        userid = this.userTo[0].userid;
                  } else{
                        isMessageFromOtherUser = true;
                        chatwithusername = this.userFrom[0].userid;
                        userid = this.userFrom[0].userid;
                }
                var message = createChatMessage(isMessageFromOtherUser, chatwithusername,this['sakai:body'], this['sakai:created'],false)
                appendMessageToHTML(renderChatMessage(message),userid);
            })
        }
    };

    /**
     * This function will request the chatmessages
     */
    var requestMessages = function(){
        var tosend = onlineContacts.join(",");

        $.ajax({
            url: url + sakai.config.URL.CHAT_GET_SERVICE.replace(/__KIND__/, "unread"),
            beforeSend: function(xhr){

                // Set a new field in the header with a token that is generated when the user is logged in in sakai
                xhr.setRequestHeader("x-sakai-token", globToken);
            },
            data: {
                "_from": tosend,
                "items": 1000,
                "t": pulltime
            },
            cache: false,

            success: function(data){
               renderReceivedChatMessage(data);
            },
            error: function(xhr, textStatus, thrownError){
                alert('error');
            }
        });
    };

    /**
     * This function will check if there are any new chatmessages
     */
    var checkNewMessages = function(){

        // Create a data object
        var data = {};

        // Check if the time is not 0, if so set the current time
        if (time.length !== 0) {
            data.t = time;
        }

        // Send an Ajax request to check if there are any new messages, but only if there are contacts online
        if (onlineUsers) {
            if (onlineUsers.count > 0) {
                $.ajax({
                    url:  url + "/_user" + getProfile().profile.path + "/message.chatupdate.json",
                    data:data,
                    beforeSend:function(xhr){

                    // Set a new field in the header with a token that is generated when the user is logged in in sakai
                    xhr.setRequestHeader("x-sakai-token",globToken);
                    },
                    success: function(data){

                        // Get the time
                        time = data.time;

                        pulltime = data.pulltime;

                        if (data.update) {
                            requestMessages()
                        }

                            setTimeout(checkNewMessages, 3000);

                    }
                });
            }
        }
    };

    /**
     * Hide the online users
     */
    var hideOnlineUsers = function(){
        open = false;
        $('ul',$macChat).hide();
        $(this).removeClass('activeChat');
    };

    /**
     * Show the online users
     */
    var showOnlineUsers = function(){
        open = true;
         $('ul',$macChat).show();
         $(this).addClass('activeChat');
    };

    /**
     * Show the online friends (render the templates)
     * @param {Object} data, response
     */
    var showOnlineFriends = function(data){
        var count = 0;
        onlineContacts = [];

        $macChat.html($.TemplateRenderer($macChatTemplate,data));
        $(data.contacts).each(function(){
            if((this['sakai:status'] !== "offline")){
                if ((this.profile.chatstatus !== "offline")) {
                    onlineContacts.push(this.user);
                    count++;
                }
            }
        });
         onlineUsers = {
            'count':count
        };

        if(PrevOnlineUsers !== onlineUsers.count){
            checkNewMessages();
        }

        PrevOnlineUsers = onlineUsers.count;
        if (count) {
            $macUsers.html($.TemplateRenderer($macUsersOnlineTemplate, onlineUsers));
            $('a', $macChat).bind('click', startChat);
            $macChatPeopleIcon = $('#mac_chat_people_icon');
            $('#mac_chat_people_icon').attr('src',url+'/devwidgets/navigationchat/images/people.png');
            if (open === true) {
                $('ul', $macChat).show();
            }
            if (data.contacts.length) {
                $macUsers.show();
                $macUsers.unbind('click');
                $macUsers.toggle(showOnlineUsers, hideOnlineUsers);
            }
        }
    };


    /**
     * Get the friends of the user
     * @param {Object} token
     */
    var getOnlineContacts = function(token){

        if (first) {
            globToken = token;
            first= false;
        }
        // Receive your online friends through an Ajax request
        $.ajax({
            url: url + "/var/presence.contacts.json",
            beforeSend: function(xhr){
            cache:false;
                // Set a new field in the header with a token that is generated when the user is logged in in sakai
                xhr.setRequestHeader("x-sakai-token", globToken);
            },
            success: function(data){
                showOnlineFriends(data);
                setTimeout(getOnlineContacts, 5000);
            }
        });
    };
