$(document).ready(function () {
    $('div#main').hide();
    // Set the location of the Node.JS server
    var serverAddress = 'http://10.100.49.77';
    var serverAddress = 'http://108.226.174.227';

    var environment = Cookies.get('environmentScreenshots');
    if (typeof environment == 'undefined') {
        environment = Cookies.get('environment');
        if (typeof environment == 'undefined') {
            environment = 'prod';
        }
        Cookies.set('environmentScreenshots','prod');
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
        Cookies.set('environmentScreenshots','prod');
        var socketURL = serverAddress + ':5530';
        version = 'PRODUCTION';
        break;
    }


    $('select#environment').off('change').on('change', function () {
        environment = $(this).find(':selected').val();
        Cookies.set('environmentScreenshots',environment);
        window.location.reload();
    });

    $(document).off('click.closebtn').on('click.closebtn', 'input#closeBtn', function() {
        $('table#header').hide();
        $('table#selectRow').show();
        $('div#selectRowHeader').show();
        $('div.flexslider').html('<input id="closeBtn" type="button" class="btn btn-warning" value="X"><table id="header"></table><ul class="slides"></ul>');
    });


    $('div.flexslider').hide();

    $('input:radio[name=searchtype]').change(function() {
        $('#searchtype > label.active').removeClass('btn-primary').addClass('btn-info');
        $('#searchtype > label').not('.active').removeClass('btn-info').addClass('btn-primary');        
        if ($(this).val() == 'complete') {
            $('div.refresh').hide();
            $('div.daterange').show();
        } else {
            $('div.daterange').hide();
            $('div.refresh').show();
        }
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
        if ($('input#includeInProgress').is(':checked')) {
            var includeInProgress = 'Y';
        } else {
            var includeInProgress = 'N';
        }
        socket.emit('Get Listing', {
            startDate: startDate,
            endDate: endDate,
            includeInProgress: includeInProgress,
            label: label
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

    document.title = 'SAMS - ' + version + ' SCREENSHOT DATA';

    // Initialize variables
    window.socket = io.connect(socketURL);
	
    socket.on('connect', function () {
	    socket.emit('Request DB Config');
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

    socket.on('Return DB Config', function (data) {
        dbHost = data.dbConfig.host;
        dbUser = data.dbConfig.user;
        dbPassword = data.dbConfig.password;
        dbName = data.dbConfig.database;
    });

    socket.on('Receive Listing', function(data) {
        $('.overlay').hide();
        if (typeof data.queryData != 'undefined') {
            var queryData = data.queryData;
        } else {
            var queryData = new Object();
        }
        if (queryData.length > 0) {
            var html = '<div id="selectRowHeader" class="text-center">DOUBLE CLICK ON A ROW TO LOAD THAT SESSION\'S SCREENSHOTS</div><table id="selectRow" class="table table-bordered center hover-highlight"><thead><tr><th class="text-center">SMP SESSION ID</th><th class="text-center">FLOW STARTED</th><th class="text-center">FLOW COMPLETED</th><th class="text-center">ELAPSED<br />TIME</th><th class="filter-select text-center">AGENT<br />ATT UID</th><th class="filter-select text-center">AGENT NAME</th><th class="filter-select text-center">MANAGER<br />ATT UID</th></thead><tbody>';
            $.each( queryData, function (key, value) {
                var smp_session_id = value.smp_session_id;
                var start_time = moment(new Date(value.start_time)).format('MM/DD/YYYY HH:mm:ss');
                var stop_time = moment(new Date(value.stop_time)).format('MM/DD/YYYY HH:mm:ss');
                var elapsed_seconds = value.elapsed_seconds;
                var attuid = value.att_uid;
                var first_name = value.first_name;
                var last_name = value.last_name;
                var manager_id = value.manager_id;
                html = html + '<tr>';
                html = html + '<td class="col-sm-3">' + smp_session_id + '</td>';
                html = html + '<td class="col-sm-1 text-center">' + start_time + '</td>';                
                html = html + '<td class="col-sm-1 text-center">' + stop_time + '</td>';
                html = html + '<td class="col-sm-1 text-center">' + elapsed_seconds + '</td>';
                html = html + '<td class="col-sm-1">' + attuid + '</td>';                
                html = html + '<td class="col-sm-4">' + last_name + ',' + first_name + '</td>';
                html = html + '<td class="col-sm-1">' + manager_id + '</td>';
                html = html + '</tr>';
            });
            html = html + '</tbody></table>';
            $('div#selectRecord').html(html).show();
			$('table#selectRow').stickyTableHeaders();
            $('table#selectRow').tablesorter({
                theme: 'custom',
                sortList: [[1,0]],
                sortReset: true,
                ignoreCase: true,
                widgets: ['zebra', 'filter']
            });

            $('div#noData').hide();
            $('table#selectRow tr').off('dblclick').on('dblclick', function() {
                $('table#selectRow').hide();
                $('div#selectRowHeader').hide();
                $('.flexslider').remove();
                $('div.flex-container').append('<div class="flexslider"><input id="closeBtn" type="button" class="btn btn-warning" value="X"><table id="header"></table><ul class="slides"></ul></div>');
                var smp_session_id = $(this).children().first().html();
                $('div#screenshot').html('<p class="imglist"></p>');
                socket.emit('Get ScreenShots', {
                    smp_session_id: smp_session_id
                });
            });
        } else {
            var startDate = moment($('#daterange').data('daterangepicker').startDate._d).format('MM/DD/YY HH:mm');
            var endDate = moment($('#daterange').data('daterangepicker').endDate._d).format('MM/DD/YY HH:mm');
            if (data.label == 'Custom Range') {
                $('div#noData').html('<h3>NO DATA LOCATED FOR RANGE ' + startDate + ' AND ' + endDate + '</h3>').show();
            } else {
                var label = data.label;
                $('div#noData').html('<h3>NO DATA LOCATED FOR ' + label.toUpperCase() + '</h3>').show();
            }
            $('#selectRecord').hide();
            $('table#header').hide();
        }
    });

    socket.on('Get ScreenShots', function (data) {
        $('div#slides').hide();
        var screenshot_time = moment(data.screenshot_time).format('MM/DD/YYYY HH:mm:ss');
        var flow_name = data.flow_name;
        var step_name = data.step_name;
        var image_data = data.image_data;
        var html = '<li><img src="' + image_data + '" /><p class=flex-caption>SCREENSHOT TIME:&nbsp;' + screenshot_time + '<br />FLOW NAME:&nbsp;' + flow_name + '<br />STEP NAME:&nbsp;' + step_name +'<p></li>';
        $('ul.slides').append(html);

    });

    socket.on('Screenshots Delivered', function() {
        $('.flexslider').flexslider({
            controlsContainer: '.flexslider',
            animation: 'slide',
            animationLoop: false,
            slideshow: false,
            directionNav: true,
            prevText: 'Previous',
            nextText: 'Next'
        });
        $('div.flexslider').show();
    });
    
    socket.on('Update Header', function (data) {
        var session_id = data.session_id;
        var start_time = moment(data.start_time).format('MM/DD/YYYY HH:mm:ss');
        var stop_time = moment(data.stop_time).format('MM/DD/YYYY HH:mm:ss');
        var elapsed_seconds = data.elapsed_seconds;
        var att_uid = data.att_uid;
        var agent_name = data.agent_name;
        var manager_id = data.manager_id;
        var work_source = data.work_source;
        var business_line = data.business_line;
        var task_type = data.task_type;
        var html = '<tr><td class="label">SESSION ID:</td><td>' + session_id + '</td><td class="label">ELAPSED TIME:</td><td>' + elapsed_seconds + '</td><tr>' +
            '<tr><td class="label">START TIME:</td><td>' + start_time + '</td><td class="label">STOP TIME:</td><td>' + stop_time + '</td></tr>' +
            '<tr><td class="label">ATT UID:</td><td>' + att_uid + '</td><td class="label">AGENT NAME:</td><td>' + agent_name + '</td></tr>' +
            '<tr><td class="label">MANAGER UID:</td><td>' + manager_id + '</td><tr>' + 
            '<tr><td class="label">WORK SOURCE:</td><td>' + work_source + '</td><td class="label">BUSINESS LINE:</td><td>' + business_line + '</td></tr>';
        if (task_type.trim().length > 0) {
            html = html + '<tr><td class="label">TASK TYPE:</td><td>' + task_type + '</td></tr>';
        }
        $('table#header').append(html);        
    });
});