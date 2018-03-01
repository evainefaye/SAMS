$(document).ready(function () {
    $('div#main').hide();
    // Set the location of the Node.JS server
    var serverAddress = 'http://10.100.49.77';
 
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

    socket.on('Receive Report', function(data) {
        $('.overlay').hide();
        if (typeof data.queryData != 'undefined') {
            var queryData = data.queryData;
        } else {
            var queryData = new Object();
        }
    });
});
