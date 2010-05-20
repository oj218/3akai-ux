/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
/*global Config, $, sData, sakai window widget fluid */

///////////////////////
// Global variables //
//////////////////////

var $w7LoginContainer = $("#w7_login-container");
var usernameField = "w7_username";
var passwordField = "w7_password";
var $w7Username = $('#w7_username');
var $w7Password = $('#w7_password');
var $w7Tabs = $(".w7_tabs");
var $w7RecentMessages = $('#w7_recentMessages');
var $w7Short = $(".w7_short");
var $w7RecentMessages = $('#w7_recentMessages');
var $w7BackButton = $("#w7_back_button");
var $w7Message = $("#w7_message");
var $w7TableHeader = $("#w7_table_header");

// Error messages
var $w7LogError = $("#w7_log_error");

// Templates
var $w7RecentmessagesTemplate = $('#w7_recentmessages_template');
var $w7MessageTemplate = $("#w7_messageTemplate");


// Global variables
var path = "http://localhost:8080";
var user;
var first = true;
var defaultvalue;
var defaultvalue2;
var changeColorBlack = "w7_changeColorBlack"; // Css class to change the textcolour
var changeColorNormal = "w7_changeColorNormal"; // Css class to change the textcolour
/**
 *  This function will render the message in the widget
 */
var showMessage = function(){
    $w7RecentMessages.hide();

    //Get the subject,message and sender from the li, the message and subject are hidden
    var messageObj = {
        'sender': $($('.w7_user_repeat'), $(this).parent()).html(),
        "subject": $($('.w7_hidden'), $(this).parent()).html(),
        "message": $('p', $(this).parent()).html()
    };

    //Render the message
    $w7Message.html($.TemplateRenderer($w7MessageTemplate, messageObj));
    $w7Message.show();
};

/**
 *  This function will display the recentmessages
 * @param {Object} data, the response
 */
var displayRecentMessages = function(data){
    $('a', $w7Tabs).show();
    if (data.results.length) {

        // Only display 7 recentmessages
        if (data.results.length > 7) {
            data.results = data.results.splice(data.results.length - 7, data.results.length);
        }

        $w7LoginContainer.hide();
        data.user = user.user.userid;
        $w7RecentMessages.html($.TemplateRenderer($w7RecentmessagesTemplate, data));
        $w7RecentMessages.show();
    }

    $w7Short = $(".w7_short");
    $("a", $w7RecentMessages).bind('click', showMessage);
    $w7Short.each(function(){
        $(this).html(sakai.api.Util.shortenString($(this).html(), 60));
    });
};

/**
 *  This function will get the recentmessages
 */
var getRecentMessages = function(){
    $.ajax({
        url: "http://localhost:8080/var/message/box.json?box=inbox",
        success: function(data){
            displayRecentMessages(data);
        },
        error: function(xhr, textStatus, thrownError){
            fluid.log("Error at the request for new images after the drag and drop");
        }
    });
};

/**
 * This will determine whether there is a valid session. If there is, we'll
 * redirect to the URL requested or the personal dashboard if nothing has been provided.
 */
var decideLoggedIn = function(data){
    var mejson = (data === undefined ? sakai.data.me : $.evalJSON(data));

    if (mejson.user.userid) {
        $w7LogError.hide();
        user = mejson;
        getRecentMessages();
    }
    else {
        $w7LogError.show();
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
        url: "http://localhost:8080/system/me",
        cache: false,
        success: function(data){
            decideLoggedIn(data);
        },
        error: function(xhr, textStatus, thrownError){
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

    var values = sakai.api.UI.Forms.form2json($w7LoginContainer);

    var data = {
        "sakaiauth:login": 1,
        "sakaiauth:un": values[usernameField],
        "sakaiauth:pw": values[passwordField],
        "_charset_": "utf-8"
    };

    $.ajax({
        url: "http://localhost:8080/system/sling/formlogin",
        type: "POST",
        success: checkLogInSuccess,
        error: checkLogInSuccess,
        data: data
    });

    return false;
};

/**
 * This function will show the list of recentmessages and hide the currentmessage
 */
var showList = function(){
    $w7Message.hide();
    $w7RecentMessages.show();
};


/**
 * This is the logout functionality
 */
var logout = function(){
    $('a', $w7Tabs).hide();
    $.ajax({
        url: path + "/system/sling/formlogin",
        type: "POST",
        complete: function(){
            $w7RecentMessages.html('');
            $w7Message.html('');
            $w7LoginContainer.show();
            $w7Username.val(defaultvalue);
            $w7Password.val(defaultvalue2);
        },
        data: {
            "sakaiauth:logout": "1",
            "_charset_": "utf-8"
        }
    });
};

/**
 * This function will chnage the colour of the textbox
 * @param {Object} textbox
 */
var changeColour2 = function(textbox){

    // If the value is the default value, clear the inputbox
    if (textbox.val() === defaultvalue2) {
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
var checkEmpty2 = function(textbox){

    // Change the colour of the text in the inputbox
    textbox.removeClass(changeColorBlack);
    textbox.addClass(changeColorNormal);

    // Check if it's empty, if it is fill it in with the default value
    if (!textbox.val()) {
        textbox.val(defaultvalue2);
    }
};

/**
 * This function will chnage the colour of the textbox
 * @param {Object} textbox
 */
var changeColour = function(textbox){

    // If the value is the default value, clear the inputbox
    if (textbox.val() === defaultvalue) {
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
    if (!textbox.val()) {
        textbox.val(defaultvalue);
    }
};

$w7Username.blur(function(){
    checkEmpty($w7Username);
});

//If the textbox gets focussed change the colour of the text
$w7Username.focus(function(){
    changeColour($w7Username);
});

$w7Password.blur(function(){
    checkEmpty2($w7Password);
});

//If the textbox gets focussed change the colour of the text
$w7Password.focus(function(){
    changeColour2($w7Password);
});

/**
 * This funtion is executed at the start
 */
var init = function(){
    $('a', $w7TableHeader).live('click', logout);
    $w7LoginContainer.submit(performLogIn);
    defaultvalue = $w7Username.val();
    defaultvalue2 = $w7Password.val();
    $w7BackButton.live('click', showList);

};
init();