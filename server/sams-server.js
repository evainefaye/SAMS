// Store the time of the server boot
var serverStartTime = new Date().toUTCString();
var sashaUsers = new Object();
var stepTimers = new Object;
var stepTimersInstance = new Object;
var flowTimers = new Object;
var flowTimersInstance = new Object;
var sessionCounter = new Object;

var notifyStalledStepTime = 300000;
var notifyStalledFlowTime = 1200000;

var db_config = {};
global.con = '';

var argv = require('minimist')(process.argv.slice(2));
var env = argv.e;
switch(env) {
case 'fde':
    var instance = 'FDE';
    var port = '5510';
    var useDB = true;
    var database = 'sams_fde';
    break;
case 'dev':
    var instance = 'FDE';
    var port = '5510';
    var useDB = true;
    var database = 'sams_fde';
case 'beta':
    var instance = 'PRE-PROD';
    var port = '5520';
    var useDB = true;
    var database = 'sams_preprod';
    break;
case 'pre-prod':
    var instance = 'PRE-PROD';
    var port = '5520';
    var useDB = true;
    var database = 'sams_preprod';
    break;
case 'prod':
    var instance = 'PROD';
    var port = '5530';
    var useDB = true;
    var database = 'sams_prod';
    break;
default:
    var instance = 'PROD';
    var port = '5530';
    var useDB = true;
    var database = 'sams_prod';
    break;
}

if (useDB) {
    var mysql = require('mysql');
    var db_config = {
        host: 'localhost',
        user: 'sams',
        password: 'develop',
        database: database
    };
    var connectDB = function(db_config) {
        global.con = mysql.createConnection(db_config);
        global.con.connect(function(err) {
            if (err) {
                if (err.fatal) {
                    useDB = false;
                    console.log(new Date().toString(), 'Fatal Database Error: ' + err.code);
                    console.log(new Date().toString(), 'Database Logging has been disabled.');
                }
            } else {
                useDB = true;
                global.con.on('error', function(err) {
                    if (!err.fatal) {
                        return;
                    } else {
                        useDB = false;
                        switch (err.code) {
                        case 'PROTOCOL_CONNECTION_LOST':
                            console.log(new Date().toString(), 'Database Connection Lost');
                            console.log(new Date().toString(), 'Database Logging temporarily unavailable');
                            setTimeout(function() {
                                connectDB(db_config);
                            }, 10000);
                            break;
                        default:
                            console.log(new Date().toString(), 'Fatal Database Error: ' + err.code);
                            console.log(new Date().toString(), 'Database Logging has been disabled.');
                            break;
                        }
                    }
                });
                console.log(new Date().toString(),'Database Connection successful');
                console.log(new Date().toString(),'Database: ' + database);
                var sql = 'DELETE FROM duration_log_step_automation WHERE in_progress = "Y"';
                global.con.query(sql);
                var sql = 'DELETE FROM duration_log_step_manual WHERE in_progress = "Y"';
                global.con.query(sql);
                var sql = 'DELETE FROM screenshots WHERE in_progress = "Y"';
                global.con.query(sql);
            }
        });
    };
    connectDB(db_config);
}

// Create Socket.IO Server listening on port designated by instance
var io = require('socket.io').listen(port);
console.log(new Date().toString(), 'SAMS ' + instance + ' opened on port ' + port);
io.origins('*:*');
io.sockets.on('connection', function (socket) {

    // *** ITEMS TO DO WHEN CONNECTING ***
    // Store the socket ID, and store the connection in ActivityHistory
    socket.connectionId = socket.id;

    // Request the connected client to announce its connection.
    // On the client side this function will share names but have different
    // functions based on it being a SASHA client, Monitor Client, or SASHA Detail Client
    socket.emit('Request Connection Type', {
        ConnectionId: socket.connectionId,
        ServerStartTime: serverStartTime
    });

    // Perform when any user disconnects
    socket.on('disconnect', function() {
        var connectionId = socket.connectionId;
        if (typeof sashaUsers[connectionId] != 'undefined') {
            var userInfo = sashaUsers[connectionId];
            // Remove the SASHA connection from the list of connected users
            delete sashaUsers[connectionId];
            // Update the list of connected users on monitor clients
            io.sockets.in('monitor').emit('Remove SASHA Connection from Monitor', {
                ConnectionId: connectionId,
                UserInfo: userInfo
            });
            delete flowTimersInstance[connectionId];
            delete stepTimersInstance[connectionId];
            clearInterval(flowTimers[connectionId]);
            clearInterval(stepTimers[connectionId]);
            var attUID = userInfo.AttUID;
            if (typeof sessionCounter[attUID] != 'undefined') {
                sessionCounter[attUID]--;
            }
            if (useDB) {
                var smpSessionId = userInfo.SmpSessionId;
                if (smpSessionId) {
                    var sql = 'UPDATE screenshots SET in_progress="N" WHERE smp_session_id="' + smpSessionId + '"';
                    global.con.query(sql);
                }
            }
            if (useDB) {
                var flowStartTime = userInfo['SessionStartTime'];
                var flowStopTime = new Date().toUTCString();
                var elapsedTime = (Date.parse(flowStopTime)-Date.parse(flowStartTime))/1000;
                if (!isNaN(elapsedTime)) {
                    var sql = 'REPLACE INTO duration_log_session (smp_session_id, start_time, stop_time, elapsed_seconds, att_uid, first_name, last_name, manager_id, work_source, business_line, task_type, threshold_exceeded) VALUES(' +
						mysql.escape(userInfo.SmpSessionId) + ',' +
						mysql.escape(new Date(flowStartTime).toISOString()) + ',' +
						mysql.escape(new Date(flowStopTime).toISOString()) + ',' +
						mysql.escape(elapsedTime) + ',' +
						mysql.escape(userInfo.AttUID) + ',' +
						mysql.escape(userInfo.FirstName) + ',' +
						mysql.escape(userInfo.LastName) + ',' +
						mysql.escape(userInfo.Manager) + ',' +
						mysql.escape(userInfo.SAMSWorkType) + ',' +
						mysql.escape(userInfo.SkillGroup) + ',' +
                        mysql.escape(userInfo.TaskType) + ',';
                    if (elapsedTime > notifyStalledFlowTime / 1000) {
                        sql = sql + mysql.escape('Y');
                    } else {
                        sql = sql + mysql.escape('N');
                    }
                    sql = sql + ')';
                    global.con.query(sql);
                }
                var oldFlowName = userInfo.FlowName;
                var oldStepName = userInfo.StepName;
                var oldStepStartTime =  userInfo.StepStartTime;
                var stepStopTime = new Date().toUTCString();
                elapsedTime = (Date.parse(stepStopTime)-Date.parse(oldStepStartTime))/1000;
                if (!isNaN(elapsedTime)) {
                    var sql = '';
                    switch (oldStepName) {
                    case 'SO WAIT':
                        oldStepStartTime = new Date(oldStepStartTime).toISOString();
                        stepStopTime = new Date(stepStopTime).toISOString();
                        var sql = 'INSERT INTO duration_log_step_automation (smp_session_id, start_time, stop_time, elapsed_seconds, att_uid, first_name, last_name, manager_id, work_source, business_line, task_type, flow_name, step_name, in_progress, threshold_exceeded) VALUES(' +
							mysql.escape(userInfo.SmpSessionId) + ',' +
							mysql.escape(new Date(oldStepStartTime).toISOString()) + ',' +
							mysql.escape(new Date(stepStopTime).toISOString()) + ',' +
							mysql.escape(elapsedTime) + ',' +
							mysql.escape(userInfo.AttUID) + ',' +
							mysql.escape(userInfo.FirstName) + ',' +
							mysql.escape(userInfo.LastName) + ',' +
							mysql.escape(userInfo.Manager) + ',' +
							mysql.escape(userInfo.SAMSWorkType) + ',' +
							mysql.escape(userInfo.SkillGroup) + ',' +
							mysql.escape(userInfo.TaskType) + ',' +
							mysql.escape(oldFlowName) + ',' +
							mysql.escape(oldStepName) +	 ',' +
							mysql.escape('N') + ',';
                        if (elapsedTime >= 30) {
                            sql = sql + mysql.escape('Y') + ')';
                        } else {
                            sql = sql + mysql.escape('N') + ')';
                        }
                        break;
                    default:
                        oldStepStartTime = new Date(oldStepStartTime).toISOString();
                        stepStopTime = new Date(stepStopTime).toISOString();
                        var sql = 'INSERT INTO duration_log_step_manual (smp_session_id, start_time, stop_time, elapsed_seconds, att_uid, first_name, last_name, manager_id, work_source, business_line, task_type, flow_name, step_name, in_progress, threshold_exceeded) VALUES(' +
                            mysql.escape(userInfo.SmpSessionId) + ',' +
							mysql.escape(new Date(oldStepStartTime).toISOString()) + ',' +
							mysql.escape(new Date(stepStopTime).toISOString()) + ',' +
							mysql.escape(elapsedTime) + ',' +
							mysql.escape(userInfo.AttUID) + ',' +
							mysql.escape(userInfo.FirstName) + ',' +
							mysql.escape(userInfo.LastName) + ',' +
							mysql.escape(userInfo.Manager) + ',' +
							mysql.escape(userInfo.SAMSWorkType) + ',' +
							mysql.escape(userInfo.SkillGroup) + ',' +
							mysql.escape(userInfo.TaskType) + ',' +
							mysql.escape(oldFlowName) + ',' +
							mysql.escape(oldStepName) +
                            mysql.escape('N') + ',';
                        if (elapsedTime >= 300) {
                            sql = sql + mysql.escape('Y');
                        } else {
                            sql = sql + mysql.escape('N');
                        }
                        break;
                    }
                    if (sql != '') {
                        global.con.query(sql);
                    }
                    var sql = 'UPDATE duration_log_step_manual SET in_progress="N" WHERE smp_session_id ="' + userInfo.SmpSessionId + '"';
                    global.con.query(sql);
                    var sql = 'UPDATE duration_log_step_automation SET in_progress="N" WHERE smp_session_id ="' + userInfo.SmpSessionId + '"';
                    global.con.query(sql);
                }
            }
        }
    });

    // Store SASHA User Information in SashaUsers Object
    // Add User to sasha room
    // Add User to list of SASHA users on monitor clients
    socket.on('Register SASHA User', function(data) {
        // Place in SASHA room
        socket.join('sasha');
        var connectionId = data.ConnectionId;
        var userInfo = data.UserInfo;
        var utcTime = new Date().toISOString();
        userInfo.ConnectTime = utcTime;
        userInfo.KeepScreenshots = false;
        sashaUsers[connectionId] = userInfo;
        // Join Rooms
        socket.join(userInfo.LocationCode);
        socket.join(userInfo.City);
        socket.join(userInfo.Country);
        socket.join(userInfo.State);
        socket.join(userInfo.Zip);
        socket.join(userInfo.Manager);
        socket.join(userInfo.SmpSessionId);
        var attUID = userInfo.AttUID;
        if (typeof sessionCounter[attUID] == 'undefined') {
            sessionCounter[attUID] = 0;
        }
        sessionCounter[attUID]++;
        socket.emit('Add User Sessions to Dictionary', {
            UserSessions: sessionCounter[attUID]
        });
        io.sockets.in('monitor').emit('Add SASHA Connection to Monitor', {
            ConnectionId: connectionId,
            UserInfo: userInfo
        });
    });
    
    socket.on('Join Detail View Room', function(data) {
        var SmpSessionId = data.SmpSessionId;
        socket.join(SmpSessionId);
        var roomCount = io.nsps['/'].adapter.rooms[SmpSessionId];
        if (roomCount) {
            var count = roomCount.length;
            if (count >1) {

            }
        }
    });

    socket.on('Register Monitor User', function() {
        socket.join('monitor');
    });

    socket.on('Notify Server Received Skill Group', function(data) {
        var connectionId = socket.connectionId;
        if (typeof sashaUsers[connectionId] == 'undefined') {
            return;
        }
        var userInfo = sashaUsers[connectionId];
        if (userInfo.UserStatus != 'Inactive') {
            return;
        }
        userInfo.UserStatus = 'In Process';
        var flowName = data.FlowName;
        var stepName = data.StepName;
        var stepType = data.StepType;
        var skillGroup = data.SkillGroup;
        var samsWorkType = data.SAMSWorkType;
        var taskType = data.TaskType;
        userInfo['SessionStartTime'] = new Date().toUTCString();
        userInfo['StepStartTime'] = new Date().toUTCString();
        userInfo['FlowName'] = flowName;
        userInfo['StepName'] = stepName;
        if  (skillGroup === null || skillGroup == 'null' || skillGroup == '' || skillGroup == 'undefined') {
            skillGroup = 'UNKNOWN';
        }
        userInfo['SkillGroup'] = skillGroup;
        userInfo['SAMSWorkType'] = samsWorkType;
        userInfo['TaskType'] = taskType;
        socket.join(skillGroup);
        if (stepType == 'WAIT') {
            userInfo.OutputHistory.push(new Object());
        }
        sashaUsers[connectionId] = userInfo;
        io.sockets.in('monitor').emit('Notify Monitor Begin SASHA Flow', {
    	    ConnectionId: connectionId,
     	    UserInfo: userInfo
        });
		
        flowTimersInstance[connectionId] = 0;
        flowTimers[connectionId] = setInterval(function () {
            flowTimersInstance[connectionId]++;
            var elapsed = Math.floor(flowTimersInstance[connectionId] * (notifyStalledFlowTime / 1000) / 60);
            if (elapsed == 0 || elapsed > 1 ) {
                elapsedtext = elapsed + ' minutes';
            } else {
                var elapsedtext = elapsed + ' minute';
            }
            io.sockets.connected[connectionId].emit('Notify SASHA', {
                Message: 'You have a SASHA Flow that has been active for ' + elapsedtext + ' without completion.',
                RequireBlur: false,
                GiveFocus: true,
                RequireInteraction: true,
                ConnectionId: connectionId
            });
        }, notifyStalledFlowTime);
        stepTimersInstance[connectionId] = 0;
        stepTimers[connectionId] = setInterval(function () {
            stepTimersInstance[connectionId]++;
            var elapsed = Math.floor(stepTimersInstance[connectionId] * (notifyStalledStepTime / 1000) / 60);
            if (elapsed == 0 || elapsed > 1) {
                var elapsedtext = elapsed + ' minutes';
            } else {
                elapsedtext = elapsed + ' minute';
            }
            io.sockets.connected[connectionId].emit('Notify SASHA', {
                Message: 'SASHA Flow has not seen movement in  ' + elapsedtext + ' for your non-active SASHA window.',
                RequireBlur: true,
                GiveFocus: true,
                RequireInteraction: true,
                ConnectionId: connectionId
            });
        }, notifyStalledStepTime);
    });

    socket.on('Send SAMS Flow and Step', function(data) {
        var connectionId = socket.connectionId;
        if (typeof sashaUsers[connectionId] == 'undefined') {
            return;
        }
        var flowName = data.FlowName;
        var stepName = data.StepName;
        var stepType = data.StepType;
        var formName = data.FormName;
        if (useDB) {
            var userInfo = sashaUsers[connectionId];
            var oldFlowName = userInfo.FlowName;
            var oldStepName = userInfo.StepName;
            var oldStepStartTime = userInfo.StepStartTime;
            var stepStopTime = new Date().toUTCString();
            var elapsedTime = (Date.parse(stepStopTime)-Date.parse(oldStepStartTime))/1000;
            if (!isNaN(elapsedTime)) {
                var sql = '';
                switch (oldStepName) {
                case 'SO WAIT':
                    oldStepStartTime = new Date(oldStepStartTime).toISOString();
                    stepStopTime = new Date(stepStopTime).toISOString();
                    var sql = 'INSERT INTO duration_log_step_automation (smp_session_id, start_time, stop_time, elapsed_seconds, att_uid, first_name, last_name, manager_id, work_source, business_line, task_type, flow_name, step_name, in_progress, threshold_exceeded) VALUES(' +
						mysql.escape(userInfo.SmpSessionId) + ',' +
						mysql.escape(new Date(oldStepStartTime).toISOString()) + ',' +
						mysql.escape(new Date(stepStopTime).toISOString()) + ',' +
						mysql.escape(elapsedTime) + ',' +
						mysql.escape(userInfo.AttUID) + ',' +
						mysql.escape(userInfo.FirstName) + ',' +
						mysql.escape(userInfo.LastName) + ',' +
						mysql.escape(userInfo.Manager) + ',' +
						mysql.escape(userInfo.SAMSWorkType) + ',' +
						mysql.escape(userInfo.SkillGroup) + ',' +
						mysql.escape(userInfo.TaskType) + ',' +
						mysql.escape(oldFlowName) + ',' +
						mysql.escape(oldStepName) + ',' +
                        mysql.escape('Y') + ',';
                    if (elapsedTime >= 30) {
                        sql = sql + mysql.escape('Y');
                    } else {
                        sql = sql + mysql.escape('N');
                    }
                    sql = sql + ')';
                    break;
                default:
                    oldStepStartTime = new Date(oldStepStartTime).toISOString();
                    stepStopTime = new Date(stepStopTime).toISOString();
                    var sql = 'INSERT INTO duration_log_step_manual (smp_session_id, start_time, stop_time, elapsed_seconds, att_uid, first_name, last_name, manager_id, work_source, business_line, task_type, flow_name, step_name, in_progress, threshold_exceeded) VALUES(' +
						mysql.escape(userInfo.SmpSessionId) + ',' +
						mysql.escape(new Date(oldStepStartTime).toISOString()) + ',' +
						mysql.escape(new Date(stepStopTime).toISOString()) + ',' +
						mysql.escape(elapsedTime) + ',' +
						mysql.escape(userInfo.AttUID) + ',' +
						mysql.escape(userInfo.FirstName) + ',' +
						mysql.escape(userInfo.LastName) + ',' +
						mysql.escape(userInfo.Manager) + ',' +
						mysql.escape(userInfo.SAMSWorkType) + ',' +
						mysql.escape(userInfo.SkillGroup) + ',' +
						mysql.escape(userInfo.TaskType) + ',' +
						mysql.escape(oldFlowName) + ',' +
						mysql.escape(oldStepName) + ',' +
						mysql.escape('Y') + ',';
                    if (elapsedTime >= 300) {
                        sql = sql + mysql.escape('Y');
                    } else {
                        sql = sql + mysql.escape('N');
                    }
                    sql = sql + ')';
                    break;
                }
                global.con.query(sql);
            }
        }
        userInfo.FlowName = flowName;
        userInfo.StepName = stepName;
        userInfo.StepStartTime =  new Date().toUTCString();
        userInfo.FlowHistory.push(flowName);
        userInfo.StepHistory.push(stepName);
        userInfo.StepTypeHistory.push(stepType);
        userInfo.FormNameHistory.push(formName);
        if (stepType == 'WAIT') {
            userInfo.OutputHistory.push(new Object());
        }
        userInfo.StepTime.push(Math.floor(Date.now()/1000));
        sashaUsers[connectionId] = userInfo;
        io.sockets.in('monitor').in(connectionId).emit('Update Flow and Step Info', {
            ConnectionId: connectionId,
            UserInfo: userInfo
        });
        if (userInfo.UserStatus == 'In Process') {
            clearInterval(stepTimers[connectionId]);
            stepTimersInstance[connectionId] = 0;
            stepTimers[connectionId] = setInterval(function () {
                stepTimersInstance[connectionId]++;
                var elapsed = Math.floor(stepTimersInstance[connectionId] * (notifyStalledStepTime / 1000) / 60);
                if (elapsed == 0 || elapsed > 1 ) {
                    var elapsedtext = elapsed + ' minutes';
                } else {
                    elapsedtext = elapsed + ' minute';
                }
                io.sockets.connected[connectionId].emit('Notify SASHA', {
                    Message: 'SASHA Flow has not seen movement in  ' + elapsedtext + ' for your non-active SASHA window.',
                    RequireBlur: false,
                    GiveFocus: true,
                    RequireInteraction: true,
                    ConnectionId: connectionId
                });
            }, notifyStalledStepTime);
        }
    });
    
    socket.on('Alert Server of Stalled Session', function(data) {
        var connectionId = data.ConnectionId;
        if (typeof sashaUsers[connectionId] == 'undefined') {
            return;
        }
        var userInfo = sashaUsers[connectionId];
        io.sockets.in('monitor').emit('Alert Monitor of Stalled Session', {
            UserInfo: userInfo
        });
    });

    socket.on('Request Current Connection Data', function(data) {
        var connectionId = socket.connectionId;
        var activeTab = data.ActiveTab;
        for (var key in sashaUsers) {
            var userInfo = sashaUsers[key];
            if (userInfo.UserStatus == 'Inactive') {
                socket.emit('Add SASHA Connection to Monitor', {
                    ConnectionId: key,
                    UserInfo: userInfo
                });
            } else {
                socket.emit('Notify Monitor Begin SASHA Flow', {
                    ConnectionId: connectionId,
                    UserInfo: userInfo
                });
            }
        }
        if (activeTab != 'none') {
            socket.emit('Reset Active Tab', {
                ActiveTab: data.ActiveTab
            });
        }
    });

    socket.on('Request Client Detail from Server', function(data) {
        var clientId = data.ConnectionId;
        socket.join(clientId);
        if (typeof sashaUsers[clientId] == 'undefined') {
            socket.emit('No Such Client');
            return;
        }
        var userInfo = sashaUsers[clientId];
        socket.emit('Receive Client Detail from Server', {
            UserInfo: userInfo
        });
    });

    socket.on('Request SASHA ScreenShot from Server', function(data) {
        var connectionId = data.connectionId;
        io.emit('Request SASHA ScreenShot from SASHA', {
            ConnectionId: connectionId
        });
    });

    socket.on('Send SASHA ScreenShot to Server', function(data) {
        var imageURL = data.ImageURL;
        var connectionId = socket.connectionId;
        io.in(connectionId).emit('Send SASHA ScreenShot to Monitor', {
            ImageURL: imageURL
        });
    });

    socket.on('Request SASHA Dictionary from Server', function(data) {
        var connectionId = data.connectionId;
        io.emit('Request SASHA Dictionary from SASHA', {
            ConnectionId: connectionId
        });
    });

    socket.on('Send SASHA Dictionary to Server', function(data) {
        var dictionary = data.Dictionary;
        var connectionId = socket.connectionId;
        io.in(connectionId).emit('Send SASHA Dictionary to Monitor', {
            Dictionary: dictionary
        });
    });

    socket.on('Request SASHA Skill Group Info from Server', function(data) {
        var connectionId = data.ConnectionId;
        var requestValue = data.RequestValue;
        io.emit('Request SASHA Skill Group Info from SASHA', {
            RequestValue: requestValue,
            ConnectionId: connectionId
        });
    });

    socket.on('Send SASHA Skill Group Info to Server', function(data) {
        var resultValue = data.ResultValue;
        var connectionId = socket.connectionId;
        io.in(connectionId).emit('Send SASHA Skill Group Info to Monitor', {
            ResultValue: resultValue
        });
    });

    socket.on('Send Agent Inputs to SAMS', function(data) {
        var connectionId = socket.connectionId;
        var output = data.Output;
        var userInfo = sashaUsers[connectionId];
        if (typeof userInfo != 'undefined') {
            userInfo.OutputHistory.push(output);
            sashaUsers[connectionId] = userInfo;
            io.in(connectionId).emit('Send Agent Inputs to Monitor', {
                Output: output
            });
        }
    });

    socket.on('Send User Message to Server', function(data) {
        var connectionId = data.ConnectionId;
        var broadcastText = data.BroadcastText;
        if (broadcastText.trim()) {
            io.sockets.connected[connectionId].emit('Send User Message to User', {
                BroadcastText: broadcastText,
                ConnectionId: connectionId
            });
        }
    });

    socket.on('Notify Server Session Closed', function (data) {
        var connectionId = data.ConnectionId;
        io.in(connectionId).emit('Notify Popup Session Closed');
    });
	
    socket.on('Save Screenshot', function(data) {
        if (useDB) {
            var connectionId = socket.connectionId;
            if (typeof sashaUsers[connectionId] != 'undefined') {
                var userInfo = sashaUsers[connectionId];
                var imageURL = data.ImageURL;
                if (typeof data.flowName != 'undefined') {
                    var flowName = data.flowName;
                } else {
                    var flowName = 'Flow Not Available';
                }
                if (typeof data.stepName != 'undefined') {
                    var stepName = data.stepName;
                } else {
                    var stepName = 'Step Not Available';
                }
                var smpSessionId = userInfo.SmpSessionId;
                var currentTime = new Date().toISOString();
                if (smpSessionId) {
                    var sql = 'INSERT INTO screenshots (GUID, smp_session_id, screenshot_time, flow_name, step_name, image_data, in_progress) VALUES(UUID(),' + mysql.escape(smpSessionId) + ',' + mysql.escape(currentTime) + ',' + mysql.escape(flowName) + ',' + mysql.escape(stepName) + ',' + mysql.escape(imageURL) + ',' + mysql.escape('Y') + ')';
                    global.con.query(sql);
                }
                var roomCount = io.nsps['/'].adapter.rooms[smpSessionId];
                if (roomCount) {
                    var count = roomCount.length;
                    if (count >1) {
                        io.in(smpSessionId).emit('Update Screenshot History', {
                            screenshot_time: currentTime,
                            flow_name: flowName,
                            step_name: stepName,
                            image_data: imageURL
                        });
                    }
                }
                        
            }
        }
    });

    socket.on('Get Listing', function (data) {
        if (useDB) {
            var includeInProgress = data.includeInProgress;
            var startDate = data.startDate;
            var endDate = data.endDate;
            if (typeof data.label != 'undefined') {
                var label = data.label;
            } else {
                var label = 'Custom Range';
            }
            if (includeInProgress == 'N') {
                var sql = 'SELECT smp_session_id, start_time, stop_time, SEC_TO_TIME(elapsed_seconds) AS elapsed_seconds, att_uid, first_name, last_name, manager_id from duration_log_session WHERE start_time BETWEEN "' + startDate + '" AND "' + endDate + '" ORDER BY start_time ASC';
            } else {
                var sql = 'SELECT DISTINCT smp_session_id from screenshots WHERE timestamp BETWEEN "' + startDate + '" AND "' + endDate + '" ORDER BY timestamp ASC';
            }
            global.con.query(sql, (err, rows) => {
                socket.emit('Receive Listing', {
                    queryData: rows,
                    label: label
                });
            });
        }
    });

    socket.on('Get ScreenShots', function(data) {
        if (useDB) {
            var smp_session_id = data.smp_session_id;
            if (smp_session_id) {
                if (typeof data.view == 'undefined') {
                    var sql = 'SELECT *, SEC_TO_TIME(elapsed_seconds) AS elapsed, CONCAT(last_name, ", ", first_name) as agent_name FROM duration_log_session WHERE smp_session_id="' + smp_session_id + '"';
                    global.con.query(sql, (err, rows) => {
                        if (err === null && rows.length > 0) {
                            var session_id = rows[0].smp_session_id;
                            var start_time = rows[0].start_time;
                            var stop_time = rows[0].stop_time;
                            var elapsed_seconds = rows[0].elapsed;
                            var att_uid = rows[0].att_uid;
                            var agent_name = rows[0].agent_name;
                            var manager_id = rows[0].manager_id;
                            var work_source = rows[0].work_source;
                            var business_line = rows[0].business_line;
                            var task_type = rows[0].task_type;
                            socket.emit('Update Header', {
                                session_id: session_id,
                                start_time: start_time,
                                stop_time: stop_time,
                                elapsed_seconds: elapsed_seconds,
                                att_uid: att_uid,
                                agent_name: agent_name,
                                manager_id: manager_id,
                                work_source: work_source,
                                business_line: business_line,
                                task_type: task_type
                            });
                        }
                    });
                }
                var sql = 'SELECT * FROM screenshots  WHERE smp_session_id="' + smp_session_id + '" ORDER BY recorded ASC';
  			    global.con.query(sql, (err, rows) => {
                    if (err === null) {
                        rows.forEach((row) => {
                            var screenshot_time = row.screenshot_time;
                            var flow_name = row.flow_name;
                            var step_name = row.step_name;
                            var image_data = row.image_data;
                            socket.emit('Get ScreenShots', {
                                screenshot_time: screenshot_time,
                                flow_name: flow_name,
                                step_name: step_name,
                                image_data: image_data
                            });
                        });
                    } 
                    socket.emit('Screenshots Delivered');
                });
            }
        }
    });	
});
