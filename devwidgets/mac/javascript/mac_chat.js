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

    var $macChat = $("#mac_chat");

    // Templates
    var $macChatTemplate = $('#mac_chat_template');

    var showOnlineFriends = function(data){
        $macChat.html($.TemplateRenderer($macChatTemplate,data));
    };


    var getOnlineContacts = function(token){
        if (first) {
            globToken = token;
            first= false;
        }
        // Receive your online friends through an Ajax request
        $.ajax({
            url: url + "/var/presence.contacts.json",
            beforeSend: function(xhr){

                // Set a new field in the header with a token that is generated when the user is logged in in sakai
                xhr.setRequestHeader("x-sakai-token", globToken);
            },
            success: function(data){
                showOnlineFriends(data);
                setTimeout(getOnlineContacts, 5000);
            }
        });
    };
