$(document).ready(function () {
    // Set the location of the Node.JS server
    var serverAddress = 'http://10.100.49.104';
    var vars = getURLVars();
    var env = vars.env;
    switch (env) {
    case 'fde':
		var socketURL = serverAddress + ':5510';
        var version = 'FDE (FLOW DEVELOPMENT ENVIRONMENT)';
        break;
    case 'dev':
        var socketURL = serverAddress + ':5510';
        var version = 'FDE (FLOW DEVELOPMENT ENVIRONMENT)';
        break;
    case 'beta':
        var socketURL = serverAddress + ':5520';
        version = 'BETA (PRE-PROD)';
        break;
    case 'pre-prod':
        var socketURL = serverAddress + ':5520';
        version = 'BETA (PRE-PROD)';
        break;
    case 'prod':
        var socketURL = serverAddress + ':5530';
        version = 'PRODUCTION';
        break;
    default:
        var socketURL = serverAddress + ':5530';
        version = 'DEFAULT (PRODUCTION)';
        break;
    }
	
	$('#daterange').daterangepicker({
		"showDropdowns": true,
		"opens": "center",
		"autoApply": true,
		"startDate": moment().subtract(1,'h').startOf('minute'),
		"endDate": moment().endOf('minute'),
		"timePicker": true,
		"timePicker24Hour": true,
		"ranges": {
			"Last Hour" :[
				moment().subtract(1,'h').startOf('minute'),
				moment().endOf('minute')
			],			
			"Today": [
				moment().startOf('day'),
				moment().endOf('day')
			],
			"Yesterday": [
				moment().subtract(1,'d').startOf('day'),			
				moment().subtract(1,'d').endOf('day')
			],
			"Last 7 Days": [
				moment().subtract(7,'d').startOf('day'),
				moment().endOf('day')
			],
			"Last 30 Days": [
				moment().subtract(30,'d').startOf('day'),
				moment().endOf('day')
			],
			"This Month": [
				moment().startOf('month').startOf('day'),
				moment().endOf('month').endOf('day')
			],
			"Last Month": [
				moment().subtract(1,'M').startOf('month').startOf('day'),
				moment().subtract(1,'M').endOf('month').endOf('day')
			]
		},
	    "locale": {
			"direction": "ltr",
			"format": "MM/DD/YYYY HH:mm",
			"separator": " - "
		},
	    "alwaysShowCalendars": true
	}, function(start, end, label) {
			startDate = start.format('YYYY-MM-DD HH:MM:SS');
			endDate = end.format('YYYY-MM-DD HH:MM:SS');
			if ($('input#includeInProgress').is(':checked')) {
				includeInProgress = "Y";
			} else {
				includeInProgress = "N";
			}
			socket.emit('Get Listing', {
				startDate: startDate,
				endDate: endDate,
				includeInProgress: includeInProgress,
				label: label
			});
			$('div#selector').html('');			
			$(".overlay").show();
	});

	
	startDate = moment($('#daterange').data('daterangepicker').startDate._d).format('YYYY-MM-DD HH:MM:SS');
	endDate = moment($('#daterange').data('daterangepicker').endDate._d).format('YYYY-MM-DD 23:59:00');
    document.title = 'SAMS - ' + version + ' SCREENSHOT DATA';
    // Initialize variables
    window.socket = io.connect(socketURL)
	
	$('input#includeInProgress').prop('checked',false);
	
    $('button#reloadlist').off('click').on('click', function () {
		startDate = moment($('#daterange').data('daterangepicker').startDate._d).format('YYYY-MM-DD 00:00:00');
		endDate = moment($('#daterange').data('daterangepicker').endDate._d).format('YYYY-MM-DD 23:59:00');
		$('div#selector').html('');
		$('div#screenshotdata').html('');
			if ($('input#includeInProgress').is(':checked')) {
			includeInProgress = "Y";
		} else {
			includeInProgress = "N";
		}
        socket.emit('Get Listing', {
			startDate: startDate,
			endDate: endDate,
			includeInProgress: includeInProgress
		});
		$(".overlay").show();
    });

	$('input#includeInProgress').off('change').on('change', function() {
		startDate = moment($('#daterange').data('daterangepicker').startDate._d).format('YYYY-MM-DD 00:00:00');
		endDate = moment($('#daterange').data('daterangepicker').endDate._d).format('YYYY-MM-DD 23:59:00');
		$('div#selector').html('');
		$('div#screenshotdata').html('');
		if ($('input#includeInProgress').is(':checked')) {
			includeInProgress = "Y";
		} else {
			includeInProgress = "N";
		}
        socket.emit('Get Listing', {
			startDate: startDate,
			endDate: endDate,
			includeInProgress: includeInProgress
		});
		$(".overlay").show();		
	});
	
    socket.on('connect', function () {
		startDate = moment($('#daterange').data('daterangepicker').startDate._d).format('YYYY-MM-DD 00:00:00');
		endDate = moment($('#daterange').data('daterangepicker').endDate._d).format('YYYY-MM-DD 23:59:00');
		$('div#selector').html('');		
		$(".overlay").show();		
		$('div#screenshotdata').html('');		
		if ($('input#includeInProgress').is(':checked')) {
			includeInProgress = "Y";
		} else {
			includeInProgress = "N";
		}
        socket.emit('Get Listing', {
			startDate: startDate,
			endDate: endDate,
			includeInProgress: includeInProgress
		});		
    });
	
    socket.on('Receive Listing', function(data) {
		$('.overlay').hide();
		console.log(data.length);
        var rows = data.data
		if (rows.length > 0) {
			var html = "SESSION ID: <SELECT ID='id' name='id'>";
			html += "<option value='false'>-- SELECT SESSION --</option>";		
			$.each( rows, function (key, value) {
				var value2 = value.smp_session_id;
				html += '<option value="' + value2 + '">' + value2 + '</option>';
			});
			html += '</select>';
			$('div#selector').html(html);
			$('select#id').off('change').on('change', function () {
				$('div#screenshotdata').html('');							
				var smp_session_id = $('select#id :selected').val();
				if (smp_session_id) {
					socket.emit('Get ScreenShots', {
						smp_session_id: smp_session_id
					});
				}
			});
			
		} else {
			startDate = moment($('#daterange').data('daterangepicker').startDate._d).format('MM/DD/YY');
			endDate = moment($('#daterange').data('daterangepicker').endDate._d).format('MM/DD/YY');
			if (data.label == 'Custom Range') {
				$('div#selector').html('NO SCREENSHOTS WITH DATES BETWEEN ' + startDate + ' AND ' + endDate + ' LOCATED');
			} else {
				label = data.label;
				alert(label);
				$('div#selector').html('NO SCREENSHOTS FOR ' + label.toUpperCase() + ' LOCATED');
			}
		}
    });

    socket.on('Get ScreenShots', function (data) {
        var timestamp = data.timestamp;
        var flow_name = data.flow_name;
        var step_name = data.step_name;
        var image_data = data.image_data;
        var html = '<p>Timestamp: ' + timestamp + '<br />' + 'Flow: ' + flow_name + ' -> ' + step_name + '<br /><img src="' + image_data + '">';
        $('div#screenshotdata').append(html);
    });
	
	
	if (vars.id) {
		if (vars.connection) {
			$('body').html('<div id="retain">Screenshots are normally discarded upon completion of the flow.  As long as your SASHA session has not completed, you may click <button id="retainScreenshots">HERE</button> to request retention.</div><div id="screenshotdata"></div>');
//			$('button#retainScreenshots').off('click').on('click', function () {
//				socket.emit('Retain Screenshot Remote', {
//					connectionId: vars.connection
//				});
//				var url = window.location.href;
//				if (url.indexOf('&connection=')) {
//					index = url.indexOf('&connection=');
//					url = url.substr(0,index);
//				}
//				$('div#retain').html('Your screenshots will be accessible at: ' + url);				
//			});
//		} else {
//			$('body').html('<div id="screenshotdata"></div>');			
//		}

        socket.emit('Get ScreenShots', {
			smpSessionId: vars.id
		});
		}
	}	
});

// Read a page's GET URL variables and return them as an associative array.
let getURLVars = function () {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
};
