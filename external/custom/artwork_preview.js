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
    }**/

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
                        var device_no = $.cookie('device_no');

                        if (user_device_info.state.toLowerCase() === 'connected') {
                            var output_connected = '';
                            output_connected += '<div class="user-play-list">';
                            output_connected += '<div class="mask-cover">';
                            output_connected += '<img src="" class="artwork-thumb-popup" width="100%" height="100%">';
                            output_connected += '<div class="mask-play">';
                            output_connected += '<span class="device-title-play">' + user_device_info.name + '</span>';
                            output_connected += '<button type="button" class="btn-play-play-device" onclick="previewImages(\'' + user_device_info.guid + '\')" id="play' + user_device_info.guid + '" device="' + user_device_info.guid + '" data-controls-modal = "artwork-preview" data-backdrop="static" data-keyboard="false"></button>';
                            output_connected += '<span class="not-available-images">' + 'No preview images' + '</span>';

                            // output_connected += '<input type="hidden" name = "current_artwork_playing_'+user_device_info.guid+'" id = "current_artwork_playing_'+user_device_info.guid+'" device="' + user_device_info.guid + '">'
                            output_connected += '</div>';
                            output_connected += '</div>';
                            output_connected += '</div>';

                            var outputBound = '';
                            if (device_no == 1) {
                                outputBound += '<div class="device_items col-lg-12 col-md-12 col-sm-12 col-xs-12" id="' + user_device_info.guid + '" device="' + user_device_info.guid + '">';
                            } else if (device_no > 1) {
                                outputBound += '<div class="device_items col-lg-6 col-md-6 col-sm-12 col-xs-12" id="' + user_device_info.guid + '" device="' + user_device_info.guid + '">';
                            }

                            output_connected += '<button type="button" class="btn-preview-video-device" onclick="previewVideo(\'' + user_device_info.guid + '\')" id="previewVideo' + user_device_info.guid + '" device="' + user_device_info.guid + '">Preview Video</button>';
                            output_connected += '<span class="not-available-video">' + 'No preview video' + '</span>';

                            output_connected += '&nbsp;';
                            output_connected += '<button type="button" class="btn-play-pause-device2" onclick="endPreview(\'' + user_device_info.guid + '\')" id="pause2' + user_device_info.guid + '" device="' + user_device_info.guid + '">Stop</button>';

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
function previewImages(deviceId) {
    var artworkId = $('#artwork-preview').attr('artwork')?$('#artwork-preview').attr('artwork'):'';
    var preview_images = $('#artwork-preview').attr('preview-images')?$('#artwork-preview').attr('preview-images'):'';
    var params = new Object();
    params.device_id = deviceId;
    params.id = artworkId;
    params[RESOURCE_URLS] = preview_images;
    params[RESOURCE_TYPE] = RESOURCE_TYPE_IMAGES;

    sendData(socket, '2', 'command', 'artwork.preview_start', '3', params);

    //Set current playing value
    // $('#artwork-preview #current_artwork_playing_'+deviceId).val(artworkId);

}

function previewVideo(deviceId) {
    var artworkId = $('#artwork-preview').attr('artwork')?$('#artwork-preview').attr('artwork'):'';
    var videoUrl = $('#artwork-preview').attr('preview-video')?$('#artwork-preview').attr('preview-video'):'';
    var params = new Object();
    params.device_id = deviceId;
    params.id = artworkId;
    params[RESOURCE_URLS] = videoUrl;
    params[RESOURCE_TYPE] = RESOURCE_TYPE_VIDEOS;

    sendData(socket, '2', 'command', 'artwork.preview_start', '3', params);

    //Set current playing value
    // $('#artwork-preview #current_artwork_playing_'+deviceId).val(artworkId);

}

//End preview artwork
function endPreview(deviceId) {
    var params = Object();
    params.device_id = deviceId;
    sendData(socket, '2', 'command', 'artwork.preview_end', '3', params);
}

//Click preview button on Gallery list
$('.btn-play-play').click(function () {
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
        var preview_images = $(this).attr('preview-images')?$(this).attr('preview-images'):null;
        var preview_video = $(this).attr('preview-video')?$(this).attr('preview-video'):null;
        var artwork_url_id;
        $('#artwork-preview').modal({show: true});
        if(artwork_id) {
        	artwork_url_id = ''+artwork_id+'';
        	$('#artwork-preview').attr('artwork', artwork_id);
        }
        if(preview_images) {
            artwork_url_id = ''+CryptoJS.MD5(preview_images)+'';
        	$('#artwork-preview').attr('preview-images', preview_images);
            $('#artwork-preview .btn-play-play-device').attr('style','display:show');
            $('#artwork-preview .not-available-images').attr('style','display:none');
        } else {
            $('#artwork-preview .btn-play-play-device').attr('style','display:none');
            $('#artwork-preview .not-available-images').attr('style','display:show');
        }

        if(preview_video) {
            artwork_url_id = ''+CryptoJS.MD5(preview_video)+'';
            $('#artwork-preview').attr('preview-video', preview_video);
            $('#artwork-preview .btn-preview-video-device').attr('style','display:show');
            $('#artwork-preview .not-available-video').attr('style','display:none');
        } else {
            $('#artwork-preview .btn-preview-video-device').attr('style','display:none');
            $('#artwork-preview .not-available-video').attr('style','display:show');
        }

        $('#artwork-preview .artwork-thumb-popup').attr('src', $(this).attr('thumb'));
    }
});