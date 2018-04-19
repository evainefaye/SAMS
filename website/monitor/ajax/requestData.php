<?php

$array = array();
$lookup = array();

// Receive database info from node server
$databaseIP = $_POST['databaseIP'];
$databaseUser = $_POST['databaseUser'];
$databasePW = $_POST['databasePW'];
$databaseName = $_POST['databaseName'];

// Retrieve Parameters
$selectName = $_POST['selectName'];

// Connect to database provide error if it fails
$mysqli = new mysqli($databaseIP, $databaseUser, $databasePW, $databaseName);

// Oh no! A connect_errno exists so the connection attempt failed!
if ($mysqli->connect_errno) {

	$array['ERROR'] = 'FAILED TO CONNECT TO DATABASE';
	echo json_encode($array);
    exit;
}

//  *** GENERATE SELECT BOX DATA ***
switch ($selectName) {
case '#CitySel':
    $sql = "SELECT DISTINCT city AS selectKey, city AS selectValue FROM duration_log_session WHERE city != '' ORDER BY selectKey";
    break;
case '#SupervisorSel':
    $sql = "SELECT DISTINCT manager_id AS selectKey, manager_id as selectValue FROM duration_log_session WHERE manager_id != '' ORDER BY selectKey";
	break;
}

if (!$result = $mysqli->query($sql)) {
	$array['ERROR'] = 'SQL FAILED TO EXECUTE'.$sql;
    echo json_encode($array);
    exit;
}

// No rows returned
if ($result->num_rows === 0) {
	$array['ERROR'] = 'NO RECORDS RETURNED MATCHING REQUEST';
    echo json_encode($array);
    exit;
}

while ($row = $result->fetch_assoc()) {
	$selectKey = $row['selectKey'];
	$selectValue = $row['selectValue'];
	$array[] = array(
		"key" => $selectKey,
		"value" => $selectValue
	);
}
echo json_encode($array);
exit;
?>