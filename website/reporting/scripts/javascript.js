$(document).ready(function () {
    $('div#main').hide();
    // Set the location of the Node.JS server
    var serverAddress = 'http://10.100.49.77';
    var dbHost = 'localhost';
    var dbUser = 'sams';
    var dbPassword = 'develop';
    var dbName = 'sams_prod';

    var environment = Cookies.get('environmentReporting');
    if (typeof environment == 'undefined') {
        environment = Cookies.get('environment');
        if (typeof environment == 'undefined') {
            environment = 'prod';
        }
        Cookies.set('environmentReporting','prod');
    }
    $('select#environment option[value=' + environment + ']').prop('selected', 'selected').change();
 
    switch (environment) {
    case 'fde':
        var socketURL = serverAddress + ':5510';
        var version = 'DEVELOPMENT';
        break;
    case 'pre-prod':
        var socketURL = serverAddress + ':5520';
        version = 'BETA';
        break;
    case 'prod':
        var socketURL = serverAddress + ':5530';
        version = 'PRODUCTION';
        break;
    default:
        environment = 'prod';
        Cookies.set('environmentReporting','prod');
        var socketURL = serverAddress + ':5530';
        version = 'PRODUCTION';
        break;
    }
	var phText = $('input#AutomationStepThreshold').attr('data-ph');	
    $('input#AutomationStepThreshold').removeClass('hideFilter optional').addClass('showFilter').val('').prop('placeholder', phText);;
 
    $('select#environment').off('change').on('change', function () {
        environment = $(this).find(':selected').val();
        Cookies.set('environmentReporting',environment);
        window.location.reload();
    });
 
    $('#ReportType').off('change').on('change', function() {
        $('.optional, .required').removeClass('optional required');
        switch ($('#ReportType :selected').val()) {
        case 'SlowAutomationSummary':
			var phText = $('input#AutomationStepThreshold').attr('data-ph');
            $('input#AutomationStepThreshold').removeClass('hideFilter').addClass('showFilter').val('').prop('placeholder', phText);
            $('input#SessionThreshold').removeClass('showFilter').addClass('hideFilter').val('');
            $('input#ManualStepThreshold').removeClass('showFilter').addClass('hideFilter').val('');
            $('input#AttUID').removeClass('showFilter').addClass('hideFilter').val('');
             break;
        case 'SlowManualSummary':
            $('input#AutomationStepThreshold').removeClass('showFilter').addClass('hideFilter').val('');
            $('input#SessionThreshold').removeClass('showFilter').addClass('hideFilter').val('');
			var phText = $('input#ManualStepThreshold').attr('data-ph');
            $('input#ManualStepThreshold').removeClass('hideFilter').addClass('showFilter').val('').prop('placeholder', phText);
            $('input#AttUID').removeClass('showFilter').addClass('hideFilter').val('');
             break;
        case 'AllAutomation':
			var phText = $('input#AutomationStepThreshold').attr('data-opt-ph');
            $('input#AutomationStepThreshold').removeClass('hideFilter').addClass('showFilter optional').val('').prop('placeholder', phText);
            $('input#SessionThreshold').removeClass('showFilter').addClass('hideFilter').val('');
            $('input#ManualStepThreshold').removeClass('showFilter').addClass('hideFilter').val('');
			var phText = $('input#AttUID').attr('data-opt-ph');			
            $('input#AttUID').removeClass('hideFilter').addClass('showFilter optional').val('').prop('placeholder', phText);
            break;
        case'AllManual':
            $('input#AutomationStepThreshold').removeClass('showFilter').addClass('hideFilter').val('');
            $('input#SessionThreshold').removeClass('showFilter').addClass('hideFilter').val('');
			var phText = $('input#ManualStepThreshold').attr('data-opt-ph');
			$('input#ManualStepThreshold').removeClass('hideFilter').addClass('showFilter optional').val('').prop('placeholder', phText);
			var phText = $('input#AttUID').attr('data-opt-ph');			
            $('input#AttUID').removeClass('hideFilter').addClass('showFilter optional').val('').prop('placeholder', phText);
            break;
		case 'AllWorkflow':
            $('input#AutomationStepThreshold').removeClass('showFilter').addClass('hideFilter').val('');
			var phText = $('input#SessionThreshold').attr('data-opt-ph');
			$('input#SessionThreshold').removeClass('hideFilter').addClass('showFilter optional').val('').prop('placeholder', phText);
            $('input#ManualStepThreshold').removeClass('showFilter').addClass('hideFilter').val('');
			var phText = $('input#AttUID').attr('data-opt-ph');			
            $('input#AttUID').removeClass('hideFilter').addClass('showFilter optional').val('').prop('placeholder', phText);
			break;
        case 'AgentSummary':
            break;
        case 'AgentDetail':
            break;
        }
    });
 
    $('#daterange').daterangepicker({
        'showDropdowns': true,
        'timePicker': true,
        'timePicker24Hour': true,		
        'autoApply': true,
        'startDate': moment().startOf('day'),
        'endDate': moment().endOf('day'),
        'ranges': {
            'Today': [
                moment().startOf('day'),
                moment().endOf('day')
            ],
            'Yesterday': [
                moment().subtract(1,'d').startOf('day'),                                               
                moment().subtract(1,'d').endOf('day')
            ],
            'Previous 7 Days': [
                moment().subtract(7,'d').startOf('day'),
                moment().endOf('day')
            ],
            'Previous 30 Days': [
                moment().subtract(30,'d').startOf('day'),
                moment().endOf('day')
            ],
            'This Month': [
                moment().startOf('month').startOf('day'),
                moment().endOf('month').endOf('day')
            ],
            'Last Week': [
                moment().subtract(1, 'weeks').startOf('isoWeek'),
                moment().subtract(1, 'weeks').endOf('isoWeek')
            ],
            'Last Month': [
                moment().subtract(1,'M').startOf('month').startOf('day'),
                moment().subtract(1,'M').endOf('month').endOf('day')
            ]
        },
        'locale': {
            'direction': 'ltr',
            'format': 'MM/DD/YYYY HH:mm',
            'separator': '' / ''
        },
        'opens': 'center',
        'alwaysShowCalendars': true
    });

    $('input#RequestReport').off('click.request').on('click.request', function () {
        var reportType=$('select#ReportType :selected').val();		
		var valid = false;
		$('.required').removeClass('required');
		switch (reportType) {
		case 'SlowAutomationSummary':
			var element = $('input#AutomationStepThreshold');
			if ($(element).val().trim() == '' || isNaN($(element).val().trim()) || $(element).val() <= 0) {
				if ($(element).val().trim() == '') {
					$(element).val('30');
					valid = true;
				} else {
					$(element).addClass('required');
				}
			} else {
				$(element).val($(element).val().trim());
				valid = true;
			}
			break;
		case 'SlowManualSummary':
			var element = $('input#ManualStepThreshold');
			if ($(element).val().trim() == '' || isNaN($(element).val().trim()) || $(element).val() <= 0) {
				if ($(element).val().trim() == '') {
					$(element).val('300');
					valid = true;
				} else {
					$(element).addClass('required');
				}
			} else {
				$(element).val($(element).val().trim());
				valid = true;
			}
			break;
		case 'AllAutomation':
			var element = $('input#AutomationStepThreshold');
			var value = $(element).val().trim();
			if (isNaN($(element).val().trim()) || $(element).val() <= 0) {
				if ($(element).hasClass('optional') && $(element).val().trim() == '') {
					valid = true;
				} else {
					$(element).addClass('required');
				}
			} else {
				$(element).val($(element).val().trim());
				valid = true;
			}
			var element = $('input#AttUID');
			$(element).val($(element).val().trim());
			break;
		case 'AllManual':
			var element = $('input#ManualStepThreshold');
			if (isNaN($(element).val().trim()) || $(element).val() <= 0) {
				if ($(element).hasClass('optional') && $(element).val().trim() == '') {
					valid = true;
				} else {
					$(element).addClass('required');
				}
			} else {
				$(element).val($(element).val().trim());
				valid = true;
			}
			var element = $('input#AttUID');
			$(element).val($(element).val().trim());
			break;
		case 'AllWorkflow':
			var element = $('input#SessionThreshold');
			if (isNaN($(element).val().trim()) || $(element).val() <= 0) {
				if ($(element).hasClass('optional') && $(element).val().trim() == '') {
					valid = true;
				} else {
					$(element).addClass('required');
				}
			} else {
				$(element).val($(element).val().trim());
				valid = true;
			}
			var element = $('input#AttUID');
			$(element).val($(element).val().trim());
			break;
		}
		if (!valid) {
			return;
		}
        $('div.overlay').show();
        $('input, select').attr('disabled', true);        
        $('div#reportBody').html('');
        var startDate = $('#daterange').data('daterangepicker').startDate.toISOString();
        var endDate = $('#daterange').data('daterangepicker').endDate.toISOString();
		var automationStepFilter = '';
		var manualStepFilter = '';
		var sessionFilter = '';
		var attUIDFilter = '';
		var automationStepThreshold = '';
		var manualStepThreshold = '';
		var sessionThreshold = '';
		var attUID = '';
		var titleText = '';
		$.each($('.showFilter'), function (index, element) {
			switch($(element).prop('id')) {
			case 'AutomationStepThreshold':
				if ($(element).val() != '') {
					automationStepFilterExceeded = 'AND elapsed_seconds >= "' + $(element).val() + '" ';
					automationStepFilterWithin = 'AND elapsed_seconds < "' + $(element).val() + '" ';
					automationStepThreshold = $(element).val();
				} else {
					automationStepFilterExceeded = '';
					automationStepFilterWithin = '';
				}
				break;
			case 'ManualStepThreshold':
				if ($(element).val() != '') {
					manualStepFilterExceeded = 'AND elapsed_seconds >= "' + $(element).val() + '" ';
					manualStepFilterWithin = 'AND elapsed_seconds < "' + $(element).val() + '" ';					
					manualStepThreshold = $(element).val();
				} else {
					manualStepFilterExceeded = '';
					manualStepFilterWithin = '';
				}
				break;
			case 'SessionThreshold':
				if ($(element).val() != '') {
					sessionThresholdFilterExceeded = 'AND elapsed_seconds >= "' + $(element).val() + '" ';
					sessionThresholdfilterWithin = 'AND elapsed_seconds < "' + $(element).val() + '" ';					
					sessionThreshold = $(element).val();
				} else {
					sessionThresholdFilterExceeded = '';
					sessionThresholdFilterWithin = '';
				}
				break;
			case 'AttUID':
				if ($(element).val() != '') {
					attUIDFilter = 'AND (manager_id = "' + $(element).val() + '" || att_uid = "' + $(element).val() + '") ';					
					attUID = $(element).val();
				} else {
					attUIDFilter = '';
					attUID =  '';
				}
				break;
			}
		});
        switch(reportType) {
        case 'SlowAutomationSummary':
			titleText = 'AUTOMATION STEPS THAT HAVE AT LEAST ONE AUTOMATION STEP TAKING ' + automationStepThreshold + ' OR MORE SECONDS TO COMPLETE STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss');
			var sql = 'SELECT mainQuery.flow_name AS flow_name, (SELECT COUNT(*) FROM duration_log_step_automation subQuery1 WHERE subQuery1.flow_name = mainQuery.flow_name AND in_progress = "N" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))) AS count, (SELECT COUNT(*) FROM duration_log_step_automation subQuery1 WHERE subQuery1.flow_name = mainQuery.flow_name AND in_progress = "N" ' + automationStepFilterWithin + 'AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))) AS count_standard, COUNT(*) AS count_slow, (SELECT SEC_TO_TIME(ROUND(AVG(elapsed_seconds))) FROM duration_log_step_automation subQuery1 WHERE subQuery1.flow_name = mainQuery.flow_name AND in_progress = "N" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))) AS average, (SELECT IF(SUM(elapsed_seconds) IS NULL, SEC_TO_TIME(0), SEC_TO_TIME(ROUND(AVG(elapsed_seconds)))) FROM duration_log_step_automation subQuery1 WHERE subQuery1.flow_name = mainQuery.flow_name AND in_progress = "N" ' + automationStepFilterWithin + 'AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))) AS average_standard, SEC_TO_TIME(elapsed_seconds) AS average_slow FROM duration_log_step_automation mainQuery WHERE in_progress = "N" ' + automationStepFilterExceeded + 'AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '")) GROUP BY flow_name ORDER BY flow_name ASC';
            break;
        case 'SlowManualSummary':
			titleText = 'MANUAL STEPS THAT HAVE AT LEAST ONE MANUAL STEP TAKING ' + manualStepThreshold + ' OR MORE SECONDS TO COMPLETE STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss');
			var sql = 'SELECT mainQuery.flow_name AS flow_name, mainQuery.step_name,(SELECT COUNT(*) FROM duration_log_step_manual subQuery1 WHERE subQuery1.flow_name = mainQuery.flow_name AND subQuery1.step_name = mainQuery.step_name AND in_progress = "N" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))) AS count, (SELECT COUNT(*) FROM duration_log_step_manual subQuery1 WHERE subQuery1.flow_name = mainQuery.flow_name AND subQuery1.step_name = mainQuery.step_name AND in_progress = "N" ' + manualStepFilterWithin + 'AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))) AS count_standard, COUNT(*) AS count_slow, (SELECT SEC_TO_TIME(ROUND(AVG(elapsed_seconds))) FROM duration_log_step_manual subQuery1 WHERE subQuery1.flow_name = mainQuery.flow_name AND subQuery1.step_name = mainQuery.step_name AND in_progress = "N" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))) AS average, (SELECT IF(SUM(elapsed_seconds) IS NULL, SEC_TO_TIME(0), SEC_TO_TIME(ROUND(AVG(elapsed_seconds)))) FROM duration_log_step_manual subQuery1 WHERE subQuery1.flow_name = mainQuery.flow_name AND subQuery1.step_name = mainQuery.step_name AND in_progress = "N" ' + manualStepFilterWithin + 'AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))) AS average_standard, SEC_TO_TIME(elapsed_seconds) AS average_slow FROM duration_log_step_manual mainQuery WHERE in_progress = "N" ' + manualStepFilterExceeded + 'AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '")) GROUP BY CONCAT(flow_name, step_name) ORDER BY flow_name ASC, step_name ASC';
            break;
        case 'AllAutomation':
			if (automationStepThreshold == '' && attUID == '') {
				titleText = 'AUTOMATION STEPS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss');
			}				
			if (automationStepThreshold != '' && attUID == '') {
				titleText = 'AUTOMATION STEPS THAT TAKING ' + automationStepThreshold + ' OR MORE SECONDS TO COMPLETE STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss');
			}
			if (automationStepThreshold == '' && attUID != '') {
				titleText = 'AUTOMATION STEPS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + ' FOR AGENT OR SUPERVISOR ATTUID ' + attUID.toUpperCase();
			}
			if (automationStepThreshold != '' && attUID != '') {
				titleText = 'AUTOMATION STEPS TAKING ' + automationStepThreshold + ' OR MORE SECONDS TO COMPLETE STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + ' FOR AGENT OR SUPERVISOR ATTUID ' + attUID.toUpperCase();				
			}
            var sql = 'SELECT smp_session_id, start_time, stop_time, SEC_TO_TIME(elapsed_seconds) AS automation_step_duration, att_uid, CONCAT(last_name, ", ", first_name) AS agent_name, IF(manager_id IS NULL, "Not Available", manager_id) AS manager_id, IF(work_source IS NULL, "Not Available", work_source) as work_source, IF(business_line IS NULL, "Not Available", business_line) AS business_line, IF(task_type IS NULL, "", task_type) AS task_type, flow_name FROM duration_log_step_automation WHERE in_progress = "N" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))' + automationStepFilterExceeded + attUIDFilter + ' ORDER BY start_time ASC';
            break;
        case 'AllManual':
			if (manualStepThreshold == '' && attUID == '') {
				titleText = 'MANUAL STEPS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss');
			}				
			if (manualStepThreshold != '' && attUID == '') {
				titleText = 'MANUAL STEPS TAKING ' + manualStepThreshold + ' OR MORE SECONDS TO COMPLETE STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss');
			}
			if (manualStepThreshold == '' && attUID != '') {
				titleText = 'MANUAL STEPS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + ' FOR AGENT OR SUPERVISOR ATTUID ' + attUID.toUpperCase();
			}
			if (manualStepThreshold != '' && attUID != '') {
				titleText = 'MANUAL STEPS TAKING ' + manualStepThreshold + ' OR MORE SECONDS TO COMPLETE STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + ' FOR AGENT OR SUPERVISOR ATTUID ' + attUID.toUpperCase();				
			}
            var sql = 'SELECT smp_session_id, start_time, stop_time, SEC_TO_TIME(elapsed_seconds) AS manual_step_duration, att_uid, CONCAT(last_name, ", ", first_name) AS agent_name, IF(manager_id IS NULL, "Not Available", manager_id) AS manager_id, IF(work_source IS NULL, "Not Available", work_source) AS work_source, IF(business_line IS NULL, "Not Available", business_line) AS business_line, IF(task_type IS NULL, "", task_type) AS task_type, flow_name, step_name FROM duration_log_step_manual WHERE in_progress = "N" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '")) ' + manualStepFilterExceeded + attUIDFilter + 'ORDER BY start_time';
            break;
        case 'AllWorkflow':
			if (sessionThreshold == '' && attUID == '') {
				titleText = 'WORKFLOW SESSION DATA FOR SESSIONS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss');
			}				
			if (sessionThreshold != '' && attUID == '') {
				titleText = 'WORKFLOW SESSION DATA FOR SESSIONS TAKING ' + manualStepThreshold + ' OR MORE SECONDS TO COMPLETE STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss');
			}
			if (sessionThreshold == '' && attUID != '') {
				titleText = 'WORKFLOW SESSION DATA FOR SESSIONS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + ' FOR AGENT OR SUPERVISOR ATTUID ' + attUID.toUpperCase();
			}
			if (sessionThreshold != '' && attUID != '') {
				titleText = 'WORKFLOW SESSIONS DATA FOR SESSIONS TAKING ' + manualStepThreshold + ' OR MORE SECONDS TO COMPLETE STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + ' FOR AGENT OR SUPERVISOR ATTUID ' + attUID.toUpperCase();				
			}
            var sql = 'SELECT smp_session_id, start_time, stop_time, SEC_TO_TIME(elapsed_seconds) AS manual_step_duration, att_uid, CONCAT(last_name, ", ", first_name) AS agent_name, IF(manager_id IS NULL, "Not Availalble", manager_id) AS manager_id, IF(work_source IS NULL, "Not Available", work_source) AS work_source, IF(business_line IS NULL, "Not Available", business_line) AS business_line, IF(task_type IS NULL, "", task_type) AS task_type FROM duration_log_step_manual WHERE (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '")) ' + sessionThresholdFilterExceeded + attUIDFilter + 'ORDER BY start_time';
            break;
        case 'AgentSummary':
            var sql = 'SELECT CONCAT(last_name, ", ", first_name) AS agent_name, att_uid, manager_id, COUNT(*) AS count_completed, (SELECT COUNT(*) FROM duration_log_session subQuery1 WHERE subQuery1.att_uid = mainQuery.att_uid AND elapsed_seconds >= "' + sessionThreshold + '" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '")) ) AS count_slow, SEC_TO_TIME(ROUND(AVG(elapsed_seconds),0)) AS session_average, (SELECT COUNT(*) FROM duration_log_step_automation subQuery1 WHERE subQuery1.att_uid = mainQuery.att_uid AND in_progress = "N" AND elapsed_seconds >= "' + automationStepThreshold + '" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '")) ) AS count_slow_automation, (SELECT COUNT(*) FROM duration_log_step_manual subQuery1 WHERE subQuery1.att_uid = mainQuery.att_uid AND in_progress = "N" AND elapsed_seconds >= "' + manualStepThreshold + '" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '")) ) AS count_slow_manual FROM duration_log_session mainQuery WHERE (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))' + attUIDCondition + ' GROUP BY att_uid ORDER BY agent_name';
            break;
        case 'AgentDetail':
            var sql = 'SELECT CONCAT(last_name, ", ", first_name) AS agent_name, att_uid, manager_id, SEC_TO_TIME(elapsed_seconds) workflow_duration, (SELECT IF(SUM(elapsed_seconds) IS NULL, SEC_TO_TIME(0),SEC_TO_TIME(SUM(elapsed_seconds))) FROM duration_log_step_automation subQuery1 WHERE subQuery1.smp_session_id = mainQuery.smp_session_id AND in_progress = "N" AND elapsed_seconds >= "' + automationStepThreshold + '" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '")) ) AS slow_automation_duration, (SELECT IF(SUM(elapsed_seconds) IS NULL, SEC_TO_TIME(0), SEC_TO_TIME(SUM(elapsed_seconds))) FROM duration_log_step_manual subQuery1 WHERE subQuery1.smp_session_id = mainQuery.smp_session_id AND in_progress = "N" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '")) ) AS slow_manual_duration, start_time, stop_time, (SELECT COUNT(*) FROM duration_log_step_automation subQuery1 WHERE subQuery1.smp_session_id = mainQuery.smp_session_id AND in_progress = "N" AND elapsed_seconds >= "' + automationStepThreshold + '" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '")) ) AS count_slow_automation, (SELECT COUNT(*) FROM duration_log_step_manual subQuery1 WHERE subQuery1.smp_session_id = mainQuery.smp_session_id AND in_progress = "N" AND elapsed_seconds >= "' + manualStepThreshold + '" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '")) ) AS count_slow_manual, IF(work_source IS NULL, "Not Available", work_source) AS work_source, IF(business_line IS NULL, "Not Available", business_line) AS business_line, IF(task_type IS NULL, "", task_type) AS task_type, smp_session_id AS session_id FROM duration_log_session mainQuery WHERE (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))' + attUIDCondition + ' ORDER BY agent_name';
            break;
        }
        $.ajax({
            type: 'post',
            url: 'test2.php',
            data: {
                databaseIP: dbHost,
                databaseUser: dbUser,
                databasePW: dbPassword,
                databaseName: dbName,
                sql: sql
            },
            dataType: 'json',
        }).done(function(data) {
            $('div.overlay').hide();
            $('input, select').attr('disabled', false);
            if (data.hasOwnProperty('RESULT')) {
                alert('ERROR: ' + data.RESULT);
            } else {
                switch (reportType) {
                case 'SlowAutomationSummary':
				    var html = '<h5 class="text-center">' + titleText + '</h5><table id="results" class="table table-bordered center hover-highlight"><thead><tr><th class="sorter-false"></th><th colspan=2 class="sorter-false text-center border-bottom">TOTAL</th><th colspan=3 class="sorter-false text-center">WITHIN ' + automationStepThreshold + ' SECONDS</th><th colspan=3 class="sorter-false text-center">OVER ' + automationStepThreshold + ' SECONDS</th></tr><tr><th class="text-center">FLOW NAME</th><th class="text-center">COUNT</th><th class="filter-false text-center">AVERAGE</th><th class="text-center">COUNT</th><th class="filter-false text-center">AVERAGE</th><th class="text-center">PERCENTAGE</th><th text="class-center">COUNT</th><th class="filter-false text-center">AVERAGE</th><th>PERCENTAGE</th></tr></thead><tbody>';
			        $.each(data, function (key, value) {
                        var percent_standard = (value.count_standard / value.count * 100).toFixed(2) + '%';                        
				        var percent_slow = (value.count_slow / value.count * 100).toFixed(2) + '%';
				        html = html + '<tr><td class="text-left">' + value.flow_name + '</td><td class="text-right">' + value.count + '</td><td class="text-right">' + value.average + '</td><td class="text-right">' + value.count_standard + '</td><td class="text-right">' + value.average_standard + '</td><td class="text-right">' + percent_standard + '</td><td class="text-right">' + value.count_slow + '</td><td class="text-right">' + value.average_slow + '</td><td class="text-right">' + percent_slow + '</td></tr>';
				    });
				    break;
                case 'SlowManualSummary':
				    var html = '<h5 class="text-center">' + titleText + '</h5><table id="results" class="table table-bordered center hover-highlight"><thead><tr><th colspan=2 class="sorter-false"></th><th colspan=2 class="sorter-false text-center border-bottom">TOTAL</th><th colspan=3 class="sorter-false text-center">WITHIN ' + manualStepThreshold + ' SECONDS</th><th colspan=3 class="sorter-false text-center">OVER ' + manualStepThreshold + ' SECONDS</th></tr><tr><th class="text-center">FLOW NAME</th><th class="text-center" STEP NAME</th><th class="text-center">COUNT</th><th class="filter-false text-center">AVERAGE</th><th class="text-center">COUNT</th><th class="filter-false text-center">AVERAGE</th><th class="text-center">PERCENTAGE</th><th text="class-center">COUNT</th><th class="filter-false text-center">AVERAGE</th><th>PERCENTAGE</th></tr></thead><tbody>';
			        $.each(data, function (key, value) {
                        var percent_standard = (value.count_standard / value.count * 100).toFixed(2) + '%';                        
				        var percent_slow = (value.count_slow / value.count * 100).toFixed(2) + '%';
				        html = html + '<tr><td class="text-left">' + value.flow_name + '</td><td class="text-left">' + value.step_name + '</td><td class="text-right">' + value.count + '</td><td class="text-right">' + value.average + '</td><td class="text-right">' + value.count_standard + '</td><td class="text-right">' + value.average_standard + '</td><td class="text-right">' + percent_standard + '</td><td class="text-right">' + value.count_slow + '</td><td class="text-right">' + value.average_slow + '</td><td class="text-right">' + percent_slow + '</td></tr>';
				    });
				    break;
                case 'AllAutomation':
                    var html ='<h5 class="text-center">' + titleText + '</h5><table id="results" class="table table-bordered center hover-highlight"><thead><tr><th class="text-center">SESSION ID</th><th class="text-center filter-false" >START TIME</th><th class="text-center filter-false">COMPLETION TIME</th><th class="text-center filter-false">AUTOMATION STEP DURATION</th><th class="text-center">ATT UID</th><th class="text-center">AGENT NAME</th><th class="text-center">MANAGER ATT UID</th><th class="text-center">WORK TYPE</th><th class="text-center">BUSINESS LINE</th><th class="text-center">TASK TYPE</th><th class="text-center">FLOW NAME</th></tr></thead><tbody>';				
                    $.each(data, function (key, value) {
                        var start_time = moment(new Date(value.start_time)).format('MM/DD/YYYY HH:mm:ss');
                        var stop_time = moment(new Date(value.stop_time)).format('MM/DD/YYYY HH:mm:ss');
                        html = html + '<tr><td class="text-left">' + value.smp_session_id + '</td><td class="text-center">' + start_time + '</td><td class="text-center">' + stop_time + '</td><td class="text-center">' + value.automation_step_duration + '</td><td class="text center">' + value.att_uid + '</td><td class="text-left">' + value.agent_name + '</td><td class="text-center">' + value.manager_id + '</td><td class="text-left">' + value.work_source + '</td><td class="text-left">' + value.business_line + '</td><td class="text-left">' + value.task_type + '</td><td class="text-left">' + value.flow_name + '</td></tr>';
                    });
                    break;
                case 'AllManual':
				    var html = '<h5 class="text-center">' + titleText + '</h5><table id="results" class="table table-bordered center hover-highlight"><thead><tr><th class="text-center">SESSION ID</th><th class="text-center filter-false">START TIME</th><th class="text-center filter-false">COMPLETION TIME</th><th class="text-center filter-false">MANUAL STEP DURATION</th><th>ATT UID</th><th class="text-center">AGENT NAME</th><th class="text-center">MANAGER ATT UID</th><th class="text-center">WORK TYPE</th><th class="text-center">BUSINESS LINE</th><th class="text-center">TASK TYPE</th><th class="text-center">FLOW NAME</th><th class="text-center">STEP NAME</th></tr></thead><tbody>';
				    $.each(data, function (key, value) {
					    var start_time = moment(new Date(value.start_time)).format('MM/DD/YYYY HH:mm:ss');
					    var stop_time = moment(new Date(value.stop_time)).format('MM/DD/YYYY HH:mm:ss');
					    html = html + '<tr><td class="text-left">' + value.smp_session_id + '</td><td class="text-center">' + start_time + '</td><td class="text-center">' + stop_time + '</td><td class="text-center">' + value.manual_step_duration + '</td><td class="text-center">' + value.att_uid + '</td><td class="text-left">' + value.agent_name + '</td><td class="text-center">' + value.manager_id + '</td><td class="text-left">' + value.work_source + '</td><td class="text-left">' + value.business_line + '</td><td class="text-left">' + value.task_type + '</td><td class="text-left">' + value.flow_name + '</td><td class="text-left">' + value.step_name + '</td></tr>';
				    });
                    break;
                case 'AllWorkflow':
				    var html = '<h5 class="text-center">' + titleText + '</h5><table id="results" class="table table-bordered center hover-highlight"><thead><tr><th class="text-center">SESSION ID</th><th class="text-center filter-false">START TIME</th><th class="text-center filter-false">COMPLETION TIME</th><th class="text-center filter-false">MANUAL STEP DURATION</th><th>ATT UID</th><th class="text-center">AGENT NAME</th><th class="text-center">MANAGER ATT UID</th><th class="text-center">WORK TYPE</th><th class="text-center">BUSINESS LINE</th><th class="text-center">TASK TYPE</th></tr></thead><tbody>';
				    $.each(data, function (key, value) {
					    var start_time = moment(new Date(value.start_time)).format('MM/DD/YYYY HH:mm:ss');
					    var stop_time = moment(new Date(value.stop_time)).format('MM/DD/YYYY HH:mm:ss');
					    html = html + '<tr><td class="text-left">' + value.smp_session_id + '</td><td class="text-center">' + start_time + '</td><td class="text-center">' + stop_time + '</td><td class="text-center">' + value.manual_step_duration + '</td><td class="text-center">' + value.att_uid + '</td><td class="text-left">' + value.agent_name + '</td><td class="text-center">' + value.manager_id + '</td><td class="text-left">' + value.work_source + '</td><td class="text-left">' + value.business_line + '</td><td class="text-left">' + value.task_type + '</td></tr>';
				    });
                    break;

                case 'AgentSummary':
				    var html = '<table border=1><thead><tr><th>AGENT NAME</th><th>MANAGER ATT UID</th><th># OF COMPLETED FLOWS</th><th># OF FLOWS W/ DURATON OVER WORKFLOW THRESHOLD</th><th>AVERAGE WORKFLOW DURATION</th><th># OF INSTANCES OF SLOW AUTOMATION STEPS</th><th># OF INSTANCES OF SLOW MANUAL STEPS</th></tr></thead><tbody>';
				    $.each(data, function (key, value) {
					    html = html + '<tr><td>' + value.agent_name + ' (' + value.att_uid + ')' + '</td><td>' + value.manager_id + '</td><td>' + value.count_completed + '</td><td>' + value.count_slow + '</td><td>' + value.session_average + '</td><td>' + value.count_slow_automation + '</td><td>' + value.count_slow_manual + '</td></tr>';
				    });
                    break;
                case 'AgentDetail':
				    html = '<table border=1><thead><tr><th>AGENT NAME</th><th>MANAGER ATT UID</th><th>WORKFLOW DURATION</th><th>TOTAL SLOW AUTOMATION STEP TIME</th><th>TOTAL SLOW MANUAL STEP TIME</th><th>START TIME</th><th>COMPLETION TIME</th><th># OF SLOW AUTOMATION STEPS</th><th># OF SLOW MANUAL STEPS</th><th>WORK TYPE<th></th><th>BUSINESS LINE</th><th>TASK TYPE</th><th>SESSION ID</th></tr></thead><tbody>';
				    $.each(data, function (key, value) {
					    var start_time = moment(new Date(value.start_time)).format('MM/DD/YYYY HH:mm:ss');
					    var stop_time = moment(new Date(value.stop_time)).format('MM/DD/YYYY HH:mm:ss');
					    var html = html + '<tr><td>' + value.agent_name + ' (' + value.att_uid + ')' + '</td><td>' + value.manager_id + '</td><td>' + value.workflow_duration + '</td><td>' + value.slow_automation_duration + '</td><td>' + value.slow_manual_duration + '</td><td>' + start_time + '</td><td>' + stop_time + '</td><td>' + value.count_slow_automation + '</td><td>' + value.count_slow_manual + '</td><td>' + value.work_source + '</td><td>' + value.business_line + '</td><td>' + value.task_type + '</td><td>' + value.session_id + '</td></tr>';
				    });
                    break;
                }
			    html = html + '</tbody></table>';
                $('div#reportBody').html(html);
				$('table#results').stickyTableHeaders();
                $('table#results').tablesorter({
                    theme: 'custom',
                    sortReset: true,
                    ignoreCase: true,
                    widgets: ['zebra', 'filter']
                });                
		    }
	    });
    });
	
    $('i.glyphicon.glyphicon-calendar.fa.fa-calendar').off('click').on('click', function() {
        $('#daterange').trigger('click');
    });

    document.title = 'SAMS - ' + version + ' REPORTING';
 
    // Initialize variables
    window.socket = io.connect(socketURL);
               
    socket.on('connect', function () {
	    // Request database info from node server 
	    socket.emit('Request DB Config');
        $('div#main').show();
        $('div#overlay').hide();       
        $('div.initializationScreen').hide();
        $('#searchtype > label:first').addClass('active');
        $('#searchtype > label:last').removeClass('active');       
        $('div.refresh').hide();
        $('div.daterange').show();
    });
 
    // Receive database info from node server
    socket.on('Return DB Config', function (data) {
        dbHost = data.dbConfig.host;
        dbUser = data.dbConfig.user;
        dbPassword = data.dbConfig.password;
        dbName = data.dbConfig.database;
    });
		
    socket.on('disconnect', function () {
        $('div#main').hide();
        $('div#overlay').show();
        $('div.initializationScreen').html('CONNECTION INTERRUPTED...').show();               
        $('#daterange').val('');
        $('div#select').html('');
        $('div.initializationScreen').show();
    });
});