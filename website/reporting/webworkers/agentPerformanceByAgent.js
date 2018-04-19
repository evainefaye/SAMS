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
        workerMessage['reportRow'] = '<tr><td class="text-left">' + dataRow.agent_name + '</td><td class="text-left">' + dataRow.att_uid + '</td><td class="text-left">' + dataRow.manager_id + '</td><td class="text-center">' + dataRow.session_average + '</td><td class="text-right">' + dataRow.count_completed + '</td><td class="text-right">' + dataRow.count_slow_workflow + '</td><td class="text-right">' + dataRow.percent_slow_workflow + '%</td><td class="text-right">' + dataRow.count_slow_motive + '</td><td class="text-right">' + dataRow.percent_slow_motive + '%</td><td class="text-right">' + dataRow.count_slow_agent + '</td><td class="text-right">' + dataRow.percent_slow_agent + '%</td>';
        workerMessage['reportProgress'] = Math.floor(recordCount/recordSize * 100);
        postMessage(workerMessage);
    });
    workerMessage = new Object;
    workerMessage['reportSuccess'] = true;
    postMessage(workerMessage);
};