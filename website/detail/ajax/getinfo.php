<?php

$array = array();

// Receive database info from node server
$databaseIP = $_POST['databaseIP'];
$databaseUser = $_POST['databaseUser'];
$databasePW = $_POST['databasePW'];
$databaseName = $_POST['databaseName'];

// retrieve SQl to be run
$sql = $_POST['sql'];

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
?>
