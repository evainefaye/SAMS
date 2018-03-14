$(document).ready(function () {
    $('div.container').hide();
    $('select#environment').chosen({
        width: '100%',
        allow_single_deselect: true,
        disable_search: true
    });
    $('div#main').hide();
    // Set the location of the Node.JS server
    var serverAddress = 'http://10.100.49.77';

    var environment = Cookies.get('environmentReporting');
    if (typeof environment == 'undefined') {
        environment = Cookies.get('environment');
        if (typeof environment == 'undefined') {
            environment = 'prod';
        }
        Cookies.set('environmentReporting', 'prod');
    }
    $('select#environment').val(environment).trigger('chosen:updated');

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
        Cookies.set('environmentReporting', 'prod');
        var socketURL = serverAddress + ':5530';
        version = 'PRODUCTION';
        break;
    }
 	$('select#ReportType').val('');
    $('select#environment').off('change').on('change', function () {
        environment = $(this).find(':selected').val();
        Cookies.set('environmentReporting', environment);
        window.location.reload();
    });

    $('select.showFilter').off('change').on('change', function() {
        $('ReportType').trigger('change');
    });

    $('#ReportType').off('change').on('change', function() {
        $('.optional, .required').removeClass('optional required');
        $('div#reportBody').html('').show();
        $('div.container').hide();
        switch ($('#ReportType :selected').val()) {
        case '':
            $('input#AutomationStepThreshold').removeClass('showFilter').addClass('hideFilter');
            $('input#SessionThreshold').removeClass('showFilter').addClass('hideFilter');
            $('input#ManualStepThreshold').removeClass('showFilter').addClass('hideFilter');
            $('select#AttUIDSel').removeClass('showFilter').addClass('hideFilter optional').val('');
            $('select#BusinessLineSel').removeClass('showFilter').addClass('hideFilter optional');
            $('select#WorkSourceSel').removeClass('showFilter').addClass('hideFilter optional');
		    $('select#TaskTypeSel').removeClass('showFilter').addClass('hideFilter optional');
            $('input#SessionId').removeClass('showFilter').addClass('hideFilter optional');
		    $('.chosen-container').show();
            break;
        case 'SlowAutomationSummary':
	    	var phText = $('input#AutomationStepThreshold').attr('data-ph');
            $('input#AutomationStepThreshold').removeClass('hideFilter').addClass('showFilter').val('').prop('placeholder', phText);
            $('input#SessionThreshold').removeClass('showFilter').addClass('hideFilter');
            $('input#ManualStepThreshold').removeClass('showFilter').addClass('hideFilter');
            $('select#AttUIDSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#BusinessLineSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#WorkSourceSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#TaskTypeSel').removeClass('hideFilter').addClass('showFilter optional');
            $('input#SessionId').removeClass('showFilter').addClass('hideFilter optional');
		    $('.chosen-container').show();
            break;
        case 'SlowManualSummary':
            $('input#AutomationStepThreshold').removeClass('showFilter').addClass('hideFilter');
            $('input#SessionThreshold').removeClass('showFilter').addClass('hideFilter');
		    var phText = $('input#ManualStepThreshold').attr('data-ph');
            $('input#ManualStepThreshold').removeClass('hideFilter').addClass('showFilter').val('').prop('placeholder', phText);
            $('select#AttUIDSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#BusinessLineSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#WorkSourceSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#TaskTypeSel').removeClass('hideFilter').addClass('showFilter optional');
            $('input#SessionId').removeClass('showFilter').addClass('hideFilter optional');
		    $('.chosen-container').show();
            break;
        case 'AllAutomation':
		    var phText = $('input#AutomationStepThreshold').attr('data-opt-ph');
            $('input#AutomationStepThreshold').removeClass('hideFilter').addClass('showFilter optional').val('').prop('placeholder', phText);
            $('input#SessionThreshold').removeClass('showFilter').addClass('hideFilter');
            $('input#ManualStepThreshold').removeClass('showFilter').addClass('hideFilter');
            $('select#AttUIDSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#BusinessLineSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#WorkSourceSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#TaskTypeSel').removeClass('hideFilter').addClass('showFilter optional');
            $('input#SessionId').removeClass('showFilter').addClass('hideFilter optional');
		    $('.chosen-container').show();
            break;
        case'AllManual':
            $('input#AutomationStepThreshold').removeClass('showFilter').addClass('hideFilter').val('');
            $('input#SessionThreshold').removeClass('showFilter').addClass('hideFilter');
		    var phText = $('input#ManualStepThreshold').attr('data-opt-ph');
		    $('input#ManualStepThreshold').removeClass('hideFilter').addClass('showFilter optional').val('').prop('placeholder', phText);
            $('select#AttUIDSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#BusinessLineSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#WorkSourceSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#TaskTypeSel').removeClass('hideFilter').addClass('showFilter optional');
            $('input#SessionId').removeClass('showFilter').addClass('hideFilter optional');
		    $('.chosen-container').show();
            break;
	    case 'AllWorkflow':
            $('input#AutomationStepThreshold').removeClass('showFilter').addClass('hideFilter');
		    var phText = $('input#SessionThreshold').attr('data-opt-ph');
		    $('input#SessionThreshold').removeClass('hideFilter').addClass('showFilter optional').prop('placeholder', phText).val('');
            $('input#ManualStepThreshold').removeClass('showFilter').addClass('hideFilter');
            $('select#AttUIDSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#BusinessLineSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#WorkSourceSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#TaskTypeSel').removeClass('hideFilter').addClass('showFilter optional');
            $('input#SessionId').removeClass('showFilter').addClass('hideFilter optional');
		    $('.chosen-container').show();
		    break;
        case 'AgentSummary':
            var phText = $('input#AutomationStepThreshold').attr('data-ph');
            $('input#AutomationStepThreshold').removeClass('hideFilter').addClass('showFilter').prop('placeholder', phText).val('');
            var phText = $('input#SessionThreshold').attr('data-ph');
            $('input#SessionThreshold').removeClass('hideFilter').addClass('showFilter').prop('placeholder', phText).val('');
            var phText = $('input#ManualStepThreshold').attr('data-ph');
            $('input#ManualStepThreshold').removeClass('hideFilter').addClass('showFilter').prop('placeholder', phText).val('');
            $('selectAttUIDSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#BusinessLineSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#WorkSourceSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#TaskTypeSel').removeClass('hideFilter').addClass('showFilter optional');
            $('input#SessionId').removeClass('showFilter').addClass('hideFilter optional');
		    $('.chosen-container').show();
            break;
        case 'AgentPerformance':
            var phText = $('input#AutomationStepThreshold').attr('data-ph');
            $('input#AutomationStepThreshold').removeClass('hideFilter').addClass('showFilter').prop('placeholder', phText).val('');
            $('input#SessionThreshold').removeClass('showFilter optional').addClass('hideFilter');
            var phText = $('input#ManualStepThreshold').attr('data-ph');
            $('input#ManualStepThreshold').removeClass('hideFilter').addClass('showFilter').prop('placeholder', phText).val('');
            $('select#AttUIDSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#BusinessLineSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#WorkSourceSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#TaskTypeSel').removeClass('hideFilter').addClass('showFilter optional');
            $('input#SessionId').removeClass('showFilter').addClass('hideFilter optional');
		    $('.chosen-container').show();
            break;
	    case 'Screenshots':
            $('input#AutomationStepThreshold').removeClass('showFilter').addClass('hideFilter optional');
            $('input#SessionThreshold').removeClass('showFilter').addClass('hideFilter optional');
            $('input#ManualStepThreshold').removeClass('showFilter').addClass('hideFilter optional');
            $('select#AttUIDSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#BusinessLineSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#WorkSourceSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#TaskTypeSel').removeClass('hideFilter').addClass('showFilter optional');
            var phText = $('input#SessionId').attr('data-opt-ph');
            $('input#SessionId').removeClass('hideFilter').addClass('showFilter optional').prop('placeholder', phText);
		    $('.chosen-container').show();
            break;
	    case 'PerformanceSummary':
            $('input#AutomationStepThreshold').removeClass('showFilter').addClass('hideFilter optional');
            $('input#SessionThreshold').removeClass('showFilter').addClass('hideFilter optional');
            $('input#ManualStepThreshold').removeClass('showFilter').addClass('hideFilter optional');
            $('select#AttUIDSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#BusinessLineSel').removeClass('showFilter').addClass('hideFilter optional');
            $('select#WorkSourceSel').removeClass('showFilter').addClass('hideFilter optional');
            $('select#TaskTypeSel').removeClass('showFilter').addClass('hideFilter optional');
            $('input#SessionId').removeClass('showFilter').addClass('hideFilter optional');
		    $('.chosen-container').not('#environment_chosen').not('#ReportType_chosen').not('#AttUIDSel_chosen').hide();
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
                moment().subtract(1, 'd').startOf('day'),
                moment().subtract(1, 'd').endOf('day')
            ],
            'Previous 7 Days': [
                moment().subtract(7, 'd').startOf('day'),
                moment().endOf('day')
            ],
            'Previous 30 Days': [
                moment().subtract(30, 'd').startOf('day'),
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
                moment().subtract(1, 'M').startOf('month').startOf('day'),
                moment().subtract(1, 'M').endOf('month').endOf('day')
            ]
        },
        'locale': {
            'direction': 'ltr',
            'format': 'MM/DD/YYYY HH:mm',
            'separator': '' / ''
        },
        'opens': 'center',
        'parentEl': 'body',
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
    var BusinessLine = '';
    var WorkSource = '';
    var TaskType = '';
    var titleText = '';

    $('input#RequestReport').off('click.request').on('click.request', function () {
        var reportType=$('select#ReportType :selected').val();
        if (reportType == '') {
            return;
        }
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
            if (valid1 && valid2) {
                valid = true;
            }
            break;
	    case 'Screenshots':
		    valid = true;
		    break;
	    case 'PerformanceSummary':
	    	valid = true;
		    	break;
	    }
	    if (!valid) {
		    return;
        }
        $('div.overlay').show();
        $('input, select').attr('disabled', true);
        $('div#reportBody').html('');
	    $('div#screenshotBody').html('');
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
	    var parameters = '';
	    $.each($('.showFilter'), function (index, element) {
		    switch($(element).prop('id')) {
		    case 'AutomationStepThreshold':
			    if ($(element).val() != '') {
				    automationStepFilterExceeded = 'AND elapsed_seconds >= "' + $(element).val() + '" ';
				    automationStepFilterWithin = 'AND elapsed_seconds < "' + $(element).val() + '" ';
				    automationStepThreshold = $(element).val();
				    if (parameters == '') {
					    parameters = 'MOTIVE&nbsp;STEP:&nbsp;' + automationStepThreshold + '&nbsp;SECONDS';
				    } else {
					    parameters = parameters + 'MOTIVE&nbsp;STEP:&nbsp;' + automationStepThreshold + '&nbsp;SECONDS';
				    }
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
				    if (parameters == '') {
					    parameters = 'AGENT&nbsp;STEP:&nbsp' + manualStepThreshold + ' &nbspSECONDS';
				    } else {
					    parameters = parameters + ' AGENT&nbsp;STEP:&nbsp;' + manualStepThreshold + '&nbsp;SECONDS';
				    }
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
				    if (parameters == '') {
					    parameters = 'WORKFLOW&nbsp;DURATION:&nbsp;' + sessionThreshold + ' &nbsp;SECONDS';
				    } else {
					    parameters = parameters + ' WORKFLOW&nbsp;DURATION:&nbsp;' + sessionThreshold + ' &nbsp;SECONDS';
				    }
			    } else {
				    sessionThresholdFilterExceeded = '';
				    sessionThresholdFilterWithin = '';
			    }
			    break;
		    case 'AttUIDSel':
			    if ($(element).val() != '') {
                    attUIDFilter = 'AND (';
				    if (parameters === '') {
					    parameters = 'ATTUID:&nbsp;[';
				    } else {
					    parameters = parameters + ' ATTUID:&nbsp;[';
				    }
                    $.each($(element).val(), function (key, value) {
                        attUID = attUID + ' ' + attUID;
                        if (key == 0) {
                            attUIDFilter = attUIDFilter + '(manager_id = "' + value + '" || att_uid = "' + value + '")';
						    parameters = parameters + value.toUpperCase();
                        } else {
                            attUIDFilter = attUIDFilter + ' OR (manager_id = "' + value + '" || att_uid = "' + value + '")';
						    parameters = parameters + ',' + value.toUpperCase();
                        }
                    });
                    attUID = attUID.trim();
				    attUIDFilter = attUIDFilter + ') ';
				    parameters = parameters + ']';
			    } else {
				    attUIDFilter = '';
				    attUID =  '';
			    }
			    break;
		    case 'BusinessLineSel':
			    if ($(element).val() != '') {
                    businessLineFilter = 'AND (';
				    if (parameters === '') {
					    parameters = 'BUSINESS&nbsp;LINE:&nbsp;[';
				    } else {
					    parameters = parameters +  ' BUSINESS&nbsp;LINE:&nbsp;[';
				    }
                    businessLine = $(element).val();
                    $.each(businessLine, function (key, value) {
                        if (key == 0) {
                            businessLineFilter = businessLineFilter + 'business_line LIKE "%' + value + '%" ';
						    parameters = parameters + value;
                        } else {
                            businessLineFilter = businessLineFilter + ' OR business_line LIKE "%' + value + '%"';
						    parameters = parameters + ',' + value;
                        }
                    });
				    businessLineFilter = businessLineFilter + ') ';
				    parameters = parameters + ']';
			    } else {
				    businessLineFilter = '';
				    businessLine =  '';
			    }
			    break;
		    case 'WorkSourceSel':
			    if ($(element).val() != '') {
                    workSourceFilter = 'AND (';
				    if (parameters == '') {
					    parameters = 'WORK&nbsp;TYPE: [';
				    } else {
					    parameters = parameters + '&nbsp;WORK&nbsp;TYPE:&nbsp;[';
				    }
                    workSource = $(element).val();
                    $.each(workSource, function (key, value) {
                        if (key == 0) {
                            workSourceFilter = workSourceFilter + 'work_source LIKE "%' + value + '%"';
						    parameters = parameters + value;
                        } else {
                            workSourceFilter = workSourceFilter + ' OR work_source LIKE "%' + value + '%"';
						    parameters = parameters + ', ' + value;
                        }
                    });
				    workSourceFilter = workSourceFilter + ') ';
				    parameters = parameters + ']';
			    } else {
				    workSourceFilter = '';
				    workSource =  '';
			    }
			    break;
		    case 'TaskTypeSel':
			    if ($(element).val() != '') {
                    taskTypeFilter = 'AND (';
				    if (parameters == '') {
					    parameters = 'TASK&nbsp;TYPE: [';
				    } else {
					    parameters = parameters + '&nbsp;TASK&nbsp;TYPE:&nbsp;[';
				    }
                    taskType = $(element).val();
                    $.each(taskType, function (key, value) {
                        if (key == 0) {
                            taskTypeFilter = taskTypeFilter + 'task_type = "' + value + '"';
						    parameters = parameters + value;
                        } else {
                            taskTypeFilter = taskTypeFilter + ' OR task_type = "' + value + '"';
						    parameters = parameters + ', ' + value;
                        }
                    });
				    taskTypeFilter = taskTypeFilter + ') ';
				    parameters = parameters + ']';
			    } else {
				    taskTypeFilter = '';
				    taskType =  '';
			    }
			    break;
		    case 'SessionId':
			    if ($(element).val() != '') {
                    sessionIdFilter = ' AND smp_session_id LIKE "%' + $(element).val().trim() + '%" ';
			    } else {
				    sessionIdFilter = '';
			    }
			    break;
		    }
	    });
        switch(reportType) {
        case 'SlowAutomationSummary':
   		    titleText = 'MOTIVE STEPS THAT HAVE ONE OR MORE MOTIVE STEP TAKING ' + automationStepThreshold + ' OR MORE SECONDS TO COMPLETE STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + '<br /><small><i>' + parameters + '</i></small>';
            var sql = 'SELECT mainQuery.flow_name AS flow_name, (SELECT COUNT(*) FROM duration_log_step_automation subQuery1 WHERE subQuery1.flow_name = mainQuery.flow_name AND in_progress = "N" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))) AS count, (SELECT COUNT(*) FROM duration_log_step_automation subQuery1 WHERE subQuery1.flow_name = mainQuery.flow_name AND in_progress = "N" ' + automationStepFilterWithin + 'AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))) AS count_standard, COUNT(*) AS count_slow, (SELECT SEC_TO_TIME(ROUND(AVG(elapsed_seconds))) FROM duration_log_step_automation subQuery1 WHERE subQuery1.flow_name = mainQuery.flow_name AND in_progress = "N" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))) AS average, (SELECT IF(SUM(elapsed_seconds) IS NULL, SEC_TO_TIME(0), SEC_TO_TIME(ROUND(AVG(elapsed_seconds)))) FROM duration_log_step_automation subQuery1 WHERE subQuery1.flow_name = mainQuery.flow_name AND in_progress = "N" ' + automationStepFilterWithin + 'AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))) AS average_standard, SEC_TO_TIME(elapsed_seconds) AS average_slow FROM duration_log_step_automation mainQuery WHERE in_progress = "N" ' + automationStepFilterExceeded + 'AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))' + attUIDFilter + workSourceFilter + businessLineFilter + taskTypeFilter + ' GROUP BY flow_name ORDER BY flow_name ASC';
            break;
        case 'SlowManualSummary':
	        titleText = 'AGENT STEPS THAT HAVE ONE OR MORE AGENT STEP TAKING ' + manualStepThreshold + ' OR MORE SECONDS TO COMPLETE STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss')  + '<br /><small><i>' + parameters + '</i></small>';
            var sql = 'SELECT mainQuery.flow_name AS flow_name, mainQuery.step_name,(SELECT COUNT(*) FROM duration_log_step_manual subQuery1 WHERE subQuery1.flow_name = mainQuery.flow_name AND subQuery1.step_name = mainQuery.step_name AND in_progress = "N" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))) AS count, (SELECT COUNT(*) FROM duration_log_step_manual subQuery1 WHERE subQuery1.flow_name = mainQuery.flow_name AND subQuery1.step_name = mainQuery.step_name AND in_progress = "N" ' + manualStepFilterWithin + 'AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))) AS count_standard, COUNT(*) AS count_slow, (SELECT SEC_TO_TIME(ROUND(AVG(elapsed_seconds))) FROM duration_log_step_manual subQuery1 WHERE subQuery1.flow_name = mainQuery.flow_name AND subQuery1.step_name = mainQuery.step_name AND in_progress = "N" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))) AS average, (SELECT IF(SUM(elapsed_seconds) IS NULL, SEC_TO_TIME(0), SEC_TO_TIME(ROUND(AVG(elapsed_seconds)))) FROM duration_log_step_manual subQuery1 WHERE subQuery1.flow_name = mainQuery.flow_name AND subQuery1.step_name = mainQuery.step_name AND in_progress = "N" ' + manualStepFilterWithin + 'AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))) AS average_standard, SEC_TO_TIME(elapsed_seconds) AS average_slow FROM duration_log_step_manual mainQuery WHERE in_progress = "N" ' + manualStepFilterExceeded + 'AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))' + attUIDFilter + workSourceFilter + businessLineFilter + taskTypeFilter + ' GROUP BY CONCAT(flow_name, step_name) ORDER BY flow_name ASC, step_name ASC';
            break;
        case 'AllAutomation':
		    if (parameters == '') {
			    titleText = 'MOTIVE STEPS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss');
		    } else {
			    titleText = 'MOTIVE STEPS THAT TAKING ' + automationStepThreshold + ' OR MORE SECONDS TO COMPLETE STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + '<br /><small><i>' + parameters + '</i></small>';
		    }
            var sql = 'SELECT smp_session_id, start_time, stop_time, SEC_TO_TIME(elapsed_seconds) AS automation_step_duration, att_uid, CONCAT(last_name, ", ", first_name) AS agent_name, IF(manager_id IS NULL, "Not Available", manager_id) AS manager_id, IF(work_source IS NULL, "Not Available", work_source) as work_source, IF(business_line IS NULL, "Not Available", business_line) AS business_line, IF(task_type IS NULL, "", task_type) AS task_type, flow_name FROM duration_log_step_automation WHERE in_progress = "N" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))' + automationStepFilterExceeded + attUIDFilter + workSourceFilter + businessLineFilter + taskTypeFilter + ' ORDER BY start_time ASC';
            break;
        case 'AllManual':
		    if (parameters == '') {
			    titleText = 'AGENT STEPS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss');
		    } else {
			    titleText = 'AGENT STEPS TAKING ' + manualStepThreshold + ' OR MORE SECONDS TO COMPLETE STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + '<br /><small><i>' + parameters + '</i></small>';
		    }
            var sql = 'SELECT smp_session_id, start_time, stop_time, SEC_TO_TIME(elapsed_seconds) AS manual_step_duration, att_uid, CONCAT(last_name, ", ", first_name) AS agent_name, IF(manager_id IS NULL, "Not Available", manager_id) AS manager_id, IF(work_source IS NULL, "Not Available", work_source) AS work_source, IF(business_line IS NULL, "Not Available", business_line) AS business_line, IF(task_type IS NULL, "", task_type) AS task_type, flow_name, step_name FROM duration_log_step_manual WHERE in_progress = "N" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '")) ' + manualStepFilterExceeded + attUIDFilter + workSourceFilter + businessLineFilter + taskTypeFilter + 'ORDER BY start_time';
            break;
        case 'AllWorkflow':
		    if (parameters == '') {
                titleText = 'WORKFLOW SESSION DATA FOR SESSIONS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss');
		    } else {
			    titleText = 'WORKFLOW SESSION DATA FOR SESSIONS TAKING ' + sessionThreshold + ' OR MORE SECONDS TO COMPLETE STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss')  + '<br /><small><i>' + parameters + '</i></small>';
		    }
            var sql = 'SELECT smp_session_id, start_time, stop_time, SEC_TO_TIME(elapsed_seconds) AS manual_step_duration, att_uid, CONCAT(last_name, ", ", first_name) AS agent_name, IF(manager_id IS NULL, "Not Available", manager_id) AS manager_id, IF(work_source IS NULL, "Not Available", work_source) AS work_source, IF(business_line IS NULL, "Not Available", business_line) AS business_line, IF(task_type IS NULL, "", task_type) AS task_type FROM duration_log_session WHERE (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '")) ' + sessionThresholdFilterExceeded + attUIDFilter + workSourceFilter + businessLineFilter + taskTypeFilter + 'ORDER BY start_time';
            break;
        case 'AgentSummary':
            titleText = 'WORKFLOW SUMMARY BY AGENT FOR SESSIONS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + '<br /><small><i>' + parameters + '</i></small>';
            var sql = 'SELECT CONCAT(last_name, ", ", first_name) AS agent_name, att_uid, manager_id, SEC_TO_TIME(ROUND(AVG(elapsed_seconds),0)) AS session_average, COUNT(*) AS count_completed, (SELECT COUNT(*) FROM duration_log_session subQuery1 WHERE subQuery1.att_uid = mainQuery.att_uid AND elapsed_seconds >= "' + sessionThreshold + '" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))) AS count_slow_workflow, (SELECT COUNT(DISTINCT smp_session_id) FROM duration_log_step_automation subQuery1 WHERE subQuery1.att_uid = mainQuery.att_uid AND in_progress = "N" AND elapsed_seconds >= "' + automationStepThreshold + '" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '")) ) AS count_slow_automation, (SELECT COUNT(DISTINCT smp_session_id) FROM duration_log_step_manual subQuery1 WHERE subQuery1.att_uid = mainQuery.att_uid AND in_progress = "N" AND elapsed_seconds >= "' + manualStepThreshold + '" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '")) ) AS count_slow_manual FROM duration_log_session mainQuery WHERE (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))' + attUIDFilter + workSourceFilter + businessLineFilter + taskTypeFilter + ' GROUP BY att_uid ORDER BY agent_name';
            break;
        case 'AgentPerformance':
            titleText = 'AGENT PERFORMANCE SUMMARY FOR SESSIONS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + '<br /><small><i>' + parameters + '</i></small>';
            var sql = 'SELECT smp_session_id, start_time, stop_time, SEC_TO_TIME(elapsed_seconds) AS session_duration, att_uid, CONCAT(last_name, ", ", first_name) AS agent_name, manager_id, work_source, business_line, task_type,(SELECT COUNT(*) FROM duration_log_step_automation subQuery1 WHERE subQuery1.smp_session_id = mainQuery.smp_session_id AND elapsed_seconds <"' + automationStepThreshold + '") AS automation_count_within, (SELECT IF(SUM(elapsed_seconds) IS NULL, SEC_TO_TIME(0), SEC_TO_TIME(SUM(elapsed_seconds))) FROM duration_log_step_automation subQuery1 WHERE subQuery1.smp_session_id = mainQuery.smp_session_id AND elapsed_seconds <"' + automationStepThreshold + '") AS automation_time_within, (SELECT COUNT(*) FROM duration_log_step_manual subQuery1 WHERE subQuery1.smp_session_id = mainQuery.smp_session_id AND elapsed_seconds <"' + manualStepThreshold + '") AS manual_count_within, (SELECT IF(SUM(elapsed_seconds) IS NULL, SEC_TO_TIME(0), SEC_TO_TIME(SUM(elapsed_seconds))) FROM duration_log_step_manual subQuery1 WHERE subQuery1.smp_session_id = mainQuery.smp_session_id AND elapsed_seconds <"' + manualStepThreshold + '") AS manual_time_within, (SELECT COUNT(*) FROM duration_log_step_automation subQuery1 WHERE subQuery1.smp_session_id = mainQuery.smp_session_id AND elapsed_seconds >="' + automationStepThreshold + '") AS automation_count_exceeded, (SELECT IF(SUM(elapsed_seconds) IS NULL, SEC_TO_TIME(0), SEC_TO_TIME(SUM(elapsed_seconds))) FROM duration_log_step_automation subQuery1 WHERE subQuery1.smp_session_id = mainQuery.smp_session_id AND elapsed_seconds >="' + automationStepThreshold + '") AS automation_time_exceeded, (SELECT COUNT(*) FROM duration_log_step_manual subQuery1 WHERE subQuery1.smp_session_id = mainQuery.smp_session_id AND elapsed_seconds >="' + manualStepThreshold + '") AS manual_count_exceeded, (SELECT IF(SUM(elapsed_seconds) IS NULL, SEC_TO_TIME(0), SEC_TO_TIME(SUM(elapsed_seconds))) FROM duration_log_step_manual subQuery1 WHERE subQuery1.smp_session_id = mainQuery.smp_session_id AND elapsed_seconds >="' + manualStepThreshold + '") AS manual_time_exceeded FROM duration_log_session mainQuery WHERE (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))' + attUIDFilter + workSourceFilter + businessLineFilter + taskTypeFilter + ' ORDER BY agent_name';
            break;
	    case 'Screenshots':
            titleText = 'WORKFLOW SESSION DATA FOR SESSIONS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + '<br /><small><i>DOUBLE CLICK ON A ROW FROM THE LIST TO VIEW THE ASSOCIATED SCREENSHOTS</i></small>';
            var sql = 'SELECT smp_session_id, start_time, stop_time, SEC_TO_TIME(elapsed_seconds) AS manual_step_duration, att_uid, CONCAT(last_name, ", ", first_name) AS agent_name, IF(manager_id IS NULL, "Not Available", manager_id) AS manager_id, IF(work_source IS NULL, "Not Available", work_source) AS work_source, IF(business_line IS NULL, "Not Available", business_line) AS business_line, IF(task_type IS NULL, "", task_type) AS task_type FROM duration_log_session WHERE (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '")) ' + sessionIdFilter + attUIDFilter + workSourceFilter + businessLineFilter + taskTypeFilter + ' ORDER BY start_time';
		    break;
	    case 'PerformanceSummary':
		    titleText = 'WORKFLOW COMPLETION COUNT BY CATEGORY FOR WORKFLOWS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + '<br /><small><i>' + parameters + '</i></small>';
        }
        $.ajax({
            type: 'post',
            url: 'ajax/getinfo.php',
            data: {
                databaseIP: dbHost,
                databaseUser: dbUser,
                databasePW: dbPassword,
                databaseName: dbName,
                sql: sql,
			    startDate: startDate,
			    endDate: endDate,
			    reportType: reportType,
			    attUIDFilter: attUIDFilter
            },
            dataType: 'json',
        }).done(function(data) {
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
			    html = html + '</tbody></table>';
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
			    html = html + '</tbody></table>';
			    break;
            case 'AllAutomation':
                var html ='<h3 class="text-center">'+ $('select#ReportType :selected').text() + '</h3><h5 class="text-center">' + titleText + '</h5><table id="results" class="table table-bordered center hover-highlight"><thead><tr><th class="text-center">SESSION ID</th><th class="text-center filter-false" >START TIME</th><th class="text-center filter-false">COMPLETION TIME</th><th class="text-center filter-false">MOTIVE STEP DURATION</th><th class="text-center">AGENT NAME</th><th class="text-center">ATT UID</th><th class="text-center">MANAGER ATT UID</th><th class="text-center">WORK TYPE</th><th class="text-center">BUSINESS LINE</th><th class="text-center">TASK TYPE</th><th class="text-center">FLOW NAME</th></tr></thead><tbody>';
                if (!data.hasOwnProperty('ERROR')) {
                    $.each(data, function (key, value) {
                        var start_time = moment(new Date(value.start_time)).format('MM/DD/YYYY HH:mm:ss');
                        var stop_time = moment(new Date(value.stop_time)).format('MM/DD/YYYY HH:mm:ss');
                        html = html + '<tr><td class="text-left">' + value.smp_session_id + '</td><td class="text-center">' + start_time + '</td><td class="text-center">' + stop_time + '</td><td class="text-center">' + value.automation_step_duration + '</td><td class="text-left">' + value.agent_name + '</td><td class="text left">' + value.att_uid + '</td><td class="text-left">' + value.manager_id + '</td><td class="text-left">' + value.work_source + '</td><td class="text-left">' + value.business_line + '</td><td class="text-left">' + value.task_type + '</td><td class="text-left">' + value.flow_name + '</td></tr>';
                    });
                } else {
                    html = html + '<tr><td colspan=11 class="text-center">' + data.ERROR + '</td></tr>';
                }
			    html = html + '</tbody></table>';
                break;
            case 'AllManual':
			    var html = '<h3 class="text-center">'+ $('select#ReportType :selected').text() + '</h3><h5 class="text-center">' + titleText + '</h5><table id="results" class="table table-bordered center hover-highlight"><thead><tr><th class="text-center">SESSION ID</th><th class="text-center filter-false">START TIME</th><th class="text-center filter-false">COMPLETION TIME</th><th class="text-center filter-false">AGENT STEP DURATION</th><th class="text-center">AGENT NAME</th><th class="text-center">ATT UID</th><th class="text-center">MANAGER ATT UID</th><th class="text-center">WORK TYPE</th><th class="text-center">BUSINESS LINE</th><th class="text-center">TASK TYPE</th><th class="text-center">FLOW NAME</th><th class="text-center">STEP NAME</th></tr></thead><tbody>';
                if (!data.hasOwnProperty('ERROR')) {
                    $.each(data, function (key, value) {
				        var start_time = moment(new Date(value.start_time)).format('MM/DD/YYYY HH:mm:ss');
				        var stop_time = moment(new Date(value.stop_time)).format('MM/DD/YYYY HH:mm:ss');
				        html = html + '<tr><td class="text-left">' + value.smp_session_id + '</td><td class="text-center">' + start_time + '</td><td class="text-center">' + stop_time + '</td><td class="text-center">' + value.manual_step_duration + '</td><td class="text-left">' + value.agent_name + '</td><td class="text-left">' + value.att_uid + '</td><td class="text-left">' + value.manager_id + '</td><td class="text-left">' + value.work_source + '</td><td class="text-left">' + value.business_line + '</td><td class="text-left">' + value.task_type + '</td><td class="text-left">' + value.flow_name + '</td><td class="text-left">' + value.step_name + '</td></tr>';
                    });
                } else {
                    html = html + '<tr><td colspan=12 class="text-center">' + data.ERROR + '</td></tr>';
                }
			    html = html + '</tbody></table>';
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
			    html = html + '</tbody></table>';
                break;
            case 'AgentSummary':
                var html = '<h3 class="text-center">'+ $('select#ReportType :selected').text() + '</h3><h5 class="text-center">' + titleText + '</h5><table id="results" class="table table-bordered center hover-highlight"><thead><tr><th colspan=3 class="text-center sorter-false"></th><th colspan=2 class="text-center sorter-false">COMPLETED WORKFLOWS</th><th colspan=2 class="text-center sorter-false">WORKFLOW<br />DURATION<br />>=' + sessionThreshold + ' SECONDS</th><th colspan=2 class="text-center sorter-false">CONTAINING<br />MOTIVE STEP<br />>=' + automationStepThreshold + ' SECONDS</th><th colspan=2 class="text-center sorter-false">CONTAINING<br />AGENT STEP<br />>=' + manualStepThreshold + ' SECONDS</th></tr><tr><th class="text-center">AGENT NAME</th><th class="text-center">ATT UID</th><th class="text-center">MANAGER ATT UID</th><th class="text-center filter-false">AVG DURATION</th><th class="text-center">COUNT</th><th class="text-center">COUNT</th><th class="text-center">PERCENTAGE</th><th class="text-center">COUNT</th><th class="text-center">PERCENTAGE</th><th class="text-center">COUNT</th><th class="text-center">PERCENTAGE</th></tr></thead><tbody>';
                if (!data.hasOwnProperty('ERROR')) {
				    $.each(data, function (key, value) {
    				    html = html + '<tr><td class="text-left">' + value.agent_name + '</td><td class="text-left">' + value.att_uid + '</td><td class="text-left">' + value.manager_id + '</td><td class="text-center">' + value.session_average + '</td><td class="text-right">' + value.count_completed + '</td><td class="text-right">' + value.count_slow_workflow + '</td><td class="text-right">' + (value.count_slow_workflow / value.count_completed *100).toFixed(2)  + '%</td><td class="text-right">' + value.count_slow_automation + '</td><td class="text-right">' + (value.count_slow_automation / value.count_completed *100).toFixed(2)  + '%</td><td class="text-right">' + value.count_slow_manual + '</td><td class="text-right">' + (value.count_slow_manual / value.count_completed *100).toFixed(2)  + '%</td></tr>';
                    });
                } else {
                    html = html + '<tr><td colspan=11 class="text-center">' + data.ERROR + '</td></tr>';
                }
			    html = html + '</tbody></table>';
                break;
            case 'AgentPerformance':
                var html = '<h3 class="text-center">'+ $('select#ReportType :selected').text() + '</h3><h5 class="text-center">' + titleText + '</h5><table id="results" class="table table-bordered center hover-highlight"><thead><tr><th colspan=7 class="text-center sorter-false">WORKFLOW DATA</th><th colspan=3 class="text-center sorter-false">MOTIVE STEPS<br />< ' + automationStepThreshold + ' SECONDS</th><th colspan=3 class="text-center sorter-false">MOTIVE STEPS<br />>=' + automationStepThreshold + ' SECONDS</th><th colspan=3 class="text-center sorter-false">AGENT STEPS<br />< ' + manualStepThreshold + ' SECONDS</th><th colspan=3 class="text-center sorter-false">AGENT STEP<br />>=' + manualStepThreshold + ' SECONDS</th></tr><tr><th class="text-center filter-false">START TIME</th><th class="text-left">AGENT NAME</th><th class="text-center">MANAGER ATT UID</th><th class="text-center">WORK TYPE</th><th class="text-center">BUSINESS LINE</th><th class="text-center">TASK TYPE</th><th class="text-center filter-false">WORKFLOW DURATION</th><th class="text-center">COUNT</th><th class="text-center filter-false">TOTAL<br />TIME</th><th class="text-center">PERCENTAGE</th><th class="text-center">COUNT</th><th class="text-center filter-false">TOTAL<br />TIME</th><th class="text-center">PERCENTAGE</th><th class="text-center">COUNT</th><th class="text-center filter-false">TOTAL<br />TIME</th><th class="text-center">PERCENTAGE</th><th class="text-center">COUNT</th><th class="text-center filter-false">TOTAL<br />TIME</th><th class="text-center">PERCENTAGE</th></tr></thead><tbody>';
                if (!data.hasOwnProperty('ERROR')) {
			        $.each(data, function (key, value) {
    				    var start_time = moment(new Date(value.start_time)).format('MM/DD/YYYY HH:mm:ss');
				        var stop_time = moment(new Date(value.stop_time)).format('MM/DD/YYYY HH:mm:ss');
				        var automation_count_within = Number(value.automation_count_within);
				        var manual_count_within = Number(value.manual_count_within);
				        var automation_count_exceeded = Number(value.automation_count_exceeded);
				        var manual_count_exceeded = Number(value.manual_count_exceeded);
				        var total_automation_count = automation_count_within + automation_count_exceeded;
				        var total_manual_count = manual_count_within + manual_count_exceeded;
				        if (total_automation_count > 0) {
					        var percent_automation_within = (automation_count_within / total_automation_count * 100).toFixed(2) + '%';
					        var percent_automation_exceeded = (automation_count_exceeded / total_automation_count * 100).toFixed(2) + '%';
				        } else {
					        var percent_automation_within = '0.00%';
					        var percent_automation_exceeded = '0.00%';
				        }
				        if (total_manual_count > 0) {
					        var percent_manual_within = (manual_count_within / total_manual_count * 100).toFixed(2) + '%';
					        var percent_manual_exceeded = (manual_count_exceeded / total_manual_count * 100).toFixed(2) + '%';
					        } else {
					        var percent_manual_within = '0.00%';
					        var percent_manual_exceeded = '0.00%';
				        }
                        html = html + '<tr class="screenshots" data-session = "' + value.smp_session_id + '"><td class="text-center">' + start_time + '</td><td class="text-left">' + value.agent_name + ' (' + value.att_uid + ')' + '</td><td class="text-left">' + value.manager_id + '</td><td class="text-left">' + value.work_source + '</td><td class="text-left">' + value.business_line + '</td><td class="text-left">' + value.task_type + '</td><td class="text-center">' + value.session_duration + '</td><td class="text-right">' + automation_count_within + '</td><td class="text-center">' + value.automation_time_within + '</td><td class="text-right">' + percent_automation_within + '</td><td class="text-right">' + automation_count_exceeded + '</td><td class="text-center">' + value.automation_time_exceeded + '</td><td class="text-right">' + percent_automation_exceeded + '</td><td class="text-right">' + manual_count_within + '</td><td class="text-center">' + value.manual_time_within + '</td><td class="text-right">' + percent_manual_within + '</td>';
					    if (manual_count_exceeded  > 0) {
						    html = html + '<td class="text-right" data-query="' + manualStepThreshold + '">' + manual_count_exceeded + '</td><td>' + value.manual_time_exceeded + '<td class="text-right">' + percent_manual_exceeded + '</td></tr>';
					    } else {
						    html = html + '<td class="text-right">' + manual_count_exceeded + '</td><td>' + value.manual_time_exceeded + '<td class="text-right">' + percent_manual_exceeded + '</td></tr>';
					    }
                    });
                } else {
                    html = html + '<tr><td colspan=22 class="text-center">' + data.ERROR + '</td></tr>';
                }
			    html = html + '</tbody></table>';
                break;
            case 'Screenshots':
                var html = '<h3 class="text-center">'+ $('select#ReportType :selected').text() + '</h3><h5 class="text-center">' + titleText + '</h5><table id="results" class="table table-bordered center hover-highlight"><thead><tr><th class="text-center">SESSION ID</th><th class="text-center filter-false">START TIME</th><th class="text-center filter-false">COMPLETION TIME</th><th class="text-center filter-false">WORKFLOW DURATION</th><th class="text-center">AGENT NAME</th><th class="text-center">ATT UID</th><th class="text-center">MANAGER ATT UID</th><th class="text-center">WORK TYPE</th><th class="text-center">BUSINESS LINE</th><th class="text-center">TASK TYPE</th></tr></thead><tbody>';
                if (!data.hasOwnProperty('ERROR')) {
				    $.each(data, function (key, value) {
    				    var start_time = moment(new Date(value.start_time)).format('MM/DD/YYYY HH:mm:ss');
				        var stop_time = moment(new Date(value.stop_time)).format('MM/DD/YYYY HH:mm:ss');
				        html = html + '<tr class="screenshots" data-session="' + value.smp_session_id + '"><td class="text-left">' + value.smp_session_id + '</td><td class="text-center">' + start_time + '</td><td class="text-center">' + stop_time + '</td><td class="text-center">' + value.manual_step_duration + '</td><td class="text-left">' + value.agent_name + '</td><td class="text-left">' + value.att_uid + '</td><td class="text-left">' + value.manager_id + '</td><td class="text-left">' + value.work_source + '</td><td class="text-left">' + value.business_line + '</td><td class="text-left">' + value.task_type + '</td></tr>';
                    });
                } else {
                    html = html + '<tr><td colspan=10 class="text-center">' + data.ERROR + '</td></tr>';
                }
			    html = html + '</tbody></table>';
                break;
		    case 'PerformanceSummary':
                if (!data.hasOwnProperty('ERROR')) {
		    		var html = '<h3 class="text-center">'+ $('select#ReportType :selected').text() + '</h3><h5 class="text-center">' + titleText + '</h5>';
 					html = html + '<ul class="nav nav-pills nav-justified">';
				    $.each(data, function (reportType, reportData) {
		    			switch(reportType) {
		    			case 'CountByAgent':
		    				html = html + '<li class="active"><a data-toggle="pill" href="#CountByAgent">COUNT BY AGENT</a></li>';
		    				break;
		    			case 'CountByBusinessLine':
		    				html = html + '<li><a data-toggle="pill" href="#CountByBusinessLine">COUNT BY BUSINESS LINE</a></li>';
		    				break;
		    			case 'CountByWorkSource':
		    				html = html + '<li><a data-toggle="pill" href="#CountByWorkSource">COUNT BY WORK TYPE</a></li>';
		    				break;
		    			case 'CountByTaskType':
		    				html = html + '<li><a data-toggle="pill" href="#CountByTaskType">COUNT BY TASK TYPE</a></li>';
		    				break;
		    			}
		    		});
		    		html = html + '</ul><div class="tab-content">';
				    $.each(data, function (reportType, reportData) {
    					switch (reportType) {
    					case 'CountByAgent':
    						html = html + '<div id="CountByAgent" class="tab-pane fade in active"><table class="results table table-bordered center hover-highlight"><thead><tr><th colspan=3 class="sorter-false filter-false text-center">COMPLETED WORKFLOWS BY AGENT</th></tr><tr><th class="filter-false text-center">AGENT NAME</th><th class="filter-false text-center">TOTAL COMPLETED</th><th class="filter-false text-center">PERCENTAGE</th></tr></thead><tbody>';
    						break;
    					case 'CountByBusinessLine':
    						html = html + '<div id="CountByBusinessLine" class="tab-pane fade in"><table class="results table table-bordered center hover-highlight"><thead><tr><th colspan=3 class="sorter-false filter-false text-center">COMPLETED WORKFLOWS BY BUSINESS LINE</th></tr><tr><th class="filter-false text-center">BUSINESS LINE</th><th class="filter-false text-center">TOTAL COMPLETED</th><th class="filter-false text-center">PERCENTAGE</th></tr></thead><tbody>';
    						break;
    					case 'CountByWorkSource':
    						html = html + '<div id="CountByWorkSource" class="tab-pane fade in"><table class="results table table-bordered center hover-highlight"><thead><tr><th colspan=3 class="sorter-false filter-false text-center">COMPLETED WORKFLOWS BY WORK TYPE</th></tr><tr><th class="filter-false text-center">WORK TYPE</th><th class="filter-false text-center">TOTAL COMPLETED</th><th class="filter-false text-center">PERCENTAGE</th></tr></thead><tbody>';
    						break;
    					case 'CountByTaskType':
    						html = html + '<div id="CountByTaskType" class="tab-pane fade in"><table class="results table table-bordered center hover-highlight"><thead><tr><th colspan=3 class="sorter-false filter-false text-center">COMPLETED WORKFLOWS BY TASK TYPE</th></tr><tr><th class="filter-false text-center">TASK TYPE</th><th class="filter-false text-center">TOTAL COMPLETED</th><th class="filter-false text-center">PERCENTAGE</th></tr></thead><tbody>';
    						break;
    					}
    					$.each(reportData, function (index, reportRow) {
    						switch (reportType) {
    						case 'TotalCount':
    							html = html + '<div class="text-center"><h3>TOTAL COMPLETED WORKFLOWS: ' + reportRow.count + '</h3></div>';
    							totalCompleted = reportRow.count;
    							break;
    						case 'CountByAgent':
    							html = html + '<tr><td class="text-right">' + reportRow.agent_name + '</td><td class="text-right">' + reportRow.agent_name_count + '</td><td class="text-right">' + (reportRow.agent_name_count / totalCompleted * 100).toFixed(2) + '%</td></tr>';
    							break;
    						case 'CountByBusinessLine':
    							html = html + '<tr><td class="text-right">' + reportRow.business_line + '</td><td class="text-right">' + reportRow.business_line_count + '</td><td class="text-right">' + (reportRow.business_line_count / totalCompleted * 100).toFixed(2) + '%</td></tr>';
    							break;
    						case 'CountByWorkSource':
    							html = html + '<tr><td class="text-right">' + reportRow.work_source + '</td><td class="text-right">' + reportRow.work_source_count + '</td><td class="text-right">' + (reportRow.work_source_count / totalCompleted * 100).toFixed(2) + '%</td></tr>';
    							break;
    						case 'CountByTaskType':
    							html = html + '<tr><td class="text-right">' + reportRow.task_type + '</td><td class="text-right">' + reportRow.task_type_count + '</td><td class="text-right">' + (reportRow.task_type_count / data['TaskTypeTotal']['count'] *100).toFixed(2) + '%</td></tr>';
    							break;
    						}
    					});
    					switch(reportType) {
    					case 'TaskTypeTotal':
    					case 'TotalCount':
    						break;
    					case 'CountByAgent':
    					case 'CountByBusinessLine':
    					case 'CountByWorkSource':
    						html = html + '</tbody><thead><tr><th class="sorter-false filter-false text-right">TOTAL</th><th class="sorter-false filter-false text-right">' + totalCompleted + '</th><th class="sorter-false filter-false">&nbsp;</th></tr></thead></table></div>';
    						break;
    					case 'CountByTaskType':
    						html = html + '</tbody><thead><tr><th class="sorter-false filter-false text-right">TOTAL</th><th class="sorter-false filter-false text-right">' + data['TaskTypeTotal']['count'] + '</th><th class="sorter-false filter-false">&nbsp;</th></tr></thead></table></div>';
    						break;
    					default:
    						html = html + '</tbody></table></div>';
    						break;
    					}
    				});
    				html = html + '</div>';
    			} else {
                    html = html + '<tr><td colspan=10 class="text-center">' + data.ERROR + '</td></tr>';
    			}
    			$('a[data-toggle="tab"]').off('shown.bs.tab.resort').on('shown.tab.bs.resort', function (e) {
    				$('table.result').trigger('update').trigger('applyWidgetId','zebra');
    				$('table').trigger('update');
    			});
    			break;
            }
            $('div#reportBody').html(html);
    		$('a[data-toggle="pill"]').off('shown.bs.tab.resort').on('shown.tab.bs.resort', function (e) {
    			$('table.result').trigger('update').trigger('applyWidgetId', 'zebra');
    			$('table').trigger('update');
    		});
            $('table#results, table.results').stickyTableHeaders();
            if (!data.hasOwnProperty('ERROR')) {
                $('table#results, table.results').tablesorter({
                    theme: 'custom',
                    sortReset: true,
                    ignoreCase: true,
                    widgets: ['zebra', 'filter']
                });
            } else {
                $('table#results, table.results').tablesorter({
                    theme: 'custom',
                    sortReset: true,
                    ignoreCase: true,
                    widgets: ['zebra']
                });
            }
            $('div.overlay').hide();
		    $('tr.screenshots').off('dblclick').on('dblclick', function() {
			    var session_id = $(this).attr('data-session');
			    displayScreenshots(session_id);
		    });
		    $('td.query-manual').off('click').on('click', function() {
			    smp_session_id = $(this).parent().prop('data-session');
			    compare = $(this).attr('data-query');
			    subQuery('manual', smp_session_id, compare);
		    });
	    }).fail(function () {
		    alert('Request Timed Out');
            $('div.overlay').hide();
            $('input, select').attr('disabled', false);
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
        $('select#ReportType.chosen').chosen({
            width: '100%',
            allow_single_deselect: true,
            disable_search: true
        });
        $('select#AttUIDSel.chosen').chosen({
            width: '100%',
            allow_single_deselect: true,
            disable_search_threshold: 10
        });
        $('select#BusinessLineSel.chosen').chosen({
            width: '100%',
            allow_single_deselect: true,
            disable_search_threshold: 10
        });
        $('select#WorkSourceSel.chosen').chosen({
            width: '100%',
            allow_single_deselect: true,
            disable_search_threshold: 10
        });
        $('select#TaskTypeSel.chosen').chosen({
            width: '100%',
            allow_single_deselect: true,
            disable_search_threshold: 10
        });
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
	    useDB = data.useDB;
	    if (!useDB) {
		    $('select, input').not('#environment').prop('disabled', true).trigger('chosen:updated');
		    $('body').append('<div id="main" class="center"><h3>REQUIRED DATABASE ACCESS NOT CONFIGURED FOR THIS ENVIRONMENT</h3></div>');
		    return false;
	    }
    	var sql = 'SELECT DISTINCT(att_uid) AS Id, CONCAT(last_name, ", ", first_name," (", UCASE(att_uid), ")") AS Name FROM duration_log_session UNION SELECT DISTINCT(manager_id), CONCAT(" MANAGER - ", UCASE(manager_id)) FROM duration_log_session ORDER BY NAME';
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
            if (!data.hasOwnProperty('ERROR')) {
			    $.each(data, function (key, value) {
			    	$('#AttUIDSel').append($('<option>', {
			    		value: value.Id,
			    		text : value.Name
			    	}));
		    	});
	    		$('select#AttUIDSel.chosen').trigger('chosen:updated');
	    	} else {
	    		$('select#AttUIDSel').remove();
	    	}
    	}).fail(function() {
    		$('select#AttUIDSel').remove();
        });

    	var sql = 'SELECT DISTINCT(business_line) AS BusinessLine FROM duration_log_session ORDER BY BusinessLine';
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
            if (!data.hasOwnProperty('ERROR')) {
			    $.each(data, function (key, value) {
			    	$('#BusinessLineSel').append($('<option>', {
			    		value: value.BusinessLine,
			    		text : value.BusinessLine
                    }));
		    	});
	    		$('select#BusinessLineSel.chosen').trigger('chosen:updated');
	    	} else {
	    		$('select#BusinessLineSelSel').remove();
	    	}
    	}).fail(function() {
    		$('select#BusinessLineSel').remove();
        });

        var sql = 'SELECT DISTINCT(work_source) AS WorkType FROM duration_log_session ORDER BY WorkType';
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
            if (!data.hasOwnProperty('ERROR')) {
			    $.each(data, function (key, value) {
			    	$('#WorkSourceSel').append($('<option>', {
			    		value: value.WorkType,
			    		text : value.WorkType
                    }));
		    	});
	    		$('select#WorkSourceSel.chosen').trigger('chosen:updated');
	    	} else {
	    		$('select#WorkSourceSel').remove();
	    	}
    	}).fail(function() {
    		$('select#WorkSourceSel').remove();
    	});
        var sql = 'SELECT DISTINCT(task_type) AS TaskType FROM duration_log_session ORDER BY TaskType';
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
            if (!data.hasOwnProperty('ERROR')) {
			    $.each(data, function (key, value) {
			    	$('#TaskTypeSel').append($('<option>', {
			    		value: value.TaskType,
			    		text : value.TaskType
                    }));
		    	});
	    		$('select#TaskTypeSel.chosen').trigger('chosen:updated');
	    	} else {
	    		$('select#TaskTypeSel').remove();
	    	}
    	}).fail(function() {
    		$('select#TaskTypeSel').remove();
    	});
    });

    socket.on('disconnect', function () {
        $('div#main').hide();
        $('div.container').hide();
        $('div#overlay').show();
        $('div.initializationScreen').html('CONNECTION INTERRUPTED...').show();
        $('select#ReportType').val('').trigger('chosen:updated');
	    $('div#reportBody').hide();
	    $('div#screenshotBody').hide();
        $('div.initializationScreen').show();
    });
});

let subQuery = function(type, lookup, compare) {
    if (type == 'manual') {
	    var sql = 'SELECT *, SEC_TO_TIME(elapsed_seconds) AS elapsed_seconds FROM duration_log_step_manual WHERE elapsed_seconds >= "' + compare + '" AND smp_session_id = "' + lookup + '"';
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
	    var popupData = '<div class="popup"><p class="text-center">SESSION: ' + lookup + '</p><table class="table table-bordered center hover-highlight"><thead><th class="text-center">START TIME</th><th class="text-center">COMPLETED TIME</th><th class="text-center">MANUAL STEP DURATION</th><th class="text-center">FLOW NAME</th><th>STEP NAME</th><thead><tbody>';
	    $.each(data, function (key, value) {
		    popupData = popupData + '<tr><td class="text-center">' + value.start_time + '</td><td class="text-center">' + value.stop_time + '</td><td class="text-center">' + value.elapsed_seconds + '</td><td class="text-left">' + value.flow_name + '</td><td class="text-left">' + value.step_name + '</td></tr>';
	    });
	    popupData = popupData + '</table></div>';
	    $.fn.popup.defaults.transition = 'all 0.3s';
	    $(popupData).popup({
		    transition: 'all 0.3s',
		    scrolllock: true // optional
	    }).popup('show');
	    console.log(popupData);
    });
};

let displayScreenshots = function (session_id) {
    $('div#reportBody').hide();
    $('div.overlay').show();
    var sql = 'SELECT ss.smp_session_id, ss.flow_name, ss.step_name, ss.screenshot_time, ss.image_data, sl.start_time, sl.stop_time, SEC_TO_TIME(sl.elapsed_seconds) AS elapsed_seconds, CONCAT(sl.last_name, ", ", sl.first_name, " (", UCASE(sl.att_uid), ")") AS agent_name, UCASE(sl.manager_id) AS manager_id, sl.work_source, sl.business_line, sl.task_type FROM screenshots ss LEFT JOIN duration_log_session sl ON ss.smp_session_id = sl.smp_session_id WHERE ss.smp_session_id = "' + session_id + '" ORDER BY ss.recorded';
    $.ajax({
        type: 'post',
        url: 'ajax/getinfo.php',
        data: {
            databaseIP:  dbHost,
            databaseUser: dbUser,
            databasePW: dbPassword,
            databaseName: dbName,
            sql: sql
        },
        dataType: 'json',
    }).done(function(data) {
	    var start_time = moment(data[0].start_time).format('MM/DD/YYYY HH:mm:ss');
	    var stop_time = moment(data[0].stop_time).format('MM/DD/YYYY HH:mm:ss');
	    var task_type = data[0].task_type;
	    if (!task_type) {
		    task_type = '&nbsp;';
	    }
	    var work_source = data[0].work_source;
	    if (!work_source) {
		    work_source = '&nbsp;';
	    }
	    var manager_id = data[0].manager_id;
	    if (!manager_id) {
		    manager_id = '&nbsp;';
	    }
	    var business_line = data[0].business_line;
	    if (!business_line) {
		    business_line = '&nbsp;';
	    }
	    var html = '<div class="close row col-sm-12 text-right" style="font-size: 200%;color: #ffffff;padding-right: 15px;padding-top:2px;">X</div><div class="row"><div class="col-sm-3 text-right">SESSION ID:</div><div class="data col-sm-9 text-left">' + data[0].smp_session_id + '</div><div class="col-sm-3 text-right">AGENT:</div><div class="data col-sm-3 text-left">' + data[0].agent_name + '</div><div class="col-sm-3 text-right">MANAGER:</div><div class="data col-sm-3 text-left">' + manager_id + '</div><div class="col-sm-3 text-right">START TIME:</div><div class="data col-sm-3 text-left">' + start_time + '</div><div class="col-sm-3 text-right">END TIME:</div><div class="data col-sm-3 text-left">' + stop_time + '</div><div class="col-sm-3 text-right">DURATION:</div><div class="data col-sm-3 text-left">' + data[0].elapsed_seconds + '</div><div class="col-sm-3 text-right">TASK TYPE:</div><div class="data col-sm-3 text-left">' + task_type + '</div><div class="col-sm-3 text-right">WORK TYPE:</div><div class="data col-sm-3 text-left">' + work_source + '</div><div class="col-sm-3 text-right">BUSINESS LINE:</div><div class="data col-sm-3 text-left">' + business_line + '</div><div class="data col-sm-12 text-center">CLICK THE IMAGE BELOW TO DISPLAY A LARGER VIEW</div></div>';
	    $('div.headerData').html(html);
	    var count = data.length;
	    $.each(data, function(key, value) {
	    	var html = '<li><img class="flex makefancybox" src="' + value.image_data + '" /><div class="footerData row"><div class="col-sm-3 text-right">TIME:</div><div class="data col-sm-3 text-left">' + value.screenshot_time + '</div><div class="col-sm-6 text-right data">' + (key+1) + '/' + count + '</div><div class="col-sm-3 text-right">FLOW NAME</div><div class="col-sm-3 text-left data">' + value.flow_name + '</div><div class="col-sm-3 text-right">STEP NAME:</div><div class="col-sm-3 text-left data">' + value.step_name + '</div></div></li>';
	    	$('ul.slides').append(html);
	    });
	    $('.flexslider').flexslider({
	    	controlsContainer: '.flexslider',
	    	animation: 'slide',
	     	animationLoop: false,
	    	slideshow: false,
	    	directionNav: true,
	    	prevText: 'Previous',
	    	nextText: 'Next',
	    });
	    $('div.overlay').hide();
        $('div.container').show();
        $('div.close').off('click').on('click', function () {
            $('div.container').hide();
            $('div#reportBody').show();
        });
        $('img.makefancybox').each(function(){
            var src = $(this).attr('src');
            var a = $('<a href="#" class="fancybox"></a>').attr('href', src);
            $(this).wrap(a);
            $('a.fancybox').fancybox({
                titlePositon: 'inside'
            });
            $(this).removeClass('makefancybox');
        });
    });
};
