importScripts('jquery.moment.min.js', 'jquery.moment.duration.js');
onmessage = function(e) {
	data = e.data;
	for (rowKey in data) {
		row = data[rowKey];
		asset_id = row.asset_id;
		contact_name = row.contact_name;
		room_number = row.room_number;
		count = row.count;
		detail_records = row.detail;
		detail_count = 0;
		total_elapsed_time = 0;
		detail_records.forEach(function(detail_row) {
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
				row = '<tr><td class="text-right">' + asset_id + '</td><td class="text-right">' + contact_name + '</td><td class="text-right">' + room_number + '</td><td class="text-right">' + count + '</td><td class="text-left">' + session_id + '</td><td class="text-right">' + ticket_number +'</td><td class="text-right">' + work_type + '</td><td class="text-right">' + task_type + '</td><td class="text-right">' + start_time.format('MM/DD/YYYY HH:mm:ss') + '</td><td class="text-right">' + stop_time.format('MM/DD/YYYY HH:mm:ss') + '</td><td> </td><td class="text-right">' + elapsed_time + '</td><td class="text-right">' + total_elapsed_display + '</td></tr>';
				previous_stop_time = stop_time;
			} else {
				previous_stop_time = moment(previous_stop_time);
				if (start_time < previous_stop_time) {
					elapsed_since_previous = 'NOT AVAILABLE';
				} else {
					elapsed_since_previous = moment.duration(moment(start_time).diff(previous_stop_time, "seconds"), "seconds").format('d [days] HH:mm:ss', {
						stopTrim: "h",
						forceLength: true
					});
				}
				previous_stop_time = stop_time;
				row = '<tr><td title="' + asset_id + '"> </td><td title="' + contact_name + '"> </td><td title="' + room_number + '"> </td><td> </td><td class="text-left">' + session_id + '</td><td class="text-right">' + ticket_number +'</td><td class="text-right">' + work_type + '</td><td class="text-right">' + task_type + '</td><td class="text-right">' + start_time.format('MM/DD/YYYY HH:mm:ss') + '</td><td class="text-right">' + stop_time.format('MM/DD/YYYY HH:mm:ss') + '</td><td class="text-right">' + elapsed_since_previous + '</td><td class="text-right">' + elapsed_time + '</td><td class="text-right">' + total_elapsed_display + '</td></tr>';
			}
			postMessage(row);
			detail_count ++;
		});
	};
	postMessage('report complete');
};
