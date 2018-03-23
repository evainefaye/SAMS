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
$attUIDFilter = $_POST['attUIDFilter'];

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
