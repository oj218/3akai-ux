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
    var todoDelete = $('#todo_delete',rootel);
    var todoCheck = $('#todo_check',rootel);
    var todoTasks = $('#todo_tasks',rootel);
    var todoTemplate = 'todo_template';
    var subjectError;
    var dateError;
    var todoHeadDone = $('#todo_li_head_done',rootel);
    var todoHeadSubject = $('#todo_li_head_task',rootel);
    var todoHeadPriority = $('#todo_li_head_priority',rootel);
    var todoHeadDate = $('#todo_li_head_date',rootel);
    
    var clickCountSubjectSorting = 0;
    var clickCountPrioritySorting = 0;
    var clickCountDoBySorting = 0;
   
    
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
    
    var getCurrentUser = function(){
    $.ajax({
                url: "http://localhost:8080/system/me",
                type: "GET",

            success: function(data) {
              $currentUser = $.evalJSON(data);
               getTodolist();
            },

            error: function(xhr, status, e) {
               console.log("error");
            }
        });
};
    
/**
*
* @param {Object} json
*/
    
var BubbleSortSubject = function(arrayName, length){
    if (clickCountSubjectSorting % 2 !== 0) {
    var i,j;
    for ( i = 0; i < (length - 1); i++) 
        for ( j = i + 1; j < length; j++) 
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
}else{
     for ( i = 0; i < (length - 1); i++) 
        for ( j = i + 1; j < length; j++) 
            if (arrayName[j].subject > arrayName[i].subject) {
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
    return arrayName;
};

var BubbleSortPrio = function(arrayName, length){
    if (clickCountPrioritySorting % 2 !== 0) {
    var i,j;
    for ( i = 0; i < (length - 1); i++) 
        for ( j = i + 1; j < length; j++) 
            if (arrayName[j].priority < arrayName[i].priority) {
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
}else{
     for ( i = 0; i < (length - 1); i++) 
        for ( j = i + 1; j < length; j++) 
            if (arrayName[j].priority > arrayName[i].priority) {
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
    return arrayName;
};

var BubbleSortDoBy = function(arrayName, length){
    if (clickCountDoBySorting % 2 !== 0) {
    var i,j;
    for ( i = 0; i < (length - 1); i++) 
        for ( j = i + 1; j < length; j++) 
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
}else{
     for ( i = 0; i < (length - 1); i++) 
        for ( j = i + 1; j < length; j++) 
            if (arrayName[j].doBy > arrayName[i].doBy) {
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
    return arrayName;
};

    
var renderTodolist = function(){
    var test = Object;
    parseglobalArray = [];
    for (var c in parseglobal.all) {
        if (parseglobal.all.hasOwnProperty(c)) {
            if (typeof(parseglobal.all[c]) === "object") {
                parseglobalArray.push(parseglobal.all[c]);
            }
        }
    }
    // clickCountSubjectSorting 
    if (sortHeader === "subject") {
        parseglobalArray = BubbleSortSubject(parseglobalArray, parseglobalArray.length);
    }
    else 
        if (sortHeader === "prio") {
            parseglobalArray = BubbleSortPrio(parseglobalArray, parseglobalArray.length);
            
        }
        else 
            if (sortHeader === "date") {
                parseglobalArray = BubbleSortDoBy(parseglobalArray, parseglobalArray.length);
                
            }

    var pagingArray = {
        all: parseglobalArray.slice(pageCurrent * pageSize, (pageCurrent * pageSize) + pageSize)
    };
    

    //parseglobal.all = parseglobal.all.slice(pageCurrent * pageSize, (pageCurrent * pageSize) + pageSize); 
    todoTasks.html($.Template.render(todoTemplate, pagingArray));
    
    if (parseglobalArray.length >= 0) {//pageSize
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
            
            $todoSubject.html($todoEnterTask);
        }else{
            // If it wasn't possible to connect to the server, show the not connected error
            $todoContainer.html($todoErrorNotConnected);
        }
    };
    
var getTodolist = function(){
    $.ajax({
        url:   "/todo/" + $currentUser.user.userid + "/todo"+".infinity.json",
        
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
       var postUrl = "/todo/" + $currentUser.user.userid + "/todo";
        var jsonArray = {};
        jsonArray[json.subject] = json;
        // post the data from the form (in a json object),
        // to the server then execute the comlete function
        sdata.preference.save(postUrl,jsonArray,sendDataComplete);
    }
 
     var deleteTasks = function(todoList){
        var i = 0;
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
                    console.log("error");
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
            "priority" :""
        };
    json.subject = todoSubject.val();
    json.doBy = todoDate.val();
    json.priority = todoPriority.val();
    //Validation
    // Check if the textboxes are empty
    //If they're empty, colour them red and incase the normal style is still applied , remove it
    if((json.subject ==="")||(json.subject ===undefined)){
        todoSubject.removeClass('normalStyle');
        todoSubject.addClass('errorStyle');
        errorCount = errorCount + 1;
        }
     if((json.doBy ==="")||(json.doBy ===undefined)){
        
        todoDate.addClass('errorStyle');
        todoDate.removeClass('normalStyle');
        errorCount = errorCount + 1;
        }
       if(todoDate.val()==="do by"){
           todoDate.addClass('errorStyle');
        todoDate.removeClass('normalStyle');
        errorCount = errorCount + 1;
       }
     // Everytime there is an error, the counter goes up. Only when there are no errors (so 0), the data can be sent 
    if (errorCount === 0) {
        todoDate.val('');
         todoSubject.val('');
        sendDataTodoFirstTime(json);
    }};
    var sortSubject = function (){
         clickCountSubjectSorting = clickCountSubjectSorting +1;
         sortHeader = 'subject';
         getTodolist();
    };
    var sortPriority = function (){
         clickCountPrioritySorting = clickCountPrioritySorting +1;
          sortHeader = 'prio';
         getTodolist();
    };
    var sortDate = function (){
         clickCountDoBySorting = clickCountDoBySorting +1;
         sortHeader = 'date';
         getTodolist();
    };
var init = function (){
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
            if(todoSubject.val()==="Description"){
            todoSubject.val('');
            }
        });
        todoDate.focus(function(){
            todoDate.addClass('normalStyle');
              if(todoDate.val()==="do by"){
            todoDate.val('');
            }
        });
        
        todoHeadSubject.live('click',sortSubject);
        todoHeadSubject.addClass('errorStyle');
        todoHeadPriority.live('click',sortPriority);
        todoHeadDate.live('click',sortDate);
        
        todoAddButton.click(addData);
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