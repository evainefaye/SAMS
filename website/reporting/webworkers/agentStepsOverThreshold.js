onmessage = function(e) {
	data = e.data;
	recordSize = data.length;
	recordCount = 0;
	workerMessage = new Object;
	/* If your data contained an 'ERROR' property send the error result and exit out */
    if (data.hasOwnProperty('ERROR')) {
        workerMessage['reportRow'] = '<tr><td colspan=10 class="text-center">' + data.ERROR + '</td></tr>';
		workerMessage['reportError'] = true;	
		postMessage(workerMessage);
		return;
	}
	data.forEach(function(dataRow) {
		workerMessage = new Object;
		recordCount++;
		dataRow.percent_standard = (dataRow.count_standard / dataRow.count * 100).toFixed(2) + '%';
		dataRow.percent_slow = (dataRow.count_slow / dataRow.count * 100).toFixed(2) + '%';
		workerMessage['reportRow'] = '<tr><td class="text-left">' + dataRow.flow_name + '</td><td class="text-left">' + dataRow.step_name + '</td><td class="text-right">' + dataRow.count + '</td><td class="text-right">' + dataRow.average + '</td><td class="text-right">' + dataRow.count_standard + '</td><td class="text-right">' + dataRow.average_standard + '</td><td class="text-right">' + dataRow.percent_standard + '</td><td class="text-right">' + dataRow.count_slow + '</td><td class="text-right">' + dataRow.average_slow + '</td><td class="text-right">' + dataRow.percent_slow + '</td></tr>';
		workerMessage['reportProgress'] = Math.floor((recordCount/recordSize) * 100);
		postMessage(workerMessage);
	});
	workerMessage = new Object;
	workerMessage['reportSuccess'] = true;
	postMessage(workerMessage);
};