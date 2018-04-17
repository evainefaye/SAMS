/* eslint-env node */
/* eslint-disable no-console */

// Declare global variables
var instance,
    port,
    useDB,
    database,
    sql;
var db_config = new Object();

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

// Enabled Capturing Dictionary Data and pushing it to the monitor(s) associated
var pushDictionaryData = false;
var pushDictionaryTime = 120000;


global.con = '';

var argv = require('minimist')(process.argv.slice(2));

var env = argv.e;
switch(env) {

case 'fde':
case 'dev':
    instance = 'FDE';
    port = '5510';
    useDB = true;
    database = 'sams_fde';
    break;
case 'beta':
case 'pre-prod':
    instance = 'PRE-PROD';
    port = '5520';
    useDB = true;
    database = 'sams_preprod';
    break;
case 'prod':
    instance = 'PROD';
    port = '5530';
    useDB = true;
    database = 'sams_prod';
    break;
default:
    instance = 'PROD';
    port = '5530';
    useDB = true;
    database = 'sams_prod';
    break;
}

if (useDB) {
    var mysql = require('mysql');
    db_config = {
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
                console.log(new Date().toString(), 'Database Connection successful');
                console.log(new Date().toString(), 'Database: ' + database);
                console.log(new Date().toString(), 'Checking for invalid database records...');
                sql = 'DELETE FROM duration_log_step_automation WHERE smp_session_id NOT IN(SELECT smp_session_id FROM duration_log_session)';
                global.con.query(sql, function(err, result) {
                    if (err) {
                        console.log(new Date().toString(), 'Error running SQL line 104: ' + err);
                    } else {
                        console.log(new Date().toString(), 'Purged ' + result.affectedRows + ' invalid records from duration_log_step_automation table');
                    }
                });
                sql = 'DELETE FROM duration_log_step_manual WHERE smp_session_id NOT IN(SELECT smp_session_id FROM duration_log_session)';
                global.con.query(sql, function(err, result) {
                    if (err) {
                        console.log(new Date().toString(), 'Error running SQ line 112 ' + err);
                    } else {
                        console.log(new Date().toString(), 'Purged ' + result.affectedRows + ' invalid records from duration_log_step_manual table');
                    }
                });
                sql = 'DELETE FROM screenshots WHERE in_progress = "Y"';
                global.con.query(sql, function(err, result) {
                    if (err) {
                        console.log(new Date().toString(), 'Error running SQL line 120: ' + err);
                    } else {
                        console.log(new Date().toString(), 'Purged ' + result.affectedRows + ' invalid records from screenshots table');
                    }
                });
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
                    sql = 'UPDATE screenshots SET in_progress="N" WHERE smp_session_id="' + smpSessionId + '"';
                    global.con.query(sql, function(err) {
                        if (err) {
                            console.log(new Date().toString(), 'Error running SQL line 175: ' + err);
                        }
                    });
                }
            }
            if (useDB && userInfo.SAMSWorkType != '') {
                var flowStartTime = userInfo['SessionStartTime'];
                var flowStopTime = new Date().toUTCString();
                var elapsedTime = (Date.parse(flowStopTime)-Date.parse(flowStartTime))/1000;
                if (!isNaN(elapsedTime) && userInfo.hasOwnProperty('SAMSWorkType')) {
                    if (userInfo['SAMSWorkType'].length > 0) {
                        var dashboardData = userInfo.DashboardData;
                        // console.log(new Date().toString(), 'Session Ended: ' + userInfo.AttUID);;
                        sql = 'REPLACE INTO duration_log_session (smp_session_id, start_time, stop_time, elapsed_seconds, att_uid, first_name, last_name, manager_id, work_source, business_line, task_type, city, active_org, asset_id, call_back_number, caller_name, caller_phone, client_name, client_ticket_num, contact_email, contact_name, contact_phone, email_address, end_user_name, end_user_phone, environment, ip, mac, master_state, parent_ticket_number, problem_abstract, room_number, run_location, ticket_number, ticket_role, ticket_state, ticket_type, t2_team_name, venue_code, venue_name, work_queue, userInfo) VALUES(' +
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
							mysql.escape(userInfo.TaskType) + ',' +
							mysql.escape(userInfo.City) + ',' +
							mysql.escape(dashboardData.ActiveOrg) + ',' +
							mysql.escape(dashboardData.AssetId) + ',' +
							mysql.escape(dashboardData.CallbackNumber) + ',' +
							mysql.escape(dashboardData.CallerName) + ',' +
							mysql.escape(dashboardData.CallerPhone) + ',' +
							mysql.escape(dashboardData.ClientName) + ',' +
							mysql.escape(dashboardData.ClientTicketNum) + ',' +
							mysql.escape(dashboardData.ContactEmail) + ',' +
							mysql.escape(dashboardData.ContactName) + ',' +
							mysql.escape(dashboardData.ContactPhone) + ',' +
							mysql.escape(dashboardData.EmailAddress) + ',' +
							mysql.escape(dashboardData.endUserName) + ',' +
							mysql.escape(dashboardData.endUserPhone) + ',' +
							mysql.escape(dashboardData.Environment) + ',' +
							mysql.escape(dashboardData.IP) + ',' +
							mysql.escape(dashboardData.MAC) + ',' +
							mysql.escape(dashboardData.MasterState) + ',' +
							mysql.escape(dashboardData.ParentTicketNum) + ',' +
							mysql.escape(dashboardData.ProblemAbstract) + ',' +
							mysql.escape(dashboardData.RoomNumber) + ',' +
							mysql.escape(dashboardData.RunLocation) + ',' +
							mysql.escape(dashboardData.TicketNum) + ',' +
							mysql.escape(dashboardData.TicketRole) + ',' +
							mysql.escape(dashboardData.ticketState) + ',' +
							mysql.escape(dashboardData.TicketType) + ',' +
							mysql.escape(dashboardData.T2TeamName) + ',' +
							mysql.escape(dashboardData.VenueCode) + ',' +
							mysql.escape(dashboardData.VenueName) + ',' +
							mysql.escape(dashboardData.workQueue) + ',' +
							mysql.escape(JSON.stringify(userInfo)) + ')';
                        global.con.query(sql, function(err) {
                            if (err) {
                                console.log(new Date().toString(), 'Error running SQL line 234: ' + err);
                            }
                        });
                    }
                }
                var oldFlowName = userInfo.FlowName;
                var oldStepName = userInfo.StepName;
                var oldStepStartTime =  userInfo.StepStartTime;
                var stepStopTime = new Date().toUTCString();
                elapsedTime = (Date.parse(stepStopTime)-Date.parse(oldStepStartTime))/1000;
                if (!isNaN(elapsedTime) && userInfo.hasOwnProperty('SAMSWorkType')) {
                    if (userInfo['SAMSWorkType'].length > 0) {
                        sql = '';
                        switch (oldStepName) {
                        case 'SO WAIT':
                            oldStepStartTime = new Date(oldStepStartTime).toISOString();
                            stepStopTime = new Date(stepStopTime).toISOString();
                            sql = 'INSERT INTO duration_log_step_automation (smp_session_id, start_time, stop_time, elapsed_seconds, att_uid, first_name, last_name, manager_id, work_source, business_line, task_type, flow_name, step_name, city, in_progress) VALUES(' +
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
								mysql.escape(userInfo.City) + ',' +
								mysql.escape('N') + ')';
                            break;
                        default:
                            oldStepStartTime = new Date(oldStepStartTime).toISOString();
                            stepStopTime = new Date(stepStopTime).toISOString();
                            sql = 'INSERT INTO duration_log_step_manual (smp_session_id, start_time, stop_time, elapsed_seconds, att_uid, first_name, last_name, manager_id, work_source, business_line, task_type, flow_name, step_name, city, in_progress) VALUES(' +
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
								mysql.escape(userInfo.City) + ',' +
								mysql.escape('N') + ')';
                            break;
                        }
                        if (sql != '') {
                            global.con.query(sql, function(err) {
                                if (err) {
                                    console.log(new Date().toString(), 'Error running SQL line 291 ' + err);
                                }
                            });
                        }
                        sql = 'UPDATE duration_log_step_manual SET in_progress="N" WHERE smp_session_id ="' + userInfo.SmpSessionId + '"';
                        global.con.query(sql, function(err) {
                            if (err) {
                                console.log(new Date().toString(), 'Error running SQL line 298: ' + err);
                            }
                        });
                        sql = 'UPDATE duration_log_step_automation SET in_progress="N" WHERE smp_session_id ="' + userInfo.SmpSessionId + '"';
                        global.con.query(sql, function(err) {
                            if (err) {
                                console.log(new Date().toString(), 'Error running SQL line 304: ' + err);
                            }
                        });
                    }
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
        // console.log(new Date().toString(), 'Sending Initial Request for SASHA Dictionary for new SASHA connection ' + connectionId);
        io.sockets.in(connectionId).emit('Request SASHA Dictionary from SASHA', {
            ConnectionId: connectionId
        });
    });

    socket.on('Join Detail View Room', function(data) {
        var SmpSessionId = data.SmpSessionId;
        socket.join(SmpSessionId);
        // var roomCount = io.nsps['/'].adapter.rooms[SmpSessionId];
        // if (roomCount) {
        //     var count = roomCount.length;
        // }
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
        var userInfo = sashaUsers[connectionId];
        if (useDB && userInfo.hasOwnProperty('SAMSWorkType')) {
            if (userInfo['SAMSWorkType'].length == 0) {
                return;
            }
            var oldFlowName = userInfo.FlowName;
            var oldStepName = userInfo.StepName;
            var oldStepStartTime = userInfo.StepStartTime;
            var stepStopTime = new Date().toUTCString();
            var elapsedTime = (Date.parse(stepStopTime)-Date.parse(oldStepStartTime))/1000;
            if (!isNaN(elapsedTime) && userInfo.hasOwnProperty('SAMSWorkType')) {
                if (userInfo['SAMSWorkType'].length == 0) {
                    return;
                }
                sql = '';
                switch (oldStepName) {
                case 'SO WAIT':
                    oldStepStartTime = new Date(oldStepStartTime).toISOString();
                    stepStopTime = new Date(stepStopTime).toISOString();
                    sql = 'INSERT INTO duration_log_step_automation (smp_session_id, start_time, stop_time, elapsed_seconds, att_uid, first_name, last_name, manager_id, work_source, business_line, task_type, flow_name, step_name, city, in_progress) VALUES(' +
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
                        mysql.escape(userInfo.City) + ',' +
                        mysql.escape('Y') + ')';
                    break;
                default:
                    oldStepStartTime = new Date(oldStepStartTime).toISOString();
                    stepStopTime = new Date(stepStopTime).toISOString();
                    sql = 'INSERT INTO duration_log_step_manual (smp_session_id, start_time, stop_time, elapsed_seconds, att_uid, first_name, last_name, manager_id, work_source, business_line, task_type, flow_name, step_name, city, in_progress) VALUES(' +
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
                        mysql.escape(userInfo.City) + ',' +
                        mysql.escape('Y') + ')';
                    break;
                }
                global.con.query(sql, function(err) {
                    if (err) {
                        console.log(new Date().toString(), 'Error running SQL line 507: ' + err);
                    }
                });
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
        var requestValue = new Object();
        requestValue['ActiveOrg'] = 'ActiveOrg';
        requestValue['AssetID'] = 'AssetId';
        requestValue['CallbackNumber'] = 'CallbackNumber';
        requestValue['CallerName'] = 'CallerName';
        requestValue['CallerPhone'] = 'CallerPhone';
        requestValue['ClientName'] = 'ClientName';
        requestValue['ClientTicketNum'] = 'ClientTicketNum';
        requestValue['ContactEmail'] = 'ContactEmail';
        requestValue['ContactName'] = 'ContactName';
        requestValue['ContactPhone'] = 'ContactPhone';
        requestValue['EmailAddress'] = 'EmailAddress';
        // Default is 1 if empty its 2
        requestValue['endUserName'] = 'endUserName1';
        requestValue['AOTSEndUserName'] = 'endUserName2';
        // Default is 1, if empty its 2
        requestValue['endUserPhone'] = 'endUserPhone1';
        requestValue['AOTSEndUserPhone'] = 'endUserPhone2';
        requestValue['environmentProperties["SASHAEnvironment"]'] = 'Environment';
        requestValue['IP'] = 'IP';
        requestValue['MAC']= 'MAC';
        requestValue['MasterState'] = 'MasterState';
        requestValue['ParentTicketNum'] = 'ParentTicketNum';
        // Need to process before storing to remove ;-;-; and :~:~
        requestValue['ProblemAbstract'] = 'ProblemAbstract';
        requestValue['RoomNumber'] = 'RoomNumber';
        requestValue['RunLocation'] = 'RunLocation';
        requestValue['TicketNum'] = 'TicketNum';
        requestValue['TicketRole'] = 'TicketRole';
        // Default is 1,then ticketState2  May need to process to remove ;-;-; or :~:~
        requestValue['testModules["M5_getAOTSTicketInfoV2"]["properties"]["InvokeRuleResponse"]["InvokeRuleSyncResponse"]["returnData"]["getAOTSTicketInfoResults"]["TicketState"]'] = 'ticketState1';
        requestValue['testModules["M5_getAOTSTicketInfo"]["properties"]["InvokeRuleResponse"]["InvokeRuleSyncResponse"]["returnData"]["getAOTSTicketInfoResults"]["TicketState"]'] = 'ticketState2';
        requestValue['TicketType'] = 'TicketType';
        requestValue['T2TeamName'] = 'T2TeamName';
        requestValue['userName'] = 'userName';
        requestValue['VenueCode'] = 'VenueCode';
        requestValue['VenueName'] = 'VenueName';
        // Default is 1 then 2, may need to process to remove ;-;- or :~:~
        requestValue['testModules["M5_getAOTSTicketInfoV2"]["properties"]["InvokeRuleResponse"]["InvokeRuleSyncResponse"]["returnData"]["getAOTSTicketInfoResults"]["WorkQueue"]'] = 'workQueue1';
        requestValue['testModules["M5_getAOTSTicketInfo"]["properties"]["InvokeRuleResponse"]["InvokeRuleSyncResponse"]["returnData"]["getAOTSTicketInfoResults"]["WorkQueue"]'] = 'workQueue2';
        // One last request to check for to know if this is a server side request vs. monitor request.  Eventually pull the monitor requests entirely pass this data to monitor (if it exists) and let it take what it wants.
        requestValue['ServerSideUpdate'] = 'serverSideUpdate';
        io.in(connectionId).emit('Request SASHA Skill Group Info from SASHA', {
            RequestValue: requestValue,
            ConnectionId: connectionId
        });
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
        var connectionId = data.ConnectionId;
        io.in(connectionId).emit('Request SASHA ScreenShot from SASHA', {
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

    // ** CORRECT FUNCTION TO SEND REQUEST TO ONE SASHA SESSION **
    socket.on('Request SASHA Dictionary from Server', function(data) {
        // console.log(new Date().toString(), 'received request for dictionary');
        var connectionId = data.ConnectionId;
        if (typeof sashaUsers[connectionId] != 'undefined') {
            // var userInfo = sashaUsers[connectionId];
            // var smpSessionId = userInfo['SmpSessionId'];
            io.in(connectionId).emit('Request SASHA Dictionary from SASHA', {
                ConnectionId: connectionId
            });
        }
    });

    socket.on('Send SASHA Dictionary to Server', function(data) {
        var dictionary = data.Dictionary;
        dictionary = dictionary.trim();
        var connectionId = socket.connectionId;
        if (typeof sashaUsers[connectionId] != 'undefined') {
            // console.log(new Date().toString(), 'SAMS received a dictionary from SASHA Connection ' + connectionId);
            var roomCount = io.nsps['/'].adapter.rooms[connectionId];
            if (roomCount) {
                var count = roomCount.length;
                // console.log(new Date().toString(), 'There are ' + count + ' users in room for ' + connectionId);
                if (count > 1) {
                    // console.log(new Date().toString(), count + ' users requesting detail data for SASHA Connection ' + connectionId + ', sending');
                    io.in(connectionId).emit('Send SASHA Dictionary to Monitor', {
                        Dictionary: dictionary
                    });
                } else {
                    // console.log(new Date().toString(), 'No users requesting detail data for SASHA Connection ' + connectionId + ', not sent');
                }
            }
        }
    });

    socket.on('Request SASHA Skill Group Info from Server', function(data) {
        var connectionId = data.ConnectionId;
        var requestValue = data.RequestValue;
        io.in(connectionId).emit('Request SASHA Skill Group Info from SASHA', {
            RequestValue: requestValue,
            ConnectionId: connectionId
        });
    });

    socket.on('Send SASHA Skill Group Info to Server', function(data) {
        var resultValue = data.ResultValue;
        // Process results from update requested server side
        // This value is requested on disconnect to gather information for logging to the database
        if (resultValue.hasOwnProperty('serverSideUpdate')) {
            connectionId = socket.connectionId;
            if (typeof sashaUsers[connectionId] == 'undefined') {
                return;
            }
            var userInfo = sashaUsers[connectionId];
            // Remove flag indicating its server side
            delete resultValue.serverSideUpdate;

            // Clean Up Values that are returned and prepare for database storage

            // Remove Non digits
            if (typeof resultValue.CallbackNumber != 'undefined') {
                resultValue.CallbackNumber = resultValue['CallbackNumber'].replace(/[^0-9]+/g, '');
            }
            if (typeof resultValue.CallerPhone != 'undefined') {
                resultValue.CallerPhone = resultValue['CallerPhone'].replace(/[^0-9]+/g, '');
            }
            if (typeof resultValue.ContactPhone != 'undefined') {
                resultValue.ContactPhone = resultValue['ContactPhone'].replace(/[^0-9]+/g, '');
            }
            if (typeof resultValue.endUserPhone != 'undefined') {
                resultValue.endUserPhone = resultValue['endUserPhone'].replace(/[^0-9]+/g, '');
            }
            if (typeof resultValue.ParentTicketNum != 'undefined') {
                resultValue.ParentTicketNum = resultValue['ParentTicketNum'].replace(/[^0-9]+/g, '');
            }
            if (typeof resultValue.TicketNum != 'undefined') {
                resultValue.TicketNum = resultValue['TicketNum'].replace(/[^0-9]+/g, '');
            }

            // Remove undesired characters from string
            resultValue.ProblemAbstract = resultValue.ProblemAbstract.replace(/;-;-;/g, ' ').replace(/:~:~/g, ' ').trim();

            // Remove undesired characters from string
            resultValue.TicketRole = resultValue.TicketRole.replace(/;-;-;/g, ' ').replace(/:~:~/g, ' ').replace(/TicketRole/g, '').trim();

            // If endUserPhone1 is not blank use it, otherwise us endUserPhone2
            if (resultValue.endUserPhone1 != '') {
                resultValue.endUserPhone = resultValue.endUserPhone1;
            } else {
                resultValue.endUserPhone = resultValue.endUserPhone2;
            }
            delete resultValue.endUserPhone1;
            delete resultValue.endUserPhone2;

            // If endUserName1 is not blank use it, otherwise us endUserName2
            if (resultValue.endUserName1 != '') {
                resultValue.endUserName = resultValue.endUserName1;
            } else {
                resultValue.endUserName = resultValue.endUserName2;
            }
            delete resultValue.endUserName1;
            delete resultValue.endUserName2;

            // If tickeState1 is not blank use it otherwise use ticketState2.   Remove invalid characters when done
            if (resultValue.ticketState1 != '') {
                resultValue.ticketState = resultValue.ticketState1;
            } else {
                resultValue.ticketState = resultValue.ticketState2;
            }
            resultValue.ticketState =  resultValue.ticketState.replace(/;-;-;/g, ' ').replace(/:~:~/g, ' ').trim();
            delete resultValue.ticketState1;
            delete resultValue.ticketState2;

            // If workQueue1 is not blank use it otherwise use workQueue2.   Remove invalid characters when done
            if (resultValue.workQueue1 != '') {
                resultValue.workQueue = resultValue.workQueue1;
            } else {
                resultValue.workQueue = resultValue.workQueue2;
            }
            resultValue.workQueue = resultValue.workQueue.replace(/;-;-;/g, ' ').replace(/:~:~/g, ' ').trim();
            delete resultValue.workQueue1;
            delete resultValue.workQueue2;
            // End Value Cleanup

            resultValue.AssetId = resultValue.AssetId.trim();

            userInfo['DashboardData'] = resultValue;
            sashaUsers[connectionId] = userInfo;
        } else {
            var connectionId = socket.connectionId;
            io.in(connectionId).emit('Send SASHA Skill Group Info to Monitor', {
                ResultValue: resultValue
            });
        }
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
                    flowName = 'Flow Not Available';
                }
                if (typeof data.stepName != 'undefined') {
                    var stepName = data.stepName;
                } else {
                    stepName = 'Step Not Available';
                }
                var smpSessionId = userInfo.SmpSessionId;
                var currentTime = new Date().toISOString();
                if (smpSessionId) {
                    sql = 'INSERT INTO screenshots (GUID, smp_session_id, screenshot_time, flow_name, step_name, image_data, city, in_progress) VALUES(UUID(),' +
						mysql.escape(smpSessionId) + ',' +
						mysql.escape(currentTime) + ',' +
						mysql.escape(flowName) + ',' +
						mysql.escape(stepName) + ',' +
						mysql.escape(imageURL) + ',' +
						mysql.escape(userInfo.City) + ',' +
						mysql.escape('Y') + ')';
                    global.con.query(sql, function(err) {
                        if (err) {
                            console.log(new Date().toString(), 'Error running SQL line 855: ' + err);
                        }
                    });
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
                label = 'Custom Range';
            }
            if (includeInProgress == 'N') {
                sql = 'SELECT smp_session_id, start_time, stop_time, SEC_TO_TIME(elapsed_seconds) AS elapsed_seconds, att_uid, first_name, last_name, manager_id from duration_log_session WHERE start_time BETWEEN "' + startDate + '" AND "' + endDate + '" ORDER BY start_time ASC';
            } else {
                sql = 'SELECT DISTINCT smp_session_id from screenshots WHERE timestamp BETWEEN "' + startDate + '" AND "' + endDate + '" ORDER BY timestamp ASC';
            }
            global.con.query(sql, (err, rows) => {
                if (!err) {
                    socket.emit('Receive Listing', {
                        queryData: rows,
                        label: label
                    });
                }
            });
        }
    });

    socket.on('Get ScreenShots', function(data) {
        if (useDB) {
            var smp_session_id = data.smp_session_id;
            if (smp_session_id) {
                if (typeof data.view == 'undefined') {
                    sql = 'SELECT *, SEC_TO_TIME(elapsed_seconds) AS elapsed, CONCAT(last_name, ", ", first_name) as agent_name FROM duration_log_session WHERE smp_session_id="' + smp_session_id + '"';
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
                sql = 'SELECT * FROM screenshots  WHERE smp_session_id="' + smp_session_id + '" ORDER BY recorded ASC';
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

    socket.on('Request DB Config', function() {
        socket.emit('Return DB Config', {
            dbConfig: db_config,
            useDB: useDB
        });
    });
});

// Setup Timer to request getting and pushing dictionary data to any connected monitor clients.
if (pushDictionaryData && pushDictionaryTime > 0) {
    console.log(new Date().toString(), 'Requesting SASHA Dictionary for all SASHA Clients every ' + pushDictionaryTime/1000 + ' seconds');
    setInterval(function () {
        // Get count of users in sasha room
        var sashaClientCount = io.nsps['/'].adapter.rooms['sasha'];
        //Does not exist (nobody ever connected to room)
        if (!sashaClientCount) {
            // console.log(new Date().toString(), 'No SASHA Connections exist');
            return;
        }
        // Nobody currently in room
        if (sashaClientCount.length < 1) {
            // console.log(new Date().toString(), 'No SASHA Connections exist');
            return;
        }
        // Loop through each socket showing connected to check how many users are in their socket room
        for (var connId in sashaClientCount.sockets) {
            // Get count of users in room for connId
            var monitorUserCount = io.nsps['/'].adapter.rooms[connId];
            // Does not exist (nobody ever connected to room)
            if (!monitorUserCount) {
                // console.log(new Date().toString(), 'No SASHA Connections found for ' + connId);
                return;
            }
            // Less than 2 users in the room
            if (monitorUserCount.length < 2) {
                // console.log(new Date().toString(), monitorUserCount.length + ' users connected to session data for ' + connId + ', no refresh of dictionary data is required');
                return;
            }
            // console.log(new Date().toString(), monitorUserCount.length + ' users connected to session data for ' + connId + ', requesting update of dictionary data');
            io.sockets.in(connId).emit('Request SASHA Dictionary from SASHA', {
                ConnectionId: connId
            });
        }
    }, pushDictionaryTime);
}
