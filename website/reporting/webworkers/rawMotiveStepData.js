importScripts('../scripts/jquery.moment.min.js');
onmessage = function(e) {
    var data = e.data;
    var recordSize = data.length;
    var recordCount = 0;
    var workerMessage = new Object;
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
        workerMessage['reportRow'] = '<tr><td class="text-left">' + dataRow.smp_session_id + '</td><td class="text-center">' + start_time + '</td><td class="text-center">' + stop_time + '</td><td class="text-center">' + dataRow.motive_step_duration + '</td><td class="text-left">' + dataRow.agent_name + '</td><td class="text left">' + dataRow.att_uid + '</td><td class="text-left">' + dataRow.manager_id + '</td><td class="text-left">' + dataRow.work_source + '</td><td class="text-left">' + dataRow.business_line + '</td><td class="text-left">' + dataRow.task_type + '</td><td class="text-left">' + dataRow.flow_name + '</td></tr>';
        workerMessage['reportProgress'] = Math.floor(recordCount/recordSize * 100);
        postMessage(workerMessage);
    });
    workerMessage = new Object;
    workerMessage['reportSuccess'] = true;
    postMessage(workerMessage);
};