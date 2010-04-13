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

sakai.googlemaps = function(tuid, showSettings){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var rootel = $("#" + tuid);
    var iframeContentWindow = {};
    var json = false;

    /**
     * To finish the widget
     */
    var finish = function() {
        sdata.container.informFinish(tuid,$('#'+tuid).parent());
        getFromJCR();
    };

    /**
     * This will saved the map data to backend server
     */
    var saveToJCR = function() {
        json = $("#googlemaps_iframe_map", rootel)[0].contentWindow.getJSON();

        // Set the value of mapsize according to the radio button selection status
        if ($("#googlemaps_radio_large", rootel).is(":checked")) {
            json.mapsize = "SMALL";
        }
        else {
            json.mapsize = "SMALL";
        }
        showSettings = false;
        // Store the corresponded map data into backend server
        sakai.api.Widgets.saveWidgetData(tuid, json, finish);
    };

    /**
     * To set the map initial size in the show panel
     */
    var setMapSize = function(callback) {
        if(!showSettings) {
            if (json && json.mapsize == "SMALL") {
                $("#googlemaps_form_search", rootel).hide();
                $("#googlemaps_save_cancel_container", rootel).hide();
                $("#googlemaps_save_cancel_container", rootel).hide();
                $("#googlemaps_edit_button").show();
                $(".delete-button").show();
                
                // Set the size of map according to the data stored on the backend server
            }
            else {
                $("#googlemaps_iframe_map", rootel).width("95%");
            }
        }
        else {

            // Show the search input textfield and save, search, cancel buttons
            $("#googlemaps_form_search", rootel).show();
            $("#googlemaps_save_cancel_container", rootel).show();
            $("#googlemaps_edit_button").hide();
            $(".delete-button").hide();
            // Add a submit listener so that the search function can be executed
            $("#googlemaps_form_search", rootel).submit(function() {
                var input = $("#googlemaps_input_text_location", rootel).val();
                if (input) {

                    // Quick hack so that searches are more local - this will need to be done via the Google API
                    if (input.indexOf(",") === -1) {
                        iframeContentWindow.search(input, sakai.data.me.user.locale.displayCountry);
                    } else {
                        iframeContentWindow.search(input, "");
                    }
                }
                return false;
            });

            // Add listener to save button
            $("#googlemaps_save", rootel).bind("click", function(e, ui) {
                saveToJCR();
            });

            if (json) {
                if (json.mapsize == "SMALL") {

                    // If the reserved mapsize is "SMALL", the "small" radio button should be checked
                    $("#googlemaps_radio_small", rootel).attr("checked", "checked");
                }
                else if (json.mapsize == "LARGE") {

                    // If the reserved mapsize is "LARGE", the "large" radio button should be checked
                    $("#googlemaps_radio_large", rootel).attr("checked", "checked");
                }
            }
        }

        callback();  // Set the map center, zoom and infowindow in the map iframe
    };

    /**
     * To set the map's center, zoom, size, info window content properties
     */
    var setMap = function() {
        if (json) {
            iframeContentWindow.setMap(json);
        }
    };

    /**
     * This is to get map zoom and center properties from backend server
     */
    var getFromJCR = function() {

        sakai.api.Widgets.loadWidgetData(tuid, function(success, data){

            if (success) {

                // Get data from the backend server
                json = data;

                // Set the size of the map's iframe
                setMapSize(setMap);

                // Set the initial value of search keyword input textbox
                $("#googlemaps_input_text_location", rootel).val(json.mapinput);
            } else {
                // Show the search input textfield and save, search, cancel buttons
                $("#googlemaps_form_search", rootel).show();
                $("#googlemaps_save_cancel_container", rootel).show();

                // If the googlemaps is opened for the first time, the "large" radio button should be default checked
                $("#googlemaps_radio_large", rootel).attr("checked", "checked");

                // Add a submit listener so that the search function can be executed
                $("#googlemaps_form_search", rootel).submit(function() {
                    var input = $("#googlemaps_input_text_location", rootel).val();
                    if (input) {

                        // Quick hack so that searches are more local - this will need to be done via the Google API
                        if (input.indexOf(",") === -1) {
                            $("#googlemaps_input_text_location", rootel).val(input + ", " + sakai.data.me.user.locale.displayCountry);
                            iframeContentWindow.search(input, sakai.data.me.user.locale.displayCountry);
                        } else {
                            iframeContentWindow.search(input, "");
                        }
                    }
                    return false;
                });

                // Add listener to save button
                $("#googlemaps_save", rootel).bind("click", function(e, ui) {
                    saveToJCR();
                });

                // Add listerner to cancel button
                $("#googlemaps_cancel", rootel).bind("click", function(e, ui) {
                    sdata.container.informCancel(tuid);
                });
            }

        });
    };

    /**
     * This is to init the google map and other controls
     */
    var init = function() {
        $("#googlemaps_iframe_map", rootel).load(function() {

            // To set the map iframe's content as the iframeContentWindow (var)
            iframeContentWindow = $("#googlemaps_iframe_map", rootel)[0].contentWindow;

            // Get the map zoom and center property data from backend server
            getFromJCR();
        });

        // Add listerner to the cancel button
        $("#googlemaps_cancel", rootel).bind("click", function(e, ui){
            $("#" + tuid).parent().remove();
        });

         // Add listerner to the delete button
        $("#googlemaps_delete", rootel).bind("click", function(e, ui){
            $("#" + tuid).parent().remove();
        });

        $("#googlemaps_edit_button").click(function(){
            showSettings = true;
            getFromJCR();
        });
    };
    init();

};

sdata.widgets.WidgetLoader.informOnLoad("googlemaps");
