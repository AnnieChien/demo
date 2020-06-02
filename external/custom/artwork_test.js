var socket;
var host;
var token = $('#artwork-preview').attr('token-data');
var RESOURCE_TYPE = "resource_type";
var RESOURCE_URLS = "resource_urls";
var RESOURCE_TYPE_IMAGES = "images";
var RESOURCE_TYPE_VIDEOS = "videos";

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

function createSocket(host) {
    if (window.WebSocket)
        return new WebSocket(host);
    else if (window.MozWebSocket)
        return new MozWebSocket(host);
}

function login() {
    var params = new Object();
    params.token = token;
    sendData(socket, '2', 'command', 'controller.connect', '4', params);
}

$(document).ready(function () {
    $(window).on('beforeunload', function () {
        socket.close();
    });

    try {
        host = $("#websocket_server_address").val();
        var scheme = '';
        if (window.location.protocol == "https:")
            scheme = "wss://";
        else
            scheme = "ws://";
        if (host === "") {
            host = scheme + window.location.host + "/ws";
        } else {
            host = scheme + host;
        }
        //Create socket
        socket = createSocket(host);

        //Open socket
        if (socket.readyState === 1) {
            login();
        } else {
            socket.onopen = function (message) {
                console.log('Debug: open socket');
                login();
            }
        };

        //Trigger socket
        socket.onmessage = function (message) {
            //Parser return data from socket server
            var data = $.parseJSON(message.data);

            //Socket connected
            if (data.method === "controller.connect") {
                if(typeof data.params.err_code !== 'undefined' && typeof data.params.err_code !== null && parseInt(data.params.err_code) == 0) {
                    var params = new Object();
                    params.token = token;
                    sendData(socket, '2', 'command', 'manager.list_devices', '1', params);
                } else {
                    $.removeCookie('device_no');
                    console.log('Debug: socket connect failed');
                }
            }

            //Get device list
            if (data.method === "manager.list_devices") {

                if(typeof data.params.err_code !== 'undefined' && typeof data.params.err_code !== null && parseInt(data.params.err_code) == 0) {
                    console.log('Debug: device list');
                    console.log(data);
                    var devicesList = data.params.list_devices;
                    //Remove all content in .modal-body
                    $('#artwork-preview .modal-body').empty();
                    //console.log(devicesList);
                    if (devicesList && devicesList.length > 0) {
                        $.cookie('device_no', devicesList.length);

                        //Get device info
                        for (var i = 0; i < devicesList.length; i++) {
                            var params = new Object();
                            params.token = token;
                            params.device_id = devicesList[i].device_id;
                            //Get device info
                            sendData(socket, '2', 'command', 'manager.get_device_info', '2', params);
                        }

                    } else {
                        //Remove cookie
                        $.removeCookie('device_no');
                        //No device connected then setup device if need
                        console.log('Debug: no device');
                        var output = '';
                        output += '<p>Get started by configuring your FRAMED device in a few easy steps.</p>';
                        output += '<a id="new-display" name="new_display" class="btn btn-framedv2" href="/usersetting/devicesettings">New setup</a>';
                        output += '<button class="btn btn-framedv2" data-dismiss="modal" aria-hidden="true">I\'ll do it later</button>';
                        $('#artwork-preview .modal-title').html('Set up your framed');
                        $('#artwork-preview .modal-body').prepend(output);
                        $('#artwork-preview .modal-body').append('<div class="clear"></div>');
                    }
                } else {
                    //Remove cookie
                    $.removeCookie('device_no');
                    console.log('Debug: get device list failed');
                }
            }

            //Get devices info
            if (data.method === "manager.get_device_info") {
                if(typeof data.params.err_code !== 'undefined' && typeof data.params.err_code !== null && parseInt(data.params.err_code) == 0) {
                    //Reset all play/pause status first
                    $('button.btn-test-pause').each(function(){
                        $(this).hide();
                    });

                    $('button.btn-test-play').each(function(){
                        $(this).show();
                    });

                    var deviceInfo = data.params.device_info;
                    console.log('Debug: device info');
                    console.log(deviceInfo);

                    if (deviceInfo && deviceInfo.length > 0) {
                        var user_device_info = deviceInfo[0];
                        var device_no = $.cookie('device_no');

                        if (user_device_info.state.toLowerCase() === 'connected') {
                            var output_connected = '';
                            output_connected += '<div class="user-play-list">';
		                    output_connected += '<div class="mask-cover">';
		                    output_connected += '<img src="" class="artwork-thumb-popup" width="100%" height="100%">';
		                    output_connected += '<div class="mask-play">';
		                    output_connected += '<span class="device-title-play">' + user_device_info.name + '</span>';
		                    output_connected += '<button type="button" class="btn-play-play-device" onclick="devicePlay(\'' + user_device_info.guid + '\')" id="play' + user_device_info.guid + '" device="' + user_device_info.guid + '" data-controls-modal = "artwork-install" data-backdrop="static" data-keyboard="false"></button>';
		                    output_connected += '<button type="button" class="btn-play-pause-device" onclick="devicePause(\'' + user_device_info.guid + '\')" id="pause' + user_device_info.guid + '" device="' + user_device_info.guid + '"></button>';
		                    output_connected += '<input type="hidden" name = "current_artwork_playing_'+user_device_info.guid+'" id = "current_artwork_playing_'+user_device_info.guid+'" device="' + user_device_info.guid + '">'
		                    output_connected += '</div>';
		                    output_connected += '</div>';
		                    output_connected += '</div>';
                            
                            var params = new Object();
	                        params.token = token;
	                        params.device_id = user_device_info.guid;
	                        //Get device playing state
	                        sendData(socket, '2', 'command', 'artwork.get_current_playing', '', params);

                            var outputBound = '';
                            if (device_no == 1) {
                                outputBound += '<div class="device_items col-lg-12 col-md-12 col-sm-12 col-xs-12" id="' + user_device_info.guid + '" device="' + user_device_info.guid + '">';
                            } else if (device_no > 1) {
                                outputBound += '<div class="device_items col-lg-6 col-md-6 col-sm-12 col-xs-12" id="' + user_device_info.guid + '" device="' + user_device_info.guid + '">';
                            }
                            outputBound += output_connected;
                            outputBound += '</div>';

                            $('#artwork-preview .modal-body').prepend(outputBound);
                            $('#artwork-preview .modal-body').append('<div class="clear"></div>');

                        } else {
                            //Device is disconnected
                            var output_disconnected = '';
                            output_disconnected += '<div class="user-play-list">';
                            output_disconnected += '<div class="mask-cover-disconnected">';

                            output_disconnected += '<span class="device-title-play-disconnected">' + user_device_info.name + '</span>';
                            output_disconnected += '<p><strong>Unable to connect</strong><br><br>';
                            output_disconnected += 'FRAMED is power off, or isn\'t connected to the Internet<br><br><br><br><br>';
                            output_disconnected += '<span class="glyphicon glyphicon-cog" data-unicode="e019"></span><br>';
                            output_disconnected += '<a href="./settings/devices">FIX IT NOW</a>';
                            output_disconnected += '</p>';

                            output_disconnected += '</div>';
                            output_disconnected += '</div>';

                            var outputBound = '';
                            if (device_no == 1) {
                                outputBound += '<div class="device_items col-lg-12 col-md-12 col-sm-12 col-xs-12" id="' + user_device_info.guid + '" device="' + user_device_info.guid + '">';
                            } else if (device_no > 1) {
                                outputBound += '<div class="device_items col-lg-6 col-md-6 col-sm-12 col-xs-12" id="' + user_device_info.guid + '" device="' + user_device_info.guid + '">';
                            }

                            outputBound += output_disconnected;
                            outputBound += '</div>';
                            $('#artwork-preview .modal-body').prepend(outputBound);
                            $('#artwork-preview .modal-body').append('<div class="clear"></div>');
                        }
                    }
                } else {
                    console.log('Debug: get device info failed');
                }
            }
            if (data.method === "artwork.get_current_playing") {
            	if(typeof data.params.err_code !== 'undefined' && typeof data.params.err_code !== null && parseInt(data.params.err_code) == 0) {
	                console.log('Debug: artwork playing state');
	                console.log(data);

                    var _id;
	                if (data.params.id) {
	                    _id = data.params.id;
	                    var devicePlayingId = data.params.device_id;
	                    console.log('Device = ' + devicePlayingId + ', Artwork = ' + _id);
	                    $('#artwork-preview #current_artwork_playing_'+devicePlayingId).attr('value', _id);
	                } else if(data.params.url) {
	                	_id = CryptoJS.MD5(data.params.url);
	                    var devicePlayingId = data.params.device_id;
	                    console.log('Device = ' + devicePlayingId + ', URL = ' + data.params.url);
	                    $('#artwork-preview #current_artwork_playing_'+devicePlayingId).val(_id);
	                }
                    //$('#play' + _id).hide();
                    //$('#pause' + _id).show();
            	} else {
            		console.log('Debug: get current playing failed');
            	}
            }
            //Play artwork
            if (data.method === "artwork.status_artwork_launching") {
            	console.log('Debug: artwork play');
            	console.log(data);
                //Reload the page if any change
            	setTimeout(function() {
            		var params = new Object();
            		params.token = token;
                    sendData(socket, '2', 'command', 'manager.list_devices', '1', params);
            	},3000);
            }
            //Pause artwork
            if (data.method === "artwork.status_artwork_terminating") {
            	console.log('Debug: artwork stop');
                //Reload the page if any change
            	setTimeout(function() {
            		var params = new Object();
            		params.token = token;
                    sendData(socket, '2', 'command', 'manager.list_devices', '1', params);
            	},3000);
            }
        }
        //Close socket
        socket.onclose = function (message) {
            console.log('Debug: socket closed');
            console.log(message);
        };
    } catch (ex) {
        console.log(ex);
    }
});

//Preview artwork
function devicePlay(deviceId) {
    var artworkId = $('#artwork-preview').attr('artwork')?$('#artwork-preview').attr('artwork'):'';
    var artworkVersion = $('#artwork-preview').attr('version')?$('#artwork-preview').attr('version'):'';
    var url = $('#artwork-preview').attr('url')?$('#artwork-preview').attr('url'):'';
    var params = new Object();
    params.device_id = deviceId;
    params.id = artworkId;
    params.url = url;
    params.version = artworkVersion;
    
    //set last_device
    sendData(socket, '2', 'command', 'artwork.launch_request', '3', params);
    //Set current playing value
    $('#artwork-preview #current_artwork_playing_'+deviceId).val(artworkId);
}
function devicePause(deviceId) {
	var artworkId = $('#artwork-preview').attr('artwork')?$('#artwork-preview').attr('artwork'):'';
    var url = $('#artwork-preview').attr('url')?$('#artwork-preview').attr('url'):'';
    var params = Object();
    params.device_id = deviceId;
    params.id = artworkId;
    params.url = url;
    sendData(socket, '2', 'command', 'artwork.terminate_request', '3', params);
    //Set current playing value
    $('#artwork-preview #current_artwork_playing_'+deviceId).val('');
}

//Click preview button on Gallery list
$('.btn-test-play').click(function () {
    if ($('#deviceSetupModal').length) {
        console.log('Debug: setup device');
        if ($('#deviceSetupModal').length) {
            $("#deviceSetupModal").modal('show');
        }
        $('.modal').on('show.bs.modal', function (e) {
            $(this).on('click', function (e) {
                $(this).modal('hide');
            });
            $(this).css({'display': 'table', 'width': '100%', 'height': '100%'});
            $(this).find('.modal-dialog').css({'padding': '0px', 'display': 'table-cell', 'vertical-align': 'middle'});
            $(this).find('.modal-content').css({'width': '500px', 'max-width': '600px', 'margin': '0px auto'});
        });

        $('.modal').on('hidden.bs.modal', function (e) {
            $(this).find('.modal-content').removeAttr('style');
            $(this).find('.modal-dialog').removeAttr('style');
        });
    } else {
        console.log('Debug: preview artwork');
        var artwork_id = $(this).attr('artwork')?$(this).attr('artwork'):null;
        var artwork_version = $(this).attr('version')?$(this).attr('version'):null;
        var url = $(this).attr('url')?$(this).attr('url'):null;
        var artwork_url_id;
        $('#artwork-preview').modal({show: true});
        if(artwork_id) {
        	artwork_url_id = ''+artwork_id+'';
        	$('#artwork-preview').attr('artwork', artwork_id);
        }
        if(artwork_version) {
        	$('#artwork-preview').attr('version', artwork_version);
        }
        if(url) {
        	artwork_url_id = ''+CryptoJS.MD5(url)+'';;
        	$('#artwork-preview').attr('url', url);
        }
        $('#artwork-preview .artwork-thumb-popup').attr('src', $(this).attr('thumb'));
        
        //Roll back all play button state
        $('#artwork-preview input[type=hidden]').each(function(){
            console.log('Artwork value = ' + $(this).val() + '----'+ artwork_url_id);
            device_id = $(this).attr('device');
            console.log(device_id);
            $('#artwork-preview .modal-body #' + device_id + ' #play' + device_id).show();
            $('#artwork-preview .modal-body #' + device_id + ' #pause' + device_id).hide();

            if(artwork_url_id === $(this).val()) {
            	$('#artwork-preview .modal-body #' + device_id + ' #play' + device_id).hide();
                $('#artwork-preview .modal-body #' + device_id + ' #pause' + device_id).show();
            }
        });
    }
});