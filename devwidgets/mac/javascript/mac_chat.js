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

    var $macChat = $("#mac_chat");
    var $macUsers = $('#mac_users');
    var $macChatWindows = $('#mac_chat_windows');
    var $macChatInput = $('.mac_chat_input');
    var $macChatWith = $('.mac_chat_with');
    var $macContent = $('#mac_content');
    var $macChatContent = $('.mac_chat_content');
    var $macChatWindow = $('.mac_chat_window');

    /* CSS STYLES */
   var macChatHide = 'mac_chat_hide';

    // Templates
    var $macChatTemplate = $('#mac_chat_template');
    var $macUsersOnlineTemplate = $('#mac_users_online_template');
    var $macChatWindowTemplate = $('#mac_chat_window_template');
    var $chatContentTemplate = $("#chat_content_template");

    var getOnlineUsers = function(data){
        var onlineFriends = [];

        $(data.contacts).each(function(){
            if (this["sakai:status"] === "online" && this.chatstatus !== "offline") {
                onlineFriends.push($(this));
            }
        });
            data.contacts = onlineFriends;
            return data;
    };


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
    var createChatMessage = function(isMessageFromOtherUser, otherUserName, inputmessage, inputdate){
        var message = {};

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
    var addChatMessage = function(el, message){
        if (el.length > 0) {
            message = createChatMessage(false, message['sakai:from'], message["sakai:body"], message["sakai:created"]);
            el.append(renderChatMessage(message));
        }
    };


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
                addChatMessage($('.mac_chat_content',$chatWindow.parent()),data.message);

                $chatWindow.val('');
            },
            error: function(xhr, textStatus, thrownError){
                alert("An error has occured when sending the message.");
            },
            data: data
        });
        
    };

    var sendMessage = function(ev){
        if (ev.keyCode === 13) {
            var to = $($macChatWith,$(this).parent()).html();
            var text = $(this).val();
            if(text){

                    // Create a chat message object
                    var message = {};

                    // Fill in the object with the appropriate data
                    message = createChatMessage(false, "", text, new Date());

                    var data = {
                        "sakai:type": "chat",
                        "sakai:sendstate": "pending",
                        "sakai:messagebox": "outbox",
                        "sakai:to": "chat:" + to,
                        "sakai:from": getProfile().profile.firstName,
                        "sakai:subject": "",
                        "sakai:body": text,
                        "sakai:category": "chat",
                        "_charset_": "utf-8"
                    };

        sendMessageAjax(data,$(this));

            }
        }
    };

    var hideChat = function(){

        $macChatContent = $('.mac_chat_content');
        $macChatInput = $('.mac_chat_input');
        $($macChatContent,$(this).parent()).hide();
        $($macChatInput,$(this).parent()).hide();
        $($macChatWith,$(this).parent()).addClass(macChatHide);
    };

    var showChat = function(){
        $($macChatContent,$(this).parent()).show();
        $($macChatInput,$(this).parent()).show();
        $($macChatWith,$(this).parent()).removeClass(macChatHide);
    };

    var checkExistance = function(user){
        $macChatWindow = $('.mac_chat_window');
         var check ;

        $($macChatWindow).each(function(){

            if($(this).attr('id').split('_')[$($(this).attr('id').split('_')).length-1] === user){
                check = true;
            }else{
                check = false;
            }
        });
        return check;
    };

    var startChat = function(){

        if (checkExistance($(this).html()) !== true) {
            var user = {
                'user': $(this).html()
            };
            $macChatWindows.append($.TemplateRenderer($macChatWindowTemplate, user));
            $macChatWith = $('.mac_chat_with');
            if($($macChatWindow).length){
                $($macChatWindow[$($macChatWindow).length-1]).css('left',($($macChatWindow).length -1) *150 + 'px');
            }

            $macChatWith.toggle(hideChat, showChat);
            $macChatInput = $('.mac_chat_input');
            $macChatInput.bind("keydown", sendMessage);
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
        $macChat.html($.TemplateRenderer($macChatTemplate,data));
        $(data.contacts).each(function(){
            if((this['sakai:status'] !== "offline")){
                if ((this.profile.chatstatus !== "offline")) {
                    count++;
                }
            }
        });
        var onlineUsers = {
            'count':count
        };
        $macUsers.html($.TemplateRenderer($macUsersOnlineTemplate,onlineUsers));
        $('a',$macChat).bind('click',startChat);

        if(open === true){
            $('ul',$macChat).show();
        }
        if(data.contacts.length){
            $macUsers.show();
            $macUsers.toggle(showOnlineUsers,hideOnlineUsers);
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
