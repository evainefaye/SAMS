importScripts('jquery.moment.min.js', 'jquery.moment.duration.js');
onmessage = function(e) {
	data = e.data;
	if (typeof data == 'array') {
		assetSize = data.length;
	} else {
		assetSize = Object.keys(data).length;
	}
	console.log(data);
	console.log('there are ' + assetSize + ' assets in report');
	assetCount = 0;
	workerMessage = new Object;
	dtlrow = 0;
	for (rowKey in data) {
		assetCount++;
		workerMessage['progress'] = Math.floor((assetCount/assetSize) * 100) + ' ' + dtlrow;
		postMessage(workerMessage);
		row = data[rowKey];
		asset_id = row.asset_id;
		count = row.count;
		detail_records = row.detail;
		detail_count = 0;
		total_elapsed_time = 0;
		detail_records.forEach(function(detail_row) {
			dtlrow++;
			workerMessage['progress'] = Math.floor((assetCount/assetSize) * 100) + ' ' + dtlrow;
			session_id = detail_row.session_id;
			ticket_number = detail_row.ticket_number;
			work_type = detail_row.work_type;
			task_type = detail_row.task_type;
			start_time = moment(detail_row.start_time);
			stop_time = moment(detail_row.stop_time);
			total_elapsed_time = total_elapsed_time + moment(stop_time).diff(start_time, "seconds");
			elapsed_time = moment.duration(moment(stop_time).diff(start_time, "seconds"), "seconds").format('d [days] HH:mm:ss', {
				stopTrim: "h",
				forceLength: true
			});
			total_elapsed_display  = moment.duration(total_elapsed_time, "seconds").format('d [days] HH:mm:ss', {
				stopTrim: "h",
				forceLength: true
			});
			if (detail_count == 0) {
				workerMessage['row'] = '<tr><td class="text-right">' + asset_id + '</td><td class="text-right pr-5 mr-5">' + count + '</td><td class="text-left">' + session_id + '</td><td class="text-right">' + ticket_number +'</td><td class="text-right">' + work_type + '</td><td class="text-right">' + task_type + '</td><td class="text-right">' + start_time.format('MM/DD/YYYY HH:mm:ss') + '</td><td class="text-right">' + stop_time.format('MM/DD/YYYY HH:mm:ss') + '</td><td> </td><td class="text-right">' + elapsed_time + '</td><td class="text-right">' + total_elapsed_display + '</td></tr>';
				previous_stop_time = stop_time;
			} else {
				previous_stop_time = moment(previous_stop_time);
				if (start_time < previous_stop_time) {
					elapsed_since_previous = 'NOT AVAILALBE';
				} else {
					elapsed_since_previous = moment.duration(moment(start_time).diff(previous_stop_time, "seconds"), "seconds").format('d [days] HH:mm:ss', {
						stopTrim: "h",
						forceLength: true
					});
				}
				previous_stop_time = stop_time;
				workerMessage['row'] = '<tr><td> </td><td> </td><td class="text-left">' + session_id + '</td><td class="text-right">' + ticket_number +'</td><td class="text-right">' + work_type + '</td><td class="text-right">' + task_type + '</td><td class="text-right">' + start_time.format('MM/DD/YYYY HH:mm:ss') + '</td><td class="text-right">' + stop_time.format('MM/DD/YYYY HH:mm:ss') + '</td><td class="text-right">' + elapsed_since_previous + '</td><td class="text-right">' + elapsed_time + '</td><td class="text-right">' + total_elapsed_display + '</td></tr>';
			}
			postMessage(workerMessage);
			delete workerMessage.row
			delete workerMessage.progress;
			detail_count ++;
		});
	}
	workerMessage['reportStatus'] = 'complete';
	postMessage(workerMessage);
	delete workerMessage.reportStatus;
};
