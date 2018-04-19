importScripts('../scripts/jquery.moment.min.js', '../scripts/jquery.moment.duration.js');
onmessage = function(e) {
    var data = e.data;
    var recordSize = data.length;
    var recordCount = 0;
    var workerMessage = new Object;
    /* If your data contained an 'ERROR' property send the error result and exit out */
    if (data.hasOwnProperty('ERROR')) {
        workerMessage['reportRow'] = '<tr><td colspan=12 class="text-center">' + data.ERROR + '</td></tr>';
        workerMessage['reportError'] = true;
        postMessage(workerMessage);
        return;
    }
    workerMessage = new Object;
    recordCount++;
    var lastKey = '';
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
        if (dataRow.venue_name != '') {
            var venue_display = dataRow.venue_code + ' - ' + dataRow.venue_name;
        }	else {
            venue_display = dataRow.venue_code;
        }
        if (dataRow.rowKey != lastKey) {
            lastKey = dataRow.rowKey;
            workerMessage['reportRow'] = '<tr><td class="text-right">' + dataRow.mac + '</td><td class="text-right">' + dataRow.count + '</td><td class="text-left">' + dataRow.session_id + '</td><td class="text-right">' + dataRow.ticket_number + '</td><td class="text-left">' + dataRow.work_type + '</td><td class="text-left">' + venue_display + '</td><td class="text-right">' + start_time.format('MM/DD/YYYY HH:mm:ss') + '</td><td class="text-right">' + stop_time.format('MM/DD/YYYY HH:mm:ss') + '</td><td> </td><td class="text-right">' + elapsed_time + '</td><td class="text-right">' + total_elapsed_display + '</td></tr>';
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
            workerMessage['reportRow'] = '<tr><td> </td><td> </td><td class="text-left">' + dataRow.session_id + '</td><td class="text-right">' + dataRow.ticket_number + '</td><td class="text-left">' + dataRow.work_type +'</td><td class="text-left">' + venue_display + '</td><td class="text-right">' + start_time.format('MM/DD/YYYY HH:mm:ss') + '</td><td class="text-right">' + stop_time.format('MM/DD/YYYY HH:mm:ss') + '</td><td class="text-right' + errorClass + '">' + elapsed_since_previous_display + '</td><td class="text-right">' + elapsed_time + '</td><td class="text-right">' + total_elapsed_display + '</td></tr>';
        }
        workerMessage['reportProgress'] = Math.floor(recordCount/recordSize * 100);
        postMessage(workerMessage);
    });
    workerMessage = new Object;
    workerMessage['reportSuccess'] = true;
    postMessage(workerMessage);
};