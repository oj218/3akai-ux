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

    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    // Paging
    var pageCurrent = 0;          // The page you are currently on
    var pageSize = 3;            // How many items you want to see on 1 page

    var jqPagerClass = ".jq_pager";


    ///////////////////////////
    // General functionality //
    ///////////////////////////

    /**
     * Parse the templates with JST
     */
    var parseTemplates = function(){
            renderPaging();
    };

    /**
     * Split the global feed into normal and favourited projects
     */
    var splitGlobalFeed = function(){
        // Parse the template with the new modified feeds
        parseTemplates();
    };


    ////////////
    // Paging //
    ////////////

    /**
     * Will be called when the pager is being clicked.
     * This will initiate a new search query and rerender
     * the current files
     * @param {Object} clickedPage
     */
    var doPaging = function(clickedPage){
        pageCurrent = clickedPage - 1;
        parseTemplates();
    };

    /**
     * Render the paging of the courses and projects widget
     */
    var renderPaging = function(){
        // Render paging
        $(jqPagerClass).pager({
            pagenumber: pageCurrent + 1,
            pagecount: 10,//Math.ceil(parseglobal.all.length / pageSize),
            buttonClickCallback: doPaging
        });
    };

    ////////////////////////
    // Init functionality //
    ////////////////////////

    /**
     * Get the courses and projects for the user that is logged in.
     * This function sends a request to the proxy server that will then send a request to camtools.
     * Since there is single signon functionality, the user is automatically logged into camtools.
     */
    var getCoursesAndProjects = function(){
        splitGlobalFeed();
    };

    /**
     * Execute this function when the widget get launched
     */
    var doInit = function(){

        // Get the courses and projects for the current user
        getCoursesAndProjects();
    };

    doInit();
    
sdata.widgets.WidgetLoader.informOnLoad("todo");