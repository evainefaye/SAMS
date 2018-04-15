<?php

$array = array();

// Receive database info from node server
$databaseIP = $_POST['databaseIP'];
$databaseUser = $_POST['databaseUser'];
$databasePW = $_POST['databasePW'];
$databaseName = $_POST['databaseName'];

// retrieve SQl to be run
$sql = $_POST['sql'];
$reportType = $_POST['reportType'];
$startDate = $_POST['startDate'];
$endDate = $_POST['endDate'];
$attUIDFilter = $_POST['attUIDFilter'];
$workSourceFilter = $_POST['workSourceFilter'];
$businessLineFilter = $_POST['businessLineFilter'];
$taskTypeFilter = $_POST['taskTypeFilter'];
$automationStepFilterWithin = $_POST['automationStepFilterWithin'];
$automationStepFilterExceeded = $_POST['automationStepFilterExceeded'];
$manualStepFilterWithin = $_POST['manualStepFilterWithin'];
$manualStepFilterExceeded = $_POST['manualStepFilterExceeded'];
$automationStepThreshold = $_POST['automationStepThreshold'];
$manualStepThreshold = $_POST['manualStepThreshold'];
$sessionThreshold = $_POST['sessionThreshold'];


// Connect to database provide error if it fails
$mysqli = new mysqli($databaseIP, $databaseUser, $databasePW, $databaseName);

// Oh no! A connect_errno exists so the connection attempt failed!
if ($mysqli->connect_errno) {
    // The connection failed. What do you want to do? 
    // You could contact yourself (email?), log the error, show a nice page, etc.
    // You do not want to reveal sensitive information

    // Let's try this:
	$array['ERROR'] = 'FAILED TO CONNECT TO DATABASE';
	echo json_encode($array);
    exit;
}

// *** REPORT: MOTIVE STEPS OVER XXX (BY FLOWNAME) ***
if ($reportType == 'SlowAutomationSummary') {
	// Perform initial query to get slow automation step information
	$sql = "SELECT flow_name, COUNT(*) AS count_slow, SEC_TO_TIME(ROUND(AVG(elapsed_seconds))) AS average_slow FROM duration_log_step_automation WHERE in_progress = 'N' $automationStepFilterExceeded AND (start_time BETWEEN('$startDate') AND ('$endDate')) $attUIDFilter $workSourceFilter $businessLineFilter $taskTypeFilter GROUP BY flow_name ORDER BY flow_name ASC";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		echo json_encode($array);
		exit;
	}
	
	// No rows returned
	if ($result->num_rows === 0) {
		// Oh, no rows! Sometimes that's expected and okay, sometimes
		// it is not. You decide. In this case, maybe actor_id was too
		// large? 
		$array['ERROR'] = 'NO RECORDS RETURNED MATCHING REQUEST';
		echo json_encode($array);
		exit;
	}

	while ($row = $result->fetch_assoc()) {
		$flow_name = $row['flow_name'];
		$array[$flow_name] = $row;
		$array[$flow_name]['count_total'] = 0;
		$array[$flow_name]['average_total'] = '00:00:00';
		$array[$flow_name]['count_standard'] = 0;
		$array[$flow_name]['average_standard'] = '00:00:00';
	}

	// SQL to get total counts
	$sql = "SELECT flow_name, COUNT(*) AS count, SEC_TO_TIME(ROUND(AVG(elapsed_seconds))) AS average FROM duration_log_step_automation WHERE in_progress = 'N' AND (start_time BETWEEN('$startDate') AND ('$endDate')) $attUIDFilter $workSourceFilter $businessLineFilter $taskTypeFilter GROUP BY flow_name ORDER BY flow_name ASC";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		echo json_encode($array);
		exit;
	}
	
	while ($row = $result->fetch_assoc()) {
		$flow_name = $row['flow_name'];
		if (array_key_exists($flow_name, $array)) {
			$count = $row['count'];
			$average = $row['average'];
			$array[$flow_name]['count'] = $count;
			$array[$flow_name]['average'] = $average;
		}
	}
	
	// SQL to get standard counts
	$sql = "SELECT flow_name, COUNT(*) AS count, SEC_TO_TIME(ROUND(AVG(elapsed_seconds))) AS average FROM duration_log_step_automation WHERE in_progress = 'N' $automationStepFilterWithin AND (start_time BETWEEN('$startDate') AND ('$endDate')) $attUIDFilter $workSourceFilter $businessLineFilter $taskTypeFilter GROUP BY flow_name ORDER BY flow_name ASC";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		echo json_encode($array);
		exit;
	}
	
	while ($row = $result->fetch_assoc()) {
		$flow_name = $row['flow_name'];
		if (array_key_exists($flow_name, $array)) {
			$count = $row['count'];
			$average = $row['average'];
			$array[$flow_name]['count_standard'] = $count;
			$array[$flow_name]['average_standard'] = $average;
		}
	}

	echo json_encode($array);
	exit;
}


// *** REPORT: AGENT STEPS OVER XXX BY FLOWNAME/STEPNAME ***
if ($reportType == 'SlowManualSummary') {
	// Perform initial query to get slow manual step information
	$sql = "SELECT CONCAT(flow_name, step_name) AS flow_step, flow_name, step_name, COUNT(*) AS count_slow, SEC_TO_TIME(ROUND(AVG(elapsed_seconds))) AS average_slow FROM duration_log_step_manual WHERE in_progress = 'N' $manualStepFilterExceeded AND (start_time BETWEEN('$startDate') AND ('$endDate')) $attUIDFilter $workSourceFilter $businessLineFilter $taskTypeFilter GROUP BY CONCAT(flow_name, step_name) ORDER BY CONCAT(flow_name, step_name) ASC";
	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		echo json_encode($array);
		exit;
	}
	
	// No rows returned
	if ($result->num_rows === 0) {
		// Oh, no rows! Sometimes that's expected and okay, sometimes
		// it is not. You decide. In this case, maybe actor_id was too
		// large? 
		$array['ERROR'] = 'NO RECORDS RETURNED MATCHING REQUEST';
		echo json_encode($array);
		exit;
	}

	while ($row = $result->fetch_assoc()) {
		$flow_step = $row['flow_step'];
		$array[$flow_step] = $row;
		$array[$flow_step]['count_total'] = 0;
		$array[$flow_step]['average_total'] = '00:00:00';
		$array[$flow_step]['count_standard'] = 0;
		$array[$flow_step]['average_standard'] = '00:00:00';
	}

	// SQL to get total counts
	$sql = "SELECT CONCAT(flow_name, step_name) AS flow_step, flow_name, step_name, COUNT(*) AS count, SEC_TO_TIME(ROUND(AVG(elapsed_seconds))) AS average FROM duration_log_step_manual WHERE in_progress = 'N' AND (start_time BETWEEN('$startDate') AND ('$endDate')) $attUIDFilter $workSourceFilter $businessLineFilter $taskTypeFilter GROUP BY CONCAT(flow_name, step_name) ORDER BY CONCAT(flow_name, step_name) ASC";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		echo json_encode($array);
		exit;
	}
	
	while ($row = $result->fetch_assoc()) {
		$flow_step = $row['flow_step'];
		if (array_key_exists($flow_step, $array)) {
			$count = $row['count'];
			$average = $row['average'];
			$array[$flow_step]['count'] = $count;
			$array[$flow_step]['average'] = $average;
		}
	}

	// SQL to get standard counts
	$sql = "SELECT CONCAT(flow_name, step_name) AS flow_step, flow_name, step_name, COUNT(*) AS count, SEC_TO_TIME(ROUND(AVG(elapsed_seconds))) AS average FROM duration_log_step_manual WHERE in_progress = 'N' $manualStepFilterWithin AND (start_time BETWEEN('$startDate') AND ('$endDate')) $attUIDFilter $workSourceFilter $businessLineFilter $taskTypeFilter GROUP BY CONCAT(flow_name, step_name) ORDER BY CONCAT(flow_name, step_name) ASC";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		echo json_encode($array);
		exit;
	}
	
	while ($row = $result->fetch_assoc()) {
		$flow_step = $row['flow_step'];
		if (array_key_exists($flow_step, $array)) {
			$count = $row['count'];
			$average = $row['average'];
			$array[$flow_step]['count_standard'] = $count;
			$array[$flow_step]['average_standard'] = $average;
		}
	}

	echo json_encode($array);
	exit;
}
// *** REPORT: AGENT PERFORMANCE (BY AGENT) ***
if ($reportType == 'AgentSummary') {
	$sql = "SELECT CONCAT(last_name, ', ', first_name) AS agent_name, att_uid, manager_id, SEC_TO_TIME(ROUND(AVG(elapsed_seconds),0)) AS session_average, COUNT(*) AS count_completed FROM duration_log_session WHERE start_time BETWEEN('$startDate') AND ('$endDate') $attUIDFilter $workSourceFilter $businessLineFilter $taskTypeFilter GROUP BY att_uid ORDER BY agent_name";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		echo json_encode($array);
		exit;
	}
	
	// No rows returned
	if ($result->num_rows === 0) {
		// Oh, no rows! Sometimes that's expected and okay, sometimes
		// it is not. You decide. In this case, maybe actor_id was too
		// large? 
		$array['ERROR'] = 'NO RECORDS RETURNED MATCHING REQUEST';
		echo json_encode($array);
		exit;
	}

	while ($row = $result->fetch_assoc()) {
		$att_uid = $row['att_uid'];
		$array[$att_uid] = $row;
		$array[$att_uid]['count_slow_workflow'] = 0;
		$array[$att_uid]['percent_slow_workflow'] = '0.00';
		$array[$att_uid]['count_slow_automation'] = 0;
		$array[$att_uid]['percent_slow_automation'] = '0.00';
		$array[$att_uid]['count_slow_manual'] = 0;
		$array[$att_uid]['percent_slow_manual'] = '0.00';
	}
	
	
	// SQL to get slow workflow counts / percentage
	$sql = "SELECT att_uid, COUNT(*) AS count FROM duration_log_session WHERE elapsed_seconds >= '$sessionThreshold' AND (start_time BETWEEN('$startDate') AND ('$endDate')) $attUIDFilter $workSourceFilter $businessLineFilter $taskTypeFilter GROUP BY att_uid ORDER BY att_uid";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		echo json_encode($array);
		exit;
	}
	
	while ($row = $result->fetch_assoc()) {
		$att_uid = $row['att_uid'];
		if (array_key_exists($att_uid, $array)) {
			$count = $row['count'];
			$array[$att_uid]['count_slow_workflow'] = $count;
			$total = $array[$att_uid]['count_completed'];
			$percentage = (ROUND($count / $total, 2)) * 100;
			$array[$att_uid]['percent_slow_workflow'] = number_format($percentage, 2, '.', '');
		}
	}

	// SQL to get slow automation counts / percentage
	$sql = "SELECT att_uid, COUNT(DISTINCT smp_session_id) AS count FROM duration_log_step_automation WHERE in_progress = 'N' AND elapsed_seconds >= '$automationStepThreshold' AND (start_time BETWEEN('$startDate') AND ('$endDate'))  $attUIDFilter $workSourceFilter $businessLineFilter $taskTypeFilter GROUP BY att_uid ORDER BY att_uid";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		echo json_encode($array);
		exit;
	}
	
	while ($row = $result->fetch_assoc()) {
		$att_uid = $row['att_uid'];
		if (array_key_exists($att_uid, $array)) {
			$count = $row['count'];
			$array[$att_uid]['count_slow_automation'] = $count;
			$total = $array[$att_uid]['count_completed'];
			$percentage = (ROUND($count / $total, 2)) * 100;
			$array[$att_uid]['percent_slow_automation'] = number_format($percentage, 2, '.', '');
		}
	}

	// SQL to get slow manual counts / percentage
	$sql = "SELECT att_uid, COUNT(DISTINCT smp_session_id) AS count FROM duration_log_step_manual WHERE in_progress = 'N' AND elapsed_seconds >= '$manualStepThreshold' AND (start_time BETWEEN('$startDate') AND ('$endDate')) $attUIDFilter $workSourceFilter $businessLineFilter $taskTypeFilter GROUP BY att_uid ORDER BY att_uid";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		echo json_encode($array);
		exit;
	}
	
	while ($row = $result->fetch_assoc()) {
		$att_uid = $row['att_uid'];
		if (array_key_exists($att_uid, $array)) {
			$count = $row['count'];
			$array[$att_uid]['count_slow_manual'] = $count;
			$total = $array[$att_uid]['count_completed'];
			$percentage = (ROUND($count / $total ,2)) * 100;
			$array[$att_uid]['percent_slow_manual'] = number_format($percentage, 2, '.', '');
		}
	}
	echo json_encode($array);
	exit;
}

// *** REPORT: AGENT PERFORMANCE (BY SESSION) ***
if ($reportType == 'AgentPerformance') {
	$sql = "SELECT smp_session_id, start_time, stop_time, SEC_TO_TIME(elapsed_seconds) AS session_duration, att_uid, CONCAT(last_name, ', ', first_name) AS agent_name, manager_id, work_source, business_line, task_type FROM duration_log_session WHERE (start_time BETWEEN('$startDate') AND ('$endDate')) $attUIDFilter $workSourceFilter $businessLineFilter $taskTypeFilter ORDER BY agent_name";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		echo json_encode($array);
		exit;
	}
	
	// No rows returned
	if ($result->num_rows === 0) {
		// Oh, no rows! Sometimes that's expected and okay, sometimes
		// it is not. You decide. In this case, maybe actor_id was too
		// large? 
		$array['ERROR'] = 'NO RECORDS RETURNED MATCHING REQUEST';
		echo json_encode($array);
		exit;
	}

	while ($row = $result->fetch_assoc()) {
		$smp_session_id = $row['smp_session_id'];
		$array[$smp_session_id] = $row;
		$array[$smp_session_id]['count_automation_within'] = 0;
		$array[$smp_session_id]['duration_automation_within'] = '00:00:00';
		$array[$smp_session_id]['count_automation_exceeded'] = 0;
		$array[$smp_session_id]['duration_automation_exceeded'] = '00:00:00';
		$array[$smp_session_id]['count_manual_within'] = 0;
		$array[$smp_session_id]['duration_manual_within'] = '00:00:00';
		$array[$smp_session_id]['count_manual_exceeded'] = 0;
		$array[$smp_session_id]['duration_manual_exceeded'] = '00:00:00';
	}
	
	
	// Under Motive Steps Target
	$sql = "SELECT smp_session_id, COUNT(*) AS count, SEC_TO_TIME(SUM(elapsed_seconds)) AS duration FROM duration_log_step_automation WHERE elapsed_seconds <'$automationStepThreshold' AND start_time BETWEEN('$startDate') AND ('$endDate') $attUIDFilter $workSourceFilter $businessLineFilter $taskTypeFilter GROUP BY smp_session_id ORDER BY smp_session_id";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		echo json_encode($array);
		exit;
	}
	
	while ($row = $result->fetch_assoc()) {
		$smp_session_id = $row['smp_session_id'];
		if (array_key_exists($smp_session_id, $array)) {
			
			$count = $row['count'];
			$duration = $row['duration'];
			$array[$smp_session_id]['count_automation_within'] = $count;
			$array[$smp_session_id]['duration_automation_within'] = $duration;
		}
	}

	// Over Motive Steps Target
	$sql = "SELECT smp_session_id, COUNT(*) AS count, SEC_TO_TIME(SUM(elapsed_seconds)) AS duration FROM duration_log_step_automation WHERE elapsed_seconds >='$automationStepThreshold' AND start_time BETWEEN('$startDate') AND ('$endDate') $attUIDFilter $workSourceFilter $businessLineFilter $taskTypeFilter GROUP BY smp_session_id ORDER BY smp_session_id";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		echo json_encode($array);
		exit;
	}
	
	while ($row = $result->fetch_assoc()) {
		$smp_session_id = $row['smp_session_id'];
		if (array_key_exists($smp_session_id, $array)) {
			$count = $row['count'];
			$duration = $row['duration'];
			$array[$smp_session_id]['count_automation_exceeded'] = $count;
			$array[$smp_session_id]['duration_automation_exceeded'] = $duration;
		}
	}


	// Under Agent Steps Target
	$sql = "SELECT smp_session_id, COUNT(*) AS count, SEC_TO_TIME(SUM(elapsed_seconds)) AS duration FROM duration_log_step_manual WHERE elapsed_seconds <'$manualStepThreshold' AND start_time BETWEEN('$startDate') AND ('$endDate') $attUIDFilter $workSourceFilter $businessLineFilter $taskTypeFilter GROUP BY smp_session_id ORDER BY smp_session_id";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		echo json_encode($array);
		exit;
	}
	
	while ($row = $result->fetch_assoc()) {
		$smp_session_id = $row['smp_session_id'];
		if (array_key_exists($smp_session_id, $array)) {
			$count = $row['count'];
			$duration = $row['duration'];
			$array[$smp_session_id]['count_manual_within'] = $count;
			$array[$smp_session_id]['duration_manual_within'] = $duration;
		}
	}

	// Over Agent Steps Target
	$sql = "SELECT smp_session_id, COUNT(*) AS count, SEC_TO_TIME(SUM(elapsed_seconds)) AS duration FROM duration_log_step_manual WHERE elapsed_seconds >='$manualStepThreshold' AND start_time BETWEEN('$startDate') AND ('$endDate') $attUIDFilter $workSourceFilter $businessLineFilter $taskTypeFilter GROUP BY smp_session_id ORDER BY smp_session_id";

	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		echo json_encode($array);
		exit;
	}
	
	while ($row = $result->fetch_assoc()) {
		$smp_session_id = $row['smp_session_id'];
		if (array_key_exists($smp_session_id, $array)) {
			$count = $row['count'];
			$duration = $row['duration'];
			$array[$smp_session_id]['count_manual_exceeded'] = $count;
			$array[$smp_session_id]['duration_manual_exceeded'] = $duration;
		}
	}

	echo json_encode($array);
	exit;
}
		
/*** OTHER ***/
if ($reportType != 'PerformanceSummary') {
	if (!$result = $mysqli->query($sql)) {
		$array['ERROR'] = 'SQL FAILED TO EXECUTE';
		echo json_encode($array);
		exit;
	}
	
	// No rows returned
	if ($result->num_rows === 0) {
		// Oh, no rows! Sometimes that's expected and okay, sometimes
		// it is not. You decide. In this case, maybe actor_id was too
		// large? 
		$array['ERROR'] = 'NO RECORDS RETURNED MATCHING REQUEST';
		echo json_encode($array);
		exit;
	}

	while ($row = $result->fetch_assoc()) {
		$array[] = $row;
	}
	echo json_encode($array);
	exit;
}


$startDate = $_POST['startDate'];
$endDate = $_POST['endDate'];
$sql = "SELECT COUNT(*) AS count FROM duration_log_session WHERE (start_time BETWEEN('$startDate') AND ('$endDate')) $attUIDFilter";
if (!$result = $mysqli->query($sql)) {
	$array['ERROR'] = 'SQL FAILED TO EXECUTE';
	echo json_encode($array);
	exit;
}
while ($row = $result->fetch_assoc()) {
	$array['TotalCount'][] = $row;
}

$sql = "SELECT COUNT(*) AS agent_name_count, CONCAT(last_name, ', ', first_name, ' (', UCASE(att_uid), ')') AS agent_name FROM duration_log_session WHERE (start_time BETWEEN('$startDate') AND ('$endDate')) $attUIDFilter GROUP BY att_uid ORDER BY agent_name";
if (!$result = $mysqli->query($sql)) {
	$array['ERROR'] = 'SQL FAILED TO EXECUTE';
	echo json_encode($array);
	exit;
}
while ($row = $result->fetch_assoc()) {
	$array['CountByAgent'][] = $row;
}

$sql = "SELECT COUNT(*) AS business_line_count, business_line FROM duration_log_session WHERE (start_time BETWEEN('$startDate') AND ('$endDate')) $attUIDFilter GROUP BY business_line ORDER BY business_line";
if (!$result = $mysqli->query($sql)) {
	$array['ERROR'] = 'SQL FAILED TO EXECUTE';
	echo json_encode($array);
	exit;
}
while ($row = $result->fetch_assoc()) {
	$array['CountByBusinessLine'][] = $row;
}

$sql = "SELECT COUNT(*) AS work_source_count, work_source FROM duration_log_session WHERE (start_time BETWEEN('$startDate') AND ('$endDate')) $attUIDFilter GROUP BY work_source ORDER BY work_source";
if (!$result = $mysqli->query($sql)) {
	$array['ERROR'] = 'SQL FAILED TO EXECUTE';
	echo json_encode($array);
	exit;
}
while ($row = $result->fetch_assoc()) {
	$array['CountByWorkSource'][] = $row;
}

$sql = "SELECT COUNT(*) AS task_type_count, task_type FROM duration_log_session WHERE task_type != '' AND (start_time BETWEEN('$startDate') AND ('$endDate')) $attUIDFilter GROUP BY task_type ORDER BY task_type";
if (!$result = $mysqli->query($sql)) {
	$array['ERROR'] = 'SQL FAILED TO EXECUTE';
	echo json_encode($array);
	exit;
}

while ($row = $result->fetch_assoc()) {
	$array['CountByTaskType'][] = $row;
}

$sql = "SELECT COUNT(*) as count FROM duration_log_session WHERE task_type != '' AND (start_time BETWEEN('$startDate') AND ('$endDate')) $attUIDFilter";
if (!$result = $mysqli->query($sql)) {
	$array['ERROR'] = 'SQL FAILED TO EXECUTE';
	echo json_encode($array);
	exit;
}

while ($row = $result->fetch_assoc()) {
	$array['TaskTypeTotal'] = $row;
}

echo json_encode($array);
?>
