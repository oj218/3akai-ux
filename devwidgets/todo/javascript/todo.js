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

        var $rootel = $("#" + tuid);
        var $todoSubject = $("#todo_subject", $rootel);
        var $todoDateId = $("#todo_date", $rootel);
        var $todoAddButton = $('#todo_add_button', $rootel);
        var $todoPriority = $('#todo_priority', $rootel);
        var $todoDelete = $('#todo_delete', $rootel);
        var $todoCheck = $('.todo_check', $rootel);
        var $todoTasks = $('#todo_tasks', $rootel);
        var todoTemplate = 'todo_template';
        var $todoHeadSubject = $('#todo_li_head_task', $rootel);
        var $todoHeadPriority = $('#todo_li_head_priority', $rootel);
        var $todoHeadDate = $('#todo_li_head_date', $rootel);
        var $todoErrorNoTasks = $("#todo_error_notasks", $rootel);
        var renderPaging;
        var tochangeTo ;
        var selectedBox ;
        var $todoSubjectValue = $("#todo_subject_text", $rootel);
        var $todoEnterTask = $("#todo_enter_task_label", $rootel);
        var todoSubjectSelected = false;
        var todoDateSelected;
        var todoSubjectValue;
        var todoDateValue;

        //Paging
        var pageCurrent = 0; // The page you are currently on
        var pageSize = 10; // How many items you want to see on 1 page
        var jqPagerClass = ".jq_pager";
        var parseglobal = [];
        var parseglobalArray = [];

        var todoId = "#todo";
        var $todoTasksAndDelete = $(todoId + "_tasks_and_delete");

        // sorting
        var sortHeader;
        var sortDict = {};

          //Functions
        var renderTodolist;
        var sendDataTodoFirstTime ;

        /**
         * 
         * @param {Object} a
         * @param {Object} b
         */
        var sortColumns = function(a,b){
            //Depending on which column how many times the user has clicked the list gets sorted
            var x = a[sortHeader];
            var y = b[sortHeader];
            //if the user has clicked on the doBy column, the values have to be parsed to date
            if (sortHeader === "doBy"){
                x = Date.parse(x);
                y = Date.parse(y);
            }
            
            if (sortDict[sortHeader]){
                return ((x < y) ? -1 : ((x > y) ? 1 : 0)); // asc
            }else{
                return ((x > y) ? -1 : ((x < y) ? 1 : 0)); // desc
            }
        };

        /**
         * 
         * @param {Object} response
         */
        var loadTodolist = function(response){
            //Check if the request was successful
            if (response) {
                parseglobal = {
                    all: $.evalJSON(response)
                };

                //Render the todolist for the current user.
                renderTodolist();

                $todoSubjectValue.html($todoEnterTask);
            }else {
                // If it wasn't possible to connect to the server, show the not connected error
                sendDataTodoFirstTime(false);
            }
        };


        var getTodolist = function(){
            $.ajax({
                url: "/todo/" + sdata.me.user.userid + "/todo" + ".infinity.json",
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
        sendDataTodoFirstTime = function(json){
            //Concatinate the url to post to
            var postUrl = "/todo/" + sdata.me.user.userid + "/todo";
            var jsonArray = {};
            jsonArray[json.id] = json;
            // post the data from the form (in a json object),
            // to the server then execute the comlete function
            sdata.preference.save(postUrl, jsonArray, sendDataComplete);
        };

        /**
         * 
         * @param {Object} json
         */
        var updateTask = function(json){
            sendDataTodoFirstTime(json);
        };

        /**
         * 
         * @param {Object} newValue
         * @param {Object} oldValue
         * @param {Object} editNode
         * @param {Object} viewNode
         */
        var saveDataAfterTextEdit = function(newValue, oldValue, editNode, viewNode){
            //When te user had edited the content in the list this function gets executed
            var $newNode = $(viewNode);
            //Get the parent from the newNode(which is the node that just been edited)
            var newNodePar = $newNode.parent();
            var json;
            //Get all values from the ul in the list
            json = {
                "id": newNodePar.parent().find(".todo_hidden").text(),
                "subject": newNodePar.parent().find(".todo_li_task").text(),
                "doBy": newNodePar.parent().find(".todoDatepick").val(),
                "priority": newNodePar.parent().find(".dropdownbox").text()
            };
            updateTask(json);
        };

        var todoHideText = function(){
            //After the user has edited the date this function gets executed
            //The new value for the date
            selectedBox.html((tochangeTo.find("input")).val());
            //Hide the textbox
            tochangeTo.hide();
            //Show the "label" (span)
            selectedBox.show();
            //Get a high positioned node for DOM manipulation
            var selBoxParent = selectedBox.parent().parent();
            var json;
            //Get all the necessairy values
            json = {
                "id": selBoxParent.parent().find(".todo_hidden").text(),
                "subject": selBoxParent.parent().find(".todo_li_task").text(),
                "doBy": selBoxParent.parent().find(".todoDatepick").val(),
                "priority": selBoxParent.parent().find(".dropdownbox").text()
            };
            updateTask(json);
        };

        renderTodolist = function(){
            // fill array

            //Atm there is only an object with properties of json objects
            //2 of these json objects are irrelevant, so these need to be deleted
            //To be able to slice the object has to be transformed into an array
            parseglobalArray = [];
            for (var c in parseglobal.all) {
                if (parseglobal.all.hasOwnProperty(c)) {
                    if (typeof(parseglobal.all[c]) === "object") {
                        parseglobalArray.push(parseglobal.all[c]);
                    }
                }
            }

            // sorting
            parseglobalArray.sort(sortColumns);

            // paging
            var pagingArray = {
                all: parseglobalArray.slice(pageCurrent * pageSize, (pageCurrent * pageSize) + pageSize)
            };

            //Render the list
            $todoTasks.html($.Template.render(todoTemplate, pagingArray));

            //Events that need to be fired after editing in the list
            var opts = {
                listeners: {
                    afterFinishEdit: saveDataAfterTextEdit
                }
            };

            //Fluidinfusion line to make editable text
            fluid.inlineEdits("#todo_task_list", opts);

            //Make the priority column in the list editable. So a cbo will appear when you click on it
            sakai.inlineEdits("#todo_task_list", {
                useTooltip: true,
                defaultViewText: " "
            });

            ////Make the doBy column in the list editable. So a datepicker will appear when you click on it
            sakai.inlineDateEdits("#todo_task_list", {
                useTooltip: true,
                defaultViewText: " "
            });

            //add a datepicker to the hidden textboxes for editing
            var $todoDatepick = $(".todoDatepick", $rootel);
            $($todoDatepick).datepicker({
                onClose: todoHideText
            
            });

            if (parseglobalArray.length > pageSize) {
                document.getElementById('todo_paging').style.visibility = "visible";
                renderPaging();
            }
            else {
                document.getElementById('todo_paging').style.visibility = "hidden";
                
                if (parseglobalArray.length === 0) {
                    $todoTasksAndDelete.html($todoErrorNoTasks);
                }
            }
        };

        /**
         * 
         * @param {Object} ev
         */
        var ddClick = function(ev){
        //This function makes inline editing for the priority possible
        //Basically, when someone clicks on a number in the priority column
        //The label is hidden and a cbo appears

            var parent = $(ev.target).parent();
            var dropdown = $(".dropdownbox", parent);
            var tochangeTo = $(".editContainer", parent);
            var value = dropdown.text();
            
            $(".options" + " option[value=" + value + "]", tochangeTo).attr("selected", true);
            if (dropdown.css("display") !== "none") {
                dropdown.hide();
                tochangeTo.show();
            }
            $(".options", parent).focus();
        };

        /**
         * 
         * @param {Object} ev
         */
        var ddClickAgain = function(ev){
            //When the user selects a number in the cbo the values needs to be displayed in the invisable label
            // and the label has to be shown and the cbo has to be hidden again.

            var parent = $(ev.target).parent().parent().parent().parent(); 
            var dropdown = $(".dropdownbox", parent);
            var newvalue = $("select.options", parent).val();
            dropdown.html(newvalue);
            $(".editContainer", parent).hide();
            tochangeTo.hide();
            dropdown.show();
            var json;
            json = {
                "id": parent.parent().find(".todo_hidden").text(),
                "subject": parent.parent().find(".todo_li_task").text(),
                "doBy": parent.parent().find(".todoDatepick").val(),
                "priority": parent.parent().find(".dropdownbox").text()
            };
            updateTask(json);
        };

        /**
         * 
         * @param {Object} ev
         */
        var ddBlur = function(ev){
            //When the user doesn't select anything in the cbo and just clicks besides the cbo the cbo has to be hidden and the label has to be shown
            var parent = $(ev.target).parent().parent().parent(); //this is the li
            var dropdown = $(".dropdownbox", parent);
            $(".editContainer", parent).hide();
            dropdown.show();
        };

        /**
         * 
         * @param {Object} container
         * @param {Object} options
         */
        //Inline edit for dropdownbox
        sakai.inlineEdits = function(container, options){
            // Loop over all the items that have to be editable
            var els = $(".inlineEditableAlt", $rootel);
            for (var i = 0; i < els.length; i = i + 1) {
                var el = $(els[i]);
                var dropdown = $(".dropdownbox", el);
                if (dropdown.length > 0) {
                    var tochangeTo = $(".editContainer", el);
                    var changedel = $(".options", tochangeTo);
                    //Bind the necessairy clicks/blursm so the right elements get shown/hidden
                    dropdown.bind("click", ddClick);
                    changedel.children().bind("click", ddClickAgain);
                    changedel.bind("blur", ddBlur);
                }
            }
            
        };

        /**
         * 
         * @param {Object} container
         * @param {Object} options
         */
        //Inline editing for the doby column
        sakai.inlineDateEdits = function(container, options){
            //Select all the doBy elements and make them hidden/visiable when necessairy
            var $todoDate = $(".todoDate", $rootel);
            tochangeTo = $(".editContainer", $rootel);
            $todoDate.bind("click", function(ev){
                selectedBox = $(ev.target);
                var parent = $(ev.target).parent();
                var $todoDate = $(".todoDate", parent);
                tochangeTo = $(".editContainer", parent);
                if ($todoDate.css("display") !== "none") {
                    $todoDate.hide();
                    tochangeTo.show();
                    $(".todoDatepick", parent).focus();
                }
            });
        };

        //If you hover over the list, you'll see a small box around the element
        $(".dropdownbox").live("mouseover", function(){
            $(this).addClass("fl-inlineEdit-invitation");
        });
        $(".dropdownbox").live("mouseout", function(){
            $(this).removeClass("fl-inlineEdit-invitation");
        });

        $(".todoDate").live("mouseover", function(){
            $(this).addClass("fl-inlineEdit-invitation");
        });
        $(".todoDate").live("mouseout", function(){
            $(this).removeClass("fl-inlineEdit-invitation");
        });

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
         * @param {Object} todoList
         */
        var deleteTasks = function(todoList){
            //Do an ajax call for every task in the list, to delete it.
            $.each(todoList, function(i, l){
                var pref_url = "/todo/" + sdata.me.user.userid + "/todo/" + l;
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
                "id":"",
                "subject": "",
                "doBy": "",
                "priority": ""
            };

            //A unique id gets generated for every new task
             if(parseglobalArray.length === 0){
                json.id = 1;
            }else{
               json.id = parseInt(parseglobalArray[parseglobalArray.length-1].id,10) +1;
            }
            json.subject = $todoSubject.val();
            json.doBy = $todoDateId.val();
            json.priority = $todoPriority.val();
            //Validation
            // Check if the textboxes are empty
            //If they're empty, colour them red and in case the normal style is still applied , remove it
            if ((json.subject === '')&&(json.subject === undefined)) {
                $todoSubject.removeClass('normalStyle');
                $todoSubject.addClass('errorStyle');
                errorCount = errorCount + 1;
            }

            if ((json.date === '')&&(json.date === undefined)){
                $todoDateId.addClass('errorStyle');
                $todoDateId.removeClass('normalStyle');
                errorCount = errorCount + 1;
            }

            var reg = /^(0[1-9]|1[012])[\- \/.](0[1-9]|[12][0-9]|3[01])[\- \/.](19|20)\d\d/;
            if (!reg.test(json.doBy)) {
                $todoDateId.addClass('errorStyle');
                $todoDateId.removeClass('normalStyle');
                errorCount = errorCount + 1;
            }

            // Everytime there is an error, the counter goes up. Only when there are no errors (so 0), the data can be sent 
            if (errorCount === 0) {
                $todoDateId.val('');
                $todoSubject.val('');
                sendDataTodoFirstTime(json);
                $todoSubject.val(todoSubjectValue);
                $todoDateId.val(todoDateValue);
                $todoPriority.val("selected", 1);
                
            }
        };

        var swapSortHeader = function(){
            // sort the column in opposite order next time
            if (sortDict[sortHeader]) {
                sortDict[sortHeader] = false;
            }
            else {
                sortDict[sortHeader] = true;
            }
        };

        //Incremate the counter to see if it has to be alphabetical or not
        var sortSubject = function(){
            sortHeader = 'subject';
            sortDict.priority = true; // reset other columns so that they will sort ascending the next time
            sortDict.doBy = true;
            getTodolist();
            swapSortHeader();
        };

        var sortPriority = function(){
            sortHeader = 'priority';
            sortDict.subject = true; // reset other columns so that they will sort ascending the next time
            sortDict.doBy = true;
            getTodolist();
            swapSortHeader();
        };

        var sortDate = function(){
            sortHeader = 'doBy';
            sortDict.subject = true; // reset other columns so that they will sort ascending the next time
            sortDict.priority = true;
            getTodolist();
            swapSortHeader();
        };

        var init = function(){
            todoSubjectValue = $todoSubject.val();
            todoDateValue = $todoDateId.val();
            getTodolist();
            
            //Delete click
            $todoDelete.live('click', function(){
                var itemsToDelete = [];
                $todoCheck = $('.todo_check', $rootel);
                //Have to assign the variable again because the first time 
                //the ajax call isn't completed
                // So there are no checkboxes with that id yet.
                //So need to put it back in the cash

                //Get all the names of the checked checkboxes (name = subject)
                $todoCheck.each(function(){
                    if ($(this).attr('checked')) {
                        itemsToDelete.push($(this).parent().parent().find(".todo_hidden").text());
                    }
                });
                //Delete the tasks
                deleteTasks(itemsToDelete);
            });

            $todoSubject.focus(function(){
                $todoSubject.addClass('normalStyle');
                if (todoSubjectSelected === false) {
                    $todoSubject.val('');
                    todoSubjectSelected = true;
                }
            });

            $todoDateId.focus(function(){
                $todoDateId.addClass('normalStyle');
                if (todoDateSelected === false) {
                    $todoDateId.val('');
                    todoDateSelected = true;
                }
            });

            $todoHeadSubject.live('click', sortSubject);
            $todoHeadSubject.addClass('errorStyle');
            $todoHeadPriority.live('click', sortPriority);
            $todoHeadDate.live('click', sortDate);
            $todoAddButton.click(addData);
        };

        var addBinding = function(){
            $($todoDateId).datepicker({});
            
            var priorityOptions = {
                2: '2',
                3: '3',
                4: '4',
                5: '5'
            };
            
            $.each(priorityOptions, function(val, text){
                $todoPriority.append($('<option></option>').val(val).html(text));
            });
        };

        addBinding();
        init();
    };

    sdata.widgets.WidgetLoader.informOnLoad("todo");
