$(document).ready(function () {
    $('#modal').plainModal({
        duration: 500}
    );

    // Show Warning Message if on a browser without web worker support
    var useWebWorker = true;
    if (typeof Worker == 'undefined') {
        useWebWorker = false;
        var showWarning = Cookies.get('showWarning');
        if (!showWarning) {
            $('.modal').plainModal('open').on('plainmodalbeforeclose', false);
        }
        $('button.modalOkay').off('click').on('click', function () {
            $('.modal').off('plainmodalbeforeclose', false).plainModal('close');
            Cookies.set('showWarning', 'true', { expires: 1 });
        });
    }

    $('div.container').hide();
    $('select#environment').chosen({
        width: '100%',
        allow_single_deselect: true,
        disable_search: true
    });
    $('div#main').hide();
    // Set the location of the Node.JS server
//    var serverAddress = 'http://10.100.49.77';
    var serverAddress = 'http://127.0.0.1';

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
        Cookies.set('environmentReporting', 'prod');
        socketURL = serverAddress + ':5530';
        version = 'PRODUCTION';
        break;
    }
    $('select#ReportType').val('');
    $('select#environment').off('change').on('change', function () {
        environment = $(this).find(':selected').val();
        Cookies.set('environmentReporting', environment);
        window.location.reload();
    });

    $('select.showFilter').off('change').on('change', function () {
        $('ReportType').trigger('change');
    });

    // Show/Hide Filters based on report selection
    $('#ReportType').off('change').on('change', function () {
        $('.optional, .required').removeClass('optional required');
        $('div#reportBody').html('').show();
        $('div.container').hide();
        switch ($('#ReportType :selected').val()) {
        case '':
            $('input#MotiveStepThreshold').removeClass('showFilter').addClass('hideFilter');
            $('input#SessionThreshold').removeClass('showFilter').addClass('hideFilter');
            $('input#AgentStepThreshold').removeClass('showFilter').addClass('hideFilter');
            $('select#AttUIDSel').removeClass('showFilter').addClass('hideFilter optional').val('');
            $('select#BusinessLineSel').removeClass('showFilter').addClass('hideFilter optional');
            $('select#WorkSourceSel').removeClass('showFilter').addClass('hideFilter optional');
            $('select#TaskTypeSel').removeClass('showFilter').addClass('hideFilter optional');
            $('select#CitySel').removeClass('showFilter').addClass('hideFilter optional');
            $('select#AssetIdSel').removeClass('showFilter').addClass('hideFilter optional');
            $('input#SessionId').removeClass('showFilter').addClass('hideFilter optional');
            $('select#MinimumCountSel').removeClass('showFilter optional').addClass('hideFilter optional');
            $('.chosen-container').not('#AssetIdSel_chosen').not('#MinimumCountSel_chosen').show();
            $('#AssetIdSel_chosen, #MinimumCountSel_chosen').hide();
            break;
        case 'MotiveStepsOverThreshold':
            var phText = $('input#MotiveStepThreshold').attr('data-ph');
            $('input#MotiveStepThreshold').removeClass('hideFilter').addClass('showFilter').val('').prop('placeholder', phText);
            $('input#SessionThreshold').removeClass('showFilter').addClass('hideFilter');
            $('input#AgentStepThreshold').removeClass('showFilter').addClass('hideFilter');
            $('select#AttUIDSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#BusinessLineSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#WorkSourceSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#TaskTypeSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#CitySel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#AssetIdSel').removeClass('showFilter').addClass('hideFilter optional');
            $('input#SessionId').removeClass('showFilter').addClass('hideFilter optional');
            $('select#MinimumCountSel').removeClass('showFilter optional').addClass('hideFilter optional');
            $('.chosen-container').not('#AssetIdSel_chosen').not('#MinimumCountSel_chosen').show();
            $('#AssetIdSel_chosen, #MinimumCountSel_chosen').hide();
            break;
        case 'AgentStepsOverThreshold':
            $('input#MotiveStepThreshold').removeClass('showFilter').addClass('hideFilter');
            $('input#SessionThreshold').removeClass('showFilter').addClass('hideFilter');
            phText = $('input#AgentStepThreshold').attr('data-ph');
            $('input#AgentStepThreshold').removeClass('hideFilter').addClass('showFilter').val('').prop('placeholder', phText);
            $('select#AttUIDSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#BusinessLineSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#WorkSourceSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#TaskTypeSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#CitySel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#AssetIdSel').removeClass('showFilter').addClass('hideFilter optional');
            $('input#SessionId').removeClass('showFilter').addClass('hideFilter optional');
            $('select#MinimumCountSel').removeClass('showFilter optional').addClass('hideFilter optional');
            $('.chosen-container').not('#AssetIdSel_chosen').not('#MinimumCountSel_chosen').show();
            $('#AssetIdSel_chosen, #MinimumCountSel_chosen').hide();
            break;
        case 'AgentPerformanceByAgent':
            phText = $('input#MotiveStepThreshold').attr('data-ph');
            $('input#MotiveStepThreshold').removeClass('hideFilter').addClass('showFilter').prop('placeholder', phText).val('');
            phText = $('input#SessionThreshold').attr('data-ph');
            $('input#SessionThreshold').removeClass('hideFilter').addClass('showFilter').prop('placeholder', phText).val('');
            phText = $('input#AgentStepThreshold').attr('data-ph');
            $('input#AgentStepThreshold').removeClass('hideFilter').addClass('showFilter').prop('placeholder', phText).val('');
            $('selectAttUIDSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#BusinessLineSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#WorkSourceSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#TaskTypeSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#CitySel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#AssetIdSel').removeClass('showFilter').addClass('hideFilter optional');
            $('input#SessionId').removeClass('showFilter').addClass('hideFilter optional');
            $('select#MinimumCountSel').removeClass('showFilter optional').addClass('hideFilter optional');
            $('.chosen-container').not('#AssetIdSel_chosen').not('#MinimumCountSel_chosen').show();
            $('#AssetIdSel_chosen, #MinimumCountSel_chosen').hide();
            break;
        case 'AgentPerformanceBySession':
            phText = $('input#MotiveStepThreshold').attr('data-ph');
            $('input#MotiveStepThreshold').removeClass('hideFilter').addClass('showFilter').prop('placeholder', phText).val('');
            $('input#SessionThreshold').removeClass('showFilter optional').addClass('hideFilter');
            phText = $('input#AgentStepThreshold').attr('data-ph');
            $('input#AgentStepThreshold').removeClass('hideFilter').addClass('showFilter').prop('placeholder', phText).val('');
            $('select#AttUIDSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#BusinessLineSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#WorkSourceSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#TaskTypeSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#CitySel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#AssetIdSel').removeClass('showFilter').addClass('hideFilter optional');
            $('input#SessionId').removeClass('showFilter').addClass('hideFilter optional');
            $('select#MinimumCountSel').removeClass('showFilter optional').addClass('hideFilter optional');
            $('.chosen-container').not('#AssetIdSel_chosen').not('#MinimumCountSel_chosen').show();
            $('#AssetIdSel_chosen, #MinimumCountSel_chosen').hide();
            break;
        case 'AllAutomation':
            phText = $('input#MotiveStepThreshold').attr('data-opt-ph');
            $('input#MotiveStepThreshold').removeClass('hideFilter').addClass('showFilter optional').val('').prop('placeholder', phText);
            $('input#SessionThreshold').removeClass('showFilter').addClass('hideFilter');
            $('input#AgentStepThreshold').removeClass('showFilter').addClass('hideFilter');
            $('select#AttUIDSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#BusinessLineSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#WorkSourceSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#TaskTypeSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#CitySel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#AssetIdSel').removeClass('showFilter').addClass('hideFilter optional');
            $('input#SessionId').removeClass('showFilter').addClass('hideFilter optional');
            $('select#MinimumCountSel').removeClass('showFilter optional').addClass('hideFilter optional');
            $('.chosen-container').not('#AssetIdSel_chosen').not('#MinimumCountSel_chosen').show();
            $('#AssetIdSel_chosen, #MinimumCountSel_chosen').hide();
            break;
        case 'AllManual':
            $('input#MotiveStepThreshold').removeClass('showFilter').addClass('hideFilter').val('');
            $('input#SessionThreshold').removeClass('showFilter').addClass('hideFilter');
            phText = $('input#AgentStepStepThreshold').attr('data-opt-ph');
            $('input#AgentStepThreshold').removeClass('hideFilter').addClass('showFilter optional').val('').prop('placeholder', phText);
            $('select#AttUIDSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#BusinessLineSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#WorkSourceSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#TaskTypeSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#CitySel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#AssetIdSel').removeClass('showFilter').addClass('hideFilter optional');
            $('input#SessionId').removeClass('showFilter').addClass('hideFilter optional');
            $('select#MinimumCountSel').removeClass('showFilter optional').addClass('hideFilter optional');
            $('.chosen-container').not('#AssetIdSel_chosen').not('#MinimumCountSel_chosen').show();
            $('#AssetIdSel_chosen, #MinimumCountSel_chosen').hide();
            break;
        case 'AllWorkflow':
            $('input#MotiveStepThreshold').removeClass('showFilter').addClass('hideFilter');
            phText = $('input#SessionThreshold').attr('data-opt-ph');
            $('input#SessionThreshold').removeClass('hideFilter').addClass('showFilter optional').prop('placeholder', phText).val('');
            $('input#AgentStepThreshold').removeClass('showFilter').addClass('hideFilter');
            $('select#AttUIDSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#BusinessLineSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#WorkSourceSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#TaskTypeSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#CitySel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#AssetIdSel').removeClass('showFilter').addClass('hideFilter optional');
            $('input#SessionId').removeClass('showFilter').addClass('hideFilter optional');
            $('select#MinimumCountSel').removeClass('showFilter optional').addClass('hideFilter optional');
            $('.chosen-container').not('#AssetIdSel_chosen').not('#MinimumCountSel_chosen').show();
            $('#AssetIdSel_chosen, #MinimumCountSel_chosen').hide();
            break;
        case 'ViewCompletedWorkflows':
            $('input#MotiveStepThreshold').removeClass('showFilter').addClass('hideFilter optional');
            $('input#SessionThreshold').removeClass('showFilter').addClass('hideFilter optional');
            $('input#AgentStepThreshold').removeClass('showFilter').addClass('hideFilter optional');
            $('select#AttUIDSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#BusinessLineSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#WorkSourceSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#TaskTypeSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#CitySel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#AssetIdSel').removeClass('showFilter').addClass('hideFilter optional');
            phText = $('input#SessionId').attr('data-opt-ph');
            $('input#SessionId').removeClass('hideFilter').addClass('showFilter optional').prop('placeholder', phText);
            $('select#MinimumCountSel').removeClass('showFilter optional').addClass('hideFilter optional');
            $('.chosen-container').not('#AssetIdSel_chosen').not('#MinimumCountSel_chosen').show();
            $('#AssetIdSel_chosen, #MinimumCountSel_chosen').hide();
            break;
        case 'WorkflowCompletionCountBreakdown':
            $('input#MotiveStepThreshold').removeClass('showFilter').addClass('hideFilter optional');
            $('input#SessionThreshold').removeClass('showFilter').addClass('hideFilter optional');
            $('input#AgentStepThreshold').removeClass('showFilter').addClass('hideFilter optional');
            $('select#AttUIDSel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#BusinessLineSel').removeClass('showFilter').addClass('hideFilter optional');
            $('select#WorkSourceSel').removeClass('showFilter').addClass('hideFilter optional');
            $('select#TaskTypeSel').removeClass('showFilter').addClass('hideFilter optional');
            $('select#CitySel').removeClass('hideFilter').addClass('showFilter optional');
            $('select#AssetIdSel').removeClass('showFilter').addClass('hideFilter optional');
            $('input#SessionId').removeClass('showFilter').addClass('hideFilter optional');
            $('select#MinimumCountSel').removeClass('showFilter optional').addClass('hideFilter optional');
            $('.chosen-container').not('#environment_chosen').not('#ReportType_chosen').not('#AttUIDSel_chosen').not('#CitySel_chosen').hide();
            break;
        case 'AssetHistoryNonAWS':
        case 'AssetHistoryAWS':
        case 'MACHistoryAWS':
            $('input#MotiveStepThreshold').removeClass('showFilter optional').addClass('hideFilter optional');
            $('input#SessionThreshold').removeClass('showFilter optional').addClass('hideFilter optional');
            $('input#AgentStepThreshold').removeClass('showFilter optional').addClass('hideFilter optional');
            $('select#AttUIDSel').removeClass('showFilter optional').addClass('hideFilter optional');
            $('select#BusinessLineSel').removeClass('showFilter optional').addClass('hideFilter optional');
            $('select#WorkSourceSel').removeClass('showFilter optional').addClass('hideFilter optional');
            $('select#TaskTypeSel').removeClass('showFilter optional').addClass('hideFilter optional');
            $('select#CitySel').removeClass('showFilter optional').addClass('hideFilter optional');
            $('select#AssetIdSel').removeClass('hideFilter').addClass('showFilter optional');
            $('input#SessionId').removeClass('showFilter').addClass('hideFilter optional');
            $('select#MinimumCountSel').removeClass('hideFilter').addClass('showFilter');
            $('.chosen-container').show();
            $('.chosen-container').not('#ReportType_chosen').not('#AssetIdSel_chosen').not('#MinimumCountSel_chosen').hide();
            if ($('#ReportType :selected').val() == 'AssetHistoryNonAWS') {
                $('select#MinimumCountSel').val(10);
            } else {
                $('select#MinimumCountSel').val(2);
            }
            $('select#MinimumCountSel').trigger('chosen:updated');
            break;
        }
    });

    // Create Date Ranger selection
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

    // Initialize Report Variables
    var agentStepFilter = '';
    var agentStepFilterExceeded = '';
    var agentStepFilterWithin = '';
    var agentStepThreshold = '';
    var assetIdFilter = '';
    var attUID = '';
    var attUIDFilter = '';
    var BusinessLine = '';
    var businessLineFilter = '';
    var cityFilter = '';
    var endDate = '';
    var minimumCountFilter = '';
    var motiveStepFilter = '';
    var motiveStepFilterExceeded = '';
    var motiveStepFilterWithin = '';
    var motiveStepThreshold = '';
    var parameters = '';
    var reportType = '';
    var sessionFilter = '';
    var sessionThreshold = '';
    var sessionThresholdFilterExceeded = '';
    var sessionThresholdFilterWithin = '';
    var selectName = '';
    var startDate = '';
    var TaskType = '';
    var taskTypeFilter = '';
    var titleText = '';
    var WorkSource = '';
    var workSourceFilter = '';

    // Handle Request Report
    $('input#RequestReport').off('click.request').on('click.request', function () {
        // If no report is selected do nothing
        var reportType = $('select#ReportType :selected').val();
        if (reportType == '') {
            return;
        }

        //Start checking for valid required fields by report type, default to not valid
        var valid = false;
        $('.required').removeClass('required');
        switch (reportType) {
        case 'MotiveStepsOverThreshold':
            var element = $('input#MotiveStepThreshold');
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
        case 'AgentStepsOverThreshold':
            element = $('input#AgentStepThreshold');
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
        case 'AgentPerformanceByAgent':
            element = $('input#MotiveStepThreshold');
            if ($(element).val().trim() == '' || isNaN($(element).val().trim()) || $(element).val() <= 0) {
                if ($(element).val().trim() == '') {
                    $(element).val('30');
                    var valid1 = true;
                } else {
                    $(element).addClass('required');
                }
            } else {
                $(element).val($(element).val().trim());
                valid1 = true;
            }
            element = $('input#AgentStepThreshold');
            if ($(element).val().trim() == '' || isNaN($(element).val().trim()) || $(element).val() <= 0) {
                if ($(element).val().trim() == '') {
                    $(element).val('300');
                    var valid2 = true;
                } else {
                    $(element).addClass('required');
                }
            } else {
                $(element).val($(element).val().trim());
                valid2 = true;
            }
            element = $('input#SessionThreshold');
            if ($(element).val().trim() == '' || isNaN($(element).val().trim()) || $(element).val() <= 0) {
                if ($(element).val().trim() == '') {
                    $(element).val('1200');
                    var valid3 = true;
                } else {
                    $(element).addClass('required');
                }
            } else {
                $(element).val($(element).val().trim());
                valid3 = true;
            }
            if (valid1 && valid2 && valid3) {
                valid = true;
            }
            break;
        case 'AgentPerformanceBySession':
            element = $('input#MotiveStepThreshold');
            if ($(element).val().trim() == '' || isNaN($(element).val().trim()) || $(element).val() <= 0) {
                if ($(element).val().trim() == '') {
                    $(element).val('30');
                    valid1 = true;
                } else {
                    $(element).addClass('required');
                }
            } else {
                $(element).val($(element).val().trim());
                valid1 = true;
            }
            element = $('input#AgentStepThreshold');
            if ($(element).val().trim() == '' || isNaN($(element).val().trim()) || $(element).val() <= 0) {
                if ($(element).val().trim() == '') {
                    $(element).val('300');
                    valid2 = true;
                } else {
                    $(element).addClass('required');
                }
            } else {
                $(element).val($(element).val().trim());
                valid2 = true;
            }
            if (valid1 && valid2) {
                valid = true;
            }
            break;
        case 'AllAgentAutomation':
            element = $('input#MotiveStepThreshold');
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
            element = $('input#AgentStepThreshold');
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
            element = $('input#SessionThreshold');
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
        case 'AssetHistoryNonAWS':
        case 'AssetHistoryAWS':
        case 'MACHistoryAWS':
        case 'WorkflowCompletionCountBreakdown':
        case 'ViewCompltedWorkflows':
            valid = true;
            break;
        }
        // If you did not determine that required fields were submitted then do nothing
        if (!valid) {
            return;
        }

        // Begin Query Building
        $('.modal').html('<h3 class="text-center"><span id="statusText">REQUESTING DATA FROM DATABASE</span></h3><div class="text-center"><img src="stylesheets/images/3.gif" />');
        $('.modal').plainModal('open').on('plainmodalbeforeclose', false);
        $('div#reportBody').html('');
        $('div#reportBody').hide();
        $('div#screenshotBody').html('');
        var startDate = $('#daterange').data('daterangepicker').startDate.toISOString();
        var endDate = $('#daterange').data('daterangepicker').endDate.toISOString();
        // Check for any filters that are shown and build the query
        $.each($('.showFilter'), function (index, element) {
            switch ($(element).prop('id')) {
            case 'MotiveStepThreshold':
                if ($(element).val() != '') {
                    motiveStepFilterExceeded = ' AND elapsed_seconds >= "' + $(element).val() + '" ';
                    motiveStepFilterWithin = ' AND elapsed_seconds < "' + $(element).val() + '" ';
                    motiveStepThreshold = $(element).val();
                    if (parameters == '') {
                        parameters = 'MOTIVE&nbsp;STEP:&nbsp;' + motiveStepThreshold + '&nbsp;SECONDS';
                    } else {
                        parameters = parameters + 'MOTIVE&nbsp;STEP:&nbsp;' + motiveStepThreshold + '&nbsp;SECONDS';
                    }
                } else {
                    motiveStepFilterExceeded = '';
                    motiveStepFilterWithin = '';
                }
                break;
            case 'AgentStepThreshold':
                if ($(element).val() != '') {
                    agentStepFilterExceeded = ' AND elapsed_seconds >= "' + $(element).val() + '" ';
                    agentStepFilterWithin = ' AND elapsed_seconds < "' + $(element).val() + '" ';
                    agentStepThreshold = $(element).val();
                    if (parameters == '') {
                        parameters = 'AGENT&nbsp;STEP:&nbsp' + agentStepThreshold + ' &nbspSECONDS';
                    } else {
                        parameters = parameters + ' AGENT&nbsp;STEP:&nbsp;' + agentStepThreshold + '&nbsp;SECONDS';
                    }
                } else {
                    agentStepFilterExceeded = '';
                    agentStepFilterWithin = '';
                }
                break;
            case 'SessionThreshold':
                if ($(element).val() != '') {
                    sessionThresholdFilterExceeded = ' AND elapsed_seconds >= "' + $(element).val() + '" ';
                    sessionThresholdFilterWithin = ' AND elapsed_seconds < "' + $(element).val() + '" ';
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
                    attUID = '';
                }
                break;
            case 'BusinessLineSel':
                if ($(element).val() != '') {
                    businessLineFilter = 'AND (';
                    if (parameters === '') {
                        parameters = 'BUSINESS&nbsp;LINE:&nbsp;[';
                    } else {
                        parameters = parameters + ' BUSINESS&nbsp;LINE:&nbsp;[';
                    }
                    var businessLine = $(element).val();
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
                    businessLine = '';
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
                    var workSource = $(element).val();
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
                    workSource = '';
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
                    var taskType = $(element).val();
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
                    taskType = '';
                }
                break;
            case 'CitySel':
                if ($(element).val() != '') {
                    cityFilter = 'AND (';
                    if (parameters == '') {
                        parameters = 'CITY: [';
                    } else {
                        parameters = parameters + '&nbsp;CITY:&nbsp;[';
                    }
                    var city = $(element).val();
                    $.each(city, function (key, value) {
                        if (key == 0) {
                            cityFilter = cityFilter + 'city = "' + value + '"';
                            parameters = parameters + value;
                        } else {
                            cityFilter = cityFilter + ' OR city = "' + value + '"';
                            parameters = parameters + ', ' + value;
                        }
                    });
                    cityFilter = cityFilter + ') ';
                    parameters = parameters + ']';
                } else {
                    cityFilter = '';
                    city = '';
                }
                break;
            case 'AssetIdSel':
                if ($(element).val() != '') {
                    assetIdFilter = 'AND (';
                    if (parameters == '') {
                        parameters = 'ASSET: [';
                    } else {
                        parameters = parameters + '&nbsp;ASSET:&nbsp;[';
                    }
                    var assetId = $(element).val();
                    $.each(assetId, function (key, value) {
                        if (key == 0) {
                            assetIdFilter = assetIdFilter + 'LTRIM(RTRIM(asset_id)) = "' + value + '"';
                            parameters = parameters + value;
                        } else {
                            assetIdFilter = assetIdFilter + ' OR LTRIM(RTRIM(asset_id)) = "' + value + '"';
                            parameters = parameters + ', ' + value;
                        }
                    });
                    assetIdFilter = assetIdFilter + ') ';
                    parameters = parameters + ']';
                } else {
                    assetIdFilter = '';
                    assetId = '';
                }
                break;
            case 'SessionId':
                if ($(element).val() != '') {
                    var sessionIdFilter = ' AND smp_session_id LIKE "%' + $(element).val().trim() + '%" ';
                } else {
                    sessionIdFilter = '';
                }
                break;
            case 'MinimumCountSel':
                if ($(element).val() != '') {
                    var value = $(element).val();
                    minimumCountFilter = 'HAVING instance_count >="' + value + '"';
                    if (parameters == '') {
                        parameters = 'MINIMUM&nbsp;COUNT:&nbsp;[' + value;
                    } else {
                        parameters = parameters + '&nbsp;MINIMUM&nbsp;COUNT:&nbsp;[' + value;
                    }
                    parameters = parameters + ']';
                } else {
                    minimumCountFilter = '';
                }
                break;
            }
        });
        switch (reportType) {
        case 'AllAutomation':
            if (parameters == '') {
                titleText = 'MOTIVE STEPS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss');
            } else {
                titleText = 'MOTIVE STEPS THAT TAKING ' + motiveStepThreshold + ' OR MORE SECONDS TO COMPLETE STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + '<br /><small><i>' + parameters + '</i></small>';
            }
            var sql = 'SELECT smp_session_id, start_time, stop_time, SEC_TO_TIME(elapsed_seconds) AS automation_step_duration, att_uid, CONCAT(last_name, ", ", first_name) AS agent_name, IF(manager_id IS NULL, "Not Available", manager_id) AS manager_id, IF(work_source IS NULL, "Not Available", work_source) as work_source, IF(business_line IS NULL, "Not Available", business_line) AS business_line, IF(task_type IS NULL, "", task_type) AS task_type, flow_name FROM duration_log_step_automation WHERE in_progress = "N" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '"))' + motiveStepFilterExceeded + attUIDFilter + workSourceFilter + businessLineFilter + taskTypeFilter + + cityFilter + ' ORDER BY start_time ASC';
            break;
        case 'AllManual':
            if (parameters == '') {
                titleText = 'AGENT STEPS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss');
            } else {
                titleText = 'AGENT STEPS TAKING ' + agentStepThreshold + ' OR MORE SECONDS TO COMPLETE STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + '<br /><small><i>' + parameters + '</i></small>';
            }
            sql = 'SELECT smp_session_id, start_time, stop_time, SEC_TO_TIME(elapsed_seconds) AS manual_step_duration, att_uid, CONCAT(last_name, ", ", first_name) AS agent_name, IF(manager_id IS NULL, "Not Available", manager_id) AS manager_id, IF(work_source IS NULL, "Not Available", work_source) AS work_source, IF(business_line IS NULL, "Not Available", business_line) AS business_line, IF(task_type IS NULL, "", task_type) AS task_type, flow_name, step_name FROM duration_log_step_manual WHERE in_progress = "N" AND (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '")) ' + agentStepFilterExceeded + attUIDFilter + workSourceFilter + businessLineFilter + taskTypeFilter +  cityFilter + 'ORDER BY start_time';
            break;
        case 'AllWorkflow':
            if (parameters == '') {
                titleText = 'WORKFLOW SESSION DATA FOR SESSIONS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss');
            } else {
                titleText = 'WORKFLOW SESSION DATA FOR SESSIONS TAKING ' + sessionThreshold + ' OR MORE SECONDS TO COMPLETE STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + '<br /><small><i>' + parameters + '</i></small>';
            }
            sql = 'SELECT smp_session_id, start_time, stop_time, SEC_TO_TIME(elapsed_seconds) AS manual_step_duration, att_uid, CONCAT(last_name, ", ", first_name) AS agent_name, IF(manager_id IS NULL, "Not Available", manager_id) AS manager_id, IF(work_source IS NULL, "Not Available", work_source) AS work_source, IF(business_line IS NULL, "Not Available", business_line) AS business_line, IF(task_type IS NULL, "", task_type) AS task_type FROM duration_log_session WHERE (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '")) ' + sessionThresholdFilterExceeded + attUIDFilter + workSourceFilter + businessLineFilter + taskTypeFilter + cityFilter + 'ORDER BY start_time';
            break;
        case 'Screenshots':
            titleText = 'WORKFLOW SESSION DATA FOR SESSIONS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + '<br /><small><i>DOUBLE CLICK ON A ROW FROM THE LIST TO VIEW THE ASSOCIATED SCREENSHOTS</i></small>';
            sql = 'SELECT smp_session_id, start_time, stop_time, SEC_TO_TIME(elapsed_seconds) AS manual_step_duration, att_uid, CONCAT(last_name, ", ", first_name) AS agent_name, IF(manager_id IS NULL, "Not Available", manager_id) AS manager_id, IF(work_source IS NULL, "Not Available", work_source) AS work_source, IF(business_line IS NULL, "Not Available", business_line) AS business_line, IF(task_type IS NULL, "", task_type) AS task_type FROM duration_log_session WHERE (start_time BETWEEN("' + startDate + '") AND ("' + endDate + '")) ' + sessionIdFilter + attUIDFilter + workSourceFilter + businessLineFilter + taskTypeFilter + cityFilter + ' ORDER BY start_time';
            break;
        }
        $.ajax({
            type: 'post',
            url: 'ajax/requestData.php',
            data: {
                databaseIP: dbHost,
                databaseUser: dbUser,
                databasePW: dbPassword,
                databaseName: dbName,
                agentStepFilterExceeded: agentStepFilterExceeded,
                agentStepFilterWithin: agentStepFilterWithin,
                agentStepThreshold: agentStepThreshold,
                assetIdFilter: assetIdFilter,
                attUIDFilter: attUIDFilter,
                businessLineFilter: businessLineFilter,
                cityFilter: cityFilter,
                endDate: endDate,
                minimumCountFilter: minimumCountFilter,
                motiveStepFilterExceeded: motiveStepFilterExceeded,
                motiveStepFilterWithin: motiveStepFilterWithin,
                motiveStepThreshold: motiveStepThreshold,
                reportType: reportType,
                sessionThreshold: sessionThreshold,
                sessionThresholdFilterExceeded: sessionThresholdFilterExceeded,
                sessionThresholdFilterWithin: sessionThresholdFilterWithin,
                startDate: startDate,
                taskTypeFilter: taskTypeFilter,
                workSourceFilter: workSourceFilter
            },
            dataType: 'json',
        }).done(function (data) {
            $('span#statusText').html('PREPARING REPORT DATA: <span id="progressPct">0%</span>');
            switch (reportType) {
            case 'MotiveStepsOverThreshold':
                var titleText = 'MOTIVE STEPS THAT HAVE ONE OR MORE MOTIVE STEP TAKING ' + motiveStepThreshold + ' OR MORE SECONDS TO COMPLETE STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + '<br /><small><i>' + parameters + '</i></small>';
                $('div#reportBody').html('<h3 class="text-center">' + $('select#ReportType :selected').text() + '</h3><h5 class="text-center">' + titleText + '</h5><table id="results" class="table table-bordered center hover-highlight"><thead><tr><th colspan=9 class="sorter-false"><div class="col-sm-1 hidden-print text-left"><img class="tableIcon reset clear-filters" report="MotiveStepsOverThreshold" src="stylesheets/images/clear-filters.png"><img class="tableIcon csv" src="stylesheets/images/csv.png"><img class="tableIcon print" src="stylesheets/images/print.png"></div><div class="col-sm-10 text-center">' + $('select#ReportType :selected').text() + '</div></th></tr><tr><th class="sorter-false"></th><th colspan=2 class="sorter-false text-center">TOTAL</th><th colspan=3 class="sorter-false text-center">WITHIN ' + motiveStepThreshold + ' SECONDS</th><th colspan=3 class="sorter-false text-center">OVER ' + motiveStepThreshold + ' SECONDS</th></tr><tr><th class="text-center sortInitialOrder-asc group-separator">FLOW NAME CONTAINING STEP</th><th class="text-center group-false">COUNT</th><th class="filter-false text-center group-false">AVERAGE <br />DURATION</th><th class="text-center group-false">COUNT</th><th class="filter-false text-center group-false">AVERAGE <br />DURATION</th><th class="text-center group-false">PERCENTAGE</th><th class="text-center group-false">COUNT</th><th class="filter-false text-center group-false">AVERAGE <br />DURATION</th><th class="text-center group-false">PERCENTAGE</th></tr></thead><tbody></tbody></table>');
                if (useWebWorker) {
                    var worker = new Worker('webworkers/motiveStepsOverThreshold.js');
                    worker.postMessage(data);
                    worker.onmessage = function(e) {
                        data = e.data;
                        if (data.hasOwnProperty('reportProgress')) {
                            var reportProgress = data.reportProgress;
                            $('span#progressPct').html(reportProgress + '%');
                        }
                        if (data.hasOwnProperty('reportRow')) {
                            var reportRow = data.reportRow;
                            $('table#results tbody').append(reportRow);
                        }
                        if (data.hasOwnProperty('reportError')) {
                            showReport('error');
                            return;
                        }
                        if (data.hasOwnProperty('reportSuccess')) {
                            showReport('success');
                        }
                    };
                } else {
                    var recordSize = data.length;
                    var recordCount = 0;
                    /* If your data contained an 'ERROR' property send the error result and exit out */
                    if (data.hasOwnProperty('ERROR')) {
                        $('table#results tbody').append('<tr><td colspan=9 class="text-center">' + data.ERROR + '</td></tr>');
                        showReport('error');
                        return;
                    }
                    data.forEach(function(dataRow) {
                        recordCount++;
                        dataRow.percent_standard = (dataRow.count_standard / dataRow.count * 100).toFixed(2) + '%';
                        dataRow.percent_slow = (dataRow.count_slow / dataRow.count * 100).toFixed(2) + '%';
                        $('table#results tbody').append('<tr><td class="text-left">' + dataRow.flow_name + '</td><td class="text-right">' + dataRow.count + '</td><td class="text-right">' + dataRow.average + '</td><td class="text-right">' + dataRow.count_standard + '</td><td class="text-right">' + dataRow.average_standard + '</td><td class="text-right">' + dataRow.percent_standard + '</td><td class="text-right">' + dataRow.count_slow + '</td><td class="text-right">' + dataRow.average_slow + '</td><td class="text-right">' + dataRow.percent_slow + '</td></tr>');
                        var reportProgress = Math.floor(recordCount/recordSize * 100);
                        $('span#progressPct').html(reportProgress + '%');
                    });
                    showReport('success');
                }
                break;

            case 'AgentStepsOverThreshold':
                titleText = 'AGENT STEPS THAT HAVE ONE OR MORE AGENT STEP TAKING ' + agentStepThreshold + ' OR MORE SECONDS TO COMPLETE STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + '<br /><small><i>' + parameters + '</i></small>';
                $('div#reportBody').html('<h3 class="text-center">' + $('select#ReportType :selected').text() + '</h3><h5 class="text-center">' + titleText + '</h5><table id="results" class="table table-bordered center hover-highlight"><thead><tr><th colspan=10 class="sorter-false text-center"><div class="col-sm-1 hidden-print text-left"><img class="tableIcon reset clear-filters" report="SlowManualSummary" src="stylesheets/images/clear-filters.png"><img class="tableIcon csv" src="stylesheets/images/csv.png"><img class="tableIcon print" src="stylesheets/images/print.png"></div><div class="col-sm-10 text-center">' + $('select#ReportType :selected').text() + '</div></th></tr><tr><th colspan=2 class="sorter-false"></th><th colspan=2 class="sorter-false text-center">TOTAL</th><th colspan=3 class="sorter-false text-center">WITHIN ' + agentStepThreshold + ' SECONDS</th><th colspan=3 class="sorter-false text-center">OVER ' + agentStepThreshold + ' SECONDS</th></tr><tr><th class="text-center sortInitialOrder-asc group-separator">FLOW NAME</th><th class="text-center sortInitialOrder-asc group-false">STEP NAME</th><th class="text-center group-false">COUNT</th><th class="filter-false text-center group-false">AVERAGE <br />DURATION</th><th class="text-center group-false">COUNT</th><th class="filter-false text-center group-false">AVERAGE <br />DURATION</th><th class="text-center group-false">PERCENTAGE</th><th class="text-center group-false">COUNT</th><th class="filter-false text-center group-false">AVERAGE <br />DURATION</th><th class="text-center group-false">PERCENTAGE</th></tr></thead><tbody></tbody></table>');
                if (useWebWorker) {
                    worker = new Worker('webworkers/agentStepsOverThreshold.js');
                    worker.postMessage(data);
                    worker.onmessage = function(e) {
                        data = e.data;
                        if (data.hasOwnProperty('reportProgress')) {
                            var reportProgress = data.reportProgress;
                            $('span#progressPct').html(reportProgress + '%');
                        }
                        if (data.hasOwnProperty('reportRow')) {
                            var reportRow = data.reportRow;
                            $('table#results tbody').append(reportRow);
                        }
                        if (data.hasOwnProperty('reportError')) {
                            showReport('error');
                            return;
                        }
                        if (data.hasOwnProperty('reportSuccess')) {
                            showReport('success');
                        }
                    };
                } else {
                    recordSize = data.length;
                    recordCount = 0;
                    /* If your data contained an 'ERROR' property send the error result and exit out */
                    if (data.hasOwnProperty('ERROR')) {
                        $('table#results tbody').append('<tr><td colspan=10 class="text-center">' + data.ERROR + '</td></tr>');
                        showReport('error');
                        return;
                    }
                    data.forEach(function(dataRow) {
                        recordCount++;
                        dataRow.percent_standard = (dataRow.count_standard / dataRow.count * 100).toFixed(2) + '%';
                        dataRow.percent_slow = (dataRow.count_slow / dataRow.count * 100).toFixed(2) + '%';
                        $('table#results tbody').append('<tr><td class="text-left">' + dataRow.flow_name + '</td><td class="text-left">' + dataRow.step_name + '</td><td class="text-right">' + dataRow.count + '</td><td class="text-right">' + dataRow.average + '</td><td class="text-right">' + dataRow.count_standard + '</td><td class="text-right">' + dataRow.average_standard + '</td><td class="text-right">' + dataRow.percent_standard + '</td><td class="text-right">' + dataRow.count_slow + '</td><td class="text-right">' + dataRow.average_slow + '</td><td class="text-right">' + dataRow.percent_slow + '</td></tr>');
                        var reportProgress = Math.floor(recordCount/recordSize * 100);
                        $('span#progressPct').html(reportProgress + '%');
                    });
                    showReport('success');
                }
                break;

            case 'AgentPerformanceByAgent':
                titleText = 'WORKFLOW PERFORMANCE SUMMARY BY AGENT FOR SESSIONS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + '<br /><small><i>' + parameters + '</i></small>';
                $('div#reportBody').html('<h3 class="text-center">' + $('select#ReportType :selected').text() + '</h3><h5 class="text-center">' + titleText + '</h5><table id="results" class="table table-bordered center hover-highlight"><thead><tr><th colspan=11 class="sorter-false text-center"><div class="col-sm-1 hidden-print text-left"><img class="tableIcon reset clear-filters" report="AgentSummary" src="stylesheets/images/clear-filters.png"><img class="tableIcon csv" src="stylesheets/images/csv.png"><img class="tableIcon print" src="stylesheets/images/print.png"></div><div class="col-sm-10 text-center">' + $('select#ReportType :selected').text() + '</div></th></tr><tr><th colspan=3 class="text-center sorter-false"></th><th colspan=2 class="text-center sorter-false">COMPLETED WORKFLOWS</th><th colspan=2 class="text-center sorter-false">WORKFLOW <br />DURATION <br />>=' + sessionThreshold + ' SECONDS</th><th colspan=2 class="text-center sorter-false">WORKFLOWS CONTAINING <br />MOTIVE STEP <br />>=' + motiveStepThreshold + ' SECONDS</th><th colspan=2 class="text-center sorter-false">WORKFLOWS CONTAINING <br />AGENT STEP <br />>=' + agentStepThreshold + ' SECONDS</th></tr><tr><th class="text-center sortInitialOrder-asc group-false">AGENT NAME</th><th class="text-center sortInitialOrder-asc group-false">ATT UID</th><th class="text-center sortInitialOrder-asc group-text">MANAGER ATT UID</th><th class="text-center filter-false group-false">AVG DURATION</th><th class="text-center group-false">COUNT</th><th class="text-center group-false">COUNT</th><th class="text-center group-false">PERCENTAGE</th><th class="text-center group-false">COUNT</th><th class="text-center group-false">PERCENTAGE</th><th class="text-center group-false">COUNT</th><th class="text-center group-false">PERCENTAGE</th></tr></thead><tbody></tbody></table>');
                if (useWebWorker) {
                    worker = new Worker('webworkers/agentPerformanceByAgent.js');
                    worker.postMessage(data);
                    worker.onmessage = function(e) {
                        data = e.data;
                        if (data.hasOwnProperty('reportProgress')) {
                            var reportProgress = data.reportProgress;
                            $('span#progressPct').html(reportProgress + '%');
                        }
                        if (data.hasOwnProperty('reportRow')) {
                            var reportRow = data.reportRow;
                            $('table#results tbody').append(reportRow);
                        }
                        if (data.hasOwnProperty('reportError')) {
                            showReport('error');
                            return;
                        }
                        if (data.hasOwnProperty('reportSuccess')) {
                            showReport('success');
                        }
                    };
                } else {
                    recordSize = data.length;
                    recordCount = 0;
                    /* If your data contained an 'ERROR' property send the error result and exit out */
                    if (data.hasOwnProperty('ERROR')) {
                        $('table#results tbody').append('<tr><td colspan=11 class="text-center">' + data.ERROR + '</td></tr>');
                        showReport('error');
                        return;
                    }
                    data.forEach(function(dataRow) {
                        recordCount++;
                        $('table#results tbody').append('<tr><td class="text-left">' + dataRow.agent_name + '</td><td class="text-left">' + dataRow.att_uid + '</td><td class="text-left">' + dataRow.manager_id + '</td><td class="text-center">' + dataRow.session_average + '</td><td class="text-right">' + dataRow.count_completed + '</td><td class="text-right">' + dataRow.count_slow_workflow + '</td><td class="text-right">' + dataRow.percent_slow_workflow + '%</td><td class="text-right">' + dataRow.count_slow_motive + '</td><td class="text-right">' + dataRow.percent_slow_motive + '%</td><td class="text-right">' + dataRow.count_slow_agent + '</td><td class="text-right">' + dataRow.percent_slow_agent + '%</td>');
                        var reportProgress = Math.floor(recordCount/recordSize * 100);
                        $('span#progressPct').html(reportProgress + '%');
                    });
                    showReport('success');
                }
                break;

            case 'AgentPerformanceBySession':
                titleText = 'AGENT PERFORMANCE SUMMARY FOR SESSIONS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + '<br /><small><i>' + parameters + '</i></small>';
                $('div#reportBody').html('<h3 class="text-center">' + $('select#ReportType :selected').text() + '</h3><h5 class="text-center">' + titleText + '</h5><table id="results" class="table table-bordered center hover-highlight"><thead><tr><th colspan=19 class="sorter-false text-center"><div class="col-sm-1 hidden-print text-left"><img class="tableIcon reset clear-filters" report="AgentperformanceBySession" src="stylesheets/images/clear-filters.png"><img class="tableIcon csv" src="stylesheets/images/csv.png"><img class="tableIcon print" src="stylesheets/images/print.png"></div><div class="col-sm-10 text-center">' + $('select#ReportType :selected').text() + '</div></th></tr><tr><th colspan=7 class="text-center sorter-false">WORKFLOW DATA</th><th colspan=3 class="text-center sorter-false">MOTIVE STEPS <br />< ' + motiveStepThreshold + ' SECONDS</th><th colspan=3 class="text-center sorter-false">MOTIVE STEPS <br />>=' + motiveStepThreshold + ' SECONDS</th><th colspan=3 class="text-center sorter-false">AGENT STEPS <br />< ' + agentStepThreshold + ' SECONDS</th><th colspan=3 class="text-center sorter-false">AGENT STEP <br />>=' + agentStepThreshold + ' SECONDS</th></tr><tr><th class="text-center filter-false group-false">START TIME</th><th class="text-left sortInitialOrder-asc group-text">AGENT NAME</th><th class="text-center sortInitialOrder-asc group-text">MANAGER ATT UID</th><th class="text-center sortInitialOrder-asc group-text">WORK TYPE</th><th class="text-center sortInitialOrder-asc group-text">BUSINESS LINE</th><th class="text-center sortInitialOrder-asc group-text">TASK TYPE</th><th class="text-center filter-false group-false">WORKFLOW DURATION</th><th class="text-center group-false">COUNT</th><th class="text-center filter-false group-false">TOTAL <br />TIME</th><th class="text-center group-false">PERCENTAGE</th><th class="text-center group-false">COUNT</th><th class="text-center filter-false group-false">TOTAL <br />TIME</th><th class="text-center group-false">PERCENTAGE</th><th class="text-center group-false">COUNT</th><th class="text-center filter-false group-false">TOTAL <br />TIME</th><th class="text-center group-false">PERCENTAGE</th><th class="text-center group-false">COUNT</th><th class="text-center filter-false group-false">TOTAL <br />TIME</th><th class="text-center group-false">PERCENTAGE</th></tr></thead><tbody></tbody></table>');
                if (useWebWorker) {
                    worker = new Worker('webworkers/agentPerformanceBySession.js');
                    worker.postMessage(data);
                    worker.onmessage = function(e) {
                        data = e.data;
                        if (data.hasOwnProperty('reportProgress')) {
                            var reportProgress = data.reportProgress;
                            $('span#progressPct').html(reportProgress + '%');
                        }
                        if (data.hasOwnProperty('reportRow')) {
                            var reportRow = data.reportRow;
                            $('table#results tbody').append(reportRow);
                        }
                        if (data.hasOwnProperty('reportError')) {
                            showReport('error');
                            return;
                        }
                        if (data.hasOwnProperty('reportSuccess')) {
                            showReport('success');
                        }
                    };
                } else {
                    recordSize = data.length;
                    recordCount = 0;
                    /* If your data contained an 'ERROR' property send the error result and exit out */
                    if (data.hasOwnProperty('ERROR')) {
                        $('table#results tbody').append('<tr><td colspan=19 class="text-center">' + data.ERROR + '</td></tr>');
                        showReport('error');
                        return;
                    }
                    data.forEach(function(dataRow) {
                        recordCount++;
                        var start_time = moment(new Date(dataRow.start_time)).format('MM/DD/YYYY HH:mm:ss');
                        var stop_time = moment(new Date(dataRow.stop_time)).format('MM/DD/YYYY HH:mm:ss');
                        var total_motive_count = Number(dataRow.count_motive_within) + Number(dataRow.count_motive_exceeded);
                        var total_agent_count = Number(dataRow.count_agent_within) + Number(dataRow.count_agent_exceeded);
                        if (total_motive_count > 0) {
                            var percent_motive_within = (dataRow.count_motive_within / total_motive_count * 100).toFixed(2) + '%';
                            var percent_motive_exceeded = (dataRow.count_motive_exceeded / total_motive_count * 100).toFixed(2) + '%';
                        } else {
                            percent_motive_within = '0.00%';
                            percent_motive_exceeded = '0.00%';
                        }
                        if (total_agent_count > 0) {
                            var percent_agent_within = (dataRow.count_agent_within / total_agent_count * 100).toFixed(2) + '%';
                            var percent_agent_exceeded = (dataRow.count_agent_exceeded / total_agent_count * 100).toFixed(2) + '%';
                        } else {
                            percent_agent_within = '0.00%';
                            percent_agent_exceeded = '0.00%';
                        }
                        $('table#results tbody').append('<tr><td class="text-center">' + start_time + '</td><td class="text-left">' + dataRow.agent_name + ' (' + dataRow.att_uid + ')' + '</td><td class="text-left">' + dataRow.manager_id + '</td><td class="text-left">' + dataRow.work_source + '</td><td class="text-left">' + dataRow.business_line + '</td><td class="text-left">' + dataRow.task_type + '</td><td class="text-center">' + dataRow.session_duration + '</td><td class="text-right">' + dataRow.count_motive_within + '</td><td class="text-center">' + dataRow.duration_motive_within + '</td><td class="text-right">' + percent_motive_within + '</td><td class="text-right">' + dataRow.count_motive_exceeded + '</td><td class="text-center">' + dataRow.duration_motive_exceeded + '</td><td class="text-right">' + percent_motive_exceeded + '</td><td class="text-right">' + dataRow.count_agent_within + '</td><td class="text-center">' + dataRow.duration_agent_within + '</td><td class="text-right">' + percent_agent_within + '</td><td class="text-right"> ' + dataRow.count_agent_exceeded + '</td><td>' + dataRow.duration_agent_exceeded + '<td class="text-right">' + percent_agent_exceeded + '</td></tr>');
                        var reportProgress = Math.floor(recordCount/recordSize * 100);
                        $('span#progressPct').html(reportProgress + '%');
                    });
                    showReport('success');
                }
                break;

            case 'AssetHistoryNonAWS':
                titleText = 'WORKFLOW HISTORY BY ASSET (NON AWS) FOR WORKFLOW STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + '<br /><small><i>' + parameters + '</i></small>';
                $('div#reportBody').html('<h3 class="text-center">' + $('select#ReportType :selected').text() + '</h3><h5 class="text-center">' + titleText + '</h5><table id="results" class="table table-bordered center hover-highlight"><thead><tr><th colspan=11 class="sorter-false filter-false text-center"><div class="col-sm-1 hidden-print text-left"><img class="tableIcon reset clear-filters" report="AssetHistory" src="stylesheets/images/clear-filters.png"><img class="tableIcon csv" src="stylesheets/images/csv.png"><img class="tableIcon print" src="stylesheets/images/print.png"></div><div class="col-sm-11 text-center">' + $('select#ReportType :selected').text() + '</div></th></tr><tr><th class="text-center sorter-false filter-false group-false">ASSET</th><th class="text-center sorter-false filter-false group-false">INSTANCE COUNT</th><th class="text-center sorter-false filter-false group-false">SESSION ID</th><th class="text-center sorter-false filter-false group-false">TICKET NUMBER</th><th class="text-center sorter-false filter-false group-false">WORK TYPE</th><th class="text-center sorter-false filter-false group-false">TASK TYPE</th><th class="text-center sorter-false filter-false group-false">START TIME</th><th class="text-center sorter-false filter-false group-false">COMPLETION TIME</th><th class="text-center sorter-false filter-false group-false">ELAPSED SINCE LAST WORKFLOW</th><th class="text-center sorter-false filter-false group-false">WORKFLOW DURATION</th><th class="text-center sorter-false filter-false group-false">ELAPSED TIME FOR ASSET</th></tr></thead><tbody></tbody><table>');
                if (useWebWorker) {
                    worker = new Worker('webworkers/assetHistoryNonAWS.js');
                    worker.postMessage(data);
                    worker.onmessage = function(e) {
                        data = e.data;
                        if (data.hasOwnProperty('reportProgress')) {
                            var reportProgress = data.reportProgress;
                            $('span#progressPct').html(reportProgress + '%');
                        }
                        if (data.hasOwnProperty('reportRow')) {
                            var reportRow = data.reportRow;
                            $('table#results tbody').append(reportRow);
                        }
                        if (data.hasOwnProperty('reportError')) {
                            showReport('error');
                            return;
                        }
                        if (data.hasOwnProperty('reportSuccess')) {
                            showReport('success');
                        }
                    };
                } else {
                    recordSize = data.length;
                    recordCount = 0;
                    /* If your data contained an 'ERROR' property send the error result and exit out */
                    if (data.hasOwnProperty('ERROR')) {
                        $('table#results tbody').append('<tr><td colspan=11 class="text-center">' + data.ERROR + '</td></tr>');
                        showReport('error');
                        return;
                    }
                    var last_asset = '';
                    var total_elapsed_time = 0;
                    data.forEach(function(dataRow) {
                        recordCount++;
                        var start_time = moment(dataRow.start_time);
                        var stop_time = moment(dataRow.stop_time);
                        total_elapsed_time = total_elapsed_time + moment(stop_time).diff(start_time, 'seconds');
                        var elapsed_time = moment.duration(moment(stop_time).diff(start_time, 'seconds'), 'seconds').format('d [days] HH:mm:ss', {
                            stopTrim: 'h',
                            forceLength: true
                        });
                        var total_elapsed_display  = moment.duration(total_elapsed_time, 'seconds').format('d [days] HH:mm:ss', {
                            stopTrim: 'h',
                            forceLength: true
                        });
                        if (dataRow.asset_id != last_asset) {
                            last_asset = dataRow.asset_id;
                            $('table#results tbody').append('<tr><td class="text-right">' + dataRow.asset_id + '</td><td class="text-right">' + dataRow.count + '</td><td class="text-left">' + dataRow.session_id + '</td><td class="text-right">' + dataRow.ticket_number +'</td><td class="text-right">' + dataRow.work_type + '</td><td class="text-right">' + dataRow.task_type + '</td><td class="text-right">' + start_time.format('MM/DD/YYYY HH:mm:ss') + '</td><td class="text-right">' + stop_time.format('MM/DD/YYYY HH:mm:ss') + '</td><td> </td><td class="text-right">' + elapsed_time + '</td><td class="text-right">' + total_elapsed_display + '</td></tr>');
                            var previous_stop_time = stop_time;
                            total_elapsed_time = 0;
                        } else {
                            previous_stop_time = moment(previous_stop_time);
                            var elapsed_since_previous_display = moment.duration(moment(start_time).diff(previous_stop_time, 'seconds'), 'seconds').format('d [days] HH:mm:ss', {
                                stopTrim: 'h',
                                forceLength: true
                            });
                            var elapsed_since_previous = moment.duration(moment(start_time).diff(previous_stop_time, 'seconds'), 'seconds');
                            if (elapsed_since_previous < 0) {
                                var errorClass = ' error';
                            } else {
                                errorClass = '';
                            }
                            previous_stop_time = stop_time;
                            $('table#results tbody').append('<tr><td> </td><td> </td><td class="text-left">' + dataRow.session_id + '</td><td class="text-right">' + dataRow.ticket_number +'</td><td class="text-right">' + dataRow.work_type + '</td><td class="text-right">' + dataRow.task_type + '</td><td class="text-right">' + start_time.format('MM/DD/YYYY HH:mm:ss') + '</td><td class="text-right">' + stop_time.format('MM/DD/YYYY HH:mm:ss') + '</td><td class="text-right' + errorClass + '">' + elapsed_since_previous_display + '</td><td class="text-right">' + elapsed_time + '</td><td class="text-right">' + total_elapsed_display + '</td></tr>');
                        }
                        var reportProgress = Math.floor(recordCount/recordSize * 100);
                        $('span#progressPct').html(reportProgress + '%');
                    });
                    showReport('success');
                }
                break;

            case 'AssetHistoryAWS':
                titleText = 'WORKFLOW HISTORY BY ASSET BY ASSET / CONTACT / ROOM (AWS ONLY) FOR WORKFLOW STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + '<br /><small><i>' + parameters + '</i></small>';
                $('div#reportBody').html('<h3 class="text-center">' + $('select#ReportType :selected').text() + '</h3><h5 class="text-center">' + titleText + '</h5><table id="results" class="table table-bordered center hover-highlight"><thead><tr><th colspan=13 class="sorter-false filter-false text-center"><div class="col-sm-1 hidden-print text-left"><img class="tableIcon reset clear-filters" report="AssetHistoryNonAWS" src="stylesheets/images/clear-filters.png"><img class="tableIcon csv" src="stylesheets/images/csv.png"><img class="tableIcon print" src="stylesheets/images/print.png"></div><div class="col-sm-11 text-center">' + $('select#ReportType :selected').text() + '</div></th></tr><tr><th class="text-center sorter-false filter-false group-false">ASSET / LOCATION</th><th class="text-center sorter-false filter-false group-false">INSTANCE COUNT</th><th class="text-center sorter-false filter-false group-false">CONTACT NAME</th><th class="text-center sorter-false filter-false group-false">ROOM NUMBER</th><th class="text-center sorter-false filter-false group-false">SESSION ID</th><th class="text-center sorter-false filter-false group-false">TICKET NUMBER</th><th class="text-center sorter-false filter-false group-false">WORK TYPE</th><th class="text-center sorter-false filter-false group-false">TASK TYPE</th><th class="text-center sorter-false filter-false group-false">START TIME</th><th class="text-center sorter-false filter-false group-false">COMPLETION TIME</th><th class="text-center sorter-false filter-false group-false">ELAPSED SINCE LAST WORKFLOW</th><th class="text-center sorter-false filter-false group-false">WORKFLOW DURATION</th><th class="text-center sorter-false filter-false group-false">ELAPSED TIME FOR ASSET</th></tr></thead><tbody></tbody><table>');
                if (useWebWorker) {
                    worker = new Worker('webworkers/assetHistoryAWS.js');
                    worker.postMessage(data);
                    worker.onmessage = function(e) {
                        data = e.data;
                        if (data.hasOwnProperty('reportProgress')) {
                            var reportProgress = data.reportProgress;
                            $('span#progressPct').html(reportProgress + '%');
                        }
                        if (data.hasOwnProperty('reportRow')) {
                            var reportRow = data.reportRow;
                            $('table#results tbody').append(reportRow);
                        }
                        if (data.hasOwnProperty('reportError')) {
                            showReport('error');
                            return;
                        }
                        if (data.hasOwnProperty('reportSuccess')) {
                            showReport('success');
                        }
                    };
                } else {
                    recordSize = data.length;
                    recordCount = 0;
                    /* If your data contained an 'ERROR' property send the error result and exit out */
                    if (data.hasOwnProperty('ERROR')) {
                        $('table#results tbody').append('<tr><td colspan=11 class="text-center">' + data.ERROR + '</td></tr>');
                        showReport('error');
                        return;
                    }
                    recordCount++;
                    var lastKey = '';
                    total_elapsed_time = 0;
                    data.forEach(function(dataRow) {
                        recordCount++;
                        var start_time = moment(dataRow.start_time);
                        var stop_time = moment(dataRow.stop_time);
                        total_elapsed_time = total_elapsed_time + moment(stop_time).diff(start_time, 'seconds');
                        var elapsed_time = moment.duration(moment(stop_time).diff(start_time, 'seconds'), 'seconds').format('d [days] HH:mm:ss', {
                            stopTrim: 'h',
                            forceLength: true
                        });
                        var total_elapsed_display  = moment.duration(total_elapsed_time, 'seconds').format('d [days] HH:mm:ss', {
                            stopTrim: 'h',
                            forceLength: true
                        });
                        if (dataRow.rowKey != lastKey) {
                            lastKey = dataRow.rowKey;
                            if (dataRow.venue_name != '') {
                                var asset_display = dataRow.asset_id + ' - ' + dataRow.venue_name;
                            }	else {
                                asset_display = dataRow.asset_id;
                            }
                            $('table#results tbody').append('<tr><td class="text-right">' + asset_display + '</td><td class="text-right">' + dataRow.count + '</td><td class="text-left">' + dataRow.contact_name + '</td><td class="text-left">' + dataRow.room_number + '</td><td class="text-left">' + dataRow.session_id + '</td><td class="text-right">' + dataRow.ticket_number +'</td><td class="text-right">' + dataRow.work_type + '</td><td class="text-right">' + dataRow.task_type + '</td><td class="text-right">' + start_time.format('MM/DD/YYYY HH:mm:ss') + '</td><td class="text-right">' + stop_time.format('MM/DD/YYYY HH:mm:ss') + '</td><td> </td><td class="text-right">' + elapsed_time + '</td><td class="text-right">' + total_elapsed_display + '</td></tr>');
                            var previous_stop_time = stop_time;
                            total_elapsed_time = 0;
                        } else {
                            previous_stop_time = moment(previous_stop_time);
                            var elapsed_since_previous_display = moment.duration(moment(start_time).diff(previous_stop_time, 'seconds'), 'seconds').format('d [days] HH:mm:ss', {
                                stopTrim: 'h',
                                forceLength: true
                            });
                            var elapsed_since_previous = moment.duration(moment(start_time).diff(previous_stop_time, 'seconds'), 'seconds');
                            if (elapsed_since_previous < 0) {
                                var errorClass = ' error';
                            } else {
                                errorClass = '';
                            }
                            previous_stop_time = stop_time;
                            $('table#results tbody').append('<tr><td> </td><td> </td><td class="text-left">' + dataRow.contact_name + '</td><td>' + dataRow.room_number + '</td><td class="text-left">' + dataRow.session_id + '</td><td class="text-right">' + dataRow.ticket_number +'</td><td class="text-right">' + dataRow.work_type + '</td><td class="text-right">' + dataRow.task_type + '</td><td class="text-right">' + start_time.format('MM/DD/YYYY HH:mm:ss') + '</td><td class="text-right">' + stop_time.format('MM/DD/YYYY HH:mm:ss') + '</td><td class="text-right' + errorClass + '">' + elapsed_since_previous_display + '</td><td class="text-right">' + elapsed_time + '</td><td class="text-right">' + total_elapsed_display + '</td></tr>');
                        }
                        var reportProgress = Math.floor(recordCount/recordSize * 100);
                        $('span#progressPct').html(reportProgress + '%');
                    });
                    showReport('success');
                }
                break;

            case 'MACHistoryAWS':
                titleText = 'WORKFLOW HISTORY BY MAC (AWS ONLY) FOR WORKFLOW STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + '<br /><small><i>' + parameters + '</i></small>';
                $('div#reportBody').html('<h3 class="text-center">' + $('select#ReportType :selected').text() + '</h3><h5 class="text-center">' + titleText + '</h5><table id="results" class="table table-bordered center hover-highlight"><thead><tr><th colspan=11 class="sorter-false filter-false text-center"><div class="col-sm-1 hidden-print text-left"><img class="tableIcon reset clear-filters" report="MACHistoryAWS" src="stylesheets/images/clear-filters.png"><img class="tableIcon csv" src="stylesheets/images/csv.png"><img class="tableIcon print" src="stylesheets/images/print.png"></div><div class="col-sm-11 text-center">' + $('select#ReportType :selected').text() + '</div></th></tr><tr><th class="text-center sorter-false filter-false group-false">MAC ADDRESS</th><th class="text-center sorter-false filter-false group-false">INSTANCE COUNT</th><th class="text-center sorter-false filter-false group-false">SESSION ID</th><th class="text-center sorter-false filter-false group-false">TICKET NUMBER</th><th class="text-center sorter-false filter-false group-false">TYPE</th><th class="text-center sorter-false filter-false group-false">VENUE</th><th class="text-center sorter-false filter-false group-false">START TIME</th><th class="text-center sorter-false filter-false group-false">COMPLETION TIME</th><th class="text-center sorter-false filter-false group-false">ELAPSED SINCE LAST WORKFLOW</th><th class="text-center sorter-false filter-false group-false">WORKFLOW DURATION</th><th class="text-center sorter-false filter-false group-false">TOTAL ELAPSED TIME FOR MAC</th></tr></thead><tbody></tbody></table>');
                if (useWebWorker) {
                    worker = new Worker('webworkers/macHistoryAWS.js');
                    worker.postMessage(data);
                    worker.onmessage = function(e) {
                        data = e.data;
                        if (data.hasOwnProperty('reportProgress')) {
                            var reportProgress = data.reportProgress;
                            $('span#progressPct').html(reportProgress + '%');
                        }
                        if (data.hasOwnProperty('reportRow')) {
                            var reportRow = data.reportRow;
                            $('table#results tbody').append(reportRow);
                        }
                        if (data.hasOwnProperty('reportError')) {
                            showReport('error');
                            return;
                        }
                        if (data.hasOwnProperty('reportSuccess')) {
                            showReport('success');
                        }
                    };
                } else {
                    recordSize = data.length;
                    recordCount = 0;
                    /* If your data contained an 'ERROR' property send the error result and exit out */
                    if (data.hasOwnProperty('ERROR')) {
                        $('table#results tbody').append('<tr><td colspan=11 class="text-center">' + data.ERROR + '</td></tr>');
                        showReport('error');
                        return;
                    }
                    recordCount++;
                    var lastKey = '';
                    total_elapsed_time = 0;
                    data.forEach(function(dataRow) {
                        recordCount++;
                        var start_time = moment(dataRow.start_time);
                        var stop_time = moment(dataRow.stop_time);
                        total_elapsed_time = total_elapsed_time + moment(stop_time).diff(start_time, 'seconds');
                        var elapsed_time = moment.duration(moment(stop_time).diff(start_time, 'seconds'), 'seconds').format('d [days] HH:mm:ss', {
                            stopTrim: 'h',
                            forceLength: true
                        });
                        var total_elapsed_display  = moment.duration(total_elapsed_time, 'seconds').format('d [days] HH:mm:ss', {
                            stopTrim: 'h',
                            forceLength: true
                        });
                        if (dataRow.venue_name != '') {
                            venue_display = dataRow.venue_code + ' - ' + dataRow.venue_name;
                        }	else {
                            venue_display = dataRow.venue_code;
                        }
                        if (dataRow.rowKey != lastKey) {
                            lastKey = dataRow.rowKey;
                            $('table#results tbody').append('<tr><td class="text-right">' + dataRow.mac + '</td><td class="text-right">' + dataRow.count + '</td><td class="text-left">' + dataRow.session_id + '</td><td class="text-right">' + dataRow.ticket_number + '</td><td class="text-left">' + dataRow.work_type + '</td><td class="text-left">' + venue_display + '</td><td class="text-right">' + start_time.format('MM/DD/YYYY HH:mm:ss') + '</td><td class="text-right">' + stop_time.format('MM/DD/YYYY HH:mm:ss') + '</td><td> </td><td class="text-right">' + elapsed_time + '</td><td class="text-right">' + total_elapsed_display + '</td></tr>');
                            previous_stop_time = stop_time;
                            total_elapsed_time = 0;
                        } else {
                            previous_stop_time = moment(previous_stop_time);
                            elapsed_since_previous_display = moment.duration(moment(start_time).diff(previous_stop_time, "seconds"), "seconds").format('d [days] HH:mm:ss', {
                                stopTrim: "h",
                                forceLength: true
                            });
                            elapsed_since_previous = moment.duration(moment(start_time).diff(previous_stop_time, "seconds"), "seconds");
                            if (elapsed_since_previous < 0) {
                                errorClass = ' error';
                            } else {
                                errorClass = '';
                            }
                            previous_stop_time = stop_time;
                            $('table#results tbody').append('<tr><td> </td><td> </td><td class="text-left">' + dataRow.session_id + '</td><td class="text-right">' + dataRow.ticket_number + '</td><td class="text-left">' + dataRow.work_type +'</td><td class="text-left">' + venue_display + '</td><td class="text-right">' + start_time.format('MM/DD/YYYY HH:mm:ss') + '</td><td class="text-right">' + stop_time.format('MM/DD/YYYY HH:mm:ss') + '</td><td class="text-right' + errorClass + '">' + elapsed_since_previous_display + '</td><td class="text-right">' + elapsed_time + '</td><td class="text-right">' + total_elapsed_display + '</td></tr>');
                
                        }
                        var reportProgress = Math.floor(recordCount/recordSize * 100);
                        $('span#progressPct').html(reportProgress + '%');
                    });
                    showReport('success');
                }
                break;

            case 'WorkflowCompletionCountBreakdown':
                titleText = 'WORKFLOW COMPLETION COUNT BREAKDOWN FOR WORKFLOWS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + '<br /><small><i>' + parameters + '</i></small>';
                $('div#reportBody').html('<h3 class="text-center">' + $('select#ReportType :selected').text() + '</h3><h5 class="text-center">' + titleText + '</h5><ul class="nav nav-pills nav-justified"><li class="active"><a data-toggle="pill" href="#CountByAgent">COUNT BY AGENT</a></li><li><a data-toggle="pill" href="#CountByBusinessLine">COUNT BY BUSINESS LINE</a></li><li><a data-toggle="pill" href="#CountByWorkSource">COUNT BY WORK TYPE</a></li><li><a data-toggle="pill" href="#CountByTaskType">COUNT BY TASK TYPE</a></li></ul><div class="tab-content"><div id="CountByAgent" class="tab-pane fade in active"><table class="results table table-bordered center hover-highlight"><thead><tr><th colspan=3 class="sorter-false filter-false text-center">COMPLETED WORKFLOWS BY AGENT</th></tr><tr><th class="filter-false text-center">AGENT NAME</th><th class="filter-false text-center">TOTAL COMPLETED</th><th class="filter-false text-center">PERCENTAGE</th></tr></thead><tbody></tbody></table></div><div id="CountByBusinessLine" class="tab-pane fade in"><table class="results table table-bordered center hover-highlight"><thead><tr><th colspan=3 class="sorter-false filter-false text-center">COMPLETED WORKFLOWS BY BUSINESS LINE</th></tr><tr><th class="filter-false text-center">BUSINESS LINE</th><th class="filter-false text-center">TOTAL COMPLETED</th><th class="filter-false text-center">PERCENTAGE</th></tr></thead><tbody></tbody></table></div><div id="CountByWorkSource" class="tab-pane fade in"><table class="results table table-bordered center hover-highlight"><thead><tr><th colspan=3 class="sorter-false filter-false text-center">COMPLETED WORKFLOWS BY WORK TYPE</th></tr><tr><th class="filter-false text-center">WORK TYPE</th><th class="filter-false text-center">TOTAL COMPLETED</th><th class="filter-false text-center">PERCENTAGE</th></tr></thead><tbody></tbody></table></div><div id="CountByTaskType" class="tab-pane fade in"><table class="results table table-bordered center hover-highlight"><thead><tr><th colspan=3 class="sorter-false filter-false text-center">COMPLETED WORKFLOWS BY TASK TYPE</th></tr><tr><th class="filter-false text-center">TASK TYPE</th><th class="filter-false text-center">TOTAL COMPLETED</th><th class="filter-false text-center">PERCENTAGE</th></tr></thead><tbody></tbody></table></div></div>');
                if (useWebWorker && 1==2) {
                    worker = new Worker('webworkers/workflowCompletionCountBreakdown.js');
                    worker.postMessage(data);
                    worker.onmessage = function(e) {
                        data = e.data;
                        if (data.hasOwnProperty('reportProgress')) {
                            $('span#progressPct').html(data.reportProgress + '%');
                        }
                        if (data.hasOwnProperty('reportError')) {
                            $('table.results tbody').html(data.reportRow);
                            showReport('error');
                            return;
                        }
                        if (data.hasOwnProperty('reportRow')) {
                            $('div#' + data.reportName + ' table.results tbody').append(data.reportRow);
                        }
                        if (data.hasOwnProperty('reportSuccess')) {
                            showReport('success');
                        }
                    };
                } else {
                    recordSize = data.length;
                    recordCount = 0;
                    totals = new Object();
                    totals['Agent'] = 0;
                    totals['BusinessLine'] = 0;
                    totals['WorkSource'] = 0;
                    totals['TaskType'] = 0;
                    /* If your data contained an 'ERROR' property send the error result and exit out */
                    if (data.hasOwnProperty('ERROR')) {
                        $('table.results tbody').append('<tr><td colspan=3 class="text-center">' + data.ERROR + '</td></tr>');
                        showReport('error');
                        return;
                    }
                    recordCount++;
                    var lastKey = '';
                    total_elapsed_time = 0;

                    data.forEach(function(dataRow) {
                        recordCount++;
                        percentage = dataRow.count / dataRow.total_count * 100;
                        percentage = percentage.toFixed(2) + '%';
                        $('div#' + dataRow.report_name + ' table.results tbody').append('<tr><td class="text-right">' + dataRow.row_name + '</td><td class="text-right">' + dataRow.count + '</td><td class="text-right">' + percentage + '</td></tr>');
                        switch (dataRow.report_name) {
                        case 'CountByAgent':
                            totals['Agent'] = dataRow.total_count;
                            break;
                        case 'CountByBusinessLine':
                            totals['BusinessLine'] = dataRow.total_count;
                            break;
                        case 'CountByWorkSource':
                            totals['WorkSource'] = dataRow.total_count;
                            break;
                        case 'CountByTaskType':
                            totals['TaskType'] = dataRow.total_count;
                            break;
                        }
                        var reportProgress = Math.floor(recordCount/recordSize * 100);
                        $('span#progressPct').html(reportProgress + '%');
                    });
                    $('div#CountByAgent table.results tbody').append('<tr><td class="text-right">TOTAL</td><td class="text-right">' + totals['Agent'] + '</td><td class="text-right"> </td></tr>');
                    $('div#CountByBusinessLine table.results tbody').append('<tr><td class="text-right">TOTAL</td><td class="text-right">' + totals['BusinessLine'] + '</td><td class="text-right"> </td></tr>');
                    $('div#CountByWorkSource table.results tbody').append('<tr><td class="text-right">TOTAL</td><td class="text-right">' + totals['WorkSource'] + '</td><td class="text-right"> </td></tr>');
                    $('div#CountByTaskType table.results tbody').append('<tr><td class="text-right">TOTAL</td><td class="text-right">' + totals['TaskType'] + '</td><td class="text-right"> </td></tr>');
                    showReport('success');
                }
                break;

            case 'ViewCompletedWorkflows':
                titleText = 'WORKFLOW SESSION DATA FOR SESSIONS STARTED BETWEEN ' + moment(new Date(startDate)).format('MM/DD/YYYY HH:mm:ss') + ' AND ' + moment(new Date(endDate)).format('MM/DD/YYYY: HH:mm:ss') + '<br /><small><i>DOUBLE CLICK ON A ROW FROM THE LIST TO VIEW THE ASSOCIATED SCREENSHOTS</i></small>';
                html = '<h3 class="text-center">' + $('select#ReportType :selected').text() + '</h3><h5 class="text-center">' + titleText + '</h5><table id="results" class="table table-bordered center hover-highlight"><thead><tr><th colspan=10 class="sorter-false filter-false text-center"><div class="col-sm-1 hidden-print text-left"><img class="tableIcon reset clear-filters" report="CountByAgent" src="stylesheets/images/clear-filters.png"><img class="tableIcon csv" src="stylesheets/images/csv.png"><img class="tableIcon print" src="stylesheets/images/print.png"></div><div class="col-sm-10 text-center">' + $('select#ReportType :selected').text() + '</div></th></tr><tr><th class="text-center sortInitialOrder-asc group-false">SESSION ID</th><th class="text-center filter-false group-false">START TIME</th><th class="text-center filter-false group-false">COMPLETION TIME</th><th class="text-center filter-false group-false">WORKFLOW DURATION</th><th class="text-center sortInitialOrder-asc group-text">AGENT NAME</th><th class="text-center sortInitialOrder-asc group-text">ATT UID</th><th class="text-center sortInitialOrder-asc group-text">MANAGER ATT UID</th><th class="text-center sortInitialOrder-asc group-text">WORK TYPE</th><th class="text-center sortInitialOrder-asc group-text">BUSINESS LINE</th><th class="text-center sortInitialOrder-asc group-text">TASK TYPE</th></tr></thead><tbody>';
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

            case 'AllAutomation':
                var html = '<h3 class="text-center">' + $('select#ReportType :selected').text() + '</h3><h5 class="text-center">' + titleText + '</h5><table id="results" class="table table-bordered center hover-highlight"><thead><tr><th colspan=11 class="sorter-false text-center"><div class="col-sm-1 hidden-print text-left"><img class="tableIcon reset clear-filters" report="AllAutomation" src="stylesheets/images/clear-filters.png"><img class="tableIcon csv" src="stylesheets/images/csv.png"><img class="tableIcon print" src="stylesheets/images/print.png"></div><div class="col-sm-10 text-center">' + $('select#ReportType :selected').text() + '</div></th></tr><tr><th class="text-center group-text">SESSION ID</th><th class="text-center filter-false group-false">START TIME</th><th class="text-center filter-false group-false">COMPLETION TIME</th><th class="text-center filter-false group-false">MOTIVE STEP DURATION</th><th class="text-center sortInitialOrder-asc group-text">AGENT NAME</th><th class="text-center sortInitialOrder-asc group-text">ATT UID</th><th class="text-center sortInitialOrder-asc group-text">MANAGER ATT UID</th><th class="text-center sortInitialOrder-asc group-text">WORK TYPE</th><th class="text-center sortInitialOrder-asc group-text">BUSINESS LINE</th><th class="text-center sortInitialOrder-asc group-text">TASK TYPE</th><th class="text-center sortInitialOrder-asc group-separator">FLOW NAME</th></tr></thead><tbody>';
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
                html = '<h3 class="text-center">' + $('select#ReportType :selected').text() + '</h3><h5 class="text-center">' + titleText + '</h5><table id="results" class="table table-bordered center hover-highlight"><thead><tr><th colspan=12 class="sorter-false text-center"><div class="col-sm-1 hidden-print text-left"><img class="tableIcon reset clear-filters" report="AllManual" src="stylesheets/images/clear-filters.png"><img class="tableIcon csv" src="stylesheets/images/csv.png"><img class="tableIcon print" src="stylesheets/images/print.png"></div><div class="col-sm-10 text-center">' + $('select#ReportType :selected').text() + '</div></th></tr><tr><th class="text-center group-text">SESSION ID</th><th class="text-center filter-false group-false">START TIME</th><th class="text-center filter-false group-false">COMPLETION TIME</th><th class="text-center filter-false group-false">AGENT STEP DURATION</th><th class="text-center sortInitialOrder-asc group-text">AGENT NAME</th><th class="text-center sortInitialOrder-asc group-text">ATT UID</th><th class="text-center sortInitialOrder-asc group-text">MANAGER ATT UID</th><th class="text-center sortInitialOrder-asc group-text">WORK TYPE</th><th class="text-center sortInitialOrder-asc group-text">BUSINESS LINE</th><th class="text-center sortInitialOrder-asc group-text">TASK TYPE</th><th class="text-center group-separator">FLOW NAME</th><th class="text-center group-false">STEP NAME</th></tr></thead><tbody>';
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
                html = '<h3 class="text-center">' + $('select#ReportType :selected').text() + '</h3><h5 class="text-center">' + titleText + '</h5><table id="results" class="table table-bordered center hover-highlight"><thead><tr><th colspan=10 class="sorter-false text-center"><div class="col-sm-1 hidden-print text-left"><img class="tableIcon reset clear-filters" report="AllWorkflow" src="stylesheets/images/clear-filters.png"><img class="tableIcon csv" src="stylesheets/images/csv.png"><img class="tableIcon print" src="stylesheets/images/print.png"></div><div class="col-sm-10 text-center">' + $('select#ReportType :selected').text() + '</div></th></tr><tr><th class="text-center group-false">SESSION ID</th><th class="text-center filter-false group-false">START TIME</th><th class="text-center filter-false group-false">COMPLETION TIME</th><th class="text-center filter-false group-false">WORKFLOW DURATION</th><th class="text-center sortInitialOrder-asc group-text">AGENT NAME</th><th class="text-center sortInitialOrder-asc group-text">ATT UID</th><th class="text-center sortInitialOrder-asc group-text">MANAGER ATT UID</th><th class="text-center sortInitialOrder-asc group-text">WORK TYPE</th><th class="text-center sortInitialOrder-asc group-text">BUSINESS LINE</th><th class="text-center sortInitialOrder-asc group-text">TASK TYPE</th></tr></thead><tbody>';
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
            }
        }).fail(function () {
            alert('Request Timed Out');
            $('div.overlay').hide();
            $('input, select').attr('disabled', false);
        });
    });

    $('i.glyphicon.glyphicon-calendar.fa.fa-calendar').off('click').on('click', function () {
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
        $('select#CitySel.chosen').chosen({
            width: '100%',
            allow_single_deselect: true,
            disable_search_threshold: 10
        });
        $('select#AssetIdSel.chosen').chosen({
            width: '100%',
            allow_single_deselect: true,
            disable_search_threshold: 10
        });
        $('#AssetIdSel_chosen').hide();
        $('select#MinimumCountSel.chosen').chosen({
            width: '100%',
            allow_single_deselect: true,
            disable_search_threshold: 10

        });
        $('#MinimumCountSel_chosen').hide();
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
            $('.modal').html('<h3 class="text-center"><span id="statusText">REQUIRED DATABASE ACCESS NOT AVAILABLE FOR THIS ENVIRONMENT</span></h3>');
            $('.modal').plainModal('open').on('plainmodalbeforeclose', false);
            return false;
        }
        populateSelect('#AttUIDSel');
        populateSelect('#BusinessLineSel');
        populateSelect('#WorkSourceSel');
        populateSelect('#TaskTypeSel');
        populateSelect('#CitySel');
        populateSelect('#AssetIdSel');
    });



    socket.on('disconnect', function () {
    });
});

let displayScreenshots = function (session_id) {
    $('div#reportBody').hide();
    $('div.overlay').show();
    $('.flexslider').remove();
    $('div.container').html('<div class="headerData col-md-12"></div><div class="flexslider col-md-12"><ul class="slides"></ul></div>');
    var sql = 'SELECT ss.smp_session_id, ss.flow_name, ss.step_name, ss.screenshot_time, ss.image_data, sl.start_time, sl.stop_time, SEC_TO_TIME(sl.elapsed_seconds) AS elapsed_seconds, CONCAT(sl.last_name, ", ", sl.first_name, " (", UCASE(sl.att_uid), ")") AS agent_name, UCASE(sl.manager_id) AS manager_id, sl.work_source, sl.business_line, sl.task_type FROM screenshots ss LEFT JOIN duration_log_session sl ON ss.smp_session_id = sl.smp_session_id WHERE ss.smp_session_id = "' + session_id + '" ORDER BY ss.recorded';
    $.ajax({
        type: 'post',
        url: 'ajax/requestData.php',
        data: {
            databaseIP: dbHost,
            databaseUser: dbUser,
            databasePW: dbPassword,
            databaseName: dbName,
            sql: sql
        },
        dataType: 'json',
    }).done(function (data) {
        var start_time = moment(data[0].start_time).format('MM/DD/YYYY HH:mm:ss');
        var stop_time = moment(data[0].stop_time).format('MM/DD/YYYY HH:mm:ss');
        var task_type = data[0].task_type;
        if (!task_type) {
            task_type = ' ';
        }
        var work_source = data[0].work_source;
        if (!work_source) {
            work_source = ' ';
        }
        var manager_id = data[0].manager_id;
        if (!manager_id) {
            manager_id = ' ';
        }
        var business_line = data[0].business_line;
        if (!business_line) {
            business_line = ' ';
        }
        var html = '<div class="close row col-sm-12 text-right" style="font-size: 200%;color: #ffffff;padding-right: 15px;padding-top:2px;">X</div><div class="row"><div class="col-sm-3 text-right">SESSION ID:</div><div class="data col-sm-9 text-left">' + data[0].smp_session_id + '</div><div class="col-sm-3 text-right">AGENT:</div><div class="data col-sm-3 text-left">' + data[0].agent_name + '</div><div class="col-sm-3 text-right">MANAGER:</div><div class="data col-sm-3 text-left">' + manager_id + '</div><div class="col-sm-3 text-right">START TIME:</div><div class="data col-sm-3 text-left">' + start_time + '</div><div class="col-sm-3 text-right">END TIME:</div><div class="data col-sm-3 text-left">' + stop_time + '</div><div class="col-sm-3 text-right">DURATION:</div><div class="data col-sm-3 text-left">' + data[0].elapsed_seconds + '</div><div class="col-sm-3 text-right">TASK TYPE:</div><div class="data col-sm-3 text-left">' + task_type + '</div><div class="col-sm-3 text-right">WORK TYPE:</div><div class="data col-sm-3 text-left">' + work_source + '</div><div class="col-sm-3 text-right">BUSINESS LINE:</div><div class="data col-sm-3 text-left">' + business_line + '</div><div class="data col-sm-12 text-center">CLICK THE IMAGE BELOW TO DISPLAY A LARGER VIEW</div></div>';
        $('div.headerData').html(html);
        var count = data.length;
        $.each(data, function (key, value) {
            var html = '<li><img class="flex makefancybox" src="' + value.image_data + '" /><div class="footerData row"><div class="col-sm-3 text-right">TIME:</div><div class="data col-sm-3 text-left">' + value.screenshot_time + '</div><div class="col-sm-6 text-right data">' + (key + 1) + '/' + count + '</div><div class="col-sm-3 text-right">FLOW NAME</div><div class="col-sm-3 text-left data">' + value.flow_name + '</div><div class="col-sm-3 text-right">STEP NAME:</div><div class="col-sm-3 text-left data">' + value.step_name + '</div></div></li>';
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
            $('ul.slides').empty();
            $('div#reportBody').show();
        });
        $('img.makefancybox').each(function () {
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


let completeReport = function (data) {
    $('a[data-toggle="pill"]').off('shown.bs.tab.resort').on('shown.tab.bs.resort', function () {
        $('table.result').trigger('update', true).trigger('applyWidgetId', 'zebra');
        $('table').trigger('update', true);
    });
    if (!data.hasOwnProperty('ERROR')) {
        if ($('table#results tbody tr').length < 5000){
            var widgets = ['zebra', 'filter', 'output', 'print', 'saveSort', 'stickyHeaders', 'group'];
        } else {
            widgets = ['zebra', 'filter', 'output', 'print', 'saveSort', 'group'];
        }
        $.each($('table#results, table.results'), function () {
            var name = $(this).find('tr').first().text();
            $(this).tablesorter({
                theme: 'custom',
                sortReset: true,
                sortRestart: true,
                sortInitialOrder: 'desc',
                ignoreCase: true,
                widgets: widgets,
                widgetOptions: {
                    group_collapsible : false,  // make the group header clickable and collapse the rows below it.
                    group_collapsed   : false, // start with all groups collapsed (if true)
                    group_saveGroups  : true,  // remember collapsed groups
                    group_separator : '_',
                    group_complete : 'groupingComplete',
                    filter_saveFilters : true,
                    filter_reset : '.clear-filters',
                    output_delivery : 'download',
                    output_includeFooter : false,
                    output_saveFileName : name + '.CSV',
                    print_title      : name,
                    print_styleSheet : 'stylesheets/print-stylesheet.css',
                    print_now : true,
                    saveSort : false
                }
            });
        });

        $('.reset').off('click').on('click', function () {
            var table = $(this).closest('table');
            $(table).trigger('filterResetSaved').trigger('saveSortReset').trigger('sortReset');
        });

        $('.csv').off('click').on('click', function() {
            $(this).closest('table').trigger('outputTable');
        });
        $('.print').off('click').on('click', function() {
            // var name = $(this).closest('tr').text();
            $(this).closest('table').trigger('printTable');
        });
    } else {
        $('table#results, table.results').tablesorter({
            theme: 'custom',
            sortReset: true,
            ignoreCase: true,
            sortRestart: true,
            sortInitialOrder: 'desc',
            widgets: ['zebra', 'stickyHeaders']
        });
    }
    $('div.overlay').hide();
    $('tr.screenshots').off('dblclick').on('dblclick', function () {
        var session_id = $(this).attr('data-session');
        displayScreenshots(session_id);
    });
};


let showReport = function (result) {
    $('.modal').html('<h3 class="text-center">PREPARING REPORT FOR DISPLAY</h3>');
    if ($('table#results tbody tr, table.results tbody tr').length > 3000) {
        $('.modal').html('<h3 class="text-center">PREPARING FOR DISPLAY</h3><h4 class="text-center">(BROWER MAY APPEAR TO FREEZE DURING DISPLAY)</h4>');
    } else {
        $('.modal').html('<h3 class="text-center">PREPARING FOR DISPLAY</h3>');
    }
    setTimeout(function() {
        $('div#reportBody').show();
        $('a[data-toggle="pill"]').off('shown.bs.tab.resort').on('shown.tab.bs.resort', function () {
            $('table.result').trigger('update', true).trigger('applyWidgetId', 'zebra');
            $('table').trigger('update', true);
        });
        switch (result) {
        case 'success':
            if ($('table#results tbody tr').length < 5000){
                var widgets = ['zebra', 'filter', 'output', 'print', 'saveSort', 'stickyHeaders', 'group'];
            } else {
                widgets = ['zebra', 'filter', 'output', 'print', 'saveSort', 'group'];
            }
            $.each($('table#results, table.results'), function () {
                var name = $(this).find('tr').first().text();
                $(this).tablesorter({
                    theme: 'custom',
                    sortReset: true,
                    sortRestart: true,
                    sortInitialOrder: 'desc',
                    ignoreCase: true,
                    widgets: widgets,
                    widgetOptions: {
                        group_collapsible : false,
                        group_collapsed   : false,
                        group_saveGroups  : true,
                        group_separator : '_',
                        group_complete : 'groupingComplete',
                        filter_saveFilters : true,
                        filter_reset : '.clear-filters',
                        output_delivery : 'download',
                        output_includeFooter : false,
                        output_saveFileName : name + '.CSV',
                        print_title      : name,
                        print_styleSheet : 'stylesheets/print-stylesheet.css',
                        print_now : true,
                        saveSort : false
                    }
                });
            });

            $('.reset').off('click').on('click', function () {
                var table = $(this).closest('table');
                $(table).trigger('filterResetSaved').trigger('saveSortReset').trigger('sortReset');
            });

            $('.csv').off('click').on('click', function() {
                $(this).closest('table').trigger('outputTable');
            });
            $('.print').off('click').on('click', function() {
                var name = $(this).closest('tr').text();
                $(this).closest('table').trigger('printTable');
            });
            break;
        case 'error':
            $('table#results, table.results').tablesorter({
                theme: 'custom',
                sortReset: true,
                ignoreCase: true,
                sortRestart: true,
                sortInitialOrder: 'desc',
                widgets: ['zebra', 'stickyHeaders']
            });
            break;
        }
        $('div.overlay').hide();
        $('.modal').off('plainmodalbeforeclose', false).plainModal('close');
        $('tr.screenshots').off('dblclick').on('dblclick', function () {
            var session_id = $(this).attr('data-session');
            displayScreenshots(session_id);
        });
    }, 1000);
};


let populateSelect = function(selectName) {
    $.ajax({
        type: 'post',
        url: 'ajax/requestData.php',
        data: {
            databaseIP: dbHost,
            databaseUser: dbUser,
            databasePW: dbPassword,
            databaseName: dbName,
            reportType: 'select',
            selectName: selectName
        },
        dataType: 'json'
    }).fail(function () {
        $(selectName).remove();
    }).done(function (data) {
        if (data.hasOwnProperty('ERROR')) {
            $('select' + selectName).chosen('destroy');
            $('select' + selectName).remove();
            return;
        }
        data.forEach(function(Item) {
            $(selectName).append($('<option>', {
                value: Item.key,
                text: Item.value
            }));
        });
        $(selectName).trigger('chosen:updated');
    });
};