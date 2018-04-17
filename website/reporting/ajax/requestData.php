<?php

$array = array();
$lookup = array();

// Receive database info from node server
$databaseIP = $_POST['databaseIP'];
$databaseUser = $_POST['databaseUser'];
$databasePW = $_POST['databasePW'];
$databaseName = $_POST['databaseName'];

// Retrieve Parameters
$agentStepFilterExceeded = $_POST['agentStepFilterExceeded'];
$agentStepFilterWithin = $_POST['agentStepFilterWithin'];
$agentStepThreshold = $_POST['agentStepThreshold'];
$assetIdFilter = $_POST['assetIdFilter'];
$attUIDFilter = $_POST['attUIDFilter'];
$businessLineFilter = $_POST['businessLineFilter'];
$cityFilter = $_POST['cityFilter'];
$endDate = $_POST['endDate'];
$minimumCountFilter = $_POST['minimumCountFilter'];
$motiveStepFilterExceeded = $_POST['motiveStepFilterExceeded'];
$motiveStepFilterWithin = $_POST['motiveStepFilterWithin'];
$motiveStepThreshold = $_POST['motiveStepThreshold'];
$reportType = $_POST['reportType'];
$sessionThreshold = $_POST['sessionThreshold'];
$sessionThresholdExceeded = $_POST['sessionThresholdExceeded'];
$sessionThresholdWithin = $_POST['sessionThresholdWithin'];
$selectName = $_POST['selectName'];
$startDate = $_POST['startDate'];
$taskTypeFilter = $_POST['taskTypeFilter'];
$workSourceFilter = $_POST['workSourceFilter'];

// Connect to database provide error if it fails
$mysqli = new mysqli($databaseIP, $databaseUser, $databasePW, $databaseName);

// Oh no! A connect_errno exists so the connection attempt failed!
if ($mysqli->connect_errno) {

	$array['ERROR'] = 'FAILED TO CONNECT TO DATABASE';
	echo json_encode($array);
    exit;
}

// Generate selected report data
switch ($reportType) {
	
//  *** GENERATE SELECT BOX DATA ***
case 'select':
	switch ($selectName) {
	case '#AttUIDSel':
		$sql = "SELECT DISTINCT(att_uid) AS selectKey, CONCAT(last_name, ', ', first_name,' (', UCASE(att_uid), ')') AS selectValue FROM duration_log_session WHERE att_uid != '' AND last_name != '' UNION SELECT DISTINCT manager_id, CONCAT(' MANAGER - ', UCASE(manager_id)) FROM duration_log_session  WHERE manager_id != '' ORDER BY selectValue";
		break;
	case '#BusinessLineSel':
		$sql = "SELECT DISTINCT business_line AS selectKey, business_line AS selectValue FROM duration_log_session WHERE business_line != '' ORDER BY selectKey";	
		break;
	case '#WorkSourceSel':
		$sql = "SELECT DISTINCT work_source AS selectKey, work_source AS selectValue FROM duration_log_session WHERE work_source != '' ORDER BY selectKey";
		break;
	case '#TaskTypeSel':
		$sql = "SELECT DISTINCT task_type  AS selectKey, task_type AS selectValue FROM duration_log_session WHERE task_type != '' ORDER BY selectKey";
		break;
	case '#CitySel':
		$sql = "SELECT DISTINCT city AS selectKey, city AS selectValue FROM duration_log_session WHERE city != '' ORDER BY selectKey";
		break;
	case '#AssetIdSel':
		$sql = "SELECT DISTINCT LTRIM(RTRIM(asset_id)) AS selectKey, LTRIM(RTRIM(asset_id)) AS selectValue FROM duration_log_session WHERE asset_id != '' ORDER BY asset_id";
		break;
	}

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE'.$sql;
		break;
	}

	// No rows returned
	if ($result->num_rows === 0) {
		$array['ERROR'] = 'NO RECORDS RETURNED MATCHING REQUEST';
		break;
	}

	while ($row = $result->fetch_assoc()) {
		$selectKey = $row['selectKey'];
		$selectValue = $row['selectValue'];
		$array[] = array(
			"key" => $selectKey,
			"value" => $selectValue
		);
	}
	break;
		
// *** REPORT: MOTIVE STEPS OVER XXX (BY FLOWNAME) ***
case 'MotiveStepsOverThreshold':

	// *** SQL 1 *** Agents with Slow Motive Step
	$sql = "SELECT flow_name, COUNT(*) AS count_slow, SEC_TO_TIME(ROUND(AVG(elapsed_seconds))) AS average_slow FROM duration_log_step_automation WHERE in_progress = 'N' AND (start_time BETWEEN('$startDate') AND ('$endDate'))$motiveStepFilterExceeded$attUIDFilter$workSourceFilter$businessLineFilter$taskTypeFilter$cityFilter GROUP BY flow_name ORDER BY flow_name ASC";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		break;
	}

	// No rows returned
	if ($result->num_rows === 0) {
		$array['ERROR'] = 'NO RECORDS RETURNED MATCHING REQUEST';
		break;
	}

	$array_count = 0;
	$haystack = '';
	while ($row = $result->fetch_assoc()) {
		$flow_name = $row['flow_name'];
		$lookup[$flow_name] = $array_count;
		if ($haystack == "") {
			$haystack = "'$flow_name'";
		} else {
			$haystack = $haystack . ", '$flow_name'";
		}
		$array[$array_count] = $row;
		$array[$array_count]['count_total'] = 0;
		$array[$array_count]['average_total'] = '00:00:00';
		$array[$array_count]['count_standard'] = 0;
		$array[$array_count]['average_standard'] = '00:00:00';
		$array_count++;
	}

	// *** SQL 2 *** Get Total Counts 
	$sql = "SELECT flow_name, COUNT(*) AS count, SEC_TO_TIME(ROUND(AVG(elapsed_seconds))) AS average FROM duration_log_step_automation WHERE in_progress = 'N' AND (start_time BETWEEN('$startDate') AND ('$endDate'))$attUIDFilter$workSourceFilter$businessLineFilter$taskTypeFilter$cityFilter AND flow_name IN ($haystack) GROUP BY flow_name ORDER BY flow_name ASC";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		break;
	}

	// No rows returned
	if ($result->num_rows === 0) {
		$array['ERROR'] = 'NO RECORDS RETURNED MATCHING REQUEST';
		break;
	}

	while ($row = $result->fetch_assoc()) {
		$flow_name = $row['flow_name'];
		if (array_key_exists($flow_name, $lookup)) {
			$array_item = $lookup[$flow_name];
			$count = $row['count'];
			$average = $row['average'];
			$array[$array_item]['count'] = $count;
			$array[$array_item]['average'] = $average;
		}
	}

	// *** SQL 3 *** Get Counts of flows within Motive Step Threshold
	$sql = "SELECT flow_name, COUNT(*) AS count, SEC_TO_TIME(ROUND(AVG(elapsed_seconds))) AS average FROM duration_log_step_automation WHERE in_progress = 'N' AND (start_time BETWEEN('$startDate') AND ('$endDate'))$motiveStepFilterWithin$attUIDFilter$workSourceFilter$businessLineFilter$taskTypeFilter$cityFilter AND flow_name IN ($haystack) GROUP BY flow_name ORDER BY flow_name ASC";

	if (!$result = $mysqli->query($sql)) {
	$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		break;
	}
	
	while ($row = $result->fetch_assoc()) {
		$flow_name = $row['flow_name'];
		if (array_key_exists($flow_name, $lookup)) {
			$array_item = $lookup[$flow_name];
			$count = $row['count'];
			$average = $row['average'];
			$array[$array_item]['count_standard'] = $count;
			$array[$array_item]['average_standard'] = $average;
		}
	}
	break;

// *** REPORT: AGENT STEPS OVER XXX BY FLOWNAME/STEPNAME ***
case 'AgentStepsOverThreshold':

	// *** SQL 1 *** Agents with Slow Agent Step
	$sql = "SELECT CONCAT(flow_name, step_name) AS flow_and_step, flow_name, step_name, COUNT(*) AS count_slow, SEC_TO_TIME(ROUND(AVG(elapsed_seconds))) AS average_slow FROM duration_log_step_manual WHERE in_progress = 'N' AND (start_time BETWEEN('$startDate') AND ('$endDate')) $agentStepFilterExceeded$attUIDFilter$workSourceFilter$businessLineFilter$taskTypeFilter$cityFilter GROUP BY CONCAT(flow_name, step_name) ORDER BY CONCAT(flow_name, step_name) ASC";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		break;
	}

	// No rows returned
	if ($result->num_rows === 0) {
		$array['ERROR'] = 'NO RECORDS RETURNED MATCHING REQUEST';
		break;
	}

	$array_count = 0;
	$haystack = '';
	while ($row = $result->fetch_assoc()) {
		$flow_and_step = $row['flow_and_step'];
		$lookup[$flow_and_step] = $array_count;
		if ($haystack == "") {
			$haystack = "'$flow_and_step'";
		} else {
			$haystack = $haystack . ", '$flow_and_step'";
		}
		$array[$array_count] = $row;
		$array[$array_count]['count_total'] = 0;
		$array[$array_count]['average_total'] = '00:00:00';
		$array[$array_count]['count_standard'] = 0;
		$array[$array_count]['average_standard'] = '00:00:00';
		$array_count++;
	}

	// *** SQL 2 *** Get Total Counts
	$sql = "SELECT CONCAT(flow_name, step_name) AS flow_and_step, flow_name, step_name, COUNT(*) AS count, SEC_TO_TIME(ROUND(AVG(elapsed_seconds))) AS average FROM duration_log_step_manual WHERE in_progress = 'N' AND (start_time BETWEEN('$startDate') AND ('$endDate'))$attUIDFilter$workSourceFilter$businessLineFilter$taskTypeFilter$cityFilter AND CONCAT(flow_name, step_name) IN ($haystack) GROUP BY CONCAT(flow_name, step_name) ORDER BY CONCAT(flow_name, step_name) ASC";
	
	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		break;
	}

	// No rows returned
	if ($result->num_rows === 0) {
		$array['ERROR'] = 'NO RECORDS RETURNED MATCHING REQUEST';
		break;
	}


	while ($row = $result->fetch_assoc()) {
		$flow_and_step = $row['flow_and_step'];
		if (array_key_exists($flow_and_step, $lookup)) {
			$array_item = $lookup[$flow_and_step];
			$count = $row['count'];
			$average = $row['average'];
			$array[$array_item]['count'] = $count;
			$array[$array_item]['average'] = $average;
		}
	}

	// *** SQL 3 *** Get Counts of flows within Agent Step Threshold
	$sql = "SELECT CONCAT(flow_name, step_name) AS flow_and_step, flow_name, step_name, COUNT(*) AS count, SEC_TO_TIME(ROUND(AVG(elapsed_seconds))) AS average FROM duration_log_step_manual WHERE in_progress = 'N' AND (start_time BETWEEN('$startDate') AND ('$endDate'))$agentStepFilterWithin$attUIDFilter$workSourceFilter$businessLineFilter$taskTypeFilter$cityFilter AND CONCAT(flow_name, step_name) IN ($haystack) GROUP BY CONCAT(flow_name, step_name) ORDER BY CONCAT(flow_name, step_name) ASC";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		break;
	}

	while ($row = $result->fetch_assoc()) {
		$flow_and_step = $row['flow_and_step'];
		if (array_key_exists($flow_and_step, $lookup)) {
			$array_item = $lookup[$flow_and_step];
			$count = $row['count'];
			$average = $row['average'];
			$array[$array_item]['count_standard'] = $count;
			$array[$array_item]['average_standard'] = $average;
		}
	}
	break;

		
// *** REPORT: AGENT PERFORMANCE (BY AGENT) ***
case 'AgentPerformanceByAgent':
	// Get list of agents
	$sql = "SELECT CONCAT(last_name, ', ', first_name) AS agent_name, att_uid, manager_id, SEC_TO_TIME(ROUND(AVG(elapsed_seconds),0)) AS session_average, COUNT(*) AS count_completed FROM duration_log_session WHERE start_time BETWEEN('$startDate') AND ('$endDate')$attUIDFilter$workSourceFilter$businessLineFilter$taskTypeFilter$cityFilter GROUP BY att_uid ORDER BY agent_name";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		break;
	}

	// No rows returned
	if ($result->num_rows === 0) {
		$array['ERROR'] = 'NO RECORDS RETURNED MATCHING REQUEST';
		break;
	}

	$array_count = 0;
	$haystack = '';
	while ($row = $result->fetch_assoc()) {
		$att_uid = $row['att_uid'];
		$lookup[$att_uid] = $array_count;
		if ($haystack == "") {
			$haystack = "'$att_uid'";
		} else {
			$haystack = $haystack . ", '$att_uid'";
		}
		$array[$array_count] = $row;
		$array[$array_count]['count_slow_workflow'] = 0;
		$array[$array_count]['percent_slow_workflow'] = '0.00';
		$array[$array_count]['count_slow_motive'] = 0;
		$array[$array_count]['percent_slow_motive'] = '0.00';
		$array[$array_count]['count_slow_agent'] = 0;
		$array[$array_count]['percent_slow_agent'] = '0.00';
		$array_count++;
	}
	
	// Get list of slow Workflow Counts / Percentage
	$sql = "SELECT att_uid, COUNT(*) AS count FROM duration_log_session WHERE (start_time BETWEEN('$startDate') AND ('$endDate'))$sessionThresholdExceeded$attUIDFilter$workSourceFilter$businessLineFilter$taskTypeFilter$cityFilter AND att_uid IN ($haystack) GROUP BY att_uid ORDER BY att_uid";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		break;
	}

	while ($row = $result->fetch_assoc()) {
		$att_uid = $row['att_uid'];
		if (array_key_exists($att_uid, $lookup)) {
			$array_item = $lookup[$att_uid];
			$count = $row['count'];
			$array[$array_item]['count_slow_workflow'] = $count;
			$total = $array[$array_item]['count_completed'];
			$percentage = (ROUND($count / $total, 2)) * 100;
			$array[$array_item]['percent_slow_workflow'] = number_format($percentage, 2, '.', '');
		}
	}

	// Get list of slow Motive Step Counts / Percentage
	$sql = "SELECT att_uid, COUNT(DISTINCT smp_session_id) AS count FROM duration_log_step_automation WHERE in_progress = 'N' AND (start_time BETWEEN('$startDate') AND ('$endDate'))$motiveStepFilterExceeded$attUIDFilter$workSourceFilter$businessLineFilter$taskTypeFilter$cityFilter AND att_uid IN ($haystack) GROUP BY att_uid ORDER BY att_uid";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		break;
	}

	while ($row = $result->fetch_assoc()) {
		$att_uid = $row['att_uid'];
		if (array_key_exists($att_uid, $lookup)) {
			$array_item = $lookup[$att_uid];
			$count = $row['count'];
			$array[$array_item]['count_slow_motive'] = $count;
			$total = $array[$array_item]['count_completed'];
			$percentage = (ROUND($count / $total, 2)) * 100;
			$array[$array_item]['percent_slow_motive'] = number_format($percentage, 2, '.', '');
		}
	}

	// Get list of slow Agent Steps Counts / Percentage
	$sql = "SELECT att_uid, COUNT(DISTINCT smp_session_id) AS count FROM duration_log_step_manual WHERE in_progress = 'N' AND (start_time BETWEEN('$startDate') AND ('$endDate'))$agentStepFilterExceeded$attUIDFilter$workSourceFilter$businessLineFilter$taskTypeFilter$cityFilter AND att_uid IN ($haystack) GROUP BY att_uid ORDER BY att_uid";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		break;
	}

	while ($row = $result->fetch_assoc()) {
		$att_uid = $row['att_uid'];
		if (array_key_exists($att_uid, $lookup)) {
			$array_item = $lookup[$att_uid];
			$count = $row['count'];
			$array[$array_item]['count_slow_agent'] = $count;
			$total = $array[$array_item]['count_completed'];
			$percentage = (ROUND($count / $total ,2)) * 100;
			$array[$array_item]['percent_slow_agent'] = number_format($percentage, 2, '.', '');
		}
	}
	break;

// *** REPORT: AGENT PERFORMANCE (BY SESSION) ***
case 'AgentPerformanceBySession':
	// Get list of sessions
	$sql = "SELECT smp_session_id, start_time, stop_time, SEC_TO_TIME(elapsed_seconds) AS session_duration, att_uid, CONCAT(last_name, ', ', first_name) AS agent_name, manager_id, work_source, business_line, task_type FROM duration_log_session WHERE (start_time BETWEEN('$startDate') AND ('$endDate'))$attUIDFilter$workSourceFilter$businessLineFilter$taskTypeFilter$cityFilter ORDER BY agent_name";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		break;
	}
	
	// No rows returned
	if ($result->num_rows === 0) {
		$array['ERROR'] = 'NO RECORDS RETURNED MATCHING REQUEST';
		break;
	}

	$array_count = 0;
	$haystack = '';
	while ($row = $result->fetch_assoc()) {
		$smp_session_id = $row['smp_session_id'];
		$lookup[$smp_session_id] = $array_count;
		if ($haystack == "") {
			$haystack = "'$smp_session_id'";
		} else {
			$haystack = $haystack . ", '$smp_session_id'";
		}
		$array[$array_count] = $row;
		$array[$array_count]['count_motive_within'] = 0;
		$array[$array_count]['duration_motive_within'] = '00:00:00';
		$array[$array_count]['count_motive_exceeded'] = 0;
		$array[$array_count]['duration_motive_exceeded'] = '00:00:00';
		$array[$array_count]['count_agent_within'] = 0;
		$array[$array_count]['duration_agent_within'] = '00:00:00';
		$array[$array_count]['count_agent_exceeded'] = 0;
		$array[$array_count]['duration_agent_exceeded'] = '00:00:00';
		$array_count++;
	}
	
	
	// Under Motive Steps Target
	$sql = "SELECT smp_session_id, COUNT(*) AS count, SEC_TO_TIME(SUM(elapsed_seconds)) AS duration FROM duration_log_step_automation WHERE start_time BETWEEN('$startDate') AND ('$endDate')$motiveStepFilterWithin$attUIDFilter$workSourceFilter$businessLineFilter$taskTypeFilter$cityFilter AND smp_session_id IN ($haystack) GROUP BY smp_session_id ORDER BY smp_session_id";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		break;
	}
	
	while ($row = $result->fetch_assoc()) {
		$smp_session_id = $row['smp_session_id'];
		if (array_key_exists($smp_session_id, $lookup)) {
			$array_item = $lookup[$smp_session_id];
			$count = $row['count'];
			$duration = $row['duration'];
			$array[$array_item]['count_motive_within'] = $count;
			$array[$array_item]['duration_motive_within'] = $duration;
		}
	}

	// Over Motive Steps Target
	$sql = "SELECT smp_session_id, COUNT(*) AS count, SEC_TO_TIME(SUM(elapsed_seconds)) AS duration FROM duration_log_step_automation WHERE start_time BETWEEN('$startDate') AND ('$endDate')$motiveStepFilterExceeded$attUIDFilter$workSourceFilter$businessLineFilter$taskTypeFilter$cityFilter AND smp_session_id IN ($haystack) GROUP BY smp_session_id ORDER BY smp_session_id";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		break;
	}
	
	while ($row = $result->fetch_assoc()) {
		$smp_session_id = $row['smp_session_id'];
		if (array_key_exists($smp_session_id, $lookup)) {
			$array_item = $lookup[$smp_session_id];
			$count = $row['count'];
			$duration = $row['duration'];
			$array[$array_item]['count_motive_exceeded'] = $count;
			$array[$array_item]['duration_motive_exceeded'] = $duration;
		}
	}


	// Under Agent Steps Target
	$sql = "SELECT smp_session_id, COUNT(*) AS count, SEC_TO_TIME(SUM(elapsed_seconds)) AS duration FROM duration_log_step_manual WHERE start_time BETWEEN('$startDate') AND ('$endDate')$agentStepFilterWithin$attUIDFilter$workSourceFilter$businessLineFilter$taskTypeFilter$cityFilter AND smp_session_id IN ($haystack) GROUP BY smp_session_id ORDER BY smp_session_id";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		break;
	}
	
	while ($row = $result->fetch_assoc()) {
		$smp_session_id = $row['smp_session_id'];
		if (array_key_exists($smp_session_id, $lookup)) {
			$array_item = $lookup[$smp_session_id];
			$count = $row['count'];
			$duration = $row['duration'];
			$array[$array_item]['count_agent_within'] = $count;
			$array[$array_item]['duration_agent_within'] = $duration;
		}
	}

	// Over Agent Steps Target
	$sql = "SELECT smp_session_id, COUNT(*) AS count, SEC_TO_TIME(SUM(elapsed_seconds)) AS duration FROM duration_log_step_manual WHERE start_time BETWEEN('$startDate') AND ('$endDate')$agentStepFilterExceeded$attUIDFilter$workSourceFilter$businessLineFilter$taskTypeFilter$cityFilter AND smp_session_id IN ($haystack) GROUP BY smp_session_id ORDER BY smp_session_id";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		break;
	}
	
	while ($row = $result->fetch_assoc()) {
		$smp_session_id = $row['smp_session_id'];
		if (array_key_exists($smp_session_id, $lookup)) {
			$array_item = $lookup[$smp_session_id];
			$count = $row['count'];
			$duration = $row['duration'];
			$array[$array_item]['count_agent_exceeded'] = $count;
			$array[$array_item]['duration_agent_exceeded'] = $duration;
		}
	}
	break;

// *** REPORT: ASSET HISTORY (NON AWS) ***
case 'AssetHistoryNonAWS':

	// Generate unique name for temporary table
	$sql = "SELECT CONCAT('temp_table_', REPLACE(UUID(), '-', '')) AS table_name";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		break;
	}
		
	$row = $result->fetch_assoc();
	$table_name = $row['table_name'];
	
	// create a temporary table with the count and asset id's to use
	$sql = "CREATE TEMPORARY TABLE IF NOT EXISTS $table_name AS SELECT DISTINCT RTRIM(LTRIM((asset_id))) AS asset_id, COUNT(*) AS instance_count FROM duration_log_session WHERE task_type NOT LIKE '%AWSX%' AND (business_line != 'TSC' AND business_line != 'TSCNOC') AND asset_id !='UNKNOWN' AND asset_id != '' AND start_time BETWEEN('$startDate') AND ('$endDate')$assetIdFilter GROUP BY RTRIM(LTRIM(asset_id)) $minimumCountFilter ORDER BY instance_count DESC, asset_id ASC";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		break;
	}

	// No rows returned
	if ($result->num_rows === 0) {
		$array['ERROR'] = 'NO RECORDS RETURNED MATCHING REQUEST';
		break;
	}
	
	// gather detail records
	$sql = "SELECT session.asset_id, temp.instance_count, smp_session_id, ticket_number, work_source, task_type, start_time, stop_time FROM duration_log_session session LEFT JOIN $table_name temp ON session.asset_id = temp.asset_id WHERE task_type NOT LIKE '%AWSX%' AND (business_line != 'TSC' AND business_line != 'TSCNOC') AND session.asset_id !='UNKNOWN' AND session.asset_id != '' AND start_time BETWEEN('$startDate') AND ('$endDate') AND temp.instance_count IS NOT NULL$assetIdFilter $minimumCountFilter ORDER BY temp.instance_count DESC, session.asset_id ASC, session.start_time ASC";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		break;
	}

	// No rows returned
	if ($result->num_rows === 0) {
		$array['ERROR'] = 'NO RECORDS RETURNED MATCHING REQUEST';
		break;
	}	
	
	$asset_count = 0;
	while ($row = $result->fetch_assoc()) {
		$array[$asset_count]['asset_id'] = $row['asset_id'];
		$array[$asset_count]['count'] = $row['instance_count'];
		$array[$asset_count]['session_id'] = $row['smp_session_id'];
		$array[$asset_count]['ticket_number'] = $row['ticket_number'];
		$array[$asset_count]['work_type'] = $row['work_source'];
		$array[$asset_count]['task_type'] = $row['task_type'];
		$array[$asset_count]['start_time']  = $row['start_time'];
		$array[$asset_count]['stop_time'] = $row['stop_time'];
		$asset_count++;
	}
	
	$sql = "DROP TABLE IF EXISTS $table_name";
	$result = ($mysqli->query($sql));
	break;

// *** REPORT: ASSET HISTORY (AWS) ***
case 'AssetHistoryAWS':

	// Generate unique name for temporary table
	$sql = "SELECT CONCAT('temp_table_', REPLACE(UUID(), '-', '')) AS table_name";
	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		break;
	}
		
	$row = $result->fetch_assoc();
	$table_name = $row['table_name'];
	
	// create a temporary table with the count and asset id's to use
	$sql = "CREATE TEMPORARY TABLE IF NOT EXISTS $table_name AS SELECT DISTINCT UCASE(CONCAT(RTRIM(LTRIM((asset_id))), SOUNDEX(RTRIM(LTRIM(contact_name))), RTRIM(LTRIM(room_number)))) AS mainKey, COUNT(*) AS instance_count FROM duration_log_session WHERE (task_type LIKE '%AWSX%' OR business_line = 'TSC' OR business_line = 'TSCNOC') AND work_source !='AWS Training Simulator' AND asset_id !='UNKNOWN' AND asset_id != '' AND asset_id != 'INFO' AND contact_name != '' AND start_time BETWEEN('$startDate') AND ('$endDate')$assetIdFilter GROUP BY UCASE(CONCAT(RTRIM(LTRIM(asset_id)), RTRIM(LTRIM(contact_name)), RTRIM(LTRIM(room_number)))) $minimumCountFilter ORDER BY instance_count DESC, asset_id ASC";
	
	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		break;
	}

	// No rows returned
	if ($result->num_rows === 0) {
		$array['ERROR'] = 'NO RECORDS RETURNED MATCHING REQUEST';
		break;
	}

	// gather detail records
	$sql = "SELECT UCASE(CONCAT(RTRIM(LTRIM((asset_id))), SOUNDEX(RTRIM(LTRIM(contact_name))), RTRIM(LTRIM(room_number)))) AS rowKey, asset_id, UCASE(venue_name) AS venue_name, UCASE(RTRIM(LTRIM(contact_name))) AS contact_name, UCASE(RTRIM(LTRIM(room_number))) AS room_number, temp.instance_count, smp_session_id, ticket_number, work_source, task_type, start_time, stop_time FROM duration_log_session session LEFT JOIN $table_name temp ON UCASE(CONCAT(RTRIM(LTRIM((asset_id))), SOUNDEX(RTRIM(LTRIM(contact_name))), RTRIM(LTRIM(room_number)))) = mainKey WHERE (task_type LIKE '%AWSX%' OR business_line = 'TSC' OR business_line = 'TSCNOC') AND work_source != 'AWS Training Simulator' AND session.asset_id !='UNKNOWN' AND asset_id !='UNKNOWN' AND asset_id != '' AND asset_id !='INFO' AND contact_name != '' AND start_time BETWEEN('$startDate') AND ('$endDate') AND temp.instance_count IS NOT NULL$assetIdFilter $minimumCountFilter ORDER BY temp.instance_count DESC, asset_id ASC, session.start_time ASC";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		break;
	}
	
	// No rows returned
	if ($result->num_rows === 0) {
		$array['ERROR'] = 'NO RECORDS RETURNED MATCHING REQUEST';
		break;
	}
	
	$asset_count = 0;
	while ($row = $result->fetch_assoc()) {
		$array[$asset_count]['rowKey'] = $row['rowKey'];
		$array[$asset_count]['asset_id'] = $row['asset_id'];
		$array[$asset_count]['venue_name'] = $row['venue_name'];
		$array[$asset_count]['contact_name'] = $row['contact_name'];
		$array[$asset_count]['room_number'] = $row['room_number'];
		$array[$asset_count]['count'] = $row['instance_count'];
		$array[$asset_count]['session_id'] = $row['smp_session_id'];
		$array[$asset_count]['ticket_number'] = $row['ticket_number'];
		$array[$asset_count]['work_type'] = $row['work_source'];
		$array[$asset_count]['task_type'] = $row['task_type'];
		$array[$asset_count]['start_time']  = $row['start_time'];
		$array[$asset_count]['stop_time'] = $row['stop_time'];
		$asset_count++;
	}
	
	$sql = "DROP TABLE IF EXISTS $table_name";
	$result = ($mysqli->query($sql));
	break;

// *** REPORT: ASSET HISTORY (AWS) ***
case 'MACHistoryAWS':

	// Generate unique name for temporary table
	$sql = "SELECT CONCAT('temp_table_', REPLACE(UUID(), '-', '')) AS table_name";
	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		break;
	}
		
	$row = $result->fetch_assoc();
	$table_name = $row['table_name'];
	
	// create a temporary table with the count and asset id's to use
	$sql = "CREATE TEMPORARY TABLE IF NOT EXISTS $table_name AS SELECT UCASE(LTRIM(RTRIM(mac))) AS rowKey, COUNT(*) AS instance_count FROM duration_log_session WHERE mac != '' AND (business_line = 'TSC' OR business_line = 'TSCNOC' OR task_type LIKE '%AWSX%') AND start_time BETWEEN('$startDate') AND ('$endDate')$assetIdFilter GROUP BY mac $minimumCountFilter ORDER BY instance_count DESC, mac";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		break;
	}
	
		// No rows returned
	if ($result->num_rows === 0) {
		$array['ERROR'] = 'NO RECORDS RETURNED MATCHING REQUEST';
		break;
	}
	
	$sql = "SELECT recorded, mac, instance_count, smp_session_id, ticket_number, start_time, stop_time, work_source, task_type, UCASE(asset_id) AS venue_code, UCASE(venue_name) AS venue_name, problem_abstract FROM duration_log_session LEFT JOIN $table_name temp ON mac=temp.rowKey WHERE mac != '' AND (business_line = 'TSC' OR business_line = 'TSCNOC' OR task_type like '%AWSX%') AND start_time BETWEEN('$startDate') AND ('$endDate') AND work_source != 'AWS Training Simulator' AND temp.instance_count IS NOT NULL$assetIdFilter $minimumCountFilter ORDER BY mac, recorded;";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		break;
	}

	// No rows returned
	if ($result->num_rows === 0) {
		$array['ERROR'] = 'NO RECORDS RETURNED MATCHING REQUEST';
		break;
	}

	$asset_count = 0;
	while ($row = $result->fetch_assoc()) {
		$array[$asset_count]['rowKey'] = $row['mac'];
		$array[$asset_count]['mac'] = $row['mac'];
		$array[$asset_count]['count'] = $row['instance_count'];		
		if (strlen($row['venue_name']) > 27) {
			$venue = substr($row['venue_name'], 0,30). ' ...';
		} else {
			$venue = $row['venue_name'];
		}
		$array[$asset_count]['venue_code'] = $row['venue_code'];
		$array[$asset_count]['venue_name'] = $venue;
		$array[$asset_count]['session_id'] = $row['smp_session_id'];
		$array[$asset_count]['ticket_number'] = $row['ticket_number'];
		$array[$asset_count]['work_type'] = $row['work_source'];
		$array[$asset_count]['task_type'] = $row['task_type'];
		$array[$asset_count]['start_time']  = $row['start_time'];
		$array[$asset_count]['stop_time'] = $row['stop_time'];
		$array[$asset_count]['problem_abstract'] = $row['problem_abstract'];
		$asset_count++;
	}
	
	$sql = "DROP TABLE IF EXISTS $table_name";
	$result = ($mysqli->query($sql));
	break;

// *** REPORT: WORKFLOW COMPLETION COUNT BREAKDOWN ***
case 'WorkflowCompletionCountBreakdown':

	$row_count = 0;
	$sql = "SELECT COUNT(*) AS count FROM duration_log_session WHERE (start_time BETWEEN('$startDate') AND ('$endDate'))$attUIDFilter$cityFilter";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		break;
	}

	while ($row = $result->fetch_assoc()) {
		$total_count = $row['count'];
	}

	$sql = "SELECT COUNT(*) AS count, UCASE(CONCAT(last_name, ', ', first_name, ' (', att_uid, ')')) AS agent_name FROM duration_log_session WHERE (start_time BETWEEN('$startDate') AND ('$endDate')) AND work_source != 'AWS Training Simulator' $attUIDFilter$cityFilter GROUP BY att_uid ORDER BY agent_name";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		break;
	}

	// No rows returned
	if ($result->num_rows === 0) {
		$array['ERROR'] = 'NO RECORDS RETURNED MATCHING REQUEST';
		break;
	}

	while ($row = $result->fetch_assoc()) {
		$array[$row_count]['report_name'] = 'CountByAgent';
		$array[$row_count]['row_name'] = $row['agent_name'];
		$array[$row_count]['count'] = $row['count'];
		$array[$row_count]['total_count'] = $total_count;
		$row_count++;
	}

	$sql = "SELECT COUNT(*) AS count, business_line FROM duration_log_session WHERE (start_time BETWEEN('$startDate') AND ('$endDate')) AND work_source !='AWS Training Simulator'$attUIDFilter$cityFilter GROUP BY business_line ORDER BY business_line";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		break;
	}

	while ($row = $result->fetch_assoc()) {
		$array[$row_count]['report_name'] = 'CountByBusinessLine';
		$array[$row_count]['row_name'] = $row['business_line'];
		$array[$row_count]['count'] = $row['count'];
		$array[$row_count]['total_count'] = $total_count;
		$row_count++;
	}

	$sql = "SELECT COUNT(*) AS count, work_source FROM duration_log_session WHERE (start_time BETWEEN('$startDate') AND ('$endDate')) AND work_source != 'AWS Training Simulator'$attUIDFilter$cityFilter GROUP BY work_source ORDER BY work_source";
	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		break;
	}

	while ($row = $result->fetch_assoc()) {
		$array[$row_count]['report_name'] = 'CountByWorkSource';
		$array[$row_count]['row_name'] = $row['work_source'];
		$array[$row_count]['count'] = $row['count'];
		$array[$row_count]['total_count'] = $total_count;
		$row_count++;
	}

	$sql = "SELECT COUNT(*) as count FROM duration_log_session WHERE task_type != '' AND (start_time BETWEEN('$startDate') AND ('$endDate')) AND work_source != 'AWS Training Simulator'$attUIDFilter$cityFilter";
	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
	break;
	}

	while ($row = $result->fetch_assoc()) {
		$total_count = $row['count'];
	}

	$sql = "SELECT COUNT(*) AS count, task_type FROM duration_log_session WHERE task_type != '' AND (start_time BETWEEN('$startDate') AND ('$endDate')) AND work_source != 'AWS Training Simulator'$attUIDFilter$cityFilter GROUP BY task_type ORDER BY task_type";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		break;
	}

	while ($row = $result->fetch_assoc()) {
		$array[$row_count]['report_name'] = 'CountByTaskType';
		$array[$row_count]['row_name'] = $row['task_type'];
		$array[$row_count]['count'] = $row['count'];
		$array[$row_count]['total_count'] = $total_count;
		$row_count++;
	}
	break;
}

echo json_encode($array);
exit;

?>