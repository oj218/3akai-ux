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
    var clickCountSubjectSorting = 0;
    var clickCountPrioritySorting = 0;
    var clickCountDoBySorting = 0;
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



    /**
     * 
     * @param {Object} arrayName
     * @param {Object} length
     */
    //Sorting function for the diffrent properties
    //Alphabetical Sorting
    var BubbleSortSubject = function(arrayName, length){
        if (clickCountSubjectSorting % 2 !== 0) {
            for (var i = 0; i < (length - 1); i++) {
                for (var j = i + 1; j < length; j++) {
                    if (arrayName[j].subject < arrayName[i].subject) {
                        var dummy = arrayName[i].subject;
                        var dummy2 = arrayName[i].priority;
                        var dummy3 = arrayName[i].doBy;
                        arrayName[i].subject = arrayName[j].subject;
                        arrayName[i].priority = arrayName[j].priority;
                        arrayName[i].doBy = arrayName[j].doBy;
                        arrayName[j].subject = dummy;
                        arrayName[j].priority = dummy2;
                        arrayName[j].doBy = dummy3;
                    }
                }
            }
        }else {
            //reverse alphabetical
            for (var k = 0; k < (length - 1); k++) {
                for (var l = k + 1; l < length; l++) {
                    if (arrayName[l].subject > arrayName[l].subject) {
                        var dummy4 = arrayName[k].subject;
                        var dummy5 = arrayName[k].priority;
                        var dummy6 = arrayName[k].doBy;
                        arrayName[k].subject = arrayName[l].subject;
                        arrayName[k].priority = arrayName[l].priority;
                        arrayName[k].doBy = arrayName[l].doBy;
                        arrayName[l].subject = dummy4;
                        arrayName[l].priority = dummy5;
                        arrayName[l].doBy = dummy6;
                    }
                }
            }
        }
        return arrayName;
    };

    /**
     * 
     * @param {Object} arrayName
     * @param {Object} length
     */
    var BubbleSortPrio = function(arrayName, length){
        if (clickCountPrioritySorting % 2 !== 0) {
            for (var i = 0; i < (length - 1); i++) {
                for (var j = i + 1; j < length; j++) {
                    if (arrayName[j].priority < arrayName[i].priority) {
                        var dummy4 = arrayName[i].subject;
                        var dummy5 = arrayName[i].priority;
                        var dummy6 = arrayName[i].doBy;
                        arrayName[i].subject = arrayName[j].subject;
                        arrayName[i].priority = arrayName[j].priority;
                        arrayName[i].doBy = arrayName[j].doBy;
                        arrayName[j].subject = dummy4;
                        arrayName[j].priority = dummy5;
                        arrayName[j].doBy = dummy6;
                    }
                }
            }
        } else {
            for (var k = 0; k < (length - 1); k++) {
                for (var l = k + 1; l < length; l++) {
                    if (arrayName[l].priority > arrayName[k].priority) {
                        var dummy = arrayName[k].subject;
                        var dummy2 = arrayName[k].priority;
                        var dummy3 = arrayName[k].doBy;
                        arrayName[k].subject = arrayName[l].subject;
                        arrayName[k].priority = arrayName[l].priority;
                        arrayName[k].doBy = arrayName[l].doBy;
                        arrayName[l].subject = dummy;
                        arrayName[l].priority = dummy2;
                        arrayName[l].doBy = dummy3;
                    }
                }
            }
        }
        return arrayName;
    };

    /**
     * 
     * @param {Object} arrayName
     * @param {Object} length
     */
    var BubbleSortDoBy = function(arrayName, length){
        //Check if it has to be alphabetical
        //by doing modulo 2
        // 1 % 2 = 1 ; so alphabetical
        // 2 % 2 = 0 ; so reversed
        if (clickCountDoBySorting % 2 !== 0) {
            for (var i = 0; i < (length - 1); i++) {
                for (var j = i + 1; j < length; j++) {
                    if (arrayName[j].doBy < arrayName[i].doBy) {
                        var dummy = arrayName[i].subject;
                        var dummy2 = arrayName[i].priority;
                        var dummy3 = arrayName[i].doBy;
                        arrayName[i].subject = arrayName[j].subject;
                        arrayName[i].priority = arrayName[j].priority;
                        arrayName[i].doBy = arrayName[j].doBy;
                        arrayName[j].subject = dummy;
                        arrayName[j].priority = dummy2;
                        arrayName[j].doBy = dummy3;
                    }
                }
            }
        }
        else {
            //for (var i = 0, j = splitted.length; i < j; i++) {
            for (var k = 0; k < (length - 1); k++) {
                for (var l = k + 1; l < length; l++) {
                    if (arrayName[l].doBy > arrayName[k].doBy) {
                        var dummy4 = arrayName[k].subject;
                        var dummy5 = arrayName[k].priority;
                        var dummy6 = arrayName[k].doBy;
                        arrayName[k].subject = arrayName[l].subject;
                        arrayName[k].priority = arrayName[l].priority;
                        arrayName[k].doBy = arrayName[l].doBy;
                        arrayName[l].subject = dummy4;
                        arrayName[l].priority = dummy5;
                        arrayName[l].doBy = dummy6;
                    }
                }
            }
        }
        return arrayName;
    };

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
        // Depending on which column is clickedm sort it 
        if (sortHeader === "subject") {
            parseglobalArray = new BubbleSortSubject(parseglobalArray, parseglobalArray.length);
        }else if(sortHeader === "prio") {
            parseglobalArray = new BubbleSortPrio(parseglobalArray, parseglobalArray.length);
        } else if(sortHeader === "date")  {
            parseglobalArray = new BubbleSortDoBy(parseglobalArray, parseglobalArray.length);
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
        if ((json.subject === '')&&(json.subject === undefined)) {
            todoSubject.removeClass('normalStyle');
            todoSubject.addClass('errorStyle');
            errorCount = errorCount + 1;
        }
        if ((json.date === '')&&(json.date === undefined)){
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
        clickCountSubjectSorting = clickCountSubjectSorting + 1;
        sortHeader = 'subject';
        getTodolist();
    };

    var sortPriority = function(){
        clickCountPrioritySorting = clickCountPrioritySorting + 1;
        sortHeader = 'prio';
        getTodolist();
    };

    var sortDate = function(){
        clickCountDoBySorting = clickCountDoBySorting + 1;
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
