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

sakai.textfield = function(tuid, placement, showSettings){

    /**
     * The clicked button is passed to this function
     * @param {Object} button
     */
    var save = function(button){

        //Hide the edit mode elements like the textboxes and bold italic buttons
        button.parent().parent().parent().find(".textfield_edit_mode").hide();

        //Assignt the value of the textfield to the p tag
        button.parent().parent().find(".textfield_text").html(button.parent().parent().find(".dashboard_textarea").val());

        //Get the necessairy css values from the textfield and put them in an object
        var cssObj = {
            'font-size': button.parent().parent().find(".dashboard_textarea").css('font-size'),
            'font-weight': button.parent().parent().find(".dashboard_textarea").css('font-weight'),
            'font-style': button.parent().parent().find(".dashboard_textarea").css('font-style')
        };

        //Apply the css on the p tag
        button.parent().parent().find(".textfield_text").css(cssObj);

        //Show the p tag, delete button,edit button
        button.parent().parent().find(".textfield_saved_mode").show();
    };


    /**
     * The clicked button is passed to this function
     * @param {Object} button
     */
    var edit = function (button){

        //Assign the value from the p tag to the textfield
        button.parent().parent().find(".dashboard_textarea").val(button.parent().parent().find(".textfield_text").html());

        //Show the edit elements
        button.parent().parent().parent().find(".textfield_edit_mode").show();

        //Hide the saved part of the widget
        button.parent().parent().find(".textfield_saved_mode").hide();
    };

   var init = function(){

       //Because sdata.widgets.WidgetLoader.insertWidgets(null,true,sakai.site.currentsite.id + "/_widgets/");
       //renders the widget in every div with a specific class the class on the div has to be deleted after it is renderedm else there'll be 2widgets
        $toDelete = $(".dashboard_textarea").parent().parent().parent();
        $toDelete.attr('id',"");
        $toDelete.attr('class',"");

        //Assign the value from the font-size textbox to the font-size css elenent of the content textboxm, this happens on every textchanged event
        $(".dashboard_input_font").keyup(function(){
            $(this).parent().parent().find(".dashboard_textarea").css('font-size', parseInt($(this).parent().parent().find('.dashboard_input_font').val()));
        });

        //On every button click either add bold font-weight or remove it
        $(".submit_button").toggle(function(){
            $(this).parent().parent().find(".dashboard_textarea").css("font-weight", "bold");
        }, function(){
            $(this).parent().parent().find(".dashboard_textarea").css("font-weight", "normal");
        });

        //On every button click either add italic font-style or remove it
        $(".italic_button").toggle(function(){
            $(this).parent().parent().find(".dashboard_textarea").css("font-style", "italic");
        }, function(){
            $(this).parent().parent().find(".dashboard_textarea").css("font-style", "normal");
        });

        //Save the current value of the textfield
        $(".textfield_save").click(function(){
            save($(this));
        });

        //Delete the entire widget
        $(".textfield_delete").click(function(){
            $(this).parent().parent().parent().remove();
        });

        //Edit the text when it's in saved mode
        $(".textfield_edit").click(function(){
            edit($(this));
        });
   };
   init();
};
sdata.widgets.WidgetLoader.informOnLoad("textfield");