// Create object for storing information about open monitor detail windows
var windowManager = new Object();

// Create global variable to store the filter by supervisor attuid
window.filterCity = ''; // Create global variable to store the window filter for City
window.filterSupervisor = ''; // Create global variable to store the window filter for Supervisor

$(document).ready(function () {

    // Set Address for SAMS Server
    // var serverAddress = 'http://10.100.49.77';
    var serverAddress ='http://127.0.0.1';

    // Initialize Environment Selection
    $('select#environment').chosen({
        width: '100%',
        allow_single_deselect: false,
        disable_search: true
    });

    // Get Environment from Cookie if available, default to prod on none found.   Set Environment Selection to value.
    environment = Cookies.get('environment');
    if (typeof environment == 'undefined') {
        environment = Cookies.get('environment');
        if (typeof environment == 'undefined') {
            environment = 'prod';
        }
        Cookies.set('environment', 'prod');
    }
    $('select#environment').val(environment).trigger('chosen:updated');

    // Set Port and environment variable based on selection
    switch (environment) {
    case 'fde':
        var socketURL = serverAddress + ':5510';
        var version = 'FDE (DEVELOPMENT)';
        break;
    case 'pre-prod':
        socketURL = serverAddress + ':5520';
        version = 'PRE-PROD (BETA)';
        break;
    case 'prod':
        socketURL = serverAddress + ':5530';
        version = 'PRODUCTION';
        break;
    default:
        environment = 'prod';
        Cookies.set('environment', 'prod');
        socketURL = serverAddress + ':5530';
        version = 'PRODUCTION';
        break;
    }

    // Event to handle anytime environment choice is changed
    $('select#environment').off('change').on('change', function () {
        environment = $(this).find(':selected').val();
        Cookies.set('environment', environment);
        // Close any monitor detail windows that are open for this environment
        $.each(windowManager, function (key) {
            windowManager[key].close();
            delete windowManager[key];
        });
        window.location.reload();
    });

    // Close any monitor detail windows that are open for this environment if you are closing the window
    $(window).on('unload', function () {
        $.each(windowManager, function (key) {
            windowManager[key].close();
            delete windowManager[key];
        });
    });

    // Set Window Title
    document.title = 'SAMS - ' + version + ' SASHA ACTIVITY MONITORING SYSTEM';


    // Create the All Sessions, Not Started, and Stalled Sessions Tabs
    createDefaultTabs();

    // Update Filters
    $(document).on('change', 'select#CitySel', function() {
        if ($('select#CitySel').val().length == 0)  {
            Cookies.remove(environment + '-CitySel');
        } else {
            Cookies.set(environment + '-CitySel', $('#CitySel').val());
        }
        var CitySel = $('select#CitySel').val();
        window.filterCity = '';
        if (CitySel.length > 0) {
            $.each(CitySel, function (index, value) {
                if (index == 0) {
                    window.filterCity = '[city~="' + value + '"]';
                } else {
                    window.filterCity = window.filterCity +  ', [city~="' + value + '"]';
                }
            });
        }
        if (window.filterCity == '') {
            // There is no City filter, apply only Supervisor filter if appropriate
            if (window.filterSupervisor == '') {
                // Show all rows
                $('tbody tr').not('.filtered').show();
            } else {
                // Apply Only Supervisor filter
                $('tbody tr').not('.filtered').show();
                showRows = $(showRows).filter(window.filterSupervisor);
                $('tbody tr').not('.filtered').not(showRows).hide();
            }
        } else {
            $('tbody tr').not('.filtered').show();
            var showRows = $('tbody tr').not('.filtered');
            showRows = $(showRows).filter(window.filterCity);
            if (window.filterSupervisor != '') {
                showRows = $(showRows).filter(window.filterSupervisor);
            }
            $('tbody tr').not('.filtered').not(showRows).hide();
        }
        $('table').trigger('update', true);
    });
    $(document).on('change', 'select#SupervisorSel', function() {
        if ($('select#SupervisorSel').val().length == 0)  {
            Cookies.remove(environment + '-SupervisorSel');
        } else {
            Cookies.set(environment + '-SupervisorSel', $('#SupervisorSel').val());
        }
        var SupervisorSel = $('select#SupervisorSel').val();
        window.filterSupervisor = '';
        if (SupervisorSel.length > 0) {
            $.each(SupervisorSel, function (index, value) {
                if (index == 0) {
                    window.filterSupervisor = '[supervisorId~="' + value + '"]';
                } else {
                    window.filterSupervisor = window.filterSupervisor +  ', [supervisorId~="' + value + '"]';
                }
            });
        }
        if (window.filterSupervisor == '') {
            // There is no Supervisor filter, apply only City filter if appropriate
            if (window.filterCity == '') {
                // Show all rows
                $('tbody tr').not('.filtered').show();
            } else {
                // Apply Only City filter
                $('tbody tr').not('.filtered').show();
                var showRows = $(showRows).filter(window.filterCity);
                $('tbody tr').not('.filtered').not(showRows).hide();
            }
        } else {
            $('tbody tr').not('.filtered').show();
            showRows = $('tbody tr').not('.filtered');
            if (window.filterCity != '') {
                showRows = $(showRows).filter(window.filterCity);
            }
            showRows = $(showRows).filter(window.filterSupervisor);
            $('tbody tr').not('.filtered').not(showRows).hide();
        }
        $('table').trigger('update', true);
    });

    // Connect to SAMS Server
    window.socket = io.connect(socketURL);

    // When connection is established, SAMS Server will send a request for the type of connection (SASHA or Monitor User).
    // This function returns the type of connection as a monitor user and gathers startup time for the server.
    socket.on('Request Connection Type', function (data) {
        var ServerStartTime = moment(new Date(data.ServerStartTime)).format('MM/DD/YYYY @ HH:mm:SS');
        $('span#serverStartTime').html(ServerStartTime);
        socket.emit('Register Monitor User');
    });

    // Connection to SAMS Server is Established
    socket.on('connect', function () {
        socket.emit('Request DB Config');
        showMainScreen();
        // Request data for all connected clients from SAMS Server
        socket.emit('Request Current Connection Data', {
            ActiveTab: 'none'
        });
    });

    // Connection to SAMS server is Lost
    socket.on('disconnect', function () {
        window.location.reload();
    });

    // Add user to the 'INACTIVESESSIONS' tab
    socket.on('Add SASHA Connection to Monitor', function (data) {
        var UserInfo = data.UserInfo;
        var connectionId = UserInfo.ConnectionId;
        var attUID = UserInfo.AttUID;
        var reverseName = UserInfo.ReverseName;
        var sessionStartTime = UserInfo.ConnectTime;
        var sessionStartTimestamp = new Date(UserInfo.ConnectTime);
        sessionStartTime = moment(new Date(UserInfo.ConnectTime)).format('MM/DD/YYYY HH:mm:ss');
        // If there is a row with the connectionId already existing do not add it again.
        if ($('table.INACTIVESESSIONS tbody tr[connectionId="' + connectionId + '"]').length) {
            return;
        }
        var row = '<tr connectionId="' + connectionId + '" supervisorId="' + UserInfo.Manager + '" + city="' + UserInfo.City + '">' +
            '<td class="text-left"><img src="stylesheets/images/more-details.png" class="tableIcon moreDetails">' + attUID + '</a></td>' +
            '<td class="text-left" title="Supervisor: ' + UserInfo.Manager + '">' + reverseName + '</td>' +
            '<td class="text-center">' + sessionStartTime + '</td>' +
            '<td class="text-right"><div InactiveSessionDurationId="sessionDuration_' + connectionId + '" title="' + sessionStartTime + '"></div></td>' +
            '</tr>';
        $('table.INACTIVESESSIONS tbody:last').append(row);
        if (window.filterCity != '' || window.filterSupervisor != '') {
            filterNewRow();
        }
        // Begin Counters for the new row
        $('div[InactiveSessionDurationId=sessionDuration_' + connectionId + ']').countdown({
            since: sessionStartTimestamp,
            compact: true,
            layout: '{d<}{dn}{d1}{d>}{h<}{hnn}{sep}{h>}{mnn}{sep}{snn}',
            format: 'yowdhMS'
        });
        // Update User Count in 'INACTIVESESSIONS' tab
        $('span.count-INACTIVESESSIONS').html($('table.INACTIVESESSIONS tbody tr').not('.group-header').length);
        $('table.INACTIVESESSIONS').trigger('update', true);
    });

    // Add a user to the 'ALLSESSIONS' tab and to skill tab as well
    socket.on('Notify Monitor Begin SASHA Flow', function (data) {
        var UserInfo = data.UserInfo;
        var connectionId = UserInfo.ConnectionId;
        // If user exists on the 'INACTIVESESSIONS' tab then they must be removed from there
        if ($('table.INACTIVESESSIONS tbody tr[connectionId="' + connectionId + '"]').length) {
            // Start by removing timers
            $('div[inactivesessionDurationId=sessionDuration_' + connectionId + ']').countdown('destroy');
            $('table.INACTIVESESSIONS tbody tr[connectionId=' + connectionId + ']').remove();
            $('span.count-INACTIVESESSIONS').html($('table.INACTIVESESSIONS tbody tr').not('.group-header').length);
        }
        var attUID = UserInfo.AttUID;
        var reverseName = UserInfo.ReverseName;
        var skillGroup = UserInfo.SkillGroup;
        var taskType = UserInfo.TaskType;
        var workType = UserInfo.SAMSWorkType;
        var flowName = UserInfo.FlowName;
        var stepName = UserInfo.StepName;
        var stepStartTimestamp = new Date(UserInfo.StepStartTime);
        var stepStartTime = moment(new Date(UserInfo.StepStartTime)).format('MM/DD/YYYY HH:mm:SS');
        var sessionStartTimestamp = new Date(UserInfo.SessionStartTime);
        var sessionStartTime = moment(new Date(UserInfo.SessionStartTime)).format('MM/DD/YYYY HH:mm:SS');
        // If skillGroup is not set, then set it as UNKNOWN
        if (skillGroup === null || skillGroup === 'null' || skillGroup === '' || skillGroup == 'undefined') {
            skillGroup = 'UNKNOWN';
        }

        // Begin adding to 'ALLSESSIONS' tab
        var row = '<tr connectionId="' + connectionId + '" supervisorId="' + UserInfo.Manager + '" + city="' + UserInfo.City + '">' +
            '<td class="text-left"><img src="stylesheets/images/more-details.png" class="tableIcon moreDetails">' + attUID + '</a></td>' +
            '<td class="text-left" title="Supervisor: ' + UserInfo.Manager + '">' + reverseName + '</td>' +
            '<td class="text-center">' + workType + '</td>' +
            '<td class="text-center">' + taskType + '</td>' +
            '<td class="text-left">' + skillGroup + '</td>' +
            '<td class="text-right" title="Session Started ' + sessionStartTime + '"><div sessionDurationId="sessionDuration_' + connectionId + '" title="' + sessionStartTime + '"></div></td>' +
            '<td class="text-right" stepStartTitle="stepStartTitle_' + connectionId + '" title="Step Started ' + stepStartTime + '"><div stepDurationId="stepDuration_' + connectionId + '" title="' + stepStartTime + '"></div></td>' +
            '<td class="text-left" flowNameId="flowName_' + connectionId + '" title="' + flowName + '">' + flowName + '</td>' +
            '<td class="text-left" stepNameId="stepName_' + connectionId + '" title="' + stepName + '"><span class="stepInfo">' + stepName + '</span></td>' +
            '</tr>';
        $('table.ALLSESSIONS tbody:last').append(row);
        // Update User Count in 'INACTIVESESSIONS' tab
        $('span.count-ALLSESSIONS').html($('table.ALLSESSIONS tbody tr').not('.group-header').length);

        // Begin adding to Skill Group Tab
        // If no tab exists, create one
        if (!$('ul#Tabs li[tabId=' + skillGroup + ']').length) {
            addTab(skillGroup);
            sortTabs('ul#Tabs');
        }
        row = '<tr connectionId="' + connectionId + '" supervisorId="' + UserInfo.Manager + '" city="' + UserInfo.City + '">' +
            '<td class="text-left"><img src="stylesheets/images/more-details.png" class="tableIcon moreDetails">' + attUID + '</a></td>' +
            '<td class="text-left" title="Supervisor: ' + UserInfo.Manager + '">' + reverseName + '</td>' +
            '<td class="text-left">' + workType + '</td>' +
            '<td class="text-center">' + taskType + '</td>' +
            '<td class="text-right" title="Session Started ' + sessionStartTime + '"><div sessionDurationId="sessionDuration_' + connectionId + '" title="' + sessionStartTime + '"></div></td>' +
            '<td class="text-right" stepStartTitle="stepStartTitle_' + connectionId + '" title="Step Started ' + stepStartTime + '"><div stepDurationId="stepDuration_' + connectionId + '" title="' + stepStartTime + '"></div></td>' +
            '<td class="text-left" flowNameId="flowName_' + connectionId + '" title="' + flowName + '">' + flowName + '</td>' +
            '<td class="text-left" stepNameId="stepName_' + connectionId + '" title="' + stepName + '"><span class="stepInfo">' + stepName + '</span></td>' +
            '</tr>';
        $('table.' + skillGroup + ' tbody:last').append(row);
        if (window.filterCity != '' || window.filterSupervisor != '') {
            filterNewRow();
        }
        // Update User Count in 'INACTIVESESSIONS' tab
        $('span.count-' + skillGroup).html($('table.' + skillGroup + ' tbody tr').not('.group-header').length);

        // Begin Counters for the new row(s)
        $('div[sessionDurationId="sessionDuration_' + connectionId + '"]').countdown({
            since: sessionStartTimestamp,
            compact: true,
            layout: '{d<}{dn}{d1}{d>}{h<}{hnn}{sep}{h>}{mnn}{sep}{snn}',
            format: 'yowdhMS',
            onTick: checkStalledSessions,
            tickInterval: 1
        });
        $('div[stepDurationId="stepDuration_' + connectionId + '"]').countdown({
            since: stepStartTimestamp,
            compact: true,
            layout: '{d<}{dn}{d1}{d>}{h<}{hnn}{sep}{h>}{mnn}{sep}{snn}',
            format: 'yowdhMS',
            onTick: checkTimerStyling,
            tickInterval: 1
        });
        $('table.ALLSESSIONS').trigger('update', true);
    });

    // Remove User from all tabs (disconnected)
    socket.on('Remove SASHA Connection from Monitor', function (data) {
        var connectionId = data.ConnectionId;
        var UserInfo = data.UserInfo;
        var skillGroup = UserInfo.SkillGroup;
        // Start by removing timers
        $('div[inactivesessionDurationId="sessionDuration_' + connectionId + '"]').countdown('destroy');
        $('div[sessionDurationId="sessionDuration_' + connectionId + '"]').countdown('destroy');
        $('div[stepDurationId="stepDuration_' + connectionId + '"]').countdown('destroy');
        $('tr[connectionId="' + connectionId + '"]').remove();
        $('table').trigger('update', true);

        // Update Count(s) of users on table(s)
        $('span.count-' + skillGroup).html($('table.' + skillGroup + ' tbody tr').not('.group-header').length);
        $('span.count-INACTIVESESSIONS').html($('table.INACTIVESESSIONS tbody tr').not('.group-header').length);
        $('span.count-ALLSESSIONS').html($('table.ALLSESSIONS tbody tr').not('.group-header').length);
        $('span.count-STALLEDSESSIONS').html($('table.STALLEDSESSIONS tbody tr').not('.group-header').length);
        // Check for any open detail window and determine if it should auto close or not
        var winName = 'window_' + connectionId;
        if (typeof windowManager[winName] === 'object') {
            if (windowManager[winName].$('input#autoclose').is(':checked')) {
                windowManager[winName].close();
            } else {
                // Set to not close the window so notify the server so that it can stop refreshing items that require a connection
                socket.emit('Notify Server Session Closed', {
                    ConnectionId: connectionId
                });
            }
            delete windowManager[winName];
        }
    });

    // Update Flow / Step Name information
    socket.on('Update Flow and Step Info', function (data) {
        var connectionId = data.ConnectionId;
        var UserInfo = data.UserInfo;
        var flowName = UserInfo.FlowName;
        var stepName = UserInfo.StepName;
        var stepStartTimestamp = new Date(UserInfo.StepStartTime);
        var stepStartTime = moment(new Date(UserInfo.StepStartTime)).format('MM/DD/YYYY HH:mm:SS');
        // Start by removing timers
        $('div[stepDurationId="stepDuration_' + connectionId + '"]').removeClass('warnWaitScreenDuration');
        $('div[stepDurationId="stepDuration_' + connectionId + '"]').countdown('destroy');
        // Update Flow/Step Name and hover titles
        $('td[flowNameId="flowName_' + connectionId + '"]').html(flowName);
        $('td[stepNameId="stepName_' + connectionId + '"]').html('<span class="stepInfo">' + stepName + '</span>');
        $('[stepStartTitle="stepStartTitle_' + connectionId + '"]').prop('title', 'Step Started ' + stepStartTime);
        $('div[stepDurationId="stepDuration_' + connectionId + '"]').prop('title', 'Step Started ' + stepStartTime);
        // Re-initialize Counters
        $('div[stepDurationId="stepDuration_' + connectionId + '"]').removeClass('warnWaitScreenDuration');
        $('div[stepDurationId="stepDuration_' + connectionId + '"]').countdown({
            since: stepStartTimestamp,
            compact: true,
            layout: '{d<}{dn}{d1}{d>}{h<}{hnn}{sep}{h>}{mnn}{sep}{snn}',
            format: 'yowdhMS',
            onTick: checkTimerStyling,
            tickInterval: 1
        });
    });

    // I may want to consider checking if i can flag them in the server since I time them there now and not use the timers to do this.
    // Timer reported user as stalled, add an entry under 'STALLEDSESSIONS'
    socket.on('Alert Monitor of Stalled Session', function (data) {

        var UserInfo = data.UserInfo;
        var connectionId = UserInfo.ConnectionId;
        // If an entry under 'STALLEDSESSIONS' already exists don't do anything
        if ($('table.STALLEDSESSIONS tbody tr[connectionId="' + connectionId + '"]').length) {
            return;
        }

        var attUID = UserInfo.AttUID;
        var reverseName = UserInfo.ReverseName;
        var skillGroup = UserInfo.SkillGroup;
        var workType = UserInfo.SAMSWorkType;
        var taskType = UserInfo.TaskType;
        var sessionStartTime = UserInfo.SessionStartTime;
        var flowName = UserInfo.FlowName;
        var stepName = UserInfo.StepName;
        var stepStartTimestamp = new Date(UserInfo.StepStartTime);
        var stepStartTime = moment(new Date(UserInfo.StepStartTime)).format('MM/DD/YYYY HH:mm:SS');
        var sessionStartTimestamp = new Date(UserInfo.SessionStartTime);
        sessionStartTime = moment(new Date(UserInfo.SessionStartTime)).format('MM/DD/YYYY HH:mm:SS');
        // If skill group was not set, set it to UNKNOWN
        if (skillGroup === null || skillGroup === 'null' || skillGroup === '') {
            skillGroup = 'UNKNOWN';
        }
        var row = '<tr connectionId="' + connectionId + '" supervisorId="' + UserInfo.Manager + '" city="' + UserInfo.City + '">' +
            '<td class="text-left"><img src="stylesheets/images/more-details.png" class="tableIcon moreDetails">' + attUID + '</a></td>' +
            '<td class="text-left" title="Supervisor: ' + UserInfo.Manager + '">' + reverseName + '</td>' +
            '<td class="text-left">' + workType + '</td>' +
            '<td class="text-left">' + taskType + '</td>' +
            '<td class="text-center">' + skillGroup + '</td>' +
            '<td class="text-right" title="Session Started ' + sessionStartTime + '"><div sessionDurationId="sessionDuration_' + connectionId + '" title="' + sessionStartTime + '"></div></td>' +
            '<td class="text-right" title="Step Started ' + stepStartTime + '"><div stepDurationId="stepDuration_' + connectionId + '" title="' + stepStartTime + '"></div></td>' +
            '<td class="text-left" flowNameId="flowName_' + connectionId + '" title="' + flowName + '">' + flowName + '</td>' +
            '<td class="text-left" stepNameId="stepName_' + connectionId + '"><span class="stepInfo" title="' + stepName + '">' + stepName + '</span></td>' +
            '</tr>';
        $('table.STALLEDSESSIONS tbody:last').append(row);
        if (window.filterCity != '' || window.filterSupervisor != '') {
            filterNewRow();
        }

        // Begin Counters
        $('div[sessionDurationId="sessionDuration_' + connectionId + '"]').countdown({
            since: sessionStartTimestamp,
            compact: true,
            layout: '{d<}{dn}{d1}{d>}{h<}{hnn}{sep}{h>}{mnn}{sep}{snn}',
            format: 'yowdhMS',
            onTick: checkTimerStyling,
            tickInterval: 1
        });
        $('div[stepDurationId="stepDuration_' + connectionId + '"]').countdown({
            since: stepStartTimestamp,
            compact: true,
            layout: '{d<}{dn}{d1}{d>}{h<}{hnn}{sep}{h>}{mnn}{sep}{snn}',
            format: 'yowdhMS',
            onTick: checkTimerStyling,
            tickInterval: 1
        });

        // Update Count(s) of users on table(s)
        $('span.count-STALLEDSESSIONS').html($('table.STALLEDSESSIONS tbody tr').not('.group-header').length);

        // Trigger table to sort
        $('table.STALLEDSESSIONS').trigger('update', true);
    });

    socket.on('Return DB Config', function (data) {
        dbHost = data.dbConfig.host;
        dbUser = data.dbConfig.user;
        dbPassword = data.dbConfig.password;
        dbName = data.dbConfig.database;
        useDB = data.useDB;
        if (!useDB) {
            $('div#cityFilter').html('&nbsp');
            $('div#supervisorFilter').html('&nbsp');
            return false;
        }
        $('select#CitySel.chosen').chosen({
            width: '100%',
            allow_single_deselect: true,
            disable_search_threshold: 10
        });
        $('select#SupervisorSel.chosen').chosen({
            width: '100%',
            allow_single_deselect: true,
            disable_search_threshold: 10
        });
        populateSelect('#SupervisorSel', 'RETRIEVING MANAGER AGENT LIST...');
        populateSelect('#CitySel', 'RETRIEVING CITY LIST...');
        $('button#switchSite').show();
    });
});


/****** HELPER PROCEDURES ******/

function createDefaultTabs() {

    // Create Tab for 'ALLSESSIONS'
    var row = '<li class="pull-right" tabId="ALLSESSIONS">' +
        '<a class="nav-link" data-toggle="tab" skillGroup="ALLSESSIONS" href="#ALLSESSIONS">IN PROGRESS (<span class="count-ALLSESSIONS">0</span>)</a>' +
        '</li>';
    $('ul#Tabs').append(row);
    // Create Tab Content for 'ALLSESSIONS'
    row = '<div id="ALLSESSIONS" class="tab-pane">' +
        '<table class="table table-bordered center hover-highlight ALLSESSIONS">' +
        '<thead>' +
		'<tr>' +
        '<th class="col-sm-1 no-border sorter-false filter-false"></th>' +
        '<th class="col-sm-2 no-border sorter-false filter-false"></th>' +
        '<th class="col-sm-1 no-border sorter-false filter-false"></th>' +
        '<th class="col-sm-1 no-border sorter-false filter-false"></th>' +
        '<th class="col-sm-1 no-border sorter-false filter-false"></th>' +
        '<th class="col-sm-1 no-border sorter-false filter-false"></th>' +
        '<th class="col-sm-1 no-border sorter-false filter-false"></th>' +
        '<th class="col-sm-2 no-border sorter-false filter-false"></th>' +
        '<th class="col-sm-2 no-border sorter-false filter-false"></th>' +
		'</tr>' +
        '<tr>' +
		'<th colspan=9 class="col-sm-12 sorter-false filter-false">' +
		'<div class="col-sm-12 buttonrow">' +
        '<div class="col-sm-1 text-left">' +
        '<img class="tableIcon reset clear-filters-ALLSESSIONS" src="stylesheets/images/clear-filters.png"><img class="tableIcon csv" src="stylesheets/images/csv.png"><img class="tableIcon print" src="stylesheets/images/print.png">' +
        '</div> ' +
		'<div class="col-sm-10 text-center">WORKFLOW IN PROGRESS (<span class="count-ALLSESSIONS">0</span>)</div>' +
		'</div>' +
		'</th>' +
		'</tr>' +
        '<tr>' +

        '<th class="col-sm-1 text-center attUID sortInitialOrder-asc group-text">ATT UID</th>' +
        '<th class="col-sm-2 text-center agentName sortInitialOrder-asc group-text">AGENT NAME</th>' +
        '<th class="col-sm-1 text-center workType sortInitialOrder-asc group-text">WORK SOURCE</th>' +
        '<th class="col-sm-1 text-center taskType sortInitialOrder-asc group-text">TASK TYPE</th>' +
        '<th class="col-sm-1 text-center skillGroup sortInitialOrder-asc group-text">BUSINESS UNIT</th>' +
        '<th class="col-sm-1 text-center sessionDuration countdown filter-false group-false sorter-date">WORKFLOW <br />SESSION DURATION</th>' +
        '<th class="col-sm-1 text-center stepDuration countdown filter-false group-false sorter-date">STEP <br />DURATION</th>' +
        '<th class="col-sm-2 text-center flowName sorter-false">FLOW NAME</th>' +
        '<th class="col-sm-2 text-center stepName sorter-false">STEP NAME</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody >' +
        '</tbody>' +
        '</table>' +
        '</div>';
    $('div#Contents').append(row);

    // Setup Open Detail View from clicking moreDetails Image on 'ALLSESSIONS' table
    $('table.ALLSESSIONS tbody').off('click').on('click', 'img.moreDetails', function () {
        var id = $(this).closest('tr').attr('connectionId');
        Cookies.set('connectionId', id);
        var winName = 'window_' + id;
        if (typeof windowManager[winName] != 'undefined') {
            var win = windowManager[winName];
            win.close();
        }
        windowManager[winName] = window.open('../detail/index.html', winName);
    });

    // Setup Open Detail View from double clicking row on 'ALLSESSIONS' table
    $('table.ALLSESSIONS tbody').off('dblclick').on('dblclick', 'tr', function () {
        var id = $(this).attr('connectionId');
        Cookies.set('connectionId', id);
        var winName = 'window_' + id;
        if (typeof windowManager[winName] != 'undefined') {
            var win = windowManager[winName];
            win.close();
        }
        windowManager[winName] = window.open('../detail/index.html', winName);
    });

    // Create Tab for 'INACTIVESESSIONS'
    row = '<li class="pull-right" tabId="INACTIVESESSIONS">' +
        '<a class="nav-link" data-toggle="tab" skillGroup="INACTIVESESSIONS" href="#INACTIVESESSIONS">NOT STARTED (<span class="count-INACTIVESESSIONS">0</span>)</a>' +
        '</li> ';
    $('ul#Tabs').append(row);
    // Create Tab Content for 'INACTIVESESSIONS'
    row = '<div id="INACTIVESESSIONS" class="tab-pane">' +
        '<table class="table table-bordered center hover-highlight INACTIVESESSIONS">' +
        '<thead>' +
		'<tr>' +
        '<th class="col-sm-3 no-border sorter-false filter-false"></th>' +
        '<th class="col-sm-3 no-border sorter-false filter-false"></th>' +
        '<th class="col-sm-3 no-border sorter-false filter-false"></th>' +
        '<th class="col-sm-3 no-border sorter-false filter-false"></th>' +
		'</tr>' +
		'<tr>' +
		'<th colspan=4 class="col-sm-12 sorter-false filter-false">' +
		'<div class="col-sm-12 buttonrow">' +
        '<div class="col-sm-1 text-left">' +
        '<img class="tableIcon reset clear-filters-INACTIVESESSIONS" src="stylesheets/images/clear-filters.png"><img class="tableIcon csv" src="stylesheets/images/csv.png"><img class="tableIcon print" src="stylesheets/images/print.png">' +
        '</div> ' +
		'<div class="col-sm-10 text-center">WORKFLOW NOT STARTED (<span class="count-INACTIVESESSIONS">0</span>)</div>' +
		'</div>' +
		'</th>' +
		'</tr>' +
        '<tr>' +
        '<th class="col-sm-3 text-center attUID sortInitialOrder-asc group-text">ATT UID</th>' +
        '<th class="col-sm-3 text-center agentName sortInitialOrder-asc group-text">AGENT NAME</th>' +
        '<th class="col-sm-3 text-center filter-false group-false sessionStartTime sorter-date">SASHA CONNECTION STARTED</th>' +
        '<th class="col-sm-3 text-center sessionDuration countdown filter-false group-false sorter-date">CONNECTION DURATION</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody >' +
        '</tbody>' +
        '</table>' +
        '</div>';
    $('div#Contents').append(row);

    // Setup Open Detail View from clicking moreDetails Image on 'INACTIVESESSIONS' table
    $('table.INACTIVESESSIONS tbody').off('click').on('click', 'img.moreDetails', function () {
        var id = $(this).closest('tr').attr('connectionId');
        Cookies.set('connectionId', id);
        var winName = 'window_' + id;
        if (typeof windowManager[winName] != 'undefined') {
            var win = windowManager[winName];
            win.close();
        }
        windowManager[winName] = window.open('../detail/index.html', winName);
    });

    // Setup Open Detail View from double clicking row on 'INACTIVESESSIONS' table
    $('table.INACTIVESESSIONS tbody').off('dblclick').on('dblclick', 'tr', function () {
        var id = $(this).attr('connectionId');
        Cookies.set('connectionId', id);
        var winName = 'window_' + id;
        if (typeof windowManager[winName] != 'undefined') {
            var win = windowManager[winName];
            win.close();
        }
        windowManager[winName] = window.open('../detail/index.html', winName);
    });

    // Create Tab for 'STALLEDSESSIONS'
    row = '<li class="pull-right" tabId="STALLEDSESSIONS">' +
        '<a class="nav-link" data-toggle="tab" skillGroup="STALLEDSESSIONS" href="#STALLEDSESSIONS">STALLED SESSIONS (<span class="count-STALLEDSESSIONS">0</span>)</a>' +
        '</li> ';
    $('ul#Tabs').append(row);
    // Create Tab Content for 'STALLEDSESSIONS'
    row = '<div id="STALLEDSESSIONS" class="tab-pane">' +
        '<table class="table table-bordered center hover-highlight STALLEDSESSIONS">' +
        '<thead>' +
        '<tr>' +
        '<th class="col-sm-1 no-border sorter-false filter-false"></th>' +
        '<th class="col-sm-2 no-border sorter-false filter-false"></th>' +
        '<th class="col-sm-1 no-border sorter-false filter-false"></th>' +
        '<th class="col-sm-1 no-border sorter-false filter-false"></th>' +
        '<th class="col-sm-1 no-border sorter-false filter-false"></th>' +
        '<th class="col-sm-1 no-border sorter-false filter-false"></th>' +
        '<th class="col-sm-1 no-border sorter-false filter-false"></th>' +
        '<th class="col-sm-2 no-border sorter-false filter-false"></th>' +
        '<th class="col-sm-2 no-border sorter-false filter-false"></th>' +
        '</tr>' +
		'<tr>' +
		'<th colspan=9 class="col-sm-12 sorter-false filter-false">' +
		'<div class="col-sm-12 buttonrow">' +
        '<div class="col-sm-1 text-left">' +
        '<img class="tableIcon reset clear-filters-STALLEDSESSIONS" src="stylesheets/images/clear-filters.png"><img class="tableIcon csv" src="stylesheets/images/csv.png"><img class="tableIcon print" src="stylesheets/images/print.png">' +
        '</div> ' +
		'<div class="col-sm-10 text-center">STALLED WORKFLOWS (<span class="count-STALLEDSESSIONS">0</span>)</div>' +
		'</div>' +
		'</th>' +
		'</tr>' +
        '<tr>' +
        '<th class="col-sm-1 text-center attUID sortInitialOrder-asc group-text">ATT UID</th>' +
        '<th class="col-sm-2 text-center agentName sortInitialOrder-asc group-text">AGENT NAME</th>' +
        '<th class="col-sm-1 text-center workType sortInitialOrder-asc group-text">WORK SOURCE</th>' +
        '<th class="col-sm-1 text-center taskType sortInitialOrder-asc group-text">TASK TYPE</th>' +
        '<th class="col-sm-1 text-center skillGroup sortInitialOrder-asc group-text">BUSINESS UNIT</th>' +
        '<th class="col-sm-1 text-center sessionDuration countdown filter-false group-false sorter-date">WORKFLOW <br />SESSION DURATION</th>' +
        '<th class="col-sm-1 text-center stepDuration countdown filter-false group-false sorter-date">STEP <br />DURATION</th>' +
        '<th class="col-sm-2 text-center flowName sorter-false">FLOW NAME</th>' +
        '<th class="col-sm-2 text-center stepName sorter-false">STEP NAME</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody >' +
        '</tbody>' +
        '</table>' +
        '</div>';
    $('div#Contents').append(row);

    // Setup Open Detail View from clicking moreDetails Image on 'STALLED' table
    $('table.STALLEDSESSIONS tbody').off('click').on('click', 'img.moreDetails', function () {
        var id = $(this).closest('tr').attr('connectionId');
        Cookies.set('connectionId', id);
        var winName = 'window_' + id;
        if (typeof windowManager[winName] != 'undefined') {
            var win = windowManager[winName];
            win.close();
        }
        windowManager[winName] = window.open('../detail/index.html', winName);
    });

    // Setup Open Detail View from double clicking row on 'STALLEDSESSIONS' table
    $('table.STALLEDSESSIONS tbody').off('dblclick').on('dblclick', 'tr', function () {
        var id = $(this).attr('connectionId');
        Cookies.set('connectionId', id);
        var winName = 'window_' + id;
        if (typeof windowManager[winName] != 'undefined') {
            var win = windowManager[winName];
            win.close();
        }
        windowManager[winName] = window.open('../detail/index.html', winName);
    });


    // Initialize ALLSESSIONS tab as active
    $('.nav-tabs a[skillGroup="ALLSESSIONS"]').tab('show');

    // Make tables sortable
    $.each($('table'), function () {
        if ($(this).hasClass('ALLSESSIONS')) {
            var sortList = [[5, 0]];
            var sortAppend = [[5, 0]];
            var tableName = 'ALLSESSIONS';
        }
        else if ($(this).hasClass('STALLEDSESSIONS')) {
            sortList = [[5, 0]];
            sortAppend = [[5, 0]];
            tableName = 'STALLEDSESSIONS';
        }
        else {
            sortList = [[3, 0]];
            sortAppend = [[3, 0]];
            tableName = 'INACTIVESESSIONS';
        }
        $(this).tablesorter({
            theme: 'custom',
            sortReset: true,
            sortRestart: true,
            sortInitialOrder: 'desc',
            ignoreCase: true,
            sortList: sortList,
            sortAppend: sortAppend,
            textExtraction: {
                '.countdown' : function(node) {
                    return $(node).find('div').attr('title');
                }
            },
            widgets: ['zebra', 'output', 'print', 'filter', 'saveSort', 'stickyHeaders', 'group'],
            widgetOptions: {
                group_collapsible : false,  // make the group header clickable and collapse the rows below it.
                group_collapsed   : false, // start with all groups collapsed (if true)
                group_saveGroups  : true,  // remember collapsed groups
                group_separator : '_',
                group_complete : 'groupingComplete',
                filter_saveFilters : true,
                filter_reset : '.clear-filters-' + tableName,
                output_delivery : 'download',
                output_includeFooter : false,
                output_saveFileName : $(this).parent().prop('id') + '.CSV',
                print_title      : $(this).parent().prop('id'),
                print_styleSheet : 'stylesheets/print-stylesheet.css',
                print_now : true,
                saveSort : true
            }
        });
    });

    // Configure reset button
    $('.reset').off('click').on('click', function () {
        var table = $(this).closest('table');
        if ($(this).hasClass('INACTIVESESSIONS')) {
            var sortList = [[3, 0]];
        } else {
            sortList = [[5, 0]];
        }
        $(table).trigger('filterResetSaved').trigger('saveSortReset').trigger('sortReset').trigger('sorton', [sortList]);
    });

    // Configure Export and Print Buttons
    $('.csv').off('click').on('click', function() {
        $(this).closest('table').trigger('outputTable');
    });
    $('.print').off('click').on('click', function() {
        // var name = $(this).closest('tr').text();
        $(this).closest('table').trigger('printTable');
    });

    // Anytime a tab is clicked, reapply tablesorter widgets
    $('a[data-toggle="tab"]').off('shown.bs.tab.resort').on('shown.tab.bs.resort', function (e) {
        var target = $(e.target).attr('skillGroup');
        $('table.' + target).trigger('update', true);
    });

};


function addTab(skillGroup) {
    // Create Tab for new skill group
    var row = '<li tabId=' + skillGroup + '>' +
        '<a class=nav-link" data-toggle="tab" skillGroup="' + skillGroup + '" href="#' + skillGroup + '">' + skillGroup + ' (<span class="count-' + skillGroup + '">0</span>)</a>' +
        '</li>';
    $('ul#Tabs').append(row);
    // Create Tab Content for skill group
    row = '<div id="' + skillGroup + '" class="tab-pane">' +
        '<table class="table table-bordered center hover-highlight ' + skillGroup + '">' +
        '<thead>' +
		'<tr>' +
        '<tr>' +
        '<th class="col-sm-1 no-border sorter-false filter-false"></th>' +
        '<th class="col-sm-2 no-border sorter-false filter-false"></th>' +
        '<th class="col-sm-1 no-border sorter-false filter-false"></th>' +
        '<th class="col-sm-1 no-border sorter-false filter-false"></th>' +
        '<th class="col-sm-1 no-border sorter-false filter-false"></th>' +
        '<th class="col-sm-1 no-border sorter-false filter-false"></th>' +
        '<th class="col-sm-2 no-border sorter-false filter-false"></th>' +
        '<th class="col-sm-2 no-border sorter-false filter-false"></th>' +
        '</tr>' +
		'<th colspan=8 class="col-sm-12 sorter-false filter-false">' +
		'<div class="col-sm-12 buttonrow">' +
        '<div class="col-sm-1 text-left">' +
        '<img class="tableIcon reset clear-filters-' + skillGroup + '" src="stylesheets/images/clear-filters.png"><img class="tableIcon csv" src="stylesheets/images/csv.png"><img class="tableIcon print" src="stylesheets/images/print.png">' +
        '</div> ' +
		'<div class="col-sm-10 text-center">' + skillGroup + ' (<span class="count-' + skillGroup + '">0</span>)</div>' +
		'</div>' +
		'</th>' +
		'</tr>' +
        '<tr>' +
        '<th class="col-sm-1 text-center attUID sortInitialOrder-asc group-text">ATT UID</th>' +
        '<th class="col-sm-2 text-center agentName sortInitialOrder-asc group-text">AGENT NAME</th>' +
        '<th class="col-sm-1 text-center workType sortInitialOrder-asc group-text">WORK SOURCE</th>' +
        '<th class="col-sm-1 text-center taskType sortInitialOrder-asc group-text">TASK TYPE</th>' +
        '<th class="col-sm-1 text-center sessionDuration countdown filter-false group-false sorter-date">WORKFLOW <br />SESSION DURATION</th>' +
        '<th class="col-sm-1 text-center stepDuration countdown filter-false group-false sorter-date">STEP <br />DURATION</th>' +
        '<th class="col-sm-2 text-center flowName sorter-false">FLOW NAME</th>' +
        '<th class="col-sm-2 text-center stepName sorter-false">STEP NAME</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody >' +
        '</tbody>' +
        '</table>' +
        '</div>';
    $('div#Contents').append(row);

    // Setup Open Detail View from clicking moreDetails Image on skill group table
    $('table.' + skillGroup + ' tbody').off('click').on('click', 'img.moreDetails', function () {
        var id = $(this).closest('tr').attr('connectionId');
        Cookies.set('connectionId', id);
        var winName = 'window_' + id;
        if (typeof windowManager[winName] != 'undefined') {
            var win = windowManager[winName];
            win.close();
        }
        windowManager[winName] = window.open('../detail/index.html', winName);
    });

    // Setup Open Detail View from double clicking row on skill group table
    $('table.' + skillGroup + ' tbody').off('dblclick').on('dblclick', 'tr', function () {
        var id = $(this).attr('connectionId');
        Cookies.set('connectionId', id);
        var winName = 'window_' + id;
        if (typeof windowManager[winName] != 'undefined') {
            var win = windowManager[winName];
            win.close();
        }
        windowManager[winName] = window.open('../detail/index.html', winName);
    });

    // Make table sortable
    $('table.' + skillGroup).tablesorter({
        theme: 'custom',
        sortReset: true,
        sortRestart: true,
        sortInitialOrder: 'desc',
        ignoreCase: true,
        sortList: [[4, 0]],
        sortAppend: [[4, 0]],
        textExtraction: {
            '.countdown' : function(node) {
                return $(node).find('div').attr('title');
            }
        },
        widgets: ['zebra', 'output', 'print', 'filter', 'saveSort', 'stickyHeaders', 'group'],
        widgetOptions: {
            group_collapsible : false,  // make the group header clickable and collapse the rows below it.
            group_collapsed   : false, // start with all groups collapsed (if true)
            group_saveGroups  : true,  // remember collapsed groups
            group_separator : '_',
            group_complete : 'groupingComplete',
            filter_saveFilters : true,
            filter_reset : '.clear-filters-' + skillGroup,
            output_delivery : 'download',
            output_includeFooter : false,
            output_saveFileName : $('table.' + skillGroup).parent().prop('id') + '.CSV',
            print_title      : $('table.' + skillGroup).parent().prop('id'),
            print_styleSheet : 'stylesheets/print-stylesheet.css',
            print_now : true,
            saveSort : true
        }
    });

    $('.reset').off('click').on('click', function () {
        var table = $(this).closest('table');
        if ($(table).hasClass('INACTIVESESSIONS')) {
            var sortList = [[3, 0]];
        } else {
            sortList = [[5, 0]];
        }
        $(table).trigger('filterResetSaved').trigger('saveSortReset').trigger('sortReset').trigger('sorton', [sortList]);
    });

    // Configure Export and Print Buttons
    $('.csv').off('click').on('click', function() {
        $(this).closest('table').trigger('outputTable');
    });
    $('.print').off('click').on('click', function() {
        // var name = $(this).closest('tr').text();
        $(this).closest('table').trigger('printTable');
    });

    // Apply table refresh on tab change to new tab
    $('a[data-toggle="tab"]').off('shown.bs.tab.resort').on('shown.tab.bs.resort', function (e) {
        var target = $(e.target).attr('skillGroup');
        $('table.' + target).trigger('update', true);
    });
};

function sortTabs(element) {
    var myList = $(element);
    var listItems = myList.children('li').get();
    listItems.sort(function (a, b) {
        var compA = $(a).text().toUpperCase();
        var compB = $(b).text().toUpperCase();
        return compA < compB ? -1 : compA > compB ? 1 : 0;
    });
    myList.empty();
    $.each(listItems, function (idx, itm) {
        myList.append(itm);
    });
    $('a[data-toggle="tab"]').off('shown.bs.tab.resort').on('shown.tab.bs.resort', function (e) {
        var target = $(e.target).attr('skillGroup');
        $('table.' + target).trigger('update', true);
    });
};


// Hide Initialization and show screen on connection
function showMainScreen() {
    $('div.initializationScreen').hide();
    $('div.mainScreen').show();
};


function checkStalledSessions(periods) {
    if ($.countdown.periodsToSeconds(periods) > 1200) {
        $(this).addClass('highlightDuration');
        var connectionId = $(this).closest('tr').attr('connectionId');
        if (!$('table.STALLEDSESSIONS tbody tr[connectionId="' + connectionId + '"]').length) {
            socket.emit('Alert Server of Stalled Session', {
                ConnectionId: connectionId
            });
        }
    }
};


// Add Styling on Timer if over threshold
function checkTimerStyling(periods) {
    if ($.countdown.periodsToSeconds(periods) > 30) {
        var stepInfo = $(this).parent().parent().find('span.stepInfo');
        if (stepInfo.html() == 'SO WAIT') {
            $(this).addClass('warnWaitScreenDuration');
            return;
        } else {
            $(this).removeClass('warnWaitScreenDuration');
        }
    }
    if ($.countdown.periodsToSeconds(periods) > 300) {
        $(this).addClass('highlightDuration');
    } else {
        $(this).removeClass('highlightDuration');
    }
};

function filterNewRow() {
    // Apply filters to newly added rows if filters are enabled
    if (window.filterCity == '') {
        // There is no City filter, apply only Supervisor filter if appropriate
        if (window.filterSupervisor == '') {
            // Show all rows
            $('tbody tr').not('.filtered').show();
        } else {
            // Apply Only Supervisor filter
            $('tbody tr').not('.filtered').show();
            var showRows = $(showRows).filter(window.filterSupervisor);
            $('tbody tr').not('.filtered').not(showRows).hide();
        }
    } else {
        $('tbody tr').not('.filtered').show();
        showRows = $('tbody tr').not('.filtered');
        showRows = $(showRows).filter(window.filterCity);
        if (window.filterSupervisor != '') {
            showRows = $(showRows).filter(window.filterSupervisor);
        }
        $('tbody tr').not('.filtered').not(showRows).hide();
    }
    $('table').trigger('update', true);
};

function populateSelect(selectName, populatePH) {
    $(selectName).prop('disabled', true).attr('data-placeholder', populatePH).trigger('chosen:updated');
    $.ajax({
        type: 'post',
        url: 'ajax/requestData.php',
        data: {
            databaseIP: dbHost,
            databaseUser: dbUser,
            databasePW: dbPassword,
            databaseName: dbName,
            selectName: selectName
        },
        dataType: 'json'
    }).fail(function (jqXHR, textStatus) {
        if (textStatus != 'timeout') {
            $('.modal').html('<div><h4 class="text-center">' + textStatus.toUpperCase() + '  DURING RETRIEVAL OF SELECTION OPTIONS</h3></div><br /><div class="text-center"><button class="modalOkay btn btn-primary">OKAY</button></div>');
            $('.modal').plainModal('open').on('plainmodalbeforeclose', false);
            $('button.modalOkay').off('click').on('click', function () {
                $('.modal').off('plainmodalbeforeclose', false).plainModal('close');

            });
        }
        $(selectName).remove();
        switch (selectName) {
        case '#CitySel':
            $('div#cityFilter').html('&nbsp');
            break;
        case '#SupervisorSel':
            $('div#supervisorFilter').html('&nbsp');
            break;
        }
    }).done(function (data) {
        if (data.hasOwnProperty('ERROR')) {
            $('select' + selectName).chosen('destroy');
            $('select' + selectName).remove();
            switch (selectName) {
            case '#CitySel':
                $('div#cityFilter').html('&nbsp');
                break;
            case '#SupervisorSel':
                $('div#supervisorFilter').html('&nbsp');
                break;
            }    
            return;
        }
        data.forEach(function(Item) {
            $(selectName).append($('<option>', {
                value: Item.key,
                text: Item.value
            }));
        });
        $(selectName).prop('disabled', false).attr('data-placeholder', $(selectName).attr('data-ph')).trigger('chosen:updated');

        switch (selectName) {
        case '#CitySel':
            var citySel = Cookies.get( environment +'-CitySel');
            if (typeof citySel != 'undefined') {
                citySel = citySel.replace(/["\[\]]/g, '');
                citySel = citySel.split(',');
                if (citySel.length > 0) {
                    $.each(citySel, function (index, value) {
                        if (value.trim != '') {
                            $('select#CitySel [value="' + value + '"]').attr('selected', 'selected');
                        }
                    });
                    $('select#CitySel').trigger('chosen:updated').trigger('change');
                }
            }
            break;
        case '#SupervisorSel':
            var supervisorSel = Cookies.get( environment +'-SupervisorSel');
            if (typeof supervisorSel != 'undefined') {
                supervisorSel = supervisorSel.replace(/["\[\]]/g, '');
                supervisorSel = supervisorSel.split(',');
                if (supervisorSel.length > 0) {
                    $.each(supervisorSel, function (index, value) {
                        if (value.trim != '') {
                            $('select#SupervisorSel [value="' + value + '"]').attr('selected', 'selected');
                        }
                    });
                    $('select#SupervisorSel').trigger('chosen:updated').trigger('change');
                }
            }
            break;
        }
    });
}