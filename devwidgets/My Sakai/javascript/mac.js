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

/*global Config, $, sData, sakai*/


    //Global variables
    var $sakaiTabs = $("#sakai_tabs");
    var $sakaiBody = $('#sakai_body');

    //Glob vars
    var redirectUrl = sakai.config.URL.MY_DASHBOARD_URL;
    var usernameField = "username";
    var passwordField = "password";
    var failMessage = "#login-failed";
    var loadingMessage = "#login-loader";
    var registerLink = "#register_here";
    var loginButton = "#loginbutton";
    var loginForm = "#login-container";

    //Templates
    var $loginTemplate = $('#mySakWi_login_template');
    var $statusTemplate = $("#mySakWi_status_template");
    var localhost = "http://localhost:8080"


    /**
     * If the user is logged in succesful the username is displayed
     * @param {Object} data
     */
    var decideLoggedIn = function(data){

        var mejson = (data === undefined ? sakai.data.me : data);
        if (mejson.user.userid) {
            var userObj = {
                'all': data
            };
           $sakaiBody.html($.TemplateRenderer($statusTemplate,userObj));
        } else {
            //CheckLogin
            Renderlogin();
        }

    };

    /**
     * This function will check if the login was succesful
     */
    var checkLogInSuccess = function(){

        $.ajax({
            url : localhost + sakai.config.URL.ME_SERVICE,
            cache : false,
            success : decideLoggedIn,
            error: function(xhr, textStatus, thrownError) {
                throw "Me service has failed";
            }
        });

    };

    /**
     * This function will login the user
     */
    var login = function(){

        var values = sakai.api.UI.Forms.form2json($(loginForm));

        var data = {"sakaiauth:login" : 1, "sakaiauth:un" : values[usernameField], "sakaiauth:pw" : values[passwordField], "_charset_":"utf-8"};

        $.ajax({
            url : localhost + sakai.config.URL.LOGIN_SERVICE,
            type : "POST",
            success : checkLogInSuccess,
            error : checkLogInSuccess,
            data : data
        });

        return false;

    };

    /**
     * This funtion will render the html for the login
     */
    var Renderlogin = function(){

        $sakaiBody.html($.TemplateRenderer($loginTemplate,{}));
        $sakaiLoginButton = $("#sakai_login_button");
        $(loginForm).submit(login);
    };

    var logout = function(){
        $.ajax({
            url: localhost + sakai.config.URL.LOGOUT_SERVICE,
            type: "POST",
            complete: function(){
                Renderlogin();
            },
            data: {
                "sakaiauth:logout": "1",
                "_charset_": "utf-8"
            }
        });
    };

    /**
     * This function is executed when the widget is loaded
     */
    var init = function(){

        //Check if the user is logged in
        checkLogInSuccess();
        
        $('#mySakWi_logout').live('click',logout);
    };
    init();

