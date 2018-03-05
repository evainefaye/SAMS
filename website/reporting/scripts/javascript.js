$(document).ready(function () {
    $('div#main').hide();
    // Set the location of the Node.JS server
    var serverAddress = 'http://10.100.49.77';
    var serverAddress = 'http://108.226.174.227';    
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
    $('input#AutomationStepThreshold').removeClass('hideFilter optional').addClass('showFilter').val('').prop('placeholder', phText);
    var phText = $('input#AttUID').attr('data-opt-ph');
    $('input#AttUID').removeClass('hideFilter').addClass('showFilter optional').val('').prop('placeholder', phText);

 
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
		    var phText = $('input#AttUID').attr('data-opt-ph');			
            $('input#AttUID').removeClass('hideFilter').addClass('showFilter optional').val('').prop('placeholder', phText);
            break;
        case 'SlowManualSummary':
            $('input#AutomationStepThreshold').removeClass('showFilter').addClass('hideFilter').val('');
            $('input#SessionThreshold').removeClass('showFilter').addClass('hideFilter').val('');
		    var phText = $('input#ManualStepThreshold').attr('data-ph');
            $('input#ManualStepThreshold').removeClass('hideFilter').addClass('showFilter').val('').prop('placeholder', phText);
		    var phText = $('input#AttUID').attr('data-opt-ph');
            $('input#AttUID').removeClass('hideFilter').addClass('showFilter optional').val('').prop('placeholder', phText);
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
            var phText = $('input#AutiomationStepThreshold').attr('data-ph');        
            $('input#AutomationStepThreshold').removeClass('hideFilter').addClass('showFilter').val('').prop('placeholder', phText);
            var phText = $('input#SessionThreshold').attr('data-ph');
            $('input#SessionThreshold').removeClass('hideFilter').addClass('showFilter').val('').prop('placeholder', phText);
            var phText = $('input#ManualStepThreshold').attr('data-ph');
            $('input#ManualStepThreshold').removeClass('hideFilter').addClass('showFilter').val('').prop('placeholder', phText);
            var phText = $('input#AttUID').attr('data-opt-ph');			
            $('input#AttUID').removeClass('hideFilter').addClass('showFilter optional').val('').prop('placeholder', phText);
            break;
        case 'AgentPerformance':
            var phText = $('input#AutiomationStepThreshold').attr('data-ph');        
            $('input#AutomationStepThreshold').removeClass('hideFilter').addClass('showFilter').val('').prop('placeholder', phText);
            $('input#SessionThreshold').removeClass('showFilter optional').addClass('hideFilter');
            var phText = $('input#ManualStepThreshold').attr('data-ph');
            $('input#ManualStepThreshold').removeClass('hideFilter').addClass('showFilter').val('').prop('placeholder', phText);
            var phText = $('input#AttUID').attr('data-opt-ph');			
            $('input#AttUID').removeClass('hideFilter').addClass('showFilter optional').val('').prop('placeholder', phText);

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

    var automationStepFilter = '';
    var manualStepFilter = '';
    var sessionFilter = '';
    var attUIDFilter = '';
    var automationStepThreshold = '';
    var manualStepThreshold = '';
    var sessionThreshold = '';
    var attUID = '';
    var titleText = '';

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
		    var element = $('input#AttUID');
		    $(element).val($(element).val().trim());
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
		    var element = $('input#AttUID');
		    $(element).val($(element).val().trim());
		    break;
    	case 'AllAutomation':
		    var element = $('input#AutomationStepThreshold');
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
        case 'AgentSummary':
            var element = $('input#AutomationStepThreshold');
            if ($(element).val().trim() == '' || isNaN($(element).val().trim()) || $(element).val() <= 0) {
                if ($(element).val().trim() == '') {
                    $(element).val('30');
                    var valid1 = true;
                } else {
                    $(element).addClass('required');
                }
            } else {
                $(element).val($(element).val().trim());
                var valid1 = true;
            }
		    var element = $('input#ManualStepThreshold');
		    if ($(element).val().trim() == '' || isNaN($(element).val().trim()) || $(element).val() <= 0) {
                if ($(element).val().trim() == '') {
                    $(element).val('300');
                    var valid2 = true;
                } else {
                    $(element).addClass('required');
                }
		    } else {
			    $(element).val($(element).val().trim());
			    var valid2 = true;
            }
		    var element = $('input#SessionThreshold');
		    if ($(element).val().trim() == '' || isNaN($(element).val().trim()) || $(element).val() <= 0) {
                if ($(element).val().trim() == '') {
                    $(element).val('1200');
                    var valid3 = true;
                } else {
                    $(element).addClass('required');
                }
		    } else {
			    $(element).val($(element).val().trim());
			    var valid3 = true;
		    }
            var element = $('input#AttUID');
		    var element = $('input#AttUID');
		    $(element).val($(element).val().trim());
            $(element).val($(element).val().trim());
            if (valid1 && valid2 && valid3) {
                valid = true;
            }
            break;
        case 'AgentPerformance':
            var element = $('input#AutomationStepThreshold');
            if ($(element).val().trim() == '' || isNaN($(element).val().trim()) || $(element).val() <= 0) {
                if ($(element).val().trim() == '') {
                    $(element).val('30');
                    var valid1 = true;
                } else {
                    $(element).addClass('required');
                }
            } else {
                $(element).val($(element).val().trim());
                var valid1 = true;
            }
		    var element = $('input#ManualStepThreshold');
		    if ($(element).val().trim() == '' || isNaN($(element).val().trim()) || $(element).val() <= 0) {
                if ($(element).val().trim() == '') {
                    $(element).val('300');
                    var valid2 = true;
                } else {
                    $(element).addClass('required');
                }
		    } else {
			    $(element).val($(element).val().trim());
			    var valid2 = true;
            }
            var element = $('input#AttUID');
		    var element = $('input#AttUID');
		    $(element).val($(element).val().trim());
            $(element).val($(element).val().trim());
            if (valid1 && valid2) {
                valid = true;
            }
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
	    automationStepFilter = '';
	    manualStepFilter = '';
	    sessionFilter = '';
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
				    sessionThresholdFilterWithin = 'AND elapsed_seconds < "' + $(element).val() + '" ';					
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
            if (attUID == '') {
    		    titleText = 'AUTOMATION STEPS THAT HAVE ONE OR MORE AUTOMATION STEP TAKING ' + automationStepThreshold + ' OR MORE SECONDS TO COMPLETE STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + '<br /><small><i>AUTOMATION STEP: <b>' + automationStepThreshold + '</b> SECONDS</i></small>';
            } else {
    		    titleText = 'AUTOMATION STEPS THAT HAVE ONE OR MORE AUTOMATION STEP TAKING ' + automationStepThreshold + ' OR MORE SECONDS TO COMPLETE STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + ' FOR AGENT/SUPERVISOR ATTUID "' + attUID.toUpperCase() + '"<br /><small><i>AUTOMATION STEP: <b>' + automationStepThreshold + '</b> SECONDS</i></small>';
            }
            var sql = 'SELECT mainQuery.flow_name AS flow_name, (SELECT COUNT(*) FROM duration_log_step_automation subQuery1 WHERE subQuery1.flow_name = mainQuery.flow_name AND in_progress = "N" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))) AS count, (SELECT COUNT(*) FROM duration_log_step_automation subQuery1 WHERE subQuery1.flow_name = mainQuery.flow_name AND in_progress = "N" ' + automationStepFilterWithin + 'AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))) AS count_standard, COUNT(*) AS count_slow, (SELECT SEC_TO_TIME(ROUND(AVG(elapsed_seconds))) FROM duration_log_step_automation subQuery1 WHERE subQuery1.flow_name = mainQuery.flow_name AND in_progress = "N" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))) AS average, (SELECT IF(SUM(elapsed_seconds) IS NULL, SEC_TO_TIME(0), SEC_TO_TIME(ROUND(AVG(elapsed_seconds)))) FROM duration_log_step_automation subQuery1 WHERE subQuery1.flow_name = mainQuery.flow_name AND in_progress = "N" ' + automationStepFilterWithin + 'AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))) AS average_standard, SEC_TO_TIME(elapsed_seconds) AS average_slow FROM duration_log_step_automation mainQuery WHERE in_progress = "N" ' + automationStepFilterExceeded + 'AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))' + attUIDFilter + ' GROUP BY flow_name ORDER BY flow_name ASC';
            break;
        case 'SlowManualSummary':
            if (attUID == '') {
		        titleText = 'MANUAL STEPS THAT HAVE ONE OR MORE MANUAL STEP TAKING ' + manualStepThreshold + ' OR MORE SECONDS TO COMPLETE STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss')  + '<br /><small><i>MANUAL STEP: <b>' + manualStepThreshold + '</b> SECONDS</i></small>';
            } else {
		        titleText = 'MANUAL STEPS THAT HAVE ONE OR MORE MANUAL STEP TAKING ' + manualStepThreshold + ' OR MORE SECONDS TO COMPLETE STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + ' FOR AGENT/SUPERVISOR ATTUID "' + attUID.toUpperCase() + '"<br /><small><i>MANUAL STEP: <b>' + manualStepThreshold + '</b> SECONDS</i></small>';
            }
            var sql = 'SELECT mainQuery.flow_name AS flow_name, mainQuery.step_name,(SELECT COUNT(*) FROM duration_log_step_manual subQuery1 WHERE subQuery1.flow_name = mainQuery.flow_name AND subQuery1.step_name = mainQuery.step_name AND in_progress = "N" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))) AS count, (SELECT COUNT(*) FROM duration_log_step_manual subQuery1 WHERE subQuery1.flow_name = mainQuery.flow_name AND subQuery1.step_name = mainQuery.step_name AND in_progress = "N" ' + manualStepFilterWithin + 'AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))) AS count_standard, COUNT(*) AS count_slow, (SELECT SEC_TO_TIME(ROUND(AVG(elapsed_seconds))) FROM duration_log_step_manual subQuery1 WHERE subQuery1.flow_name = mainQuery.flow_name AND subQuery1.step_name = mainQuery.step_name AND in_progress = "N" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))) AS average, (SELECT IF(SUM(elapsed_seconds) IS NULL, SEC_TO_TIME(0), SEC_TO_TIME(ROUND(AVG(elapsed_seconds)))) FROM duration_log_step_manual subQuery1 WHERE subQuery1.flow_name = mainQuery.flow_name AND subQuery1.step_name = mainQuery.step_name AND in_progress = "N" ' + manualStepFilterWithin + 'AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))) AS average_standard, SEC_TO_TIME(elapsed_seconds) AS average_slow FROM duration_log_step_manual mainQuery WHERE in_progress = "N" ' + manualStepFilterExceeded + 'AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))' + attUIDFilter + ' GROUP BY CONCAT(flow_name, step_name) ORDER BY flow_name ASC, step_name ASC';
            break;
        case 'AllAutomation':
		    if (automationStepThreshold == '' && attUID == '') {
			    titleText = 'AUTOMATION STEPS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss');
		    }				
		    if (automationStepThreshold != '' && attUID == '') {
			    titleText = 'AUTOMATION STEPS THAT TAKING ' + automationStepThreshold + ' OR MORE SECONDS TO COMPLETE STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + '<br /><small><i>AUTOMATION STEP: <b>' + automationStepThreshold + '</b> SECONDS</i></small>';
		    }
		    if (automationStepThreshold == '' && attUID != '') {
			    titleText = 'AUTOMATION STEPS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + ' FOR AGENT/SUPERVISOR ATTUID "' + attUID.toUpperCase() + '"';
		    }
		    if (automationStepThreshold != '' && attUID != '') {
			    titleText = 'AUTOMATION STEPS TAKING ' + automationStepThreshold + ' OR MORE SECONDS TO COMPLETE STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + ' FOR AGENT/SUPERVISOR ATTUID "' + attUID.toUpperCase() + '"<br /><small><i>AUTOMATION STEP: <b>' + automationStepThreshold + '</b> SECONDS</i></small>';
		    }
            var sql = 'SELECT smp_session_id, start_time, stop_time, SEC_TO_TIME(elapsed_seconds) AS automation_step_duration, att_uid, CONCAT(last_name, ", ", first_name) AS agent_name, IF(manager_id IS NULL, "Not Available", manager_id) AS manager_id, IF(work_source IS NULL, "Not Available", work_source) as work_source, IF(business_line IS NULL, "Not Available", business_line) AS business_line, IF(task_type IS NULL, "", task_type) AS task_type, flow_name FROM duration_log_step_automation WHERE in_progress = "N" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))' + automationStepFilterExceeded + attUIDFilter + ' ORDER BY start_time ASC';
            break;
        case 'AllManual':
		    if (manualStepThreshold == '' && attUID == '') {
			    titleText = 'MANUAL STEPS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss');
		    }				
		    if (manualStepThreshold != '' && attUID == '') {
			    titleText = 'MANUAL STEPS TAKING ' + manualStepThreshold + ' OR MORE SECONDS TO COMPLETE STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + '<br /><small><i>MANUAL STEP: <b>' + manualStepThreshold + '</b> SECONDS</i></small>';
		    }
		    if (manualStepThreshold == '' && attUID != '') {
			    titleText = 'MANUAL STEPS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + ' FOR AGENT/SUPERVISOR ATTUID "' + attUID.toUpperCase() + '"';
		    }
		    if (manualStepThreshold != '' && attUID != '') {
			    titleText = 'MANUAL STEPS TAKING ' + manualStepThreshold + ' OR MORE SECONDS TO COMPLETE STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + ' FOR AGENT/SUPERVISOR ATTUID "' + attUID.toUpperCase() + '"<br /><small><i>MANUAL STEP: <b>' + manualStepThreshold + '</b> SECONDS</i></small>';
		    }
            var sql = 'SELECT smp_session_id, start_time, stop_time, SEC_TO_TIME(elapsed_seconds) AS manual_step_duration, att_uid, CONCAT(last_name, ", ", first_name) AS agent_name, IF(manager_id IS NULL, "Not Available", manager_id) AS manager_id, IF(work_source IS NULL, "Not Available", work_source) AS work_source, IF(business_line IS NULL, "Not Available", business_line) AS business_line, IF(task_type IS NULL, "", task_type) AS task_type, flow_name, step_name FROM duration_log_step_manual WHERE in_progress = "N" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '")) ' + manualStepFilterExceeded + attUIDFilter + 'ORDER BY start_time';
            break;
        case 'AllWorkflow':
		    if (sessionThreshold == '' && attUID == '') {
                titleText = 'WORKFLOW SESSION DATA FOR SESSIONS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss');
		    }				
		    if (sessionThreshold != '' && attUID == '') {
			    titleText = 'WORKFLOW SESSION DATA FOR SESSIONS TAKING ' + sessionThreshold + ' OR MORE SECONDS TO COMPLETE STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss')  + '<br /><small><i>SESSION DURATION: <b>' + sessionThreshold + '</b> SECONDS</i></small>';
		    }
		    if (sessionThreshold == '' && attUID != '') {
			    titleText = 'WORKFLOW SESSION DATA FOR SESSIONS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + ' FOR AGENT/SUPERVISOR ATTUID "' + attUID.toUpperCase() + '"';
		    }
		    if (sessionThreshold != '' && attUID != '') {
			    titleText = 'WORKFLOW SESSIONS DATA FOR SESSIONS TAKING ' + sessionThreshold + ' OR MORE SECONDS TO COMPLETE STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + ' FOR AGENT/SUPERVISOR ATTUID "' + attUID.toUpperCase() + '" <br /><small><i>SESSION DURATION: <b>' + sessionThreshold + '</b> SECONDS</i></small>';
		    }
            var sql = 'SELECT smp_session_id, start_time, stop_time, SEC_TO_TIME(elapsed_seconds) AS manual_step_duration, att_uid, CONCAT(last_name, ", ", first_name) AS agent_name, IF(manager_id IS NULL, "Not Availalble", manager_id) AS manager_id, IF(work_source IS NULL, "Not Available", work_source) AS work_source, IF(business_line IS NULL, "Not Available", business_line) AS business_line, IF(task_type IS NULL, "", task_type) AS task_type FROM duration_log_session WHERE (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '")) ' + sessionThresholdFilterExceeded + attUIDFilter + 'ORDER BY start_time';
            break;
        case 'AgentSummary':
            if (attUID == '') {
                titleText = 'WORKFLOW SUMMARY BY AGENT FOR SESSIONS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + '<br /><small><i>AUTOMATION STEP: <b>' + automationStepThreshold + '</b> SECONDS | MANUAL STEP: <b>' + manualStepThreshold + '</b> SECONDS | WORKFLOW SESSION: <b>' + sessionThreshold + '</b> SECONDS</i></small>';
            } else {
                titleText = 'WORKFLOW SUMMARY BY AGENT FOR SESSIONS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + ' FOR AGENT/SUPERVISOR ATTUID "' + attUID.toUpperCase()  + '"<br /><small><i>AUTOMATION STEP: <b>' + automationStepThreshold + '</b> SECONDS | MANUAL STEP: <b>' + manualStepThreshold + '</b> SECONDS | WORKFLOW SESSION: <b>' + sessionThreshold + '</b> SECONDS</i></small>';
            }			
            var sql = 'SELECT CONCAT(last_name, ", ", first_name) AS agent_name, att_uid, manager_id, SEC_TO_TIME(ROUND(AVG(elapsed_seconds),0)) AS session_average, COUNT(*) AS count_completed, (SELECT COUNT(*) FROM duration_log_session subQuery1 WHERE subQuery1.att_uid = mainQuery.att_uid AND elapsed_seconds >= "' + sessionThreshold + '" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))) AS count_slow_workflow, (SELECT COUNT(DISTINCT smp_session_id) FROM duration_log_step_automation subQuery1 WHERE subQuery1.att_uid = mainQuery.att_uid AND in_progress = "N" AND elapsed_seconds >= "' + automationStepThreshold + '" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '")) ) AS count_slow_automation, (SELECT COUNT(DISTINCT smp_session_id) FROM duration_log_step_manual subQuery1 WHERE subQuery1.att_uid = mainQuery.att_uid AND in_progress = "N" AND elapsed_seconds >= "' + manualStepThreshold + '" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '")) ) AS count_slow_manual FROM duration_log_session mainQuery WHERE (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))' + attUIDFilter + ' GROUP BY att_uid ORDER BY agent_name';
            break;
        case 'AgentPerformance':
            if (attUID == '') {
                titleText = 'AGENT PERFORMANCE SUMMARY FOR SESSIONS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + '<br /><small><i>AUTOMATION STEP: <b>' + automationStepThreshold + '</b> SECONDS | MANUAL STEP: <b>' + manualStepThreshold + '</b> SECONDS | WORKFLOW SESSION: <b>' + sessionThreshold + '</b> SECONDS</i></small>';
            } else {
                titleText = 'WORKFLOW SUMMARY FOR SESSIONS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + ' FOR AGENT/SUPERVISOR ATTUID "' + attUID.toUpperCase()  + '"<br /><small><i>AUTOMATION STEP: <b>' + automationStepThreshold + '</b> SECONDS | MANUAL STEP: <b>' + manualStepThreshold + '</b> SECONDS | WORKFLOW SESSION: <b>' + sessionThreshold + '</b> SECONDS</i></small>';
            }			
            var sql = 'SELECT smp_session_id, start_time, stop_time, SEC_TO_TIME(elapsed_seconds) AS session_duration, att_uid, CONCAT(last_name, ", ", first_name) AS agent_name, manager_id, work_source, business_line, task_type, (SELECT COUNT(*) FROM duration_log_step_automation subQuery1 WHERE subQuery1.smp_session_id = mainQuery.smp_session_id AND elapsed_seconds >="' + automationStepThreshold + '") AS automation_count, SELECT IF((SELECT COUNT(*) FROM duration_log_step_automation WHERE subQuery1.smp_session_id = mainQuery.smp_session_id AND elapsed_seconds >= "' + automationStepThreshold + '") > 0, (SELECT SEC_TO_TIME(SUM(elapsed_seconds)) FROM duration_log_step_automation subQuery1 WHERE subQuery1.smp_session_id = mainQuery.smp_session_id AND elapsed_seconds >= "' + automationStepThreshold + '"), SEC_TO_TIME(0)) AS automation_duration FROM duration_log_session mainQuery WHERE (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))' + attUIDFilter + ' ORDER BY agent_name';
            console.log(sql);
            break;
        }
        $.ajax({
            type: 'post',
            url: 'ajax/getinfo.php',
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
            switch (reportType) {
            case 'SlowAutomationSummary':
                var html = '<h3 class="text-center">'+ $('select#ReportType :selected').text() + '</h3><h5 class="text-center">' + titleText + '</h5><table id="results" class="table table-bordered center hover-highlight"><thead><tr><th class="sorter-false"></th><th colspan=2 class="sorter-false text-center border-bottom">TOTAL</th><th colspan=3 class="sorter-false text-center">WITHIN ' + automationStepThreshold + ' SECONDS</th><th colspan=3 class="sorter-false text-center">OVER ' + automationStepThreshold + ' SECONDS</th></tr><tr><th class="text-center">FLOW NAME</th><th class="text-center">COUNT</th><th class="filter-false text-center">AVERAGE<br />DURATION</th><th class="text-center">COUNT</th><th class="filter-false text-center">AVERAGE<br />DURATION</th><th class="text-center">PERCENTAGE</th><th class="text-center">COUNT</th><th class="filter-false text-center">AVERAGE<br />DURATION</th><th class="text-center">PERCENTAGE</th></tr></thead><tbody>';
                if (!data.hasOwnProperty('ERROR')) {
    		     $.each(data, function (key, value) {
                        var percent_standard = (value.count_standard / value.count * 100).toFixed(2) + '%';                        
			         var percent_slow = (value.count_slow / value.count * 100).toFixed(2) + '%';
			         html = html + '<tr><td class="text-left">' + value.flow_name + '</td><td class="text-right">' + value.count + '</td><td class="text-right">' + value.average + '</td><td class="text-right">' + value.count_standard + '</td><td class="text-right">' + value.average_standard + '</td><td class="text-right">' + percent_standard + '</td><td class="text-right">' + value.count_slow + '</td><td class="text-right">' + value.average_slow + '</td><td class="text-right">' + percent_slow + '</td></tr>';
                    });
                } else {
                    html = html + '<tr><td colspan=9 class="text-center">' + data.ERROR + '</td></tr>';
                }
                break;
            case 'SlowManualSummary':
			    var html = '<h3 class="text-center">'+ $('select#ReportType :selected').text() + '</h3><h5 class="text-center">' + titleText + '</h5><table id="results" class="table table-bordered center hover-highlight"><thead><tr><th colspan=2 class="sorter-false"></th><th colspan=2 class="sorter-false text-center border-bottom">TOTAL</th><th colspan=3 class="sorter-false text-center">WITHIN ' + manualStepThreshold + ' SECONDS</th><th colspan=3 class="sorter-false text-center">OVER ' + manualStepThreshold + ' SECONDS</th></tr><tr><th class="text-center">FLOW NAME</th><th class="text-center">STEP NAME</th><th class="text-center">COUNT</th><th class="filter-false text-center">AVERAGE<br />DURATION</th><th class="text-center">COUNT</th><th class="filter-false text-center">AVERAGE<br />DURATION</th><th class="text-center">PERCENTAGE</th><th class="text-center">COUNT</th><th class="filter-false text-center">AVERAGE<br />DURATION</th><th class="text-center">PERCENTAGE</th></tr></thead><tbody>';
                if (!data.hasOwnProperty('ERROR')) {
                    $.each(data, function (key, value) {
                        var percent_standard = (value.count_standard / value.count * 100).toFixed(2) + '%';                        
			            var percent_slow = (value.count_slow / value.count * 100).toFixed(2) + '%';
			            html = html + '<tr><td class="text-left">' + value.flow_name + '</td><td class="text-left">' + value.step_name + '</td><td class="text-right">' + value.count + '</td><td class="text-right">' + value.average + '</td><td class="text-right">' + value.count_standard + '</td><td class="text-right">' + value.average_standard + '</td><td class="text-right">' + percent_standard + '</td><td class="text-right">' + value.count_slow + '</td><td class="text-right">' + value.average_slow + '</td><td class="text-right">' + percent_slow + '</td></tr>';
                    });
                } else {
                    html = html + '<tr><td colspan=10 class="text-center">' + data.ERROR + '</td></tr>';
                }
			    break;
            case 'AllAutomation':
                var html ='<h3 class="text-center">'+ $('select#ReportType :selected').text() + '</h3><h5 class="text-center">' + titleText + '</h5><table id="results" class="table table-bordered center hover-highlight"><thead><tr><th class="text-center">SESSION ID</th><th class="text-center filter-false" >START TIME</th><th class="text-center filter-false">COMPLETION TIME</th><th class="text-center filter-false">AUTOMATION STEP DURATION</th><th class="text-center">AGENT NAME</th><th class="text-center">ATT UID</th><th class="text-center">MANAGER ATT UID</th><th class="text-center">WORK TYPE</th><th class="text-center">BUSINESS LINE</th><th class="text-center">TASK TYPE</th><th class="text-center">FLOW NAME</th></tr></thead><tbody>';				
                if (!data.hasOwnProperty('ERROR')) {
                    $.each(data, function (key, value) {
                        var start_time = moment(new Date(value.start_time)).format('MM/DD/YYYY HH:mm:ss');
                        var stop_time = moment(new Date(value.stop_time)).format('MM/DD/YYYY HH:mm:ss');
                        html = html + '<tr><td class="text-left">' + value.smp_session_id + '</td><td class="text-center">' + start_time + '</td><td class="text-center">' + stop_time + '</td><td class="text-center">' + value.automation_step_duration + '</td><td class="text-left">' + value.agent_name + '</td><td class="text left">' + value.att_uid + '</td><td class="text-left">' + value.manager_id + '</td><td class="text-left">' + value.work_source + '</td><td class="text-left">' + value.business_line + '</td><td class="text-left">' + value.task_type + '</td><td class="text-left">' + value.flow_name + '</td></tr>';
                    });
                } else {
                    html = html + '<tr><td colspan=11 class="text-center">' + data.ERROR + '</td></tr>';
                }
                break;
            case 'AllManual':
			    var html = '<h3 class="text-center">'+ $('select#ReportType :selected').text() + '</h3><h5 class="text-center">' + titleText + '</h5><table id="results" class="table table-bordered center hover-highlight"><thead><tr><th class="text-center">SESSION ID</th><th class="text-center filter-false">START TIME</th><th class="text-center filter-false">COMPLETION TIME</th><th class="text-center filter-false">MANUAL STEP DURATION</th><th class="text-center">AGENT NAME</th><th class="text-center">ATT UID</th><th class="text-center">MANAGER ATT UID</th><th class="text-center">WORK TYPE</th><th class="text-center">BUSINESS LINE</th><th class="text-center">TASK TYPE</th><th class="text-center">FLOW NAME</th><th class="text-center">STEP NAME</th></tr></thead><tbody>';
                if (!data.hasOwnProperty('ERROR')) {
                    $.each(data, function (key, value) {
				        var start_time = moment(new Date(value.start_time)).format('MM/DD/YYYY HH:mm:ss');
				        var stop_time = moment(new Date(value.stop_time)).format('MM/DD/YYYY HH:mm:ss');
				        html = html + '<tr><td class="text-left">' + value.smp_session_id + '</td><td class="text-center">' + start_time + '</td><td class="text-center">' + stop_time + '</td><td class="text-center">' + value.manual_step_duration + '</td><td class="text-left">' + value.agent_name + '</td><td class="text-left">' + value.att_uid + '</td><td class="text-left">' + value.manager_id + '</td><td class="text-left">' + value.work_source + '</td><td class="text-left">' + value.business_line + '</td><td class="text-left">' + value.task_type + '</td><td class="text-left">' + value.flow_name + '</td><td class="text-left">' + value.step_name + '</td></tr>';
                    });
                } else {
                    html = html + '<tr><td colspan=12 class="text-center">' + data.ERROR + '</td></tr>';
                }
                break;
            case 'AllWorkflow':
                var html = '<h3 class="text-center">'+ $('select#ReportType :selected').text() + '</h3><h5 class="text-center">' + titleText + '</h5><table id="results" class="table table-bordered center hover-highlight"><thead><tr><th class="text-center">SESSION ID</th><th class="text-center filter-false">START TIME</th><th class="text-center filter-false">COMPLETION TIME</th><th class="text-center filter-false">WORKFLOW DURATION</th><th class="text-center">AGENT NAME</th><th class="text-center">ATT UID</th><th class="text-center">MANAGER ATT UID</th><th class="text-center">WORK TYPE</th><th class="text-center">BUSINESS LINE</th><th class="text-center">TASK TYPE</th></tr></thead><tbody>';
                if (!data.hasOwnProperty('ERROR')) {
				    $.each(data, function (key, value) {
    				    var start_time = moment(new Date(value.start_time)).format('MM/DD/YYYY HH:mm:ss');
				        var stop_time = moment(new Date(value.stop_time)).format('MM/DD/YYYY HH:mm:ss');
				        html = html + '<tr><td class="text-left">' + value.smp_session_id + '</td><td class="text-center">' + start_time + '</td><td class="text-center">' + stop_time + '</td><td class="text-center">' + value.manual_step_duration + '</td><td class="text-left">' + value.agent_name + '</td><td class="text-left">' + value.att_uid + '</td><td class="text-left">' + value.manager_id + '</td><td class="text-left">' + value.work_source + '</td><td class="text-left">' + value.business_line + '</td><td class="text-left">' + value.task_type + '</td></tr>';
                    });
                } else {
                    html = html + '<tr><td colspan=10 class="text-center">' + data.ERROR + '</td></tr>';
                }
                break;
            case 'AgentSummary':
                var html = '<h3 class="text-center">'+ $('select#ReportType :selected').text() + '</h3><h5 class="text-center">' + titleText + '</h5><table id="results" class="table table-bordered center hover-highlight"><thead><tr><th colspan=3 class="text-center sorter-false"></th><th colspan=2 class="text-center sorter-false">COMPLETED WORKFLOWS</th><th colspan=2 class="text-center sorter-false">WORKFLOW<br />DURATION<br />>=' + sessionThreshold + ' SECONDS</th><th colspan=2 class="text-center sorter-false">CONTAINING<br />AUTOMATION STEP<br />>=' + automationStepThreshold + ' SECONDS</th><th colspan=2 class="text-center sorter-false">CONTAINING<br />MANUAL STEP<br />>=' + manualStepThreshold + ' SECONDS</th></tr><tr><th class="text-center">AGENT NAME</th><th class="text-center">ATT UID</th><th class="text-center">MANAGER ATT UID</th><th class="text-center filter-false">AVG DURATION</th><th class="text-center">COUNT</th><th class="text-center">COUNT</th><th class="text-center">PERCENTAGE</th><th class="text-center">COUNT</th><th class="text-center">PERCENTAGE</th><th class="text-center">COUNT</th><th class="text-center">PERCENTAGE</th></tr></thead><tbody>';
                if (!data.hasOwnProperty('ERROR')) {
				    $.each(data, function (key, value) {
    				    html = html + '<tr><td class="text-left">' + value.agent_name + '</td><td class="text-left">' + value.att_uid + '</td><td class="text-left">' + value.manager_id + '</td><td class="text-center">' + value.session_average + '</td><td class="text-right">' + value.count_completed + '</td><td class="text-right">' + value.count_slow_workflow + '</td><td class="text-right">' + (value.count_slow_workflow / value.count_completed *100).toFixed(2)  + '%</td><td class="text-right">' + value.count_slow_automation + '</td><td class="text-right">' + (value.count_slow_automation / value.count_completed *100).toFixed(2)  + '%</td><td class="text-right">' + value.count_slow_manual + '</td><td class="text-right">' + (value.count_slow_manual / value.count_completed *100).toFixed(2)  + '%</td></tr>';
                    });
                } else {
                    html = html + '<tr><td colspan=11 class="text-center">' + data.ERROR + '</td></tr>';
                }
                break;
            case 'AgentPerformance':
                var html = '<h3 class="text-center">'+ $('select#ReportType :selected').text() + '</h3><h5 class="text-center">' + titleText + '</h5><table id="results" class="table table-bordered center hover-highlight"><thead><tr><th colspan=10 class="text-center sorter-false">WORKFLOW DATA</th><th colspan=3 class="text-center sorter-false">WITHIN THRESHOLDS</th><th colspan=3 class="text-center sorter-false">AUTOMATION STEPS<br />>=' + automationStepThreshold + ' SECONDS</th><th colspan=3 class="text-center sorter-false">MANUAL STEP<br />>=' + manualStepThreshold + ' SECONDS</th></tr><tr><th class="text-center">SMP SESSION ID</th><th class="text-center filter-false">START TIME</th><th class="text-center filter-false">COMPLETION TIME</th><th class="text-left">AGENT NAME</th><th class="text-center">ATT UID</th><th class="text-center">MANAGER ATT UID</th><th class="text-center">WORK TYPE</th><th class="text-center">BUSINESS LINE</th><th class="text-center">TASK TYPE</th><th class="text-center filter-false">WORKFLOW DURATION</th><th class="text-center">COUNT</th><th class="text-center filter-false">TOTAL<br />DURATION</th><th class="text-center">PERCENTAGE</th><th class="text-center">COUNT</th><th class="text-center filter-false">TOTAL<br />DURATION</th><th class="text-center">PERCENTAGE</th><th class="text-center">COUNT</th><th class="text-center filter-false">TOTAL<br />DURATION</th><th class="text-center">PERCENTAGE</th></tr></thead><tbody>';
                if (!data.hasOwnProperty('ERROR')) {
			        $.each(data, function (key, value) {
    				    var start_time = moment(new Date(value.start_time)).format('MM/DD/YYYY HH:mm:ss');
				        var stop_time = moment(new Date(value.stop_time)).format('MM/DD/YYYY HH:mm:ss');
                        html = html + '<tr><td class="text-left">' + value.smp_session_id + '</td><td class="text-center">' + start_time + '</td><td class="text-center">' + stop_time + '</td><td class="text-left">' + value.agent_name + '</td><td class="text-left">' + value.att_uid + '</td><td class="text-left">' + value.manager_id + '</td><td class="text-left">' + value.work_source + '</td><td class="text-left">' + value.business_line + '</td><td class="text-left">' + value.task_type + '</td><td class="text-center">' + value.session_duration + '</td><td class="text-center">' + value.standard_count + '</td><td class="text-center">' + value.standard_duration + '</td><td class="text-center">' + value.standard_percent + '</td><td class="text-center">' + value.automation_count + '</td><td class="text-center">' + value.automation_duration + '</td><td class="text-center">' + value.automation_percent + '</td><td class="text-center">' + value.manual_count + '</td><td class="text-center">' + value.manual_duration + '</td><td class="text-center">' + value.manual_percent + '</td></tr>';
                    });
                } else {
                    html = html + '<tr><td colspan=19 class="text-center">' + data.ERROR + '</td></tr>';
                }
                break;
            }
            html = html + '</tbody></table>';
            $('div#reportBody').html(html);
            $('table#results').stickyTableHeaders();
            if (!data.hasOwnProperty('ERROR')) {                
                $('table#results').tablesorter({
                    theme: 'custom',
                    sortReset: true,
                    ignoreCase: true,
                    widgets: ['zebra', 'filter']
                });                
            } else {
                $('table#results').tablesorter({
                    theme: 'custom',
                    sortReset: true,
                    ignoreCase: true,
                    widgets: ['zebra']
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