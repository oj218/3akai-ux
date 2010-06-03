/*
* Licensed to the Sakai Foundation (SF) under one
* or more contributor license agreements. See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership. The SF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License. You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied. See the License for the
* specific language governing permissions and limitations under the License.
*/

var sakai = sakai || {};

sakai.igoogle = function(){

    ///////////////////////
    // GLOBAL VARIABLES //
    //////////////////////

    // Login
    var $igLoginContainer = $('#ig_login-container');
    var usernameField = "ig_username";
    var passwordField = "ig_password";
    var $igPassword = $('#ig_password');
    var $igUsername = $('#w7_username');
    var $igHeader = $('#ig_header');

    // Recent messages
    var $igRecentMessages = $('#ig_recent_messages');
    var $igShort = $(".ig_short");
    var $igHidden = $('.s3d-hidden');
    var $igUserRepeat = $('.ig_user_repeat');
    var $igMessage = $('#ig_message');

    // Error messages
    var $igLoginFailed = $('#ig_login_failed');

    // CSS classes
    var changeColorNormal = 'ig_change_color_normal';
    var changeColorBlack = 'ig_change_color_black';
    var inactivelink = 'ig_inactivelink';
    var activelink = 'ig_activelink';

    // Global variables
    var defaultvalue;
    var defaultvalue2;
    var currentUser;

    // Templates
    var $igRecentmessagesTemplate = $('#ig_recent_messages_template');
    var $igMessageTemplate = $('#ig_message_template');

    /**
     * This will determine whether there is a valid session. If there is, we'll
     * redirect to the URL requested or the personal dashboard if nothing has been provided.
     */
    var decideLoggedIn = function(data){

        $igLoginFailed.hide();

        var mejson = (data === undefined ? sakai.data.me : data);
        if (mejson.user.userid) {
            currentUser = mejson;
            $igLoginContainer.hide();
            $igHeader.show();
            requestRecentMessages();
        } else {
            $igLoginFailed.show();
        }
    };

    /**
     * This function will show the actual message
     */
    var showMessage = function(){

        $igRecentMessages.hide();
        $that = $(this);
        $igHidden = $('.s3d-hidden');
        $igUserRepeat = $('.ig_user_repeat');

        var messageObj = {
            'sender': $($igUserRepeat, $(this).parent()).html(),
            "subject": $($igHidden, $(this).parent()).html(),
            "message": $('p', $(this).parent()).html()
        };

        $igMessage.html($.TemplateRenderer($igMessageTemplate,messageObj));


    };

    /** 
     * This function will render the html for the recent messages
     * @param {Object} data, the response
     */
    var displayRecentMessages = function(data){

        // Check if there are any messages
        if (data.results.length) {

            //If there are more than 7 messages, only show the last 7
            if(data.results.length > 7){
                data.results = data.results.splice(data.results.length - 7, data.results.length);
            }

            data.user = currentUser.user.properties.firstName;

            //Render the messages
            $igRecentMessages.html($.TemplateRenderer($igRecentmessagesTemplate, data));

            //$macRecentMessages = $('#mac_recentMessages');
            $("a", $igRecentMessages).bind('click', showMessage);

            //Make sure the subject isn't longer than the div is wide
            $igShort.each(function(){
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
     * This will be executed after the post to the login service has finished.
     * We send a new request to the Me service, explicity disabling cache by
     * adding a random number behind the URL, becasue otherwise it would get
     * the cached version of the me object which would still say I'm not logged
     * in.
     */
    var checkLogInSuccess = function(){

        $.ajax({
            url : sakai.config.URL.ME_SERVICE,
            cache : false,
            success : decideLoggedIn,
            error: function(xhr, textStatus, thrownError) {
                throw "Me service has failed";
            }
        });

    };


    /**
     * This will extract the username and password entered by the user, will hide the
     * login button and the register here link andwill put up a Signing in ... message
     * It will then call the login service and attempt to log you in. Once the login request
     * has completed, we'll do a new request to the me service and check whether we're
     * logged in
     */
    var performLogIn = function(){

        var values = sakai.api.UI.Forms.form2json($igLoginContainer);

        var data = {
            "sakaiauth:login": 1,
            "sakaiauth:un": values[usernameField],
            "sakaiauth:pw": values[passwordField],
            "_charset_": "utf-8"
        };

        $.ajax({
            url: sakai.config.URL.LOGIN_SERVICE,
            type: "POST",
            success: checkLogInSuccess,
            error: function(){
                alert('error');
            },
            data: data
        });

        return false;
    };


    /**
     * This function will chnage the colour of the textbox
     * @param {Object} textbox
     */
    var changeColour = function(textbox,value){

        // If the value is the default value, clear the inputbox
        if (textbox.val() === value) {
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
    var checkEmpty = function(textbox, value){

        // Change the colour of the text in the inputbox
        textbox.removeClass(changeColorBlack);
        textbox.addClass(changeColorNormal);

        // Check if it's empty, if it is fill it in with the default value
        if (!textbox.val()) {
            textbox.val(value);
        }
    };

    /**
     * This function will do an ajac call to get the messages from the server
     * @param {String} token
     * @exaple saveToken(XWFiZDvAv428m5eMnnbcyWWwY38=;admin)
     */
    var requestRecentMessages = function(){

      var params = $.param({
            box: "inbox",
            category: "message",
            sortOn: "sakai:created",
            sortOrder: "descending"
        });

        $.ajax({
            url: sakai.config.URL.MESSAGE_BOXCATEGORY_SERVICE + "?" + params,
            success: function(data){
                displayRecentMessages(data);
            },
            error: function(xhr, textStatus, thrownError){
                fluid.log("Error at the request for new images after the drag and drop");
            }
        });
    };

    var activateLink = function(){
        $('a',$igHeader).removeClass(activelink);
        $('a',$igHeader).addClass(inactivelink);

        $(this).removeClass(inactivelink);
        $(this).addClass(activelink);
    };


    /**
     * This funtion
     */
    var bindEvents = function(){

        $igPassword.blur(function(){
            checkEmpty($igPassword,defaultvalue2);
        });

        //If the textbox gets focussed change the colour of the text
        $igPassword.focus(function(){
            changeColour($igPassword,defaultvalue2);
        });

        $igUsername.blur(function(){
            checkEmpty($igUsername,defaultvalue);
        });

        //If the textbox gets focussed change the colour of the text
        $igUsername.focus(function(){
            changeColour($igUsername,defaultvalue);
        });

        $('#ig_recent_message_button').bind('click',requestRecentMessages);

        $('#ig_recent_message_button').bind('focus',activateLink);

        $("#ig_profile").bind('focus',activateLink);
    };

    var init = function(){
        $igLoginContainer.submit(performLogIn);
        defaultvalue = $igUsername.val();
        defaultvalue2 = $igPassword.val();

        bindEvents();

        $('body').show();
    };
    init();
};
sakai.igoogle();
