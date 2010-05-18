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
/*global $, sdata, Config, addBinding */

    ///////////////////////
    // Global variables //
    //////////////////////

    var $w7LoginContainer = $("#w7_login-container");
    var usernameField = "w7_username";
    var passwordField = "w7_password";
    var $w7RecentMessages = $('#w7_recentMessages');
    var $w7Short = $(".w7_short");
    var $w7RecentMessages = $('#w7_recentMessages');
    var $w7BackButton = $("#w7_back_button");
    var $w7Message = $("#w7_message");

    // Error messages
    var $w7LogError = $("#w7_log_error");

    // Templates
    $w7RecentmessagesTemplate = $('#w7_recentmessages_template');
    $w7MessageTemplate = $("#w7_messageTemplate");


    // Global variables

    var user;

    var showMessage = function () {
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

    var displayRecentMessages = function (data) {

        if (data.results.length) {
            $w7LoginContainer.hide();
            data["user"] = user.user.userid
            $w7RecentMessages.html($.TemplateRenderer($w7RecentmessagesTemplate, data));
        }

        $w7Short = $(".w7_short");


        $("a", $w7RecentMessages).bind('click', showMessage);
        $w7Short.each(function () {
            $(this).html(sakai.api.Util.shortenString($(this).html(), 60));
        });

    }

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
    }

    /**
    * This will determine whether there is a valid session. If there is, we'll
    * redirect to the URL requested or the personal dashboard if nothing has been provided.
    */
    var decideLoggedIn = function (data) {

       
        var mejson = (data === undefined ? sakai.data.me : $.evalJSON(data));
        if (mejson.user.userid) {
            $w7LogError.hide();
            user = mejson;
            getRecentMessages()
        } else {
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
    var checkLogInSuccess = function () {

        $.ajax({
            url: "http://localhost:8080/system/me",
            cache: false,
            success: decideLoggedIn,
            error: function (xhr, textStatus, thrownError) {
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
    var performLogIn = function () {

        var values = sakai.api.UI.Forms.form2json($w7LoginContainer);

        var data = { "sakaiauth:login": 1, "sakaiauth:un": values[usernameField], "sakaiauth:pw": values[passwordField], "_charset_": "utf-8" };

        $.ajax({
            url: "http://localhost:8080/system/sling/formlogin",
            type: "POST",
            success: checkLogInSuccess,
            error: checkLogInSuccess,
            data: data
        });

        return false;

    };

    var showList = function () {
        $w7Message.hide();
        $w7RecentMessages.show();
    };


     /**
     * This funtion is executed at the start
     */
    var init = function(){
        $w7LoginContainer.submit(performLogIn);
        $w7BackButton.live('click', showList);
    };
    init();
