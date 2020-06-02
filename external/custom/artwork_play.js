var socket;
var host;
var token = $('#artwork-install').attr('token-data');
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
    //host = 'wss://frm.fm/ws';
    if(webSocketAttempts < 10){
        console.log('trying for the ' + webSocketAttempts + 'time(s)');
        socket = createSocket(host);
        webSocketAttempts++;
    }
    
}

function getHiddenProp(){
    var prefixes = ['webkit','moz','ms','o'];
    
    // if 'hidden' is natively supported just return it
    if ('hidden' in document) return 'hidden';
    
    // otherwise loop over all the known prefixes until we find one
    for (var i = 0; i < prefixes.length; i++){
        if ((prefixes[i] + 'Hidden') in document) 
            return prefixes[i] + 'Hidden';
    }

    // otherwise it's not supported
    return null;
}

function isHidden() {
    var prop = getHiddenProp();
    if (!prop) return false;
    
    return document[prop];
}

function createSocket(host) {
    if (window.WebSocket){
        return new WebSocket(host);
    }
    else if (window.MozWebSocket){
        return new MozWebSocket(host);
    }
}

function checkWebsocketHealth(){
    if(!isHidden()){
        webSocketAttempts = 0;
        websocketRetry();
    }
}

function initiateWebsocket(){
    var visProp = getHiddenProp();
    if (visProp) {
        var evtName = visProp.replace(/[H|h]idden/,'') + 'visibilitychange';
        document.addEventListener(evtName, checkWebsocketHealth);
    }
    socket.onerror = function(event){
        console.log('error');
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

            $( ".artwork-installed-list .btn-play-play" ).each(function( index ) {
                var params = new Object();
                params.id = $(this).attr('artwork');
                sendData(socket, '2', 'command', 'artwork.get_last_install', params.id, params);
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
                var params = new Object();
                params.token = token;
                sendData(socket, '2', 'command', 'manager.list_devices', '1', params);
            } else {
                $.removeCookie('device_no');
                console.log('Debug: socket connect failed');
            }
        }

        //Get device list
        // this perform redrawing => bad performance
        // this does not do synchronization => data sometime does not sync
        // case:
        //  a device is deleted => server sends 2 notif device state changed, one disconnected and one deleted
        //  => 2 manager.list_devices are called, each will query device_info, but both called got result first before any manager.get_device_info
        //  => got result of 2 manager.get_device_info of same device
        //  => device is drawn twice!
        if (data.method === "manager.list_devices") {

            if(typeof data.params.err_code !== 'undefined' && typeof data.params.err_code !== null && parseInt(data.params.err_code) == 0) {
                console.log('Debug: device list');
                console.log(data);
                var devicesList = data.params.list_devices;
                //Remove all content in .modal-body
                $('#artwork-install .modal-body').empty();
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
                    output += '<a id="new-display" name="new_display" class="btn btn-framedv2" href="/settings/device">New setup</a>';
                    output += '<button class="btn btn-framedv2" data-dismiss="modal" aria-hidden="true">I\'ll do it later</button>';
                    $('#artwork-install .modal-title').html('Set up your framed');
                    $('#artwork-install .modal-body').prepend(output);
                    $('#artwork-install .modal-body').append('<div class="clear"></div>');
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
                $('button.btn-play-pause').each(function(){
                    $(this).hide();
                });

                $('button.btn-play-play').each(function(){
                    $(this).show();
                });

                var deviceInfo = data.params.device_info;
                console.log('Debug: device info');
                console.log(deviceInfo);

                if (deviceInfo && deviceInfo.length > 0) {
                    var user_device_info = deviceInfo[0];
                    // we use device_id instead of guid, they got the same value now but guid param should be removed!
                    var current_device_view = $("#" + user_device_info.device_id);
                    if (current_device_view.length > 0) {
                        // ok, remove it first
                        current_device_view.remove();
                    }
                    var device_no = $.cookie('device_no');
                    var artworkId = $('#artwork-install').attr('artwork');

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

                        output_connected += '<div class="install-to-device-container">';
                        output_connected += '<button style="display:none" type="button" class="install-to-device" onclick="installArtwork(\'' + user_device_info.guid + '\')" id="install' + user_device_info.guid + '" device="' + user_device_info.guid + '">Install</button>';
                        output_connected += '<div style="display:none" class = "installing-progress-on-device" id="installing' + user_device_info.guid + '">Installing ...</div>';
                        //Now, don't show Install/Remove button, so no need to display Processing... label
                        //output_connected += '<div class="processing-get-install-status" id="processing-get-install-status' + user_device_info.guid + '" device ="' + user_device_info.guid + '">Processing...</div>';
                        //output_connected += '<div style="display:none" class="processing-get-install-status" id="processing-get-install-status' + user_device_info.guid + '" device ="' + user_device_info.guid + '">Processing...</div>';
                        output_connected += '</div>';

                        var params = new Object();
                        params.token = token;
                        params.device_id = user_device_info.guid;

                        //Get device playing state
                        sendData(socket, '2', 'command', 'artwork.get_current_playing', '', params);

                        var params = new Object();
                        params.device_id = user_device_info.guid;
                        params.id = artworkId;
                        sendData(socket, '2', 'command', 'artwork.get_install_status', params.device_id, params);

                        var outputBound = '';

                        if (device_no == 1) {
                            outputBound += '<div class="device_items col-lg-12 col-md-12 col-sm-12 col-xs-12" id="' + user_device_info.guid + '" device="' + user_device_info.guid + '">';
                        } else if (device_no > 1) {
                            outputBound += '<div class="device_items col-lg-6 col-md-6 col-sm-12 col-xs-12" id="' + user_device_info.guid + '" device="' + user_device_info.guid + '">';
                        }

                        outputBound += output_connected;
                        outputBound += '</div>';

                        $('#artwork-install .modal-body').prepend(outputBound);
                        $('#artwork-install .modal-body').append('<div class="clear"></div>');

                    } else {
                        //Device is disconnected
                        var output_disconnected = '';
                        output_disconnected += '<div class="user-play-list">';
                        output_disconnected += '<div class="mask-cover-disconnected">';

                        output_disconnected += '<span class="device-title-play-disconnected">' + user_device_info.name + '</span>';
                        output_disconnected += '<p><strong>' + i18n("Unable to connect") + '</strong><br><br>';
                        output_disconnected += i18n("FRAMED is power off, or isn't connected to the Internet") + '<br><br><br><br><br>';
                        output_disconnected += '<span class="glyphicon glyphicon-cog" data-unicode="e019"></span><br>';
                        output_disconnected += '<a href="./settings/devices">' + i18n("FIX IT NOW") + '</a>';
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
                        $('#artwork-install .modal-body').prepend(outputBound);
                        $('#artwork-install .modal-body').append('<div class="clear"></div>');
                    }
                }
            } else {
                console.log('Debug: get device info failed');
            }
        }

        //Get artwork playing state
        if (data.method === "artwork.get_current_playing") {
            if(typeof data.params.err_code !== 'undefined' && typeof data.params.err_code !== null && parseInt(data.params.err_code) == 0) {
                console.log('Debug: artwork playing state');
                console.log(data);

                var _id;
                if (data.params.id) {
                    _id = data.params.id;
                    var devicePlayingId = data.params.device_id;
                    console.log('Device = ' + devicePlayingId + ', Artwork = ' + _id);
                    $('#artwork-install #current_artwork_playing_'+devicePlayingId).val(_id);
                } else if(data.params.url) {
                    _id = CryptoJS.MD5(data.params.url);
                    var devicePlayingId = data.params.device_id;
                    console.log('Device = ' + devicePlayingId + ', URL = ' + data.params.url);
                    $('#artwork-install #current_artwork_playing_'+devicePlayingId).val(_id);
                }
                $('#play' + _id).hide();
                $('#pause' + _id).show();
            } else {
                console.log('Debug: get current playing failed');
            }
        }

        //Check notification - change device status
        if (data.method === "manager.notif.device_state_changed") {
            console.log("Debug: state changed -> " + data.params.state);
            //hide all installing artworks if they are installing on that disconnected device.
            if (data.params.state.toLowerCase() === 'disconnected') {
                $(".row .artwork-installed-list").each(function() {
                    var artworkId = $(this).find('.btn-play-play').attr('artwork');
                    var deviceId = $(this).find('.user-installed-downloading-status-progress').attr('last_device');
                    var isInstallingOrDownloading = $(this).find('#install-status-container' + artworkId).is(":visible");
                    if (data.params.device_id === deviceId && isInstallingOrDownloading) {
                        console.log("Hide installing artwork: " + artworkId + " on device: "+ deviceId);
                        showDownloadFailure(artworkId);
                    }
                });
            }
            var params = new Object();
            params.token = token;
            sendData(socket, '2', 'command', 'manager.list_devices', '1', params);
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

            /*
            $.ajax({
                url: "",
                context: document.body,
                success: function(s,x){
                    $(this).html(s);
                }
            });
            */
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
            /*
            $.ajax({
                url: "",
                context: document.body,
                success: function(s,x){
                    $(this).html(s);
                }
            });
            */
        }

        if (data.method == 'artwork.status_artwork_installing') {
            console.log('Debug: notification artwork.status_artwork_installing in device : ' + data.params.device_id + " and status =" + data.params.status + " and id=" + data.params.id);
            $progress = parseFloat(data.params.progress).toFixed(2) * 100;
            $progress = Math.round($progress);
            if (data.params.id == $('#artwork-install').attr('artwork')) {
                //$('#install' + data.params.device_id).hide();
                $('#installing' + data.params.device_id).show();
                //$('#processing-get-install-status' + data.params.device_id).hide();
                if (data.params.status == 'downloading' || data.params.status == 'prepare_to_download') {
                    $('#installing' + data.params.device_id).html("Downloading");
                } else if (data.params.status == 'extracting') {
                    $('#installing' + data.params.device_id).html("Extracting");
                } else if (data.params.status == 'installing') {
                    $('#installing' + data.params.device_id).html("Installing");
                }
            }
            
            if ($('#user-installed-downloading-status-progress' + data.params.id).attr('last_device') == "")
                $('#user-installed-downloading-status-progress' + data.params.id).attr('last_device', data.params.device_id);

            if ($('#user-installed-downloading-status-progress' + data.params.id).attr('last_device') == data.params.device_id) {
                //console.log("------progress bar runing------");
                if (data.params.status == 'downloading' || data.params.status == 'prepare_to_download') {
                    showDownloadProgress(data.params.id, $progress);
                } else {
                    showInstallProgress(data.params.id);
                }
            }
        }

        if (data.method == 'artwork.status_artwork_installed') {
            console.log('Debug: artwork.status_artwork_installed in device : ' + data.params.device_id);
            if (data.params.id == $('#artwork-install').attr('artwork')) {
                //$('#install' + data.params.device_id).hide();
                $('#installing' + data.params.device_id).hide();
                //$('#processing-get-install-status' + data.params.device_id).hide();
                $('#play' + data.params.device_id).show();
                $('#pause' + data.params.device_id).hide();
            }

            if ($('#user-installed-downloading-status-progress' + data.params.id).attr('last_device') != ""
                && $('#user-installed-downloading-status-progress' + data.params.id).attr('last_device') == data.params.device_id) {
                hideInstallProgress(data.params.id);
                $('#user-installed-downloading-status-progress' + data.params.id).attr('last_device', "");
                var params = new Object();
                params.id = data.params.id;
                sendData(socket, '2', 'command', 'artwork.get_last_install', params.id, params);
            }
        }

        if (data.method == 'artwork.status_artwork_install_failed') {
            console.log('Debug: artwork.status_artwork_install_failed due to : ' + data.params.error_reason);
            if (data.params.id == $('#artwork-install').attr('artwork')) {
                $('#install' + data.params.device_id).hide();
                $('#installing' + data.params.device_id).hide();
                $('#processing-get-install-status' + data.params.device_id).hide();
                $('#play' + data.params.device_id).show();
                $('#pause' + data.params.device_id).hide();
                showInstallFailed(data.params.id);
            }
        }

        if (data.method == 'artwork.get_install_status') {
            console.log('Debug: artwork.get_install_status =' + data.params.device_id);
            if (data.params.id == $('#artwork-install').attr('artwork')) {
                if (data.params.err_code == "0") {
                    //$('#user-installed-downloading-status-progress' + data.params.id).attr('last_device', data.params.device_id);
                    if (data.params.status == "installed") {
                        console.log("status === installed");
                        //$('#install' + data.params.device_id).hide();
                        $('#installing' + data.params.device_id).hide();
                        //$('#processing-get-install-status' + data.params.device_id).hide();
                    } else if (data.params.status == "uninstalled") {
                        console.log("status === uninstalled");
                        //$('#install' + data.params.device_id).show();
                        $('#installing' + data.params.device_id).hide();
                        //$('#processing-get-install-status' + data.params.device_id).hide();
                        //$('#play' + data.params.device_id).hide();
                        $('#pause' + data.params.device_id).hide();
                        hideInstallProgress(data.params.id);
                    } else if (data.params.status == "installing") {
                        console.log("status === installed");
                        //$('#install' + data.params.device_id).hide();
                        $('#installing' + data.params.device_id).show();
                        //$('#processing-get-install-status' + data.params.device_id).hide();
                        //$('#play' + data.params.device_id).hide();
                        $('#pause' + data.params.device_id).hide();
                    }
                } else {
                    //$('#install' + data.params.device_id).show();
                    $('#installing' + data.params.device_id).hide();
                    //$('#processing-get-install-status' + data.params.device_id).hide();
                    //$('#play' + data.params.device_id).hide();
                    $('#pause' + data.params.device_id).hide();
                }
            }
        }

        if (data.method == 'artwork.get_last_install') {
            console.log('Debug:: artwork.get_last_install=================');
            if (data.params.status != 'not_installing')
                $('#user-installed-downloading-status-progress' + data.params.id).attr('last_device', data.params.device_id);

            if (data.params.status == 'install_failed') {
                console.log('Debug::artwork.get_last_install -> status = install_failed');
                showInstallFailed(data.params.id);
            } else if (data.params.status == 'not_installing') {
                console.log('Debug::artwork.get_last_install -> status = not_installing');
                hideInstallProgress(data.params.id);
            } else if (data.params.status == 'downloading' || data.params.status == 'prepare_to_download') {
                console.log('Debug::artwork.get_last_install -> status = downloading');
                showDownloadProgress(data.params.id, "");
            } else if (data.params.status == 'extracting') {
                console.log('Debug::artwork.get_last_install -> status = extracting');
                showInstallProgress(data.params.id);
            } else if (data.params.status == 'installing') {
                console.log('Debug::artwork.get_last_install -> status = installing');
                showInstallProgress(data.params.id);
            }
        }

        if (data.method == 'artwork.install_from_store') {
            console.log("Debug::install_from_store::reply->id=" + data.params.id);
            if (data.params.err_code == "0")
                $('#user-installed-downloading-status-progress' + data.params.id).attr('last_device', data.params.device_id);
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
    i18n.translator.add(artwork_playTranslations);
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
        //host = 'ws://127.0.0.1:8080/ws';
        //console.log(host);

        //Create socket
        socket = createSocket(host);
        initiateWebsocket();
    } catch (ex) {
        websocketRetry();
        console.log(ex);
    }
});