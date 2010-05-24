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

    ///////////////////////
    // Global variables //
    //////////////////////

    // Templates
    var $macProfileTemplate = $("#mac_profile_template");

    // Variables
    var $mac_profile = $('#mac_profile');

    // Global variables
    var url = "http://localhost:8080";

    /**
     * This function will display the profile data
     * @param {Object} data, the response gotten from the ajax call
     */
    var displayProfileInformation = function(data){

        var profile = data;
        profile.userPicture = constructProfilePicture(data);
        $mac_profile.html($.TemplateRenderer($macProfileTemplate,profile));
    };



    /**
     * Check whether there is a valid picture for the user
     * @param {Object} profile The profile object that could contain the profile picture
     * @return {String}
     * The complete URL of the profile picture
     * Will be an empty string if there is no picture
     */
    var constructProfilePicture = function(profile){
        if (profile.picture && profile.path) {
            return url+"/_user" + profile.path + "/public/profile/" + $.parseJSON(profile.picture).name;
        } else {
            return url+"/dev/_images/person_icon.jpg";
        }
    };

    /**
     *  This function will get the profile information
     */
    var getProfileInformation = function(token){
        $.ajax({
            url: path+"/system/me",
            beforeSend:function(xhr){
                // Set a new field in the header with a token that is generated when the user is logged in in sakai
                xhr.setRequestHeader("x-sakai-token",token);
            },
            success: function(data){
                displayProfileInformation(data);
            },
            error: function(xhr, textStatus, thrownError){
                fluid.log("Error at the request for the profile information after the drag and drop");
            }
        });
    };

