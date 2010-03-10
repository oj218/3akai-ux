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

	var todo = "#todo";
	var todoDate = todo + "_date";
	var todoMin = "todo_min";



	var addBinding = function(){
      $(todoDate).datepicker({
     });
    }
addBinding();

var makeBindDiv = function(input,count){
  for (var i = 0; i < count; i++) {
     var a = document.createElement('a');
     a.setAttribute('class', input);
     a.setAttribute('id', input+i);
     a.setAttribute('href', "java-event");
     var text = document.createTextNode(extractToTwo(i)+"");
     a.appendChild(text);
     $("#"+input+"_div").append(a);
  }
  
  // If you click on a field, insert the value into the input box and change class
        $("#" + input + "_div a", rootel).bind("click",function(e,ui){

            // Get the original id (the id from the element you clicked on)
            var id_original = e.target.id;

            // Remove the front part of the id (only keep the last part e.g. 21)
            var id = id_original.replace(input, "");

            // Remove the active class from the other elements
            $("#" + input + "_div a", rootel).removeClass(pollTimeActiveClass);

            // Set the text in the inputbox (above the drop down) to the number you clicked on
            $("#" + input).val(extractToTwo(id)+"");

            // Add the active class to the number you clicked
            $("#" + id_original, rootel).addClass(pollTimeActiveClass);

            // Hide the div containing all the numbers
            $("#"+ input + "_div").hide();

            // We do this to not reload the page again
            return false;
        });
		
		   // Add the binding to the input field and the image to show the dropdown
        $("#"+ input, rootel).bind("click",function(e,ui){
            toggleTime($("#"+ input + "_div"), $("#"+ input));
        });
        $("#"+ input + "_down", rootel).bind("click",function(e,ui){
            toggleTime($("#"+ input + "_div"), $("#"+ input));
        });
     }

};

sdata.widgets.WidgetLoader.informOnLoad("todo");