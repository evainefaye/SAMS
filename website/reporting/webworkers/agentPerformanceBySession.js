importScripts('../scripts/jquery.moment.min.js');
onmessage = function(e) {
    data = e.data;
    recordSize = data.length;
    recordCount = 0;
    workerMessage = new Object;
    /* If your data contained an 'ERROR' property send the error result and exit out */
    if (data.hasOwnProperty('ERROR')) {
        workerMessage['reportRow'] = '<tr><td colspan=11 class="text-center">' + data.ERROR + '</td></tr>';
        workerMessage['reportError'] = true;
        postMessage(workerMessage);
        return;
    }
    data.forEach(function(dataRow) {
        workerMessage = new Object;
        recordCount++;
        var start_time = moment(new Date(dataRow.start_time)).format('MM/DD/YYYY HH:mm:ss');
        var stop_time = moment(new Date(dataRow.stop_time)).format('MM/DD/YYYY HH:mm:ss');
        var total_motive_count = Number(dataRow.count_motive_within) + Number(dataRow.count_motive_exceeded);
        var total_agent_count = Number(dataRow.count_agent_within) + Number(dataRow.count_agent_exceeded);
        if (total_motive_count > 0) {
            var percent_motive_within = (dataRow.count_motive_within / total_motive_count * 100).toFixed(2) + '%';
            var percent_motive_exceeded = (dataRow.count_motive_exceeded / total_motive_count * 100).toFixed(2) + '%';
        } else {
            var percent_motive_within = '0.00%';
            var percent_motive_exceeded = '0.00%';
        }
        if (total_agent_count > 0) {
            var percent_agent_within = (dataRow.count_agent_within / total_agent_count * 100).toFixed(2) + '%';
            var percent_agent_exceeded = (dataRow.count_agent_exceeded / total_agent_count * 100).toFixed(2) + '%';
        } else {
            var percent_agent_within = '0.00%';
            var percent_agent_exceeded = '0.00%';
        }
        workerMessage['reportRow'] = '<tr><td class="text-center">' + start_time + '</td><td class="text-left">' + dataRow.agent_name + ' (' + dataRow.att_uid + ')' + '</td><td class="text-left">' + dataRow.manager_id + '</td><td class="text-left">' + dataRow.work_source + '</td><td class="text-left">' + dataRow.business_line + '</td><td class="text-left">' + dataRow.task_type + '</td><td class="text-center">' + dataRow.session_duration + '</td><td class="text-right">' + dataRow.count_motive_within + '</td><td class="text-center">' + dataRow.duration_motive_within + '</td><td class="text-right">' + percent_motive_within + '</td><td class="text-right">' + dataRow.count_motive_exceeded + '</td><td class="text-center">' + dataRow.duration_motive_exceeded + '</td><td class="text-right">' + percent_motive_exceeded + '</td><td class="text-right">' + dataRow.count_agent_within + '</td><td class="text-center">' + dataRow.duration_agent_within + '</td><td class="text-right">' + percent_agent_within + '</td><td class="text-right"> ' + dataRow.count_agent_exceeded + '</td><td>' + dataRow.duration_agent_exceeded + '<td class="text-right">' + percent_agent_exceeded + '</td></tr>';
        workerMessage['reportProgress'] = Math.floor((recordCount/recordSize) * 100);
        postMessage(workerMessage);
    });
    workerMessage = new Object;
    workerMessage['reportSuccess'] = true;
    postMessage(workerMessage);
};