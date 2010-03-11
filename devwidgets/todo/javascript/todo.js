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

sakai.todo = function(tuid, placement, showSettings){

console.log(placement)
console.log(tuid)
	/////////////////////////////
	// Configuration variables //
	/////////////////////////////

	// - ID
    var rootel = $("#" + tuid)
    var todo = "#todo";
    var todoDate = todo + "_date";
    var todoHourClass = "todo_hour";
    var todoMinClass = "todo_min";
    var todoSubject = $("#todo_subject",rootel);
    var todoDate = $("#todo_date",rootel);
    var todoWidget = $("#todo_widget", rootel);
    var todoAddButton = $('#todo_add_button',rootel);
    var todoPriority = $('#todo_priority',rootel);
    var todoWidgetContainer = $('#todo_widget_container ',rootel);
    var todoTemplate = 'todo_template';
    var json = false;
	var resetValues = function(){
	    json = {
            "error":"",
            "subject": "",
            "id": "",
            "doBy": "",
            "priority" :""
        };

    }
    resetValues();
    
    /**
     * 
     * @param {Object} json
     */
    
    var renderTodolist = function(json){
         todoWidgetContainer.html($.Template.render(todoTemplate, json));
        }
    
    /**
 * 
 * @param {Object} response
 */
    var loadTodolist = function(response){
        //Check if the request was succesful
        if(response){
            var json = $.evalJSON(response);
            
            //Render the todolist for the current user.
            renderTodolist(json);
        }
    };

var getTodolist = function(){
    $.ajax({
    url: placement + "todo/" + tuid + ".json",
    
    success: function(data){
       loadTodolist(data);
     },
       error: function(){
       loadTodolist(false);
     }
    });
};

    function sendDateComplete(){
       getTodolist();
    }

/**
 * 
 * @param {Object} json
 */
    function sendDataTodo(json){
        //Concatinate the url to post to
        postUrl = placement + "todo/" + tuid;
        
        // post the data from the form (in a json object), 
        // to the server then execute the comlete function
        sdata.preference.save(postUrl,json,sendDateComplete);
    }


    var init = function (){
	todoAddButton.click(function() {
        json.subject = todoSubject.val();
        json.doBy = todoDate.val();
        json.priority = todoPriority.val();
        sendDataTodo(json);
		
     });

	}


	var addBinding = function(){
      $(todoDate).datepicker({
     });
    }
addBinding();

init();
};

sdata.widgets.WidgetLoader.informOnLoad("todo");