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

var sakai = sakai || {};

sakai.titlebox = function(tuid, placement, showSettings){
    
     var $dashboardDeleteElement = $(".dashboard_delete_element");
    
    var editsubTitle = function(where){

        //Get the text and put it in the inputbox
        where.find('.dashboard_input_subtitle').val(where.find('.dashboard_input_subtitle_final').children().html());

        //Hide the text
        where.find('.dashboard_input_subtitle_final').hide();

        //Show the inputbox
        where.find('.dashboard_input_subtitle').show();

        //Put the focus on the input box
        where.find('.dashboard_input_subtitle').focus();

        //If the user clicks outside the textbox it'll be transformed back to text
        where.find('.dashboard_input_subtitle').bind("blur",function(){
            reverseSubtitle(where);
        });

        //If the user presses enter during the edit mode it'll be transformed back to text
        where.find('.dashboard_input_subtitle').keyup(function(e) {
            if(e.keyCode == 13) {
                where.find('.dashboard_input_subtitle').blur();
            }
        });
     };

    var editTitle = function(where){

        //Get the text and put it in the inputbox
        where.find('.dashboard_input_tile').val(where.find('.dashboard_input_title_final').children().html());

        //Hide the text
        where.find('.dashboard_input_title_final').hide();

        //Show the inputbox
        where.find('.dashboard_input_tile').show();

        //Put the focus on the input box
        where.find('.dashboard_input_tile').focus();

        //If the user clicks outside the textbox it'll be transformed back to text
        where.find('.dashboard_input_tile').bind("blur",function(){
            reverseTitle(where);
        });

        //If the user presses enter during the edit mode it'll be transformed back to text
        where.find('.dashboard_input_tile').keyup(function(e){
            if (e.keyCode == 13) {
                where.find('.dashboard_input_tile').blur();
            }
        });
    };

    var reverseTitle= function(where){

        //Set the value of the text with the value of the inputbox
        where.find('.dashboard_input_title_final').children().html(where.find('.dashboard_input_tile').val());

        //Show the text
        where.find('.dashboard_input_title_final').show();

        //Hide the inputfield
        where.find('.dashboard_input_tile').hide();
    };

    var reverseSubtitle = function(where){

        //Set the value of the text with the value of the inputbox
        where.find('.dashboard_input_subtitle_final').children().html(where.find('.dashboard_input_subtitle').val());

        //Show the text
        where.find('.dashboard_input_subtitle_final').show();

        //Hide the inputfield
        where.find('.dashboard_input_subtitle').hide();
    };
 
    var removeDeleteImage = function(toDelete){
        //Check if the image exists and then delete it
         if (!toDelete.find($dashboardDeleteElement).length) {
            $dashboardDeleteElement.remove();
        }
    };
 
    var showDeleteButton = function (toDelete){

        //Set the display of the image on block
        $dashboardDeleteElement.css('display','block');

        //IF the image doesn't exist allready add it to the page
        if (!toDelete.parent().parent().find($dashboardDeleteElement).length) {
            console.log($dashboardDeleteElement.length);
            toDelete.append($dashboardDeleteElement[0]);
            $dashboardDeleteElement.show();
        }

        //Add a click event to the delete image
        $dashboardDeleteElement.click(function(){
            var containerDiv = toDelete.parent().parent().parent().parent();
            var dottedline = toDelete.parent().parent().parent();
            $dashboardDeleteElement.parent().remove();
            if(!containerDiv.find('.dashboard_input_title_final').length&&!containerDiv.find('.dashboard_input_subtitle_final').length){
                dottedline.remove();
            }
        });

        //If the users mouse leaves the <p> the image should disappear
        toDelete.mouseleave(function(){
            removeDeleteImage(toDelete);
        });
    };
 
    var confirmTitles = function(where){

        //Get the values from the inputfields and assign it to the <p> tags
        where.find('.dashboard_input_title_final').children().html(where.find('.dashboard_input_tile').val());
        where.find('.dashboard_input_subtitle_final').children().html(where.find('.dashboard_input_subtitle').val());

        //Show the plaintext
        where.find('.dashboard_input_title_final').show();
        where.find('.dashboard_input_subtitle_final').show();

        //Hide the input fields and button
        where.find('.dashboard_input_subtitle').hide();
        where.find('.dashboard_input_tile').hide();
        where.find('.dashboard_title_button').hide();

        //If the user clicks on the text, it'll be transformed into an inputfield
        where.find('.dashboard_input_title_final').click(function(){
            editTitle(where);
        });

        //If the user clicks on the text, it'll be transformed into an inputfield
        where.find('.dashboard_input_subtitle_final').click(function(){
            editsubTitle(where);
        });

        where.find('.dashboard_input_title_final').mouseover(function(){
            showDeleteButton(where.find('.dashboard_input_title_final'));
        });

        where.find('.dashboard_input_subtitle_final').mouseover(function(){
            showDeleteButton(where.find('.dashboard_input_subtitle_final'));
        });
    };

    var init = function(){
        $('.dashboard_title_button').parent().parent().attr("id","");
        $('.dashboard_title_button').parent().parent().attr('class','');

        //Bind the click on the button
        $('.dashboard_title_button').click(function(){
            //call a function that will hide the input boxes and show text
            confirmTitles($(this).parent());
        });
    };
    init();
};
sdata.widgets.WidgetLoader.informOnLoad("titlebox");