$(document).ready(function () {
	if ($("#launch_url").length !== 0){
	    $( "#launch_url" ).keypress(function(event) {
	        if ( event.which == 13 ) {
	            console.log("What's up");
	            $('#artwork-install').attr('artwork', "");
	            $('#artwork-install').attr('url', $('#launch_url').val());
	            $('#artwork-install').modal({show:true});
	            event.preventDefault();
	        }
	    });
	}
});

//Play artwork or url
function devicePlay(deviceId) {
    var artworkId = $('#artwork-install').attr('artwork')?$('#artwork-install').attr('artwork'):'';
    var artworkVersion = $('#artwork-install').attr('version')?$('#artwork-install').attr('version'):'';
    var url = $('#artwork-install').attr('url')?$('#artwork-install').attr('url'):'';
    var url_name = $('#artwork-install').attr('url')?decodeURI($('#artwork-install').attr('url_name')):'';
    var params = new Object();
    params.device_id = deviceId;
    params.id = artworkId;
    params.url = url;
    params.url_name = url_name;
    params.version = artworkVersion;
    
    //set last_device
    $('#user-installed-downloading-status-progress' + artworkId).attr('last_device', deviceId);
    sendData(socket, '2', 'command', 'artwork.launch_request', '3', params);
    //Set current playing value
    $('#artwork-install #current_artwork_playing_'+deviceId).val(artworkId);
}
//Pause artwork or url
function devicePause(deviceId) {
	var artworkId = $('#artwork-install').attr('artwork')?$('#artwork-install').attr('artwork'):'';
    var url = $('#artwork-install').attr('url')?$('#artwork-install').attr('url'):'';
    var params = Object();
    params.device_id = deviceId;
    params.id = artworkId;
    params.url = url;
    sendData(socket, '2', 'command', 'artwork.terminate_request', '3', params);
    //unset last_device
    $('#user-installed-downloading-status-progress' + artworkId).attr('last_device', '');
}

//Click play button on installed list
$('body').on('click', '.btn-play-play', function() {
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
        console.log('Debug: play artwork');
        var artwork_id = $(this).attr('artwork')?$(this).attr('artwork'):null;
        var artwork_version = $(this).attr('version')?$(this).attr('version'):null;
        var url = $(this).attr('url')?$(this).attr('url'):null;
        var url_name = $(this).attr('url_name')?$(this).attr('url_name'):null;
        var artwork_url_id;
        $('#artwork-install').modal({show: true});
        if(artwork_id) {
        	artwork_url_id = ''+artwork_id+'';
        	$('#artwork-install').attr('artwork', artwork_id);
        }
        if(artwork_version) {
        	$('#artwork-install').attr('version', artwork_version);
        }
        if(url) {
        	artwork_url_id = ''+CryptoJS.MD5(url)+'';;
        	$('#artwork-install').attr('url', url);
            $('#artwork-install').attr('url_name', url_name);
        }
        $('#artwork-install .artwork-thumb-popup').attr('src', $(this).attr('thumb'));
        
        //Roll back all play button state
        $('#artwork-install input[type=hidden]').each(function(){
            console.log('Artwork value = ' + $(this).val() + '----'+ artwork_url_id);
            device_id = $(this).attr('device');
            console.log(device_id);
            $('#artwork-install .modal-body #' + device_id + ' #play' + device_id).show();
            $('#artwork-install .modal-body #' + device_id + ' #pause' + device_id).hide();
        });

        //Now, don't show Install/Remove button, so no need to display Processing... label
        //$( ".processing-get-install-status" ).each(function( index ) {
        //    console.log( index + ": " + $( this).attr('device') );
        //    var params = new Object();
        //    $(this).show();
        //    params.device_id = $( this).attr('device');
        //    params.id = artwork_id;
        //    sendData(socket, '2', 'command', 'artwork.get_install_status', params.device_id, params);
        //});

        $(".installing-progress-on-device").each(function (index) {
            $(this).hide();
        });
        $(".install-to-device").each(function (index) {
            $(this).hide();
        });
    }
});

//Click pause button on installed list
$('body').on('click', '.btn-play-pause', function() {
    console.log('Debug: pause artwork');
    var artwork_id = $(this).attr('artwork')?$(this).attr('artwork'):null;
    var url = $(this).attr('url')?$(this).attr('url'):null;
    var artwork_url_id;
    var device_id;
    $('#artwork-install').modal({show: true});
    
    if(artwork_id) {
    	artwork_url_id = ''+artwork_id+'';
    	$('#artwork-install').attr('artwork', artwork_id);
    }
    if(url) {
    	artwork_url_id = ''+CryptoJS.MD5(url)+'';;
    	$('#artwork-install').attr('url', url);
    }
    
    $('#artwork-install .artwork-thumb-popup').attr('src', $(this).attr('thumb'));
    
    $('#artwork-install input[type=hidden]').each(function(){
        console.log('Artwork value = ' + $(this).val() + '----'+ artwork_url_id);
        device_id = $(this).attr('device');
        console.log('Device ID = ' + device_id);
        $('#artwork-install .modal-body #' + device_id + ' #play' + device_id).show();
        $('#artwork-install .modal-body #' + device_id + ' #pause' + device_id).hide();
        if(artwork_url_id === $(this).val()) {
        	$('#artwork-install .modal-body #' + device_id + ' #play' + device_id).hide();
            $('#artwork-install .modal-body #' + device_id + ' #pause' + device_id).show();
        }
    });
});