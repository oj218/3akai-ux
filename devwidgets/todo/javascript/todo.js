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
	
	var $todoWidget = $("#todo_widget",rootel)
	var todoTemplates = "todo_template";

    var json = false;
	var resetValues = function(){
	    json = {
            "error":"",
        };
        json.error = "";
        json.subject = "";
        json.id = "";
        json.doBy= "";
		json.priority= "";
	}
	resetValues();
    /*
     * 
     */
    var init = function (){
        //cach this
	$('#add_button').click(function() {
        //
		var val = $("#todo_subject",rootel).val();
		json.subject = val;
		json.doBy = 
        $("#todo_widget", rootel).html($.Template.render('todo_template',json));
		
     });

	}
	init();

    var renderTodolist = function(response){
            console.log(response);
            $recentactivitiesContainer.html($.Template.render(recentactivitiesTemplate, response));

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
	url: "/devwidgets/todo/data.json",
    success: function(data){
       loadTodolist(data);
     },
       error: function(){
       loadTodolist(false);
     }
	});
};


	var addBinding = function(){
      $(todo_Date).datepicker({
     });
    }
addBinding();


};

sdata.widgets.WidgetLoader.informOnLoad("todo");