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


    // Front, Form
    var $sakaiTabs = $("#sakai_tabs");
    var $sakaiBody = $('#sakai_body');
    var redirectUrl = sakai.config.URL.MY_DASHBOARD_URL;
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

    // Templates
   var $statusTemplate = $("#mySakWi_status_template");
   var $mySakWiRecentmessagesTemplate = $('#mySakWi_recentmessages_template');
   var $mySakWiMessageTemplate = $('#mySakWi_messageTemplate');


    // Global Variables
    var defaultvalue;
    var changeColorBlack = "flickr_changeColorBlack"; // Css class to change the textcolour
    var changeColorNormal = "flickr_changeColorNormal"; // Css class to change the textcolour

    // Errors
    $mySakWiNoTokenError = $('#mySakWi_NoTokenError');
    $mySakWiAnotherToken = $('#mySakWi_AnotherToken');

    ////////////////////
    // Reusable Code //
    ///////////////////

    var changeColour = function(textbox){

         // If the value is the default value, clear the inputbox
         if(textbox.val() === defaultvalue){
             textbox.val('');
         }

         // Change the color of the text of the inputbox
         textbox.removeClass(changeColorNormal);
         textbox.addClass(changeColorBlack);
     };

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

    function showfrontside(event){

        var front = document.getElementById("front");
        var back = document.getElementById("back");

        if (window.widget)
            widget.prepareForTransition("ToFront");

        front.style.display="block";
        back.style.display="none";

        if (window.widget)
            setTimeout ('widget.performTransition();', 0);
    }

    function getLocalizedString (key){
 
        try {
            var ret = localizedStrings[key];
            if (ret == undefined)
                ret = key;
            return ret;
        } catch (ex) {}

        return key;
    }


    function showbackside(event){

        var front = document.getElementById("front");
        var back = document.getElementById("back");

        if (window.widget)
            widget.prepareForTransition("ToBack");

        front.style.display="none";
        back.style.display="block";

        if (window.widget)      
            setTimeout ('widget.performTransition();', 0);  
    }

    ////////////////////
    // RecentMessages //
    ////////////////////

    var expandMessage = function(){
        if ($('p',$(this).parent()).css("display") === "none") {
            $("p", $mySakWiRecentMessages).each(function(){
                $('p',$(this).parent()).hide('slow');
            });
            $('p', $(this).parent()).show('slow');
        }else{
            $('p',$(this).parent()).hide('slow');
        }
    };

    var showList = function(){
        $mySakWiMessage.hide();
        $sakaiBody.show();
    }

    var showMessage = function(){
        $sakaiBody.hide();
        var messageObj = {
            'sender':$('.mySakWi_user',$(this).parent()).html(),
            "subject" : $(this).html(),
            "message":$('p',$(this).parent()).html()
        };

        $mySakWiMessage.html($.TemplateRenderer($mySakWiMessageTemplate,messageObj));
        $mySakWiMessage.show();
    };

    var displayRecentMessages= function(data){
        data.results = data.results.splice(data.results.length-5,data.results.length);
        $sakaiBody.html($.TemplateRenderer($mySakWiRecentmessagesTemplate,data));
        $mySakWiRecentMessages = $('#mySakWi_RecentMessages');
        $("li",$mySakWiRecentMessages).ThreeDots({max_rows:1});
        $("a",$mySakWiRecentMessages).bind('click',showMessage);
    };

    var saveToken = function(token){

        $.ajax({
            url: "http://localhost:8080/var/message/box.json?box=inbox",
            beforeSend:function(xhr){
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

    var getToken = function(){

        $mySakWiNoTokenError.hide();
        $mySakWiAnotherToken.hide();
        var values = sakai.api.UI.Forms.form2json($mySakWiTokenForm);
        token = values.token.replace(' ', '');

        if (token === defaultvalue) {
            $mySakWiAnotherToken.show();
        } else if (!token) {
            checkEmpty($mySakWiToken);
            $mySakWiNoTokenError.show();
        }  else  if (window.widget) {
           widget.setPreferenceForKey(token, 'tokd');
           $mySakWiTokenForm.hide();
           $doneButton.children().trigger('click');
        }
         saveToken(values.token);
    };

    /**
     * This function is executed when the widget is loaded
     */
    var init = function(){

        new AppleInfoButton(document.getElementById("infoButton"), document.getElementById("front"), "black", "black", showbackside);
        new AppleGlassButton(document.getElementById('doneButton'), getLocalizedString('Done'), showfrontside);

        if (window.widget) {
            if(widget.preferenceForKey('tokd')){
                $mySakWiTokenForm.hide();
                saveToken(widget.preferenceForKey('tokd'));
            }
        }

        defaultvalue = $mySakWiToken.val();

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

