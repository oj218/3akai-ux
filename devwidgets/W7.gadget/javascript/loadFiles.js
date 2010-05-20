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

        var sakaiUrl = "http://localhost:8080";
        var counter = 0;
        var urlArray = [];
        var oScript ;

        /**
         * This function will be executed on the onload if there's a js file else if's a css file it's just called
         * This function will call the include_js function again but with a diffrent variable
         */
       function loaded(){
           counter++;
           if(counter !== urlArray.length){
                    include_js(urlArray[counter][0]);
           }
       }

        /**
         * This function will check if the file is a js file or a css file and make the tag
         * Then append it to the page and check if's loaded
         * @param {Object} file
         */
       function include_js(file) {
           var oHead = document.getElementsByTagName('head')[0];
           if (urlArray[counter][1] === 'js') {
               oScript = document.createElement('script');
               oScript.type = 'text/javascript';
               oScript.src = urlArray[counter][0];
               oHead.appendChild(oScript);
               oScript.onreadystatechange = function () {
                   if (this.readyState == 'loaded') {
                       loaded();
                   }
               }
           }
           else {
               oScript = document.createElement("link");
               oScript.rel = "stylesheet";
               oScript.type = "text/css";
               oScript.href = urlArray[counter][0];
               oHead.appendChild(oScript);
               loaded();
           }
       }

    /**
     * This functin will create a 2-dimensional array that includes the urls for the css and js files
     */
    var makeArray = function(){

        urlArray.push([sakaiUrl + '/dev/_lib/jquery/jquery.js','js']);
        urlArray.push([sakaiUrl + '/dev/_lib/jquery/jquery-ui.custom.js','js']);
        urlArray.push([sakaiUrl + '/dev/_lib/jquery/plugins/jquery.json.js','js']);
        urlArray.push([sakaiUrl + '/dev/_lib/sakai_util/trimpath.template.js','js']);
        urlArray.push([sakaiUrl + '/dev/_lib/Fluid/3akai_Infusion.js','js']);
        urlArray.push([sakaiUrl + '/dev/_lib/sakai_util/sdata.js','js']);
        urlArray.push([sakaiUrl + '/dev/_lib/jquery/plugins/jquery.threedots.js','js']);
        urlArray.push([sakaiUrl + '/dev/_lib/sakai_util/sakai_magic.js','js']);
        urlArray.push([sakaiUrl + '/devwidgets/W7.gadget/javascript/W7.js','js']);
        urlArray.push([sakaiUrl + '/dev/_css/sakai/sakai.base.css','css']);
        urlArray.push([sakaiUrl + '/devwidgets/W7.gadget/css/mac.css','css']);

    };


    var init = function(){
        makeArray();
        include_js(urlArray[counter]);
    };

    init();
