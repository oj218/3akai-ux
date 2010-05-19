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


    // Front, Form
    var $sakaiTabs = $("#mySakWi_tabs");
    var $sakaiBody = $('#mySakWi_body');
    var usernameField = "username";
    var passwordField = "password";
    var failMessage = "#login-failed";
    var loadingMessage = "#login-loader";
    var registerLink = "#register_here";
    var loginButton = "#loginbutton";
    var loginForm = "#login-container";
    var $mySakWiMessage = $('#mySakWi_message');
    var $mySakWiBackButton = $("#mySakWi_back_button");

    // Back, form
    var $mySakWiTokenForm = $("#mySakWi_token_form");
    var $doneButton = $('#doneButton');
    var $mySakWiToken = $("#mySakWi_token");
    var $mySakWiRecentMessages = $('#mySakWi_RecentMessages');
    var $mySakWiTokenTag = $('#mySakWi_token_tag');
    var $mySakWiTokenTagText = $('#mySakWi_token_tag_text');

    // Templates
   var $statusTemplate = $("#mySakWi_status_template");
   var $mySakWiRecentmessagesTemplate = $('#mySakWi_recentmessages_template');
   var $mySakWiMessageTemplate = $('#mySakWi_messageTemplate');
    var $mySakWiNotLoggedInTemplate = $('#mySakWi_not_logged_in_template');

    // Global Variables
    var defaultvalue;
    var changeColorBlack = "mySakWi_changeColorBlack"; // Css class to change the textcolour
    var changeColorNormal = "mySakWi_changeColorNormal"; // Css class to change the textcolour

    // Errors
    var $mySakWiNoTokenError = $('#mySakWi_NoTokenError');
    var $mySakWiAnotherToken = $('#mySakWi_AnotherToken');
    var $mySakWiNoMessage = $('#mySakWi_NoMessage');


    ////////////////////
    // Reusable Code //
    ///////////////////

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
     * This is a function written by apple
     * This function will show the front of the widget
     * @param {Object} event
     */
   var showfrontside = function (event){
        var front = document.getElementById("front");
        var back = document.getElementById("back");
        if (window.widget) {
            widget.prepareForTransition("ToFront");
        }
        front.style.display="block";
        back.style.display="none";
        if (window.widget) {
            setTimeout('widget.performTransition();', 0);
        }
    };

    /**
     * This is a function written by apple
     * @param {Object} key
     */
    var getLocalizedString = function(key){
        try {
            var ret = localizedStrings[key];
            if (ret === undefined) {
                ret = key;
            }
            return ret;
        } catch (ex) {}

        return key;
    };


    /** 
     * This is a function written by apple
     * This function will show the backside of the widget
     * @param {Object} event
     */
    var showbackside = function(event){

        var front = document.getElementById("front");
        var back = document.getElementById("back");

        if (window.widget) {
            widget.prepareForTransition("ToBack");
        }

        front.style.display="none";
        back.style.display="block";

        if (window.widget) {
            setTimeout('widget.performTransition();', 0);
        }
    };

    ////////////////////
    // RecentMessages //
    ////////////////////

    /**
     * This function will hide the message and show the list again
     */
    var showList = function(){
        $mySakWiMessage.hide();
        $sakaiBody.show();
    };

    /**
     * This function is executed when a user clicks on a message.
     * Then the message is displayed
     */
    var showMessage = function(){
        $sakaiBody.hide();

        //Get the subject,message and sender from the li, the message and subject are hidden
        var messageObj = {
            'sender': $($('.mySakWi_user_repeat'), $(this).parent()).html(),
            "subject": $($('.mySakWi_hidden'),$(this).parent()).html(),
            "message": $('p', $(this).parent()).html()
        };

        //Render the message
        $mySakWiMessage.html($.TemplateRenderer($mySakWiMessageTemplate, messageObj));
        $mySakWiMessage.show();

        //Make the text scrollable
        var gMyScrollbar = new AppleVerticalScrollbar(document.getElementById("myScrollbar"));
        var gMyScrollArea = new AppleScrollArea(document.getElementById("myScrollArea"));
        gMyScrollArea.addScrollbar(gMyScrollbar);

    };

    /**
     * This function will display the recentmessages
     * @param {Object} data
     */
    var displayRecentMessages= function(data){

        //Clear the body
        $sakaiBody.html('');

        // Check if there are any messages
        if (data.results.length) {

            //If there are more than 7 messages, only show the last 7
            if(data.results.length > 7){
                data.results = data.results.splice(data.results.length - 7, data.results.length);
            }

            //Render the messages
            $sakaiBody.html($.TemplateRenderer($mySakWiRecentmessagesTemplate, data));
            $mySakWiRecentMessages = $('#mySakWi_RecentMessages');
            $("a", $mySakWiRecentMessages).bind('click', showMessage);

            //Make sure the subject isn't longer than the div is wide
            $(".mySakWi_short").each(function(){
                if ($(this).html().length > 10) {
                    $(this).html($(this).html().substring(0, 40) + "...");
                }
            });
        }else{
            //If there are no messages show an error messages
            $mySakWiNoMessage.show();
        }
    };

    /**
     * This function will do an ajac call to get the messages from the server
     * @param {String} token
     * @exaple saveToken(XWFiZDvAv428m5eMnnbcyWWwY38=;admin)
     */
    var saveToken = function(token){

        $.ajax({
            url: "http://localhost:8080/var/message/box.json?box=inbox",
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
        $mySakWiNoTokenError.hide();
        $mySakWiAnotherToken.hide();

        // Get the token that the user just filled in
        var values = sakai.api.UI.Forms.form2json($mySakWiTokenForm);

        //Make sure there are no blank spaces int he token or the default value for comparison
        var token = values.token.replace(' ', '');
        defaultvalue = defaultvalue.replace(' ','');

        // Input validation
        if (token === defaultvalue) {
            $mySakWiAnotherToken.show();
        } else if (!token) {
            checkEmpty($mySakWiToken);
            $mySakWiNoTokenError.show();
        } else  if (window.widget) {

           // Save the token
           widget.setPreferenceForKey(token, 'takxy');
        }
           $mySakWiTokenForm.hide();
           $mySakWiTokenTagText.show();
           $mySakWiTokenTag.html(values.token);
           saveToken(values.token);
    };

    /**
     * This function is executed when the widget is loaded
     */
    var init = function(){

        // Add the buttons so that the widget can be flipped
        new AppleInfoButton(document.getElementById("infoButton"), document.getElementById("front"), "black", "black", showbackside);
        new AppleGlassButton(document.getElementById('doneButton'), getLocalizedString('Done'), showfrontside);


        //Check if this is widget mode
        if (window.widget) {

            // Check if the user already entered a token
            if(widget.preferenceForKey('takxy')){

                // Get the recent messages
                $mySakWiTokenForm.hide();
                $mySakWiTokenTagText.show();
                $mySakWiTokenTag.html(widget.preferenceForKey('takxy'));
                saveToken(widget.preferenceForKey('takxy'));
            }else{
                var emptyObject = {};
                $sakaiBody.html($.TemplateRenderer($mySakWiNotLoggedInTemplate,emptyObject));
            }
        }

        // Get the default value form the textbox
        defaultvalue = $mySakWiToken.val();

        // On blur the textbox color should be grey
        $mySakWiToken.blur(function(){
            checkEmpty($mySakWiToken);
        });

        //If the textbox gets focussed change the colour of the text
        $mySakWiToken.focus(function(){
            changeColour($mySakWiToken);
        });

        $mySakWiBackButton.live('click',showList);

        $mySakWiTokenForm.submit(getToken);

    };
    init();
