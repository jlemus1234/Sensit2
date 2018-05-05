var dayTotals = [];
sitDataRequest();
var dayTotalsB = [];
sitBackRequest();

    		function drawChart() {
      			var data = new google.visualization.DataTable();
      			data.addColumn('string', 'Date');
      			data.addColumn('number', 'Time Sitting');

      			for(var i=0; i<dayTotals.length; i++){
      				data.addRow([dayTotals[i][0], dayTotals[i][1]/(1000*60)]);
      			}
        		// Set chart options
        		var options = {'title':'Minutes Spent Sitting',
                       'width':800,
                       'height':600};

        		// Instantiate and draw our chart, passing in some options.
        		var chart = new google.visualization.ColumnChart(document.getElementById('graph_div'));
        		chart.draw(data, options);
      		}

function sitDataRequest() {
    var dates = [];
    var tableString = "<table style = 'width:100%'><tr><th>Sat Down</th><th>Stood up</th><th>Elapsed time</th></tr>"
    url = "https://sensitbme.herokuapp.com/jalo/data";
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send();
    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {
            var data = JSON.parse(request.responseText);
	    	// Clean up data
	    	// Pick out the dates from the json response
	    	dataArr = data.jalo;
	    	var datePair = 0;
	    	tableString += "<tr>";
	    	for(var i = 0, len = dataArr.length; i < len; i++){
	    		// Convert to user's time zone
				var tempDate = new Date(dataArr[i].created_at);
				dates.push(tempDate);
				tableString += "<td>";

				//Remove time zone information and add to table
				tableString += tempDate.toString().slice(0,tempDate.toString().indexOf(" GMT"));
				tableString += "</td>";

	    		if(i !== 0 && (i%2) === 1){
				// Bug: if finish on non pair, won't put in termination
				// check whether the length of thing is even or not
				var tempPrevDate1 = new Date(dataArr[i].created_at);
				var tempPrevDate2 = new Date(dataArr[i-1].created_at);
				tableString += "<td>";

				var timeDiffSec = ((tempPrevDate1.getTime()- tempPrevDate2.getTime())/1000);
				var hours = Math.floor(timeDiffSec/(60*60));
				var mins = Math.floor((timeDiffSec%(60*60))/60);
				var sec = Math.floor((timeDiffSec%(60)));
				var elapsedTime = String(hours) +" hours, "+ String(mins) + " mins, " + String(sec) + " sec";
				tableString += elapsedTime;
				tableString += "</td>";
				tableString += "</tr>";
					if((i + 1) < len){
						tableString += "<tr>";
					}
				}
        	}
        	tableString += "</table";
        	var table = document.getElementById("table");
        	table.innerHTML = tableString;
        	var dayCounter = 0;

        	for(var i =0, len = dates.length; i < len; i++){
        		// There is an earlier single date
        		if(i%2 === 1){
        			var tempDateSum = [];
        			var prev = dates[i-1];
        			var curr = dates[i];
        			// Regular pairing between instances on same day
        			if(prev.getDate() === curr.getDate() && prev.getMonth() === curr.getMonth() && prev.getYear() === curr.getYear()){
        				if(i === 1){ // first element pairing, just add in the date without checking
        					tempDateSum.push(curr.toDateString()); // push in date string
        					tempDateSum.push(curr.getTime() - prev.getTime()); // push in interval of time
        					dayTotals.push(tempDateSum);
        					dayCounter = dayCounter + 1;
        				}else{ // any other pairing occuring on same day
        					// check whether the day has already been added to the dayTotals array
        					if(dayTotals[dayCounter - 1][0].localeCompare(curr.toDateString())===0){ 
        						// day is in the array already, don't add it; add to time sum
        						dayTotals[dayCounter - 1][1] = dayTotals[dayCounter-1][1] + (curr.getTime() - prev.getTime());
        					}else{
        						tempDateSum.push(curr.toDateString()); // push in date string
        						tempDateSum.push(curr.getTime() - prev.getTime()); // push in interval of time
        						dayTotals.push(tempDateSum);
        						dayCounter = dayCounter + 1;
        					}
        				}
        			}else{ // instances on different days
        				// Bug: Doesn't work if sitting crosses boundry of more than two days.
        				// Create midnight date to close off first day
        				var midnight = new Date(prev.getTime());
        				midnight.setHours(24,0,0,0);
        				if(prev.toDateString().localeCompare(dayTotals[dayCounter - 1][0])===0)
        				{
        					dayTotals[dayCounter-1][1] = dayTotals[dayCounter-1][1] + (midnight.getTime()-prev.getTime());
        					tempDateSum.push(curr.toDateString());
        					tempDateSum.push(curr.getTime() - midnight.getTime());
        					dayTotals.push(tempDateSum);
        					dayCounter = dayCounter + 1;
        				}else{
        					// the first items' date is not in the array
        					tempDateSum.push(prev.ToDateString);
        					tempDateSum.push(midnight.getTime() - prev.getTime());
        					dayTotals.push(tempDateSum);

        					tempDateSum[0]= (curr.toDateString());
        					tempDateSum[1]= (curr.getTime() - midnight.getTime());
        					dayTotals.push(tempDateSum);
        					dayCounter = dayCounter + 2;
        				}

        			}

        		}

        	}
        	for(var i =0, len = dayTotals.length; i < len; i++){
        		var day = dayTotals[i][0];
        		var time = dayTotals[i][1]/1000;
        		var hours = Math.floor(time/(60*60));
				var mins = Math.floor((time%(60*60))/60);
				var sec = Math.floor((time%(60)));
        	}

     		// Load the Visualization API and the corechart package.
     		google.charts.load('current', {'packages':['corechart']});

    		// Set a callback to run when the Google Visualization API is loaded.
    		google.charts.setOnLoadCallback(drawChart);
    	}
    }
}

function sitBackRequest() {
    var dates = [];
    var tableString = "<table style = 'width:100%'><tr><th>Slouch start</th><th>Slouch end</th><th>Elapsed time</th></tr>"
    url = "https://sensitbme.herokuapp.com/jalo/back";
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send();
    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {
            var data2 = JSON.parse(request.responseText);
	    	// Clean up data
	    	// Pick out the dates from the json response
	    	dataArr = data2.back;
	    	var datePair = 0;
	    	tableString += "<tr>";
	    	for(var i = 0, len = dataArr.length; i < len; i++){
	    		// Convert to user's time zone
				var tempDate = new Date(dataArr[i].created_at);
				dates.push(tempDate);
				tableString += "<td>";

				//Remove time zone information and add to table
				tableString += tempDate.toString().slice(0,tempDate.toString().indexOf(" GMT"));
				tableString += "</td>";

	    		if(i !== 0 && (i%2) === 1){
				// Bug: if finish on non pair, won't put in termination
				// check whether the length of thing is even or not
				var tempPrevDate1 = new Date(dataArr[i].created_at);
				var tempPrevDate2 = new Date(dataArr[i-1].created_at);
				tableString += "<td>";

				var timeDiffSec = ((tempPrevDate1.getTime()- tempPrevDate2.getTime())/1000);
				var hours = Math.floor(timeDiffSec/(60*60));
				var mins = Math.floor((timeDiffSec%(60*60))/60);
				var sec = Math.floor((timeDiffSec%(60)));
				var elapsedTime = String(hours) +" hours, "+ String(mins) + " mins, " + String(sec) + " sec";
				tableString += elapsedTime;
				tableString += "</td>";
				tableString += "</tr>";
					if((i + 1) < len){
						tableString += "<tr>";
					}
				}
        	}
        	tableString += "</table";
        	var table = document.getElementById("table2");
        	table.innerHTML = tableString;

        	//var dayTotals = [];
        	//dayTotals = [];
        	var dayCounter = 0;

        	for(var i =0, len = dates.length; i < len; i++){
        		// There is an earlier single date
        		if(i%2 === 1){
        			var tempDateSum = [];
        			var prev = dates[i-1];
        			var curr = dates[i];
        			// Regular pairing between instances on same day
        			if(prev.getDate() === curr.getDate() && prev.getMonth() === curr.getMonth() && prev.getYear() === curr.getYear()){
        				//console.log("Same dates detected");
        				if(i === 1){ // first element pairing, just add in the date without checking
        					//console.log("First element added");
        					tempDateSum.push(curr.toDateString()); // push in date string
        					tempDateSum.push(curr.getTime() - prev.getTime()); // push in interval of time
        					dayTotalsB.push(tempDateSum);
        					//console.log(dayTotals);
        					dayCounter = dayCounter + 1;
        				}else{ // any other pairing occuring on same day
        					// check whether the day has already been added to the dayTotals array
        					if(dayTotalsB[dayCounter - 1][0].localeCompare(curr.toDateString())===0){ 

        						// day is in the array already, don't add it; add to time sum
        						dayTotalsB[dayCounter - 1][1] = dayTotalsB[dayCounter-1][1] + (curr.getTime() - prev.getTime());
        					}else{
        						tempDateSum.push(curr.toDateString()); // push in date string
        						tempDateSum.push(curr.getTime() - prev.getTime()); // push in interval of time
        						dayTotalsB.push(tempDateSum);
        						dayCounter = dayCounter + 1;
        					}
        				}
        			}else{ // instances on different days
        				// Bug: Doesn't work if sitting crosses boundry of more than two days.
        				// Create midnight date to close off first day
        				var midnight = new Date(prev.getTime());
        				midnight.setHours(24,0,0,0);
        				//console.log(midnight.toDateString());

        				if(prev.toDateString().localeCompare(dayTotalsB[dayCounter - 1][0])===0)
        				{     
        					// the first item's date is already in array
        					dayTotalsB[dayCounter-1][1] = dayTotalsB[dayCounter-1][1] + (midnight.getTime()-prev.getTime());
        					tempDateSum.push(curr.toDateString());
        					tempDateSum.push(curr.getTime() - midnight.getTime());
        					dayTotalsB.push(tempDateSum);
        					dayCounter = dayCounter + 1;
        				}else{
        					// the first items' date is not in the array
        					tempDateSum.push(prev.ToDateString);
        					tempDateSum.push(midnight.getTime() - prev.getTime());
        					dayTotalsB.push(tempDateSum);

        					tempDateSum[0]= (curr.toDateString());
        					tempDateSum[1]= (curr.getTime() - midnight.getTime());
        					dayTotalsB.push(tempDateSum);
        					dayCounter = dayCounter + 2;
        				}
        			}

        		}
        	}
        	for(var i =0, len = dayTotalsB.length; i < len; i++){
        		var day = dayTotalsB[i][0];
        		var time = dayTotalsB[i][1]/1000;
        		var hours = Math.floor(time/(60*60));
				var mins = Math.floor((time%(60*60))/60);
				var sec = Math.floor((time%(60)));
        	}


     		// Load the Visualization API and the corechart package.
     		google.charts.load('current', {'packages':['corechart']});

    		// Set a callback to run when the Google Visualization API is loaded.
    		google.charts.setOnLoadCallback(drawChart2);
    	}
    }
}


    		function drawChart2() {
      			// Create the data table.
      			var data = new google.visualization.DataTable();
      			data.addColumn('string', 'Date');
      			data.addColumn('number', 'Time Spent Slouching');

      			for(var i=0; i<dayTotalsB.length; i++){
      				data.addRow([dayTotalsB[i][0], dayTotalsB[i][1]/(1000*60)]);
      			}
        		// Set chart options
        		var options = {'title':'Minutes Spent Slouching',
                       'width':800,
                       'height':600};

        		// Instantiate and draw our chart, passing in some options.
        		var chart = new google.visualization.ColumnChart(document.getElementById('graph2_div'));
        		chart.draw(data, options);
      		}