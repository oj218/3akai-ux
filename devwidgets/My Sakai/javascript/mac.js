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

    //Front, Form
    var redirectUrl = sakai.config.URL.MY_DASHBOARD_URL;
    var usernameField = "username";
    var passwordField = "password";
    var failMessage = "#login-failed";
    var loadingMessage = "#login-loader";
    var registerLink = "#register_here";
    var loginButton = "#loginbutton";
    var loginForm = "#login-container";

    //Backm form
    var $mySakWiTokenForm = $("#mySakWi_token_form");

    //Templates
   var $statusTemplate = $("#mySakWi_status_template");

    function showfrontside(event)
    {
        var front = document.getElementById("front");
        var back = document.getElementById("back");

        if (window.widget)
            widget.prepareForTransition("ToFront");

        front.style.display="block";
        back.style.display="none";

        if (window.widget)
            setTimeout ('widget.performTransition();', 0);

    }

    function getLocalizedString (key)
    {
        try {
            var ret = localizedStrings[key];
            if (ret == undefined)
                ret = key;
            return ret;
        } catch (ex) {}

        return key;
    }


    function showbackside(event)
    {
        var front = document.getElementById("front");
        var back = document.getElementById("back");
        
        if (window.widget)
            widget.prepareForTransition("ToBack");

        front.style.display="none";
        back.style.display="block";

        if (window.widget)      
            setTimeout ('widget.performTransition();', 0);  
    }

    var displayRecentMessages= function(data){
        alert(data.results[0]['sakai:subject']);
    }

    var saveToken = function(){

        var values = sakai.api.UI.Forms.form2json($mySakWiTokenForm);
        if (window.widget) {
            widget.setPreferenceForKey(values.token, 'token');
        }

        $.ajax({
            url: "http://localhost:8080/var/message/box.json?box=inbox",
            beforeSend:function(xhr){
                xhr.setRequestHeader("x-sakai-token",values.token);
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
     * This function is executed when the widget is loaded
     */
    var init = function(){

        new AppleInfoButton(document.getElementById("infoButton"), document.getElementById("front"), "black", "black", showbackside);
        new AppleGlassButton(document.getElementById('doneButton'), getLocalizedString('Done'), showfrontside);

        $mySakWiTokenForm.submit(saveToken);
    };
    init();

