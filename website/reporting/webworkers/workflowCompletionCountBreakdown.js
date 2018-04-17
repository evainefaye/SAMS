onmessage = function(e) {
    data = e.data;
    recordSize = data.length;
    recordCount = 0;
    totals = new Object();
    totals['Agent'] = 0;
    totals['BusinessLine'] = 0;
    totals['WorkSource'] = 0;
    totals['TaskType'] = 0;
    workerMessage = new Object;
    /* If your data contained an 'ERROR' property send the error result and exit out */
    if (data.hasOwnProperty('ERROR')) {
        workerMessage['reportRow'] = '<tr><td colspan=3 class="text-center">' + data.ERROR + '</td></tr>';
        workerMessage['reportError'] = true;	
        postMessage(workerMessage);
        return;
    }
    data.forEach(function(dataRow) {
        workerMessage = new Object;
        recordCount++;
        percentage = dataRow.count / dataRow.total_count * 100;
        percentage = percentage.toFixed(2) + '%';
        workerMessage['reportName'] = dataRow.report_name;
        workerMessage['reportRow'] = '<tr><td class="text-right">' + dataRow.row_name + '</td><td class="text-right">' + dataRow.count + '</td><td class="text-right">' + percentage + '</td></tr>';
        workerMessage['reportProgress'] = Math.floor((recordCount/recordSize) * 100);
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
        postMessage(workerMessage);
    });
    workerMessage = new Object;
    workerMessage['reportName'] = 'CountByAgent';
    workerMessage['reportRow'] = '<tr><td class="text-right">TOTAL</td><td class="text-right">' + totals['Agent'] + '</td><td class="text-right"> </td></tr>';
    postMessage(workerMessage);
    workerMessage['reportName'] = 'CountByBusinessLine';
    workerMessage['reportRow'] = '<tr><td class="text-right">TOTAL</td><td class="text-right">' + totals['BusinessLine'] + '</td><td class="text-right"> </td></tr>';
    postMessage(workerMessage);
    workerMessage['reportName'] = 'CountByWorkSource';
    workerMessage['reportRow'] = '<tr><td class="text-right">TOTAL</td><td class="text-right">' + totals['WorkSource'] + '</td><td class="text-right"> </td></tr>';
    postMessage(workerMessage);
    workerMessage['reportName'] = 'CountByTaskType';
    workerMessage['reportRow'] = '<tr><td class="text-right">TOTAL</td><td class="text-right">' + totals['TaskType'] + '</td><td class="text-right"> </td></tr>';
    postMessage(workerMessage);
    workerMessage = new Object;
    workerMessage['reportSuccess'] = true;
    postMessage(workerMessage);

};