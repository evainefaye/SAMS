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
                var sql = "DELETE FROM duration_log_step_automation WHERE in_progress = 'Y'";
                global.con.query(sql);
                var sql = "DELETE FROM duration_log_step_manual WHERE in_progress = 'Y'";
                global.con.query(sql);				
                var sql = "DELETE FROM screenshots WHERE in_progress = 'Y'";
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
            // Update the list of connected users on monitor  clients
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
                    var sql = "UPDATE screenshots SET in_progress='N' WHERE smp_session_id='" + smpSessionId + "'";
                    global.con.query(sql);
                }
            }
            if (useDB) {
                var flowStartTime = userInfo['SessionStartTime'];
                var flowStopTime = new Date().toUTCString();
                var elapsedTime = (Date.parse(flowStopTime)-Date.parse(flowStartTime))/1000;
                if (!isNaN(elapsedTime)) {
                    flowStartTime = new Date(flowStartTime).toISOString().slice(0, 19).replace('T', ' ');
                    flowStopTime = new Date(flowStopTime).toISOString().slice(0, 19).replace('T', ' ');
                    var sql = 'REPLACE INTO duration_log_session (smp_session_id, start_time, stop_time, elapsed_time, att_uid, first_name, last_name, manager_id, work_source, business_line, task_type, threshold_exceeded) VALUES(' + 
						mysql.escape(userInfo.SmpSessionId) + ',' + 
						mysql.escape(flowStartTime) + ',' +
						mysql.escape(flowStopTime) + ',' + 
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
                        oldStepStartTime = new Date(oldStepStartTime).toISOString().slice(0, 19).replace('T', ' ');
                        stepStopTime = new Date(stepStopTime).toISOString().slice(0, 19).replace('T', ' ');
                        var sql = 'INSERT INTO duration_log_step_automation (smp_session_id, start_time, stop_time, elapsed_time, att_uid, first_name, last_name, manager_id, work_source, business_line, task_type, flow_name, step_name, in_progress, threshold_exceeded) VALUES(' + 
							mysql.escape(userInfo.SmpSessionId) + ',' + 
							mysql.escape(oldStepStartTime) + ',' +
							mysql.escape(stepStopTime) + ',' + 
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
                        if (elapsedTime > 30) {
                            sql = sql + mysql.escape('Y') + ')';
                        } else {
                            sql = sql + mysql.escape('N') + ')';
                        }
                        break;
                    default:
                        oldStepStartTime = new Date(oldStepStartTime).toISOString().slice(0, 19).replace('T', ' ');
                        stepStopTime = new Date(stepStopTime).toISOString().slice(0, 19).replace('T', ' ');				
                        var sql = 'INSERT INTO duration_log_step_manual (smp_session_id, start_time, stop_time, elapsed_time, att_uid, first_name, last_name, manager_id, work_source, business_line, task_type, flow_name, step_name, in_progress, threshold_exceeded) VALUES(' + 
							mysql.escape(userInfo.SmpSessionId) + ',' + 
							mysql.escape(oldStepStartTime) + ',' +
							mysql.escape(stepStopTime) + ',' + 
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
                        if (elapsedTime > 300) {
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
        var ConnectionId = data.ConnectionId;
        var UserInfo = data.UserInfo;
        var UTCTime = new Date().toISOString();
        UserInfo.ConnectTime = UTCTime;
        UserInfo.KeepScreenshots = false;
        sashaUsers[ConnectionId] = UserInfo;
        // Join Rooms
        socket.join(UserInfo.LocationCode);
        socket.join(UserInfo.City);
        socket.join(UserInfo.Country);
        socket.join(UserInfo.State);
        socket.join(UserInfo.Zip);
        socket.join(UserInfo.Manager);
        var AttUID = UserInfo.AttUID;
        if (typeof sessionCounter[AttUID] == 'undefined') {
            sessionCounter[AttUID] = 0;
        }
        sessionCounter[AttUID]++;
        socket.emit('Add User Sessions to Dictionary', {   		
            UserSessions: sessionCounter[AttUID]
        });
        io.sockets.in('monitor').emit('Add SASHA Connection to Monitor', {
            ConnectionId: ConnectionId,
            UserInfo: UserInfo
        });
    });
	
    socket.on('Register Monitor User', function() {
        socket.join('monitor');
    });

    socket.on('Notify Server Received Skill Group', function(data) {
        var ConnectionId = socket.connectionId;
        if (typeof sashaUsers[ConnectionId] == 'undefined') {
            return;
        }
        var UserInfo = sashaUsers[ConnectionId];
        if (UserInfo.UserStatus != 'Inactive') {
            return;
        }
        UserInfo.UserStatus = 'In Process';
        var FlowName = data.FlowName;
        var StepName = data.StepName;
        var StepType = data.StepType;
        //var FormName = data.FormName;
        var SkillGroup = data.SkillGroup;
        var SAMSWorkType = data.SAMSWorkType;
        var TaskType = data.TaskType;
        UserInfo['SessionStartTime'] = new Date().toUTCString();
        UserInfo['StepStartTime'] = new Date().toUTCString();
        UserInfo['FlowName'] = FlowName;
        UserInfo['StepName'] = StepName;
        if  (SkillGroup === null || SkillGroup == 'null' || SkillGroup == '' || SkillGroup == 'undefined') {
            SkillGroup = 'UNKNOWN';
        }
        UserInfo['SkillGroup'] = SkillGroup;
        UserInfo['SAMSWorkType'] = SAMSWorkType;
        UserInfo['TaskType'] = TaskType;
        socket.join(SkillGroup);
        if (StepType == 'WAIT') {
            UserInfo.OutputHistory.push(new Object());
        }
        sashaUsers[ConnectionId] = UserInfo;
        io.sockets.in('monitor').emit('Notify Monitor Begin SASHA Flow', {
    	    ConnectionId: ConnectionId,
     	    UserInfo: UserInfo
        });
		
        flowTimersInstance[ConnectionId] = 0;
        flowTimers[ConnectionId] = setInterval(function () {
            flowTimersInstance[ConnectionId]++;
            var elapsed = Math.floor(flowTimersInstance[ConnectionId] * (notifyStalledFlowTime / 1000) / 60);
            if (elapsed == 0 || elapsed > 1 ) {
                elapsedtext = elapsed + ' minutes';
            } else {
                var elapsedtext = elapsed + ' minute';
            }
            io.sockets.connected[ConnectionId].emit('Notify SASHA', {
                Message: 'You have a SASHA Flow that has been active for ' + elapsedtext + ' without completion.',
                RequireBlur: false,
                GiveFocus: true,
                RequireInteraction: true,
                ConnectionId: ConnectionId
            });
        }, notifyStalledFlowTime);
        stepTimersInstance[ConnectionId] = 0;
        stepTimers[ConnectionId] = setInterval(function () {
            stepTimersInstance[ConnectionId]++;
            var elapsed = Math.floor(stepTimersInstance[ConnectionId] * (notifyStalledStepTime / 1000) / 60);
            if (elapsed == 0 || elapsed > 1) {
                var elapsedtext = elapsed + ' minutes';
            } else {
                elapsedtext = elapsed + ' minute';
            }
            io.sockets.connected[ConnectionId].emit('Notify SASHA', {
                Message: 'SASHA Flow has not seen movement in  ' + elapsedtext + ' for your non-active SASHA window.',
                RequireBlur: true,
                GiveFocus: true,
                RequireInteraction: true,
                ConnectionId: ConnectionId
            });
        }, notifyStalledStepTime);
    });

    socket.on('Send SAMS Flow and Step', function(data) {
        var ConnectionId = socket.connectionId;
        if (typeof sashaUsers[ConnectionId] == 'undefined') {
            return;
        }
        var FlowName = data.FlowName;
        var StepName = data.StepName;
        var StepType = data.StepType;
        var FormName = data.FormName;
        if (useDB) {
            var UserInfo = sashaUsers[ConnectionId];			
            var OldFlowName = UserInfo.FlowName;
            var OldStepName = UserInfo.StepName;
            var OldStepStartTime =  UserInfo.StepStartTime;
            var StepStopTime = new Date().toUTCString();
            var elapsedTime = (Date.parse(StepStopTime)-Date.parse(OldStepStartTime))/1000;
            if (!isNaN(elapsedTime)) {
                var sql = '';
                switch (OldStepName) {
                case 'SO WAIT':
                    OldStepStartTime = new Date(OldStepStartTime).toISOString().slice(0, 19).replace('T', ' ');
                    StepStopTime = new Date(StepStopTime).toISOString().slice(0, 19).replace('T', ' ');
                    var sql = 'INSERT INTO duration_log_step_automation (smp_session_id, start_time, stop_time, elapsed_time, att_uid, first_name, last_name, manager_id, work_source, business_line, task_type, flow_name, step_name, in_progress, threshold_exceeded) VALUES(' + 
						mysql.escape(UserInfo.SmpSessionId) + ',' + 
						mysql.escape(OldStepStartTime) + ',' +
						mysql.escape(StepStopTime) + ',' + 
						mysql.escape(elapsedTime) + ',' +
						mysql.escape(UserInfo.AttUID) + ',' + 
						mysql.escape(UserInfo.FirstName) + ',' + 
						mysql.escape(UserInfo.LastName) + ',' +
						mysql.escape(UserInfo.Manager) + ',' +
						mysql.escape(UserInfo.SAMSWorkType) + ',' + 
						mysql.escape(UserInfo.SkillGroup) + ',' + 
						mysql.escape(UserInfo.TaskType) + ',' +
						mysql.escape(OldFlowName) + ',' +
						mysql.escape(OldStepName) + ',' +
                        mysql.escape('Y') + ',';
                    if (elapsedTime > 30) {
                        sql = sql + ',' + mysql.escape('Y');
                    } else {
                        sql = sql + mysql.escape('N');
                    }
                    sql = sql + ')';						
                    break;
                default:
                    OldStepStartTime = new Date(OldStepStartTime).toISOString().slice(0, 19).replace('T', ' ');
                    StepStopTime = new Date(StepStopTime).toISOString().slice(0, 19).replace('T', ' ');				
                    var sql = 'INSERT INTO duration_log_step_manual (smp_session_id, start_time, stop_time, elapsed_time, att_uid, first_name, last_name, manager_id, work_source, business_line, task_type, flow_name, step_name, in_progress, threshold_exceeded) VALUES(' + 
						mysql.escape(UserInfo.SmpSessionId) + ',' + 
						mysql.escape(OldStepStartTime) + ',' +
						mysql.escape(StepStopTime) + ',' + 
						mysql.escape(elapsedTime) + ',' +
						mysql.escape(UserInfo.AttUID) + ',' + 
						mysql.escape(UserInfo.FirstName) + ',' + 
						mysql.escape(UserInfo.LastName) + ',' +
						mysql.escape(UserInfo.Manager) + ',' +
						mysql.escape(UserInfo.SAMSWorkType) + ',' + 
						mysql.escape(UserInfo.SkillGroup) + ',' + 
						mysql.escape(UserInfo.TaskType) + ',' +
						mysql.escape(OldFlowName) + ',' +
						mysql.escape(OldStepName) + ',' +
						mysql.escape('Y') + ',';
                    if (elapsedTime > 300) {
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
        UserInfo.FlowName = FlowName;
        UserInfo.StepName = StepName;
        UserInfo.StepStartTime =  new Date().toUTCString();
        UserInfo.FlowHistory.push(FlowName);
        UserInfo.StepHistory.push(StepName);
        UserInfo.StepTypeHistory.push(StepType);
        UserInfo.FormNameHistory.push(FormName);
        if (StepType == 'WAIT') {
            UserInfo.OutputHistory.push(new Object());
        }
        UserInfo.StepTime.push(Math.floor(Date.now()/1000));
        sashaUsers[ConnectionId] = UserInfo;
        io.sockets.in('monitor').in(ConnectionId).emit('Update Flow and Step Info', {
            ConnectionId: ConnectionId,
            UserInfo: UserInfo
        });
        if (UserInfo.UserStatus == 'In Process') {
            clearInterval(stepTimers[ConnectionId]);
            stepTimersInstance[ConnectionId] = 0;
            stepTimers[ConnectionId] = setInterval(function () {
                stepTimersInstance[ConnectionId]++;
                var elapsed = Math.floor(stepTimersInstance[ConnectionId] * (notifyStalledStepTime / 1000) / 60);
                if (elapsed == 0 || elapsed > 1 ) {
                    var elapsedtext = elapsed + ' minutes';
                } else {
                    elapsedtext = elapsed + ' minute';
                }                
                io.sockets.connected[ConnectionId].emit('Notify SASHA', {
                    Message: 'SASHA Flow has not seen movement in  ' + elapsedtext + ' for your non-active SASHA window.',
                    RequireBlur: false,
                    GiveFocus: true,
                    RequireInteraction: true,
                    ConnectionId: ConnectionId
                });
            }, notifyStalledStepTime);
        }
    });
    

    socket.on('Alert Server of Stalled Session', function(data) {
        var ConnectionId = data.ConnectionId;
        if (typeof sashaUsers[ConnectionId] == 'undefined') {
            return;
        }
        var UserInfo = sashaUsers[ConnectionId];
        io.sockets.in('monitor').emit('Alert Monitor of Stalled Session', {
            UserInfo: UserInfo
        });
    });

    socket.on('Request Current Connection Data', function(data) {
        var ConnectionId = socket.connectionId;
        var ActiveTab = data.ActiveTab;
        for (var key in sashaUsers) {
            var UserInfo = sashaUsers[key];
            if (UserInfo.UserStatus == 'Inactive') {
                socket.emit('Add SASHA Connection to Monitor', {
                    ConnectionId: key,
                    UserInfo: UserInfo
                });
            } else {
                socket.emit('Notify Monitor Begin SASHA Flow', {
                    ConnectionId: ConnectionId,
                    UserInfo: UserInfo
                });
            }
        }
        if (ActiveTab != 'none') {
            socket.emit('Reset Active Tab', {
                ActiveTab: data.ActiveTab
            });
        }
    });

    socket.on('Request Client Detail from Server', function(data) {
        var ClientId = data.ConnectionId;
        socket.join(ClientId);
        if (typeof sashaUsers[ClientId] == 'undefined') {
            socket.emit('No Such Client');
            return;
        }
        var UserInfo = sashaUsers[ClientId];
        socket.emit('Receive Client Detail from Server', {
            UserInfo: UserInfo
        });
    });

    socket.on('Request SASHA ScreenShot from Server', function(data) {
        var ConnectionId = data.connectionId;
        io.emit('Request SASHA ScreenShot from SASHA', {
            ConnectionId: ConnectionId
        });
    });

    socket.on('Send SASHA ScreenShot to Server', function(data) {
        var ImageURL = data.ImageURL;
        var ConnectionId = socket.connectionId;
        io.in(ConnectionId).emit('Send SASHA ScreenShot to Monitor', {
            ImageURL: ImageURL
        });
    });

    socket.on('Request SASHA Dictionary from Server', function(data) {
        var ConnectionId = data.connectionId;
        io.emit('Request SASHA Dictionary from SASHA', {
            ConnectionId: ConnectionId
        });
    });

    socket.on('Send SASHA Dictionary to Server', function(data) {
        var Dictionary = data.Dictionary;
        var ConnectionId = socket.connectionId;
        io.in(ConnectionId).emit('Send SASHA Dictionary to Monitor', {
            Dictionary: Dictionary
        });
    });

    socket.on('Request SASHA Skill Group Info from Server', function(data) {
        var ConnectionId = data.ConnectionId;
        var RequestValue = data.RequestValue;
        io.emit('Request SASHA Skill Group Info from SASHA', {
            RequestValue: RequestValue,
            ConnectionId: ConnectionId
        });
    });

    socket.on('Send SASHA Skill Group Info to Server', function(data) {
        var ResultValue = data.ResultValue;
        var ConnectionId = socket.connectionId;
        io.in(ConnectionId).emit('Send SASHA Skill Group Info to Monitor', {
            ResultValue: ResultValue
        });
    });

    socket.on('Send Agent Inputs to SAMS', function(data) {
        var ConnectionId = socket.connectionId;
        var Output = data.Output;
        var UserInfo = sashaUsers[ConnectionId];
        if (typeof UserInfo != 'undefined') {
            UserInfo.OutputHistory.push(Output);
            sashaUsers[ConnectionId] = UserInfo;
            io.in(ConnectionId).emit('Send Agent Inputs to Monitor', {
                Output: Output
            });
        }
    });

    socket.on('Send User Message to Server', function(data) {
        var ConnectionId = data.ConnectionId;
        var BroadcastText = data.BroadcastText;
        if (BroadcastText.trim()) {
            io.sockets.connected[ConnectionId].emit('Send User Message to User', {        
                BroadcastText: BroadcastText,
                ConnectionId: ConnectionId
            });
        }
    });


    socket.on('Notify Server Session Closed', function (data) {
        var ConnectionId = data.ConnectionId;
        io.in(ConnectionId).emit('Notify Popup Session Closed');
    });
	

    socket.on('Save Screenshot', function(data) {
        if (useDB) {
            var ConnectionId = socket.connectionId;        
            if (typeof sashaUsers[ConnectionId] != 'undefined') {
                var UserInfo = sashaUsers[ConnectionId];
                var ImageURL = data.ImageURL;
                var smpSessionId = UserInfo.SmpSessionId;
                var flowName = UserInfo.FlowName;
                var stepName = UserInfo.StepName;
                var currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
                if (smpSessionId) {
                    var sql = 'INSERT INTO screenshots (GUID, smp_session_id, timestamp, flow_name, step_name, image_data, in_progress) VALUES(UUID(),' + mysql.escape(smpSessionId) + ',' + mysql.escape(currentTime) + ',' + mysql.escape(flowName) + ',' + mysql.escape(stepName) + ',' + mysql.escape(ImageURL) + ',' + mysql.escape('Y') + ')';
                    global.con.query(sql);
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
                var sql = 'SELECT DISTINCT smp_session_id from screenshots WHERE in_progress="N" AND timestamp >= "' + startDate + '" AND timestamp <= "' + endDate + '" ORDER BY timestamp ASC';  
            } else {
                var sql = 'SELECT DISTINCT smp_session_id from screenshots WHERE timestamp >= "' + startDate + '" AND timestamp <= "' + endDate + '" ORDER BY timestamp ASC';
            }
            global.con.query(sql, (err, rows) => {			
                socket.emit('Receive Listing', {
                    data: rows,
                    label: label
                });
            });
        }
    });
	
    socket.on('Get ScreenShots', function(data) {
        if (useDB) {
            var smp_session_id = data.smp_session_id;
            if (smp_session_id) {
                var sql = 'SELECT * FROM screenshots WHERE smp_session_id="' + smp_session_id + '" ORDER BY timestamp ASC';
  			    global.con.query(sql, (err, rows) => {
                    rows.forEach((row) => {
                        var timestamp = row.timestamp;
                        var flow_name = row.flow_name;
                        var step_name = row.step_name;
                        var image_data = row.image_data;
                        socket.emit('Get ScreenShots', {
                            timestamp: timestamp,
                            flow_name: flow_name,
                            step_name: step_name,
                            image_data: image_data
                        });
                    });
                });
            }
        }
    });	
});
