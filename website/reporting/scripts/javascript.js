$(document).ready(function () {
    $('div#main').hide();
    // Set the location of the Node.JS server
    var serverAddress = 'http://127.0.0.1';
 
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
 
 
    $('select#environment').off('change').on('change', function () {
        environment = $(this).find(':selected').val();
        Cookies.set('environmentReporting',environment);
        window.location.reload();
    });
 
 
    $('#daterange').daterangepicker({
        'showDropdowns': true,
        'opens': 'center',
        'autoApply': true,
        'autoUpdateInput': false,
        'startDate': moment().subtract(1,'h').startOf('minute'),
        'endDate': moment().endOf('minute'),
        'timePicker': true,
        'timePicker24Hour': true,
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
            'separator': '' - ''
        },
        'alwaysShowCalendars': true
    }, function(start, end, label) {
        var startDate = start;
        var endDate = end;
        var reportType=$('select#ReportType :selected').val();
        var sessionThreshold = $('input#SessionThreshold').val().trim();
        var automationStepThreshold = $('input#AutomationStepThreshold').val().trim();
        var manualStepThreshold = $('input#ManualStepThreshold').val().trim();
        var managerId = $('input#ManagerId').val().trim();
        var agentId = $('input#AgentId').val().trim();
        if (sessionThreshold < 0 | isNaN(sessionThreshold)) {
            sessionThreshold = 1200;
            $('input#sessionThreshold').val('1200');
        }
        if (automationStepThreshold < 0 || isNaN(automationStepThreshold)) {
            automationStepThreshold = 30;
            $('input#automationStepThreshold').val('30');
        }
        if (manualStepThreshold < 0 || isNaN(manualStepThreshold)) {
            manualStepThreshold = 300;
            $('input#manualStepThreshold').val('300');
        }
        if (managerId != '') {
        }
        if (agentId != '') {
        }
        socket.emit('Request Report', {
            label: label,
            startDate: startDate,
            endDate: endDate,
            reportType: reportType,
            sessionThreshold: sessionThreshold,
            automationStepThreshold: automationStepThreshold,
            manualStepThreshold: manualStepThreshold,
            managerId: managerId,
            agentId: agentId
        });
        $('div#select').html('');                                         
        $('div#noData').hide();
        $('table#header').hide();
        $('.overlay').show();
    });
 
    $('i.glyphicon.glyphicon-calendar.fa.fa-calendar').off('click').on('click', function() {
        $('#daterange').trigger('click');
    });
    $('#daterange').on('apply.daterangepicker', function(ev, picker) {
        $('#daterange').val(picker.startDate.format('YYYY-MM-DD HH:mm:ss') + ' - ' + picker.endDate.format('YYYY-MM-DD HH:mm:ss'));
    });
 
    document.title = 'SAMS - ' + version + ' REPORTING';
 
    // Initialize variables
    window.socket = io.connect(socketURL);
               
    socket.on('connect', function () {
        $('div#main').show();
        $('div#overlay').hide();       
        $('div.initializationScreen').hide();
        $('#searchtype > label:first').addClass('active');
        $('#searchtype > label:last').removeClass('active');       
        $('div.refresh').hide();
        $('div.daterange').show();
    });
 
    socket.on('disconnect', function () {
        $('div#main').hide();
        $('div#overlay').show();
        $('div.initializationScreen').html('CONNECTION INTERRUPTED...').show();               
        $('#daterange').val('');
        $('div#select').html('');
        $('div.initializationScreen').show();
    });

    socket.on('Send Report Data To Client', function(data) {
        $('.overlay').hide();
        var reportType = data.reportType;
        if (typeof data.queryData != 'undefined') {
            var queryData = data.queryData;
        } else {
            var queryData = new Object();
        }
        if (queryData.length > 0) {
            var header = '';
            var html = '';
            $.each( queryData, function (key, value) {
                switch (reportType) {
                case 'AllAutomation':
                    var start_time = moment(new Date(value.start_time)).format('MM/DD/YYYY HH:mm:ss');
                    var stop_time = moment(new Date(value.stop_time)).format('MM/DD/YYYY HH:mm:ss');
                    html = html + '<tr><td>' + value.smp_session_id + '</td><td>' + start_time + '</td><td>' + stop_time + '</td><td>' + value.automation_step_duration + '</td><td>' + value.att_uid + '</td><td>' + value.agent_name + '</td><td>' + value.manager_id + '</td><td>' + value.work_source + '</td><td>' + value.business_line + '</td><td>' + value.task_type + '</td><td>' + value.flow_name + '</td></tr>';
                    break;
                case 'AutomationSummary':
                    if (value.standard_count >0) {
                        var slow_percentage = ((value.slow_count / value.standard_count) * 100).toFixed(2);
                        var slow_percentage = slow_percentage + '%';
                    } else {
                        slow_percentage = '100.00%';
                    }
                    html = html + '<tr><td>' + value.flow_name + '</td><td>' + value.slow_count + '</td><td>' + value.slow_average_duration + '</td><td>' + value.standard_count + '</td><td>' + value.standard_average_duration + '<td><td>' + slow_percentage + '</td></tr>';
                    break;
                case 'AllManual':
                    var start_time = moment(new Date(value.start_time)).format('MM/DD/YYYY HH:mm:ss');
                    var stop_time = moment(new Date(value.stop_time)).format('MM/DD/YYYY HH:mm:ss');
                    html = html + '<tr><td>' + value.smp_session_id + '</td><td>' + start_time + '</td><td>' + stop_time + '</td><td>' + value.manual_step_duration + '</td><td>' + value.att_uid + '</td><td>' + value.agent_name + '</td><td>' + value.manager_id + '</td><td>' + value.work_source + '</td><td>' + value.business_line + '</td><td>' + value.task_type + '</td><td>' + value.flow_name + '</td><td>' + value.step_name + '</td></tr>';
                    break;
                case 'SlowAutomation':
                    var start_time = moment(new Date(value.start_time)).format('MM/DD/YYYY HH:mm:ss');
                    var stop_time = moment(new Date(value.stop_time)).format('MM/DD/YYYY HH:mm:ss');
                    html = html + '<tr><td>' + value.smp_session_id + '</td><td>' + start_time + '</td><td>' + stop_time + '</td><td>' + value.automation_step_duration + '</td><td>' + value.att_uid + '</td><td>' + value.agent_name + '</td><td>' + value.manager_id + '</td><td>' + value.work_source + '</td><td>' + value.business_line + '</td><td>' + value.task_type + '</td><td>' + value.flow_name + '</td></tr>';
                    break;
                case 'SlowManual':
                    var start_time = moment(new Date(value.start_time)).format('MM/DD/YYYY HH:mm:ss');
                    var stop_time = moment(new Date(value.stop_time)).format('MM/DD/YYYY HH:mm:ss');
                    html = html + '<tr><td>' + value.smp_session_id + '</td><td>' + start_time + '</td><td>' + stop_time + '</td><td>' + value.manual_step_duration + '</td><td>' + value.att_uid + '</td><td>' + value.agent_name + '</td><td>' + value.manager_id + '</td><td>' + value.work_source + '</td><td>' + value.business_line + '</td><td>' + value.task_type + '</td><td>' + value.flow_name + '</td><td>' + value.step_name + '</td></tr>';
                    break;
                case 'AgentSummary':
                    var start_time = moment(new Date(value.start_time)).format('MM/DD/YYYY HH:mm:ss');
                    var stop_time = moment(new Date(value.stop_time)).format('MM/DD/YYYY HH:mm:ss');
                    html = html + '<tr><td>' + value.agent_name + ' (' + value.att_uid + ')' + '</td><td>' + value.manager_id + '</td><td>' + value.count_completed + '</td><td>' + value.count_slow + '</td><td>' + value.session_average + '</td><td>' + value.count_slow_automation + '</td><td>' + value.count_slow_manual + '</td></tr>';
                    break;
                case 'AgentDetail':
                    var start_time = moment(new Date(value.start_time)).format('MM/DD/YYYY HH:mm:ss');
                    var stop_time = moment(new Date(value.stop_time)).format('MM/DD/YYYY HH:mm:ss');
                    html = html + '<tr><td>' + value.agent_name + ' (' + value.att_uid + ')' + '</td><td>' + value.manager_id + '</td><td>' + value.workflow_duration + '</td><td>' + value.slow_automation_duration + '</td><td>' + value.slow_manual_duration + '</td><td>' + start_time + '</td><td>' + stop_time + '</td><td>' + value.count_slow_automation + '</td><td>' + value.count_slow_manual + '</td><td>' + value.work_source + '</td><td>' + value.business_line + '</td><td>' + value.task_type + '</td><td>' + value.session_id + '</td></tr>';
                    console.log(html);
                    break;
                }
            });
        } else {
            alert('no data');
        }
        switch (reportType) {
        case 'AllAutomation':
            header = '<table><thead><tr><th>SESSION ID</th><th>START TIME</th><th>COMPLETION TIME</th><th>AUTOMATION STEP DURATION</th><th>ATT UID</th><th>AGENT NAME</th><th>MANAGER ATT UID</th><th>WORK TYPE</th><th>BUSINESS LINE</th><th>TASK TYPE</th><th>FLOW NAME</th></tr></thead><tbody>';
            html = header + html + '</tbody></table>';
            $('div#reportBody').html(html);
            break;
        case 'AutomationSummary':
            header = '<table><thead><tr><th>FLOW NAME</th><th>SLOW AUTOMATION COUNT</th><th>AVERAGE SLOW AUTOMATION</th><th>STANDARD AUTOMATION COUNT</th><th>AVERAGE STANDARD AUTOMATION</th><th>PERCENTAGE SLOW</th></tr></thead><tbody>';
            html = header + html + '</tbody><table>';
            $('div#reportBody').html(html);            
            break;
        case 'AllManual':
            header = '<table><thead><tr><th>SESSION ID</th><th>START TIME</th><th>COMPLETION TIME</th><th>MANUAL STEP DURATION</th><th>ATT UID</th><th>AGENT NAME</th><th>MANAGER ATT UID</th><th>WORK TYPE</th><th>BUSINESS LINE</th><th>TASK TYPE</th><th>FLOW NAME</th><th>STEP NAME</th></tr></thead><tbody>';
            html = header + html + '</tbody></table>';
            $('div#reportBody').html(html);
            break;
        case 'SlowAutomation':
            header = '<table><thead><tr><th>SESSION ID</th><th>START TIME</th><th>COMPLETION TIME</th><th>AUTOMATION STEP DURATION</th><th>ATT UID</th><th>AGENT NAME</th><th>MANAGER ATT UID</th><th>WORK TYPE</th><th>BUSINESS LINE</th><th>TASK TYPE</th><th>FLOW NAME</th></tr></thead><tbody>';
            html = header + html + '</tbody></table>';
            $('div#reportBody').html(html);
            break;
        case 'SlowManual':
            header = '<table><thead><tr><th>SESSION ID</th><th>START TIME</th><th>COMPLETION TIME</th><th>MANUAL STEP DURATION</th><th>ATT UID</th><th>AGENT NAME</th><th>MANAGER ATT UID</th><th>WORK TYPE</th><th>BUSINESS LINE</th><th>TASK TYPE</th><th>FLOW NAME</th><th>STEP NAME</th></tr></thead><tbody>';
            html = header + html + '</tbody></table>';
            $('div#reportBody').html(html);
            break;
        case 'AgentSummary':
            header = '<table><thead><tr><th>AGENT NAME</th><th>MANAGER ATT UID</th><th># OF COMPLETED FLOWS</th><th># OF FLOWS W/ DURATON OVER WORKFLOW THRESHOLD</th><th>AVERAGE WORKFLOW DURATION</th><th># OF INSTANCES OF SLOW AUTOMATION STEPS</th><th># OF INSTANCES OF SLOW MANUAL STEPS</th></tr></thead><tbody>';
            html = header + html + '</tbody></table>';
            $('div#reportBody').html(html);
            break;
        case 'AgentDetail':
            header = '<table><thead><tr><th>AGENT NAME</th><th>MANAGER ATT UID</th><th>WORKFLOW DURATION</th><th>TOTAL SLOW AUTOMATION STEP TIME</th><th>TOTAL SLOW MANUAL STEP TIME</th><th>START TIME</th><th>COMPLETION TIME</th><th># OF SLOW AUTOMATION STEPS</th><th># OF SLOW MANUAL STEPS</th><th>WORK TYPE<th></th><th>BUSINESS LINE</th><th>TASK TYPE</th><th>SESSION ID</th></tr></thead><tbody>';
            html = header + html + '</tbody></table>';
            $('div#reportBody').html(html);
            break;
        }        
    });
});
