/*
* Licensed to the Sakai Foundation (SF) under one
* or more contributor license agreements. See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership. The SF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License. You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied. See the License for the
* specific language governing permissions and limitations under the License.
*/
 
/*global $, sdata, Config, addBinding */
 
var sakai = sakai || {};
 
sakai.todo = function(tuid, placement, showSettings){
 
/////////////////////////////
// Configuration variables //
/////////////////////////////
 
// - ID
    var rootel = $("#" + tuid);
    var todoSubject = $("#todo_subject",rootel);
    var todoDate = $("#todo_date",rootel);
    var todoAddButton = $('#todo_add_button',rootel);
    var todoPriority = $('#todo_priority',rootel);
    var todoContainer = $('#todo_container ',rootel);
    
    
    var todoTasks = $('#todo_tasks',rootel);
    var todoTemplate = 'todo_template';
    var priorityOptions = {
        1: '1',
        2: '2',
        3: '3',
        4: '4',
        5: '5'
    };
    
    
    // Paging
    var pageCurrent = 0;        // The page you are currently on
    var pageSize = 10;            // How many items you want to see on 1 page
    var jqPagerClass = ".jq_pager";  
    var parseglobal = [];
    var parseglobalArray = [];
    var globalfeed = false;
    
    // Templates
    var todo_template = "todo_template";
    
    var todoId = "#todo";
    var $todoContainer = $(todoId + "_container");
    var $todoSubcontainer = $(todoId + "_subcontainer");
    
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
        renderTodolist();
    };

    /**
     * Render the paging of the courses and projects widget
     */
    var renderPaging = function(){
        // Render paging
        $(jqPagerClass).pager({
            pagenumber: pageCurrent + 1,
            pagecount: Math.ceil(parseglobalArray.length / pageSize),
            buttonClickCallback: doPaging
        });
    };
    
    
 
 
var resetValues = function(){
 
    };
    resetValues();
    
/**
*
* @param {Object} json
*/
    
    var renderTodolist = function(){       
        
        var test= Object;
         
        parseglobalArray = []; 
        for (var c in parseglobal.all) {
            if (parseglobal.all.hasOwnProperty(c) ) {
                if(typeof(parseglobal.all[c]) === "object" ){
                parseglobalArray.push(parseglobal.all[c]);
                }
            }
        }
        
        console.log(parseglobalArray.length);
       
        
        var pagingArray = {
            all : parseglobalArray.slice(pageCurrent * pageSize, (pageCurrent * pageSize) + pageSize)
        };
        
        console.log(pagingArray.all.length);
         
        //parseglobal.all = parseglobal.all.slice(pageCurrent * pageSize, (pageCurrent * pageSize) + pageSize); 
        todoTasks.html($.Template.render(todoTemplate, pagingArray));
        
        if(parseglobalArray.length >= 0){//pageSize
            renderPaging();
        }
        
        
        
        };
    
/**
*
* @param {Object} response
*/
    var loadTodolist = function(response){
        //Check if the request was successful
        
        if(response){
            //parseglobal = ;
            parseglobal = {
            all:$.evalJSON(response)
            };
            
            //Render the todolist for the current user.
            renderTodolist();
        }
    };
    
var getTodolist = function(){
    $.ajax({
        url: placement + "todo/" + tuid + ".infinity.json",
        
        success: function(data){          
             loadTodolist(data);
        },
        error: function(){
             loadTodolist(false);
        }
    });
};
 
 
    function sendDataComplete(){
       getTodolist();
    }
 
/**
*
* @param {Object} json
*/
    function sendDataTodoFirstTime(json){
        //Concatinate the url to post to
        var postUrl = placement + "todo/" + tuid;
        var jsonArray = {};
        jsonArray[json.subject] = json;
        // post the data from the form (in a json object),
        // to the server then execute the comlete function
        sdata.preference.save(postUrl,jsonArray,sendDataComplete);
    }
 
 
var init = function (){
    getTodolist();
    todoAddButton.click(function() {
        var json;
    json = {
            "error":"",
            "subject": "",
            "id": "",
            "doBy": "",
            "priority" :""
        };
    json.subject = todoSubject.val();
    json.doBy = todoDate.val();
    json.priority = todoPriority.val();
    sendDataTodoFirstTime(json);
     });
};
 
 
var addBinding = function(){
      $(todoDate).datepicker({
     });
     
     $.each(priorityOptions, function(val, text) {
    todoPriority.append(
        $('<option></option>').val(val).html(text)
    );
});
     
    };
addBinding();
 
init();
};
 
sdata.widgets.WidgetLoader.informOnLoad("todo");