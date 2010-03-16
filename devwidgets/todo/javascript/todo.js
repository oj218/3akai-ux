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

    ///////////////
    // variables //
    ///////////////


    var rootel = $("#" + tuid);
    var todoSubject = $("#todo_subject", rootel);
    var todoDate = $("#todo_date", rootel);
    var todoAddButton = $('#todo_add_button', rootel);
    var todoPriority = $('#todo_priority', rootel);
    var todoDelete = $('#todo_delete', rootel);
    var todoCheck = $('#todo_check', rootel);
    var todoTasks = $('#todo_tasks', rootel);
    var todoTemplate = 'todo_template';
    var todoHeadSubject = $('#todo_li_head_task', rootel);
    var todoHeadPriority = $('#todo_li_head_priority', rootel);
    var todoHeadDate = $('#todo_li_head_date', rootel);
    var $currentUser;
    var renderPaging;
    var sortHeader;
    var priorityOptions = {
        1: '1',
        2: '2',
        3: '3',
        4: '4',
        5: '5'
    };

    var $todoErrorNotConnected = $("#todo_error_notconnected", rootel);
    var $todoSubject = $("#todo_subject_text", rootel);
    var $todoEnterTask = $("#todo_enter_task_label", rootel);
    var todoSubjectSelected = false;
    var todoDateSelected;

    // Paging
    var pageCurrent = 0; // The page you are currently on
    var pageSize = 10; // How many items you want to see on 1 page
    var jqPagerClass = ".jq_pager";
    var parseglobal = [];
    var parseglobalArray = [];
    
    var todoId = "#todo";
    var $todoContainer = $(todoId + "_container");
    
    var sortBySubject = true;
    var sortByPriority = true;
    var sortByDoBy = true;

    function sortBySubjectAsc(a, b){
        var x = a.subject.toLowerCase();
        var y = b.subject.toLowerCase();
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    }
    
    function sortBySubjectDesc(a, b){
        var x = a.subject.toLowerCase();
        var y = b.subject.toLowerCase();
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    }
    
    function sortByPriorityAsc(a, b){
        var x = a.priority;
        var y = b.priority;
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    }
    
    function sortByPriorityDesc(a, b){
        var x = a.priority;
        var y = b.priority;
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    }
    
    function sortByDoByAsc(a, b){
        var x = a.doBy;
        var y = b.doBy;
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    }
    
    function sortByDoByDesc(a, b){
        var x = a.doBy;
        var y = b.doBy;
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    }

    var renderTodolist = function(){
        //Atm there is only an object with properties of json objects
        //2 of these json objects are irrelevantm, so these need to be deleted
        //To be able to slice the object has to be transformed into an array
        parseglobalArray = [];
        for (var c in parseglobal.all) {
            if (parseglobal.all.hasOwnProperty(c)) {
                if (typeof(parseglobal.all[c]) === "object") {
                    parseglobalArray.push(parseglobal.all[c]);
                }
            }
        }
        // Depending on which column is clicked, sort it 
        if (sortHeader === "subject") {
            if (sortBySubject===true) {
                parseglobalArray.sort(sortBySubjectAsc);
                sortBySubject = false;
            }else{
                parseglobalArray.sort(sortBySubjectDesc);
                sortBySubject = true;
            }
        }else if(sortHeader === "prio") {
            if (sortByPriority===true) {
                parseglobalArray.sort(sortByPriorityAsc);
                sortByPriority = false;
            }else{
                parseglobalArray.sort(sortByPriorityDesc);
                sortByPriority = true;
            }
        } else if(sortHeader === "date")  {
            if (sortByDoBy===true) {
                parseglobalArray.sort(sortByDoByAsc);
                sortByDoBy = false;
            }else{
                parseglobalArray.sort(sortByDoByDesc);
                sortByDoBy = true;
            }
        }

        var pagingArray = {
            all: parseglobalArray.slice(pageCurrent * pageSize, (pageCurrent * pageSize) + pageSize)
        };
        //Render the list
        todoTasks.html($.Template.render(todoTemplate, pagingArray));
        //Fluidinfusion line to make editable text
        fluid.inlineEdits("#todo_task_list");
        fluid.inlineEdit.dropdown("#todo_li_priority");
        
        if (parseglobalArray.length >= 0) {//pageSize
            renderPaging();
        }
    };

    /**
     * 
     * @param {Object} clickedPage
     */
    var doPaging = function(clickedPage){
        pageCurrent = clickedPage - 1;
        renderTodolist();
    };

    renderPaging = function(){
        // Render paging
        $(jqPagerClass).pager({
            pagenumber: pageCurrent + 1,
            pagecount: Math.ceil(parseglobalArray.length / pageSize),
            buttonClickCallback: doPaging
        });
    };

    /**
     * 
     * @param {Object} response
     */
    var loadTodolist = function(response){
        //Check if the request was successful
        
        if (response) {
            //parseglobal = ;
            parseglobal = {
                all: $.evalJSON(response)
            };
            
            //Render the todolist for the current user.
            renderTodolist();
            
            $todoSubject.html($todoEnterTask);
        }else {
            // If it wasn't possible to connect to the server, show the not connected error
            $todoContainer.html($todoErrorNotConnected);
        }
    };


    var getTodolist = function(){
        $.ajax({
            url: "/todo/" + $currentUser.user.userid + "/todo" + ".infinity.json",
            
            success: function(data){
                loadTodolist(data);
            },
            error: function(){
                loadTodolist(false);
            }
        });
    };

    var getCurrentUser = function(){
        $.ajax({
            url: "http://localhost:8080/system/me",
            type: "GET",
            
            success: function(data){
                $currentUser = $.evalJSON(data);
                getTodolist();
            },
            
            error: function(xhr, status, e){
                //console.log("error");
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
        var postUrl = "/todo/" + $currentUser.user.userid + "/todo";
        var jsonArray = {};
        jsonArray[json.subject] = json;
        // post the data from the form (in a json object),
        // to the server then execute the comlete function
        sdata.preference.save(postUrl, jsonArray, sendDataComplete);
    }

    /**
     * 
     * @param {Object} todoList
     */
    var deleteTasks = function(todoList){
        //Do an ajax call for every task in the list, to delete it.
        $.each(todoList, function(i, l){
            var pref_url = "/todo/" + $currentUser.user.userid + "/todo/" + l;
            $.ajax({
                url: pref_url,
                type: "POST",
                data: {
                    ":operation": "delete"
                },
                success: function(data){
                    //Everytime a item is deleted 1 is added to the counter (i)
                    i = i + 1;
                    // When the counter reaches the number of items in the list
                    // the list is reloaded
                    
                    //This is to avoid too many calls (overhead)
                    if (todoList.length === i) {
                        getTodolist();
                    }
                },
                error: function(xhr, status, e){
                    //console.log("error");
                }
            });
        });
        
    };

    var addData = function(){
        var json;
        var errorCount = 0;
        json = {
            "subject": "",
            "doBy": "",
            "priority": ""
        };
        json.subject = todoSubject.val();
        json.doBy = todoDate.val();
        json.priority = todoPriority.val();
        //Validation
        // Check if the textboxes are empty
        //If they're empty, colour them red and in case the normal style is still applied , remove it
        if (json.subject) {
            todoSubject.removeClass('normalStyle');
            todoSubject.addClass('errorStyle');
            errorCount = errorCount + 1;
        }
        if (json.doBy) {
            todoDate.addClass('errorStyle');
            todoDate.removeClass('normalStyle');
            errorCount = errorCount + 1;
        }

        var reg = /^(0[1-9]|1[012])[\- \/.](0[1-9]|[12][0-9]|3[01])[\- \/.](19|20)\d\d/;
        if (!reg.test(json.doBy)) {
            todoDate.addClass('errorStyle');
            todoDate.removeClass('normalStyle');
            errorCount = errorCount + 1;
        }

        // Everytime there is an error, the counter goes up. Only when there are no errors (so 0), the data can be sent 
        if (errorCount === 0) {
            todoDate.val('');
            todoSubject.val('');
            sendDataTodoFirstTime(json);
        }
    };

    //Incremate the counter to see if it has to be alphabetical or not
    var sortSubject = function(){
        sortHeader = 'subject';
        getTodolist();
    };

    var sortPriority = function(){
        sortHeader = 'prio';
        getTodolist();
    };

    var sortDate = function(){
        sortHeader = 'date';
        getTodolist();
    };

    var init = function(){
        getCurrentUser();
        todoDelete.live('click', function(){
            var itemsToDelete = [];
            todoCheck = $('#todo_check', rootel);
            //Have to assign the variable again because the first time 
            //the ajax call isn't completed
            // So there are no checkboxes with that id yet.
            //So need to put it back in the cash
            
            //Get all the names of the checked checkboxes (name = subject)
            todoCheck.each(function(){
                if ($(this).attr('checked')) {
                    itemsToDelete.push($(this).attr('name'));
                }
            });
            //Delete the tasks
            deleteTasks(itemsToDelete);
        });

        todoSubject.focus(function(){
            todoSubject.addClass('normalStyle');
            if (todoSubjectSelected === false) {
                todoSubject.val('');
                todoSubjectSelected = true;
            }
        });

        todoDate.focus(function(){
            todoDate.addClass('normalStyle');
            if (todoDateSelected === false) {
                todoDate.val('');
                todoDateSelected = true;
            }
        });

        todoHeadSubject.live('click', sortSubject);
        todoHeadSubject.addClass('errorStyle');
        todoHeadPriority.live('click', sortPriority);
        todoHeadDate.live('click', sortDate);
        todoAddButton.click(addData);
    };


    var addBinding = function(){
        $(todoDate).datepicker({});

        $.each(priorityOptions, function(val, text){
            todoPriority.append($('<option></option>').val(val).html(text));
        });

    };

    addBinding();
    init();
};

sdata.widgets.WidgetLoader.informOnLoad("todo");
