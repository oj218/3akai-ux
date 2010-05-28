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

    // Header
    var $macProfileButton = $('#mac_profile_button');
    var $macRecentMessagesButton = $('#mac_recent_messages_button');

    // Front, Form
    var $sakaiTabs = $("#mac_tabs");
    var $sakaiBody = $('#mac_body');
    var usernameField = "username";
    var passwordField = "password";
    var failMessage = "#login-failed";
    var loadingMessage = "#login-loader";
    var registerLink = "#register_here";
    var loginButton = "#loginbutton";
    var loginForm = "#login-container";
    var $macMessage = $('#mac_message');
    var $macBackButton = $("#mac_back_button");
    var $macUserRepeat = $('.mac_user_repeat');
    var $macHidden = $('.mac_hidden');
    var $macCloseChat = $("#mac_close_chat");

    // Back, form
    var $macTokenForm = $("#mac_token_form");
    var $doneButton = $('#mac_doneButton');
    var $macToken = $("#mac_token");
    var $macRecentMessages = $('#mac_recentMessages');
    var $macTokenTag = $('#mac_token_tag');
    var $macTokenTagText = $('#mac_token_tag_text');
    var $logoutButton = $('#mac_logout_button');
    var $macBackside = $('#mac_backside');

    // Profile
    var $macProfile = $('#mac_profile');

    // Templates
   var $statusTemplate = $("#mac_status_template");
   var $macRecentmessagesTemplate = $('#mac_recentmessages_template');
   var $macMessageTemplate = $('#mac_message_template');
   var $macNotLoggedInTemplate = $('#mac_not_logged_in_template');

    // Global Variables
    var defaultvalue;
    var changeColorBlack = "mac_changeColorBlack"; // Css class to change the textcolour
    var changeColorNormal = "mac_changeColorNormal"; // Css class to change the textcolour
    var key ="tokl5";
    var front = document.getElementById("mac_front");
    var back = document.getElementById("mac_back");
    var path = 'http://localhost:8080';
    var globToken;

    // Images
    var $frontImg = $('.mac_frontImg');
    var $macSakaiLogo = $('.mac_sakai_logo');

    // Errors
    var $macNoTokenError = $('#mac_notokenError');
    var $macAnotherToken = $('#mac_anothertoken');
    var $macNoMessage = $('#mac_nomessage');


    /////////////////////
    //   Chat Status   //
    /////////////////////


    /**
     * Set the chatstatus of the user
     * @param {String} chatstatus The chatstatus which should be
     * online/offline or busy
     */
    var sendChatStatus = function(){

        var data = {
            "sakai:status": "online",
            "_charset_": "utf-8"
        };

        $.ajax({
            url: path + sakai.config.URL.PRESENCE_SERVICE,
            type: "POST",
            beforeSend:function(xhr){
            // Set a new field in the header with a token that is generated when the user is logged in in sakai
            xhr.setRequestHeader("x-sakai-token",globToken);
            },
            data: data,
            success: function(data){

            },
            error: function(xhr, textStatus, thrownError){
                alert("An error occurend when sending the status to the server.");
            }
        });
    };


    ////////////////////
    // Reusable Code //
    ///////////////////

    /**
     * This function will remove the spaces from a string
     * @param {Object} string
     */
     function removeSpaces(string) {
        return string.split(' ').join('');
     }

    /**
     * This function will change the colour of the text of the textbox on blur
     * @param {Object} textbox
     */
    var changeColour = function(textbox){

         // If the value is the default value, clear the inputbox
         if(textbox.val() === defaultvalue){
             textbox.val('');
         }

         // Change the color of the text of the inputbox
         textbox.removeClass(changeColorNormal);
         textbox.addClass(changeColorBlack);
     };

    /**
     * This function will check if the inputbox is empty
     * @param {Object} textbox
     * @example checkEmpty($("#myTextBox"))
     */
     var checkEmpty = function(textbox){

         // Change the colour of the text in the inputbox
         textbox.removeClass(changeColorBlack);
         textbox.addClass(changeColorNormal);

         // Check if it's empty, if it is fill it in with the default value
         if(!textbox.val()){
             textbox.val(defaultvalue);
         }
     };

    ////////////////
    // Animation //
    ///////////////

    /**
     * This function will show the front of the widget
     * @param {Object} event
     */
   var showfrontside = function (event){
        if (window.widget) {
            widget.prepareForTransition("ToFront");
        }
        front.style.display="block";
        back.style.display="none";
        if (window.widget) {
            setTimeout(function(){
                widget.performTransition();
            }, 0);
        }
    };

    /**
     * This function will show the backside of the widget
     * @param {Object} event
     */
    var showbackside = function(event){

        if (window.widget) {
            widget.prepareForTransition("ToBack");
        }

        front.style.display="none";
        back.style.display="block";

        if (window.widget) {
            setTimeout(function(){
                widget.performTransition();
            }, 0);
        }
    };

    ////////////////////
    // RecentMessages //
    ////////////////////

    /**
     * This function will hide the message and show the list again
     */
    var showList = function(){
        $macMessage.hide();
        $sakaiBody.show();
    };

    /**
     * This function is executed when a user clicks on a message.
     * Then the message is displayed
     */
    var showMessage = function(){
        $sakaiBody.hide();

        $macHidden = $('.mac_hidden');
        $macUserRepeat = $('.mac_user_repeat');

        //Get the subject,message and sender from the li, the message and subject are hidden
        var messageObj = {
            'sender': $($macUserRepeat, $(this).parent()).html(),
            "subject": $($macHidden,$(this).parent()).html(),
            "message": $('p', $(this).parent()).html()
        };

        //Render the message
        $macMessage.html($.TemplateRenderer($macMessageTemplate, messageObj));
        $macMessage.show();

        //Make the text scrollable
        var gMyScrollbar = new AppleVerticalScrollbar(document.getElementById("mac_myscrollbar"));
        var gMyScrollArea = new AppleScrollArea(document.getElementById("mac_myscrollarea"));
        gMyScrollArea.addScrollbar(gMyScrollbar);
    };

    /**
     * This function will display the recentmessages
     * @param {Object} data
     */
    var displayRecentMessages= function(data){

        showfrontside();

        $logoutButton.show();

        //Clear the body
        $sakaiBody.html('');

        // Check if there are any messages
        if (data.results.length) {

            //If there are more than 7 messages, only show the last 7
            if(data.results.length > 7){
                data.results = data.results.splice(data.results.length - 7, data.results.length);
            }

            data.user = sakai.mac.profile.getProfile().profile.userid;

            //Render the messages
            $sakaiBody.html($.TemplateRenderer($macRecentmessagesTemplate, data));
            $macRecentMessages = $('#mac_recentMessages');
            $("a", $macRecentMessages).bind('click', showMessage);

            //Make sure the subject isn't longer than the div is wide
            $(".mac_short").each(function(){
                if ($(this).html().length > 10) {
                    $(this).html($(this).html().substring(0, 40) + "...");
                }
            });
        }else{
            //If there are no messages show an error messages
            $macNoMessage.show();
        }
    };

    /**
     * This function will do an ajac call to get the messages from the server
     * @param {String} token
     * @exaple saveToken(XWFiZDvAv428m5eMnnbcyWWwY38=;admin)
     */
    var getRecentMessages = function(token){

      var params = $.param({
            box: "inbox",
            category: "message",
            sortOn: "sakai:created",
            sortOrder: "descending"
        });

        $.ajax({
            url: path+sakai.config.URL.MESSAGE_BOXCATEGORY_SERVICE + "?" + params,
            beforeSend:function(xhr){

                // Set a new field in the header with a token that is generated when the user is logged in in sakai
                xhr.setRequestHeader("x-sakai-token",token);
            },
            success: function(data){
                displayRecentMessages(data);
            },

            error: function(xhr, textStatus, thrownError){
                fluid.log("Error at the request for new images after the drag and drop");
            }
        });
    };

    /**
     * This function will get the token from the inputfield and then validate the input and then request the messages
     */
    var getToken = function(){

        // Hide Errors if there are any
        $macNoTokenError.hide();
        $macAnotherToken.hide();

        // Get the token that the user just filled in
        var values = sakai.api.UI.Forms.form2json($macTokenForm);

        //Make sure there are no blank spaces int he token or the default value for comparison
        var token = removeSpaces(values.token);
        defaultvalue = removeSpaces(defaultvalue);

        // Input validation
        if (token === defaultvalue) {
            $macAnotherToken.show();
        } else if (!token) {
            checkEmpty($macToken);
            $macNoTokenError.show();
        } else  if (window.widget) {
           // Save the token
           widget.setPreferenceForKey(token, key);
        }
        globToken = token;
           $macTokenForm.hide();
           $macTokenTagText.show();
           $macTokenTag.html(values.token);
           getRecentMessages(values.token);
           sakai.mac.profile.getProfileInformation(values.token);
    };

    /**
     * This function will log the user out.
     */
    var logout = function(){

               widget.setPreferenceForKey('', key);
               $macTokenForm.show();
               $macTokenTagText.hide();
               $sakaiBody.html($.TemplateRenderer($macNotLoggedInTemplate,{}));
               $macTokenTag.html("");
               $logoutButton.hide();

     var data = {
            "sakai:status": "offline",
            "_charset_": "utf-8"
        };

           $.ajax({
            url: url + sakai.config.URL.PRESENCE_SERVICE,
            type: "POST",
            beforeSend:function(xhr){

                // Set a new field in the header with a token that is generated when the user is logged in in sakai
                xhr.setRequestHeader("x-sakai-token",token);
            },
            succes: function(){



            },
            data:data
        });
    };

    var loadImages = function(){
        $frontImg.attr('src',path+'/devwidgets/mac/Default.png');
        $macSakaiLogo.attr('src',path + '/devwidgets/mac/images/sakai_logo.png');
    };

    /**
     * This function will display the recent messages
     */
    var showRecentMessages = function(){
        $macProfile.hide();
        $sakaiBody.show();
        $macMessage.hide();
    };

    /**
     * This function will display the profile information
     */
    var showProfileInformation =function(){
        $sakaiBody.hide();
        $macProfile.show();
        $macMessage.hide();
    };

    /**
     * Bind the necessairy events
     */
    var bindEvents = function(){

        // On blur the textbox color should be grey
        $macToken.blur(function(){
            checkEmpty($macToken);
        });

        //If the textbox gets focussed change the colour of the text
        $macToken.focus(function(){
            changeColour($macToken);
        });

        $logoutButton.bind('click',logout);
        $macBackside = $('#mac_backside');
        $macBackside.live('click',showbackside);
        $macBackButton.live('click',showList);

        $macTokenForm.submit(getToken);

        // Bind the header buttons
        // This function can be found in mac_profile.js
        $macProfileButton.bind('click',showProfileInformation);
        $macRecentMessagesButton.bind('click',showRecentMessages);
    };

    /**
     * This function is executed when the widget is loaded
     */
    var init = function(){

        // Add the buttons so that the widget can be flipped
        new AppleInfoButton(document.getElementById("mac_infobutton"), document.getElementById("mac_front"), "black", "black", showbackside);
        new AppleGlassButton(document.getElementById('mac_doneButton'),'Done', showfrontside);

        loadImages();

        //Check if this is widget mode
        if (window.widget) {

            // Check if the user already entered a token
            if(widget.preferenceForKey(key)){

                // Get the recent messages
                $macTokenForm.hide();
                $macTokenTagText.show();
                $macTokenTag.html(widget.preferenceForKey(key));
                $logoutButton.show();
                getRecentMessages(widget.preferenceForKey(key));
                sakai.mac.profile.getProfileInformation(widget.preferenceForKey(key));
            }else{
                $sakaiBody.html($.TemplateRenderer($macNotLoggedInTemplate,{}));
            }
        }

        // Get the default value form the textbox
        defaultvalue = $macToken.val();

        bindEvents();
    };
    init();