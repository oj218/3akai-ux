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
/*global $, sdata, get_cookie, Config */

var sakai = sakai || {};

sakai.token = function(tuid, showSettings){
    var rootel = "#" +tuid;
    var $getTokenBtn = $('#token_getToken',rootel);
    var $token = $('#token_token',rootel);

    var getToken = function(){
        $.ajax({
            url : "http://localhost:8080/system/trusted/generateToken",

            success : function(data){
                var token = $.evalJSON(data);
                $token.html(token.token);
            },
            error : function(data){
                console.log(data);
            }
        });
    };

    var init = function(){
        $getTokenBtn.bind('click',getToken);
    };

        init();

};
sdata.widgets.WidgetLoader.informOnLoad("token");