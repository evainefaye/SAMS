$(document).ready(function () {
    $('div#main').hide();
    // Set the location of the Node.JS server
    var serverAddress = 'http://108.226.174.227';
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
        $('.overlay').show();
    });

    $('i.glyphicon.glyphicon-calendar.fa.fa-calendar').off('click').on('click', function() {
        $('#daterange').trigger('click');
    });
    $('#daterange').on('apply.daterangepicker', function(ev, picker) {
        $('#daterange').val(picker.startDate.format('YYYY-MM-DD HH:mm:ss') + ' - ' + picker.endDate.format('YYYY-MM-DD HH:mm:ss'));
    });

    document.title = 'SAMS - ' + version + ' SCREENSHOT DATA';








/*
    // call the tablesorter plugin
    $('table').tablesorter({
        theme: 'blue',

        // hidden filter input/selects will resize the columns, so try to minimize the change
        widthFixed : true,

        // initialize zebra striping and filter widgets
        widgets: ['zebra', 'filter'],

        ignoreCase: false,

        widgetOptions : {

            // filter_anyMatch options was removed in v2.15; it has been replaced by the filter_external option

            // If there are child rows in the table (rows with class name from "cssChildRow" option)
            // and this option is true and a match is found anywhere in the child row, then it will make that row
            // visible; default is false
            filter_childRows : false,

            // if true, filter child row content by column; filter_childRows must also be true
            filter_childByColumn : false,

            // if true, include matching child row siblings
            filter_childWithSibs : true,

            // if true, a filter will be added to the top of each table column;
            // disabled by using -> headers: { 1: { filter: false } } OR add class="filter-false"
            // if you set this to false, make sure you perform a search using the second method below
            filter_columnFilters : true,

            // if true, allows using "#:{query}" in AnyMatch searches (column:query; added v2.20.0)
            filter_columnAnyMatch: true,

            // extra css class name (string or array) added to the filter element (input or select)
            filter_cellFilter : '',

            // extra css class name(s) applied to the table row containing the filters & the inputs within that row
            // this option can either be a string (class applied to all filters) or an array (class applied to indexed filter)
            filter_cssFilter : '', // or []

            // add a default column filter type "~{query}" to make fuzzy searches default;
            // "{q1} AND {q2}" to make all searches use a logical AND.
            filter_defaultFilter : {},

            // filters to exclude, per column
            filter_excludeFilter : {},

            // jQuery selector (or object) pointing to an input to be used to match the contents of any column
            // please refer to the filter-any-match demo for limitations - new in v2.15
            filter_external : '',

            // class added to filtered rows (rows that are not showing); needed by pager plugin
            filter_filteredRow : 'filtered',

            // ARIA-label added to filter input/select; {{label}} is replaced by the column header
            // "data-label" attribute, if it exists, or it uses the column header text
            filter_filterLabel : 'Filter "{{label}}" column by...',

            // add custom filter elements to the filter row
            // see the filter formatter demos for more specifics
            filter_formatter : null,

            // add custom filter functions using this option
            // see the filter widget custom demo for more specifics on how to use this option
            filter_functions : null,

            // hide filter row when table is empty
            filter_hideEmpty : true,

            // if true, filters are collapsed initially, but can be revealed by hovering over the grey bar immediately
            // below the header row. Additionally, tabbing through the document will open the filter row when an input gets focus
            // in v2.26.6, this option will also accept a function
            filter_hideFilters : true,

            // Set this option to false to make the searches case sensitive
            filter_ignoreCase : true,

            // if true, search column content while the user types (with a delay).
            // In v2.27.3, this option can contain an
            // object with column indexes or classnames; "fallback" is used
            // for undefined columns
            filter_liveSearch : true,

            // global query settings ('exact' or 'match'); overridden by "filter-match" or "filter-exact" class
            filter_matchType : { 'input': 'exact', 'select': 'exact' },

            // a header with a select dropdown & this class name will only show available (visible) options within that drop down.
            filter_onlyAvail : 'filter-onlyAvail',

            // default placeholder text (overridden by any header "data-placeholder" setting)
            filter_placeholder : { search : '', select : '' },

            // jQuery selector string of an element used to reset the filters
            filter_reset : 'button.reset',

            // Reset filter input when the user presses escape - normalized across browsers
            filter_resetOnEsc : true,

            // Use the $.tablesorter.storage utility to save the most recent filters (default setting is false)
            filter_saveFilters : true,

            // Delay in milliseconds before the filter widget starts searching; This option prevents searching for
            // every character while typing and should make searching large tables faster.
            filter_searchDelay : 300,

            // allow searching through already filtered rows in special circumstances; will speed up searching in large tables if true
            filter_searchFiltered: true,

            // include a function to return an array of values to be added to the column filter select
            filter_selectSource  : null,

            // if true, server-side filtering should be performed because client-side filtering will be disabled, but
            // the ui and events will still be used.
            filter_serversideFiltering : false,

            // Set this option to true to use the filter to find text from the start of the column
            // So typing in "a" will find "albert" but not "frank", both have a's; default is false
            filter_startsWith : false,

            // Filter using parsed content for ALL columns
            // be careful on using this on date columns as the date is parsed and stored as time in seconds
            filter_useParsedData : false,

            // data attribute in the header cell that contains the default filter value
            filter_defaultAttrib : 'data-value',

            // filter_selectSource array text left of the separator is added to the option value, right into the option text
            filter_selectSourceSeparator : '|'

        }

    });
*/








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
        $('div.initializationScreen').html('CONNECTION LOST. ATTEMTPING TO RECONNECT...').show();                
        $('#daterange').val('');
        $('div#select').html('');
        $('div.initializationScreen').show();
    });


    socket.on('Receive Listing', function(data) {
        $('.overlay').hide();
        if (typeof data.queryData != 'undefined') {
            var queryData = data.queryData;
        } else {
            var queryData = new Object();
        }
        if (queryData.length > 0) {
            var html = '<table id=selectRow border=1>';
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
                html = html + '<td>' + smp_session_id + '</td>';
                html = html + '<td>' + start_time + '</td>';                
                html = html + '<td>' + stop_time + '</td>';
                html = html + '<td>' + elapsed_seconds + '</td>';
                html = html + '<td>' + attuid + '</td>';                
                html = html + '<td>' + last_name + ',' + first_name + '</td>';
                html = html + '<td>' + manager_id + '</td>';
                html = html + '</tr>';
            });
            html = html + '</table>';
            $('div#selectRecord').html(html).show();
            $('div#noData').hide();
            $('table#selectRow tr').off('dblclick').on('dblclick', function() {
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
        }
    });

    socket.on('Get ScreenShots', function (data) {
        $('div#slides').hide();
        var screenshot_time = moment(data.screenshot_time).format('MM/DD/YYYY HH:mm:ss');
        var flow_name = data.flow_name;
        var step_name = data.step_name;
        var image_data = data.image_data;
        var html = '<p>Timestamp: ' + screenshot_time + '<br />' + 'Flow: ' + flow_name + ' -> ' + step_name + '<br /><img src="' + image_data + '">';
//        $('div#screenshotdata').append(html);
        var ht = '<img src="' + image_data + '" />';
        $('div#slides').append(ht);

    });

    socket.on('Screenshots Delivered', function() {
        alert('here');
        $('div#slides').show();
        $('div#slides').slidesjs({
            width: 940,
            height: 528,
            navigation: {
                active: true
            },
            effect: 'slide',
            pagination: {
                active: false
            },
            play: {
                active: false
            }
        });
    });
	
	
    if (vars.id) {
        if (vars.connection) {
            $('body').html('<div id="retain">Screenshots are normally discarded upon completion of the flow.  As long as your SASHA session has not completed, you may click <button id="retainScreenshots">HERE</button> to request retention.</div><div id="screenshotdata"></div>');
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