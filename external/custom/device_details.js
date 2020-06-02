var socket;
var host;
var token = $('#device-details').attr('token-data');
var command_id;
var webSocketAttempts = 0;

function sendData(socket, apiVersion, type, method, commandId, params) {
    //Check session timeout
    /**
    var activeTimestamp = $.cookie("active_timestamp");
    var currentTimestamp = Math.round(+new Date()/1000);
    var sessionTimeout = $.cookie("session_timeout");
    if (currentTimestamp - activeTimestamp > sessionTimeout) {
        alert("Session is expired, please re-login!");
        return;
    }*/

    var input = new Object();
    input.api_version = apiVersion;
    input.type = type;
    input.method = method;
    input.command_id = commandId;
    input.params = params;
    socket.send(JSON.stringify(input));
}

function websocketRetry(){
    if(webSocketAttempts < 4){
        console.log('trying for the ' + webSocketAttempts + 'time(s)');
        socket = createSocket(host);
        webSocketAttempts++;
    }
    
}

function createSocket(host) {
    if (window.WebSocket)
        return new WebSocket(host);
    else if (window.MozWebSocket)
        return new MozWebSocket(host);
}

function initiateWebsocket(){
    socket.onerror = function(event){
        websocketRetry();
        initiateWebsocket();
    };

        //Open socket
        if (socket.readyState === 1) {
            login();
        } else {
            socket.onopen = function (message) {
                console.log('Debug: open socket');
                login();
                command_id = 1;
                
                $("#button_command").click(function () {
                    var params = new Object();
                    params.device_id = $("#setting_id").val();
                    params.cmd = $("#cmd").val();
                    params.dir = $("#dir").val();
                    sendData(socket, '2', 'command', 'debug.command', command_id++, params);
                    $("#cmd_output").val('executing...');
                });
                
                $("#button_execute_bat").click(function () {
                    var params = new Object();
                    params.device_id = $("#setting_id").val();
                    params.path = $("#path").val();
                    sendData(socket, '2', 'command', 'debug.execute_bat', command_id++, params);
                    $("#cmd_output").val('executing...');
                });
                
                $("#button_upload_log").click(function () {
                    var params = new Object();
                    params.device_id = $("#setting_id").val();
                    params.path = $("#path").val();
                    sendData(socket, '2', 'command', 'debug.upload_log', command_id++, params);
                    $("#cmd_output").val('executing...');
                });
                
                $("#button_upload_file").click(function () {
                    var params = new Object();
                    params.device_id = $("#setting_id").val();
                    params.path = $("#path").val();
                    sendData(socket, '2', 'command', 'debug.upload_file', command_id++, params);
                    $("#cmd_output").val('executing...');
                });
                
                $("#button_dump_db").click(function () {
                    var params = new Object();
                    params.device_id = $("#setting_id").val();
                    sendData(socket, '2', 'command', 'debug.dump_db', command_id++, params);
                    $("#cmd_output").val('executing...');
                });
                
                $("#button_db_command").click(function () {
                    var params = new Object();
                    params.device_id = $("#setting_id").val();
                    params.db_command = $("#db_command").val();
                    params.db_doc_id = $("#doc_id").val();
                    params.db_doc_key = $("#doc_key").val();
                    params.db_doc_value = $("#doc_value").val();
                    params.db_doc_value_type = $("#doc_value_type").val();
                    sendData(socket, '2', 'command', 'debug.db_command', command_id++, params);
                    $("#cmd_output").val('executing...');
                });
                
                $("#button_cpu_loading").click(function () {
                    var params = new Object();
                    params.device_id = $("#setting_id").val();
                    sendData(socket, '2', 'command', 'debug.cpu_loading', command_id++, params);
                    $("#cmd_output").val('executing...');
                });
                
                $("#button_start_cpu_loading_log").click(function () {
                    var params = new Object();
                    params.device_id = $("#setting_id").val();
                    params.interval = $("#path").val();
                    sendData(socket, '2', 'command', 'debug.start_cpu_loading_log', command_id++, params);
                    $("#cmd_output").val('executing...');
                });
                
                $("#button_stop_cpu_loading_log").click(function () {
                    var params = new Object();
                    params.device_id = $("#setting_id").val();
                    sendData(socket, '2', 'command', 'debug.stop_cpu_loading_log', command_id++, params);
                    $("#cmd_output").val('executing...');
                });
                
                $("#button_cpu_model").click(function () {
                    var params = new Object();
                    params.device_id = $("#setting_id").val();
                    sendData(socket, '2', 'command', 'debug.cpu_model', command_id++, params);
                    $("#cmd_output").val('executing...');
                });
            }
        };

        //Trigger socket
        socket.onmessage = function (message) {
            //Parser return data from socket server
            var data = $.parseJSON(message.data);

            //Socket connected
            if (data.method === "controller.connect") {
            	if(typeof data.params.err_code !== 'undefined' && typeof data.params.err_code !== null && parseInt(data.params.err_code) == 0) {
            	} else {
            		$.removeCookie('device_no');
            		console.log('Debug: socket connect failed');
            	}
            }
            else if (data.method === "debug.command") {
            	if(typeof data.params.err_code !== 'undefined' && typeof data.params.err_code !== null && parseInt(data.params.err_code) == 0) {
            		$("#cmd_output").val(data.params.output);
            	} else {
            		$("#cmd_output").val('error - ' . data.params.err_code);
            	}
            }
            else if (data.method === "debug.execute_bat") {
            	if(typeof data.params.err_code !== 'undefined' && typeof data.params.err_code !== null && parseInt(data.params.err_code) == 0) {
            		$("#cmd_output").val('sent');
            	} else {
            		$("#cmd_output").val('error - ' . data.params.err_code);
            	}
            }
            else if (data.method === "debug.upload_log") {
            	if(typeof data.params.err_code !== 'undefined' && typeof data.params.err_code !== null && parseInt(data.params.err_code) == 0) {
            		$("#cmd_output").val(data.params.output);
            	} else {
            		$("#cmd_output").val('error - ' . data.params.err_code);
            	}
            }
            else if (data.method === "debug.upload_file") {
            	if(typeof data.params.err_code !== 'undefined' && typeof data.params.err_code !== null && parseInt(data.params.err_code) == 0) {
            		$("#cmd_output").val(data.params.output);
            	} else {
            		$("#cmd_output").val('error - ' . data.params.err_code);
            	}
            }
            else if (data.method === "debug.dump_db") {
            	if(typeof data.params.err_code !== 'undefined' && typeof data.params.err_code !== null && parseInt(data.params.err_code) == 0) {
            		$("#cmd_output").val(JSON.stringify(data.params.output, null, '\t'));
            	} else {
            		$("#cmd_output").val('error - ' . data.params.err_code);
            	}
            }
            else if (data.method === "debug.db_command") {
            	if(typeof data.params.err_code !== 'undefined' && typeof data.params.err_code !== null && parseInt(data.params.err_code) == 0) {
            		$("#cmd_output").val('sent');
            	} else {
            		$("#cmd_output").val('error - ' . data.params.err_code);
            	}
            }
            else if (data.method === "debug.cpu_loading") {
            	if(typeof data.params.err_code !== 'undefined' && typeof data.params.err_code !== null && parseInt(data.params.err_code) == 0) {
            		$("#cmd_output").val(data.params.output);
            	} else {
            		$("#cmd_output").val('error - ' . data.params.err_code);
            	}
            }
            else if (data.method === "debug.start_cpu_loading_log") {
            	if(typeof data.params.err_code !== 'undefined' && typeof data.params.err_code !== null && parseInt(data.params.err_code) == 0) {
            		$("#cmd_output").val('sent');
            	} else {
            		$("#cmd_output").val('error - ' . data.params.err_code);
            	}
            }
            else if (data.method === "debug.stop_cpu_loading_log") {
            	if(typeof data.params.err_code !== 'undefined' && typeof data.params.err_code !== null && parseInt(data.params.err_code) == 0) {
            		$("#cmd_output").val('sent');
            	} else {
            		$("#cmd_output").val('error - ' . data.params.err_code);
            	}
            }
            else if (data.method === "debug.cpu_model") {
            	if(typeof data.params.err_code !== 'undefined' && typeof data.params.err_code !== null && parseInt(data.params.err_code) == 0) {
            		$("#cmd_output").val(data.params.output);
            	} else {
            		$("#cmd_output").val('error - ' . data.params.err_code);
            	}
            }
            if (data.method === "system.status_bat_executed") {
            	$("#cmd_output").val('done');
            }
        }

        //Close socket
        socket.onclose = function (message) {
        	console.log('Debug: socket closed');
            console.log(message);
        };
}

function login() {
    var params = new Object();
    params.token = token;
    sendData(socket, '2', 'command', 'controller.connect', '4', params);
}

$(document).ready(function () {
	$(window).on('beforeunload', function(){
	    socket.close();
	});

    try {
        host = $("#websocket_server_address").val();
        var scheme = '';

        if (window.location.protocol == "https:"){
            scheme = "wss://";
        } else {
            scheme = "ws://";
        }
        if (host === "") {
            host = scheme + window.location.host + "/ws";
        } else {
            host = scheme + host;
        }

        //for testing
        //host = 'wss://frm.fm/ws';

        //Create socket
        socket = createSocket(host);
        initiateWebsocket();
    } catch (ex) {
        websocketRetry();
        console.log(ex);
    }
});