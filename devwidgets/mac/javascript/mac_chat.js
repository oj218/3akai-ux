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

    // Templates
    var $macChatTemplate = $('#mac_chat_template');
    var $macUsersOnlineTemplate = $('#mac_users_online_template');
    var $macChatWindowTemplate = $('#mac_chat_window_template');

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

    var startChat = function(){

        var user = {'user':$(this).html()};
        $macChatWindows.append($.TemplateRenderer($macChatWindowTemplate,user));
    };

    /**
     * Hide the online users
     */
    var hideOnlineUsers = function(){
        open = false;
        $('ul',$macChat).hide();
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
        $macChat.html($.TemplateRenderer($macChatTemplate,data));
        $macUsers.html($.TemplateRenderer($macUsersOnlineTemplate,data));
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
