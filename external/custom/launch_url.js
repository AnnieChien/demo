$(document).ready(function () {
    $( "#launch_url" ).keypress(function(event) {
        if ( event.which == 13 ) {
            console.log("shit");
            $('#artwork-install').attr('artwork', "");
            $('#artwork-install').attr('url', $('#launch_url').val());
            $('#artwork-install').modal({show:true});
            event.preventDefault();
        }
    });
});

// feed play
function devicePlay(deviceId) {
    console.log("this is devicePlay!");
    var artworkId = $('#artwork-install').attr('artwork');
    var params = new Object();
    params.device_id = deviceId;
    params.id = artworkId;
    params.url = $('#artwork-install').attr('url');
    params.url_name = decodeURI($('#artwork-install').attr('url_name'));
    console.log(params);
    sendData(socket, '2', 'command', 'artwork.launch_request', '3', params);

    $('#artwork-install').modal('hide');
    $('#play' + artworkId).hide();
    $('#pause' + artworkId).show();
}
//Pause artwork
function devicePause(deviceId) {
    var artworkId = $('#artwork-install').attr('artwork');
    var params = Object();
    params.device_id = deviceId;
    params.id = artworkId;
    sendData(socket, '2', 'command', 'artwork.terminate_request', '3', params);
    
    $('#artwork-install').modal('hide');
    $('#pause' + artworkId).hide();
    $('#play' + artworkId).show();
}

//Click play button on installed list
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
        console.log('Debug: play artwork');
        var artwork_url_id = $(this).attr('artwork');
        //var url = $(this).attr('url');
        if(!artwork_url_id) {
        	artwork_url_id = ''+CryptoJS.MD5($(this).attr('url'))+'';
        }
        //console.log(url);
        $('#artwork-install').modal({show: true});
        //$('#artwork-install').attr('artwork', artwork_id);
        //$('#artwork-install').attr('url', url);
        $('#artwork-install .artwork-thumb-popup').attr('src', $(this).attr('thumb'));
        
        //Roll back all play button state
        $('#artwork-install input[type=hidden]').each(function(){
            console.log('Artwork value = ' + $(this).val() + '----'+ artwork_url_id);
            device_id = $(this).attr('device');
            console.log(device_id);
            $('#artwork-install .modal-body #' + device_id + ' #play' + device_id).show();
            $('#artwork-install .modal-body #' + device_id + ' #pause' + device_id).hide();
        });
    }
});

//Click pause button on installed list
$('.btn-play-pause').click(function () {
    console.log('Debug: pause artwork');
    var artwork_url_id = $(this).attr('artwork');
    if(!artwork_url_id) {
    	artwork_url_id = ''+CryptoJS.MD5($(this).attr('url'))+'';
    }
    $('#artwork-install').modal({show: true});
    //$('#artwork-install').attr('artwork', artwork_url_id);
    $('#artwork-install .artwork-thumb-popup').attr('src', $(this).attr('thumb'));
    //$.cookie('artwork_thumb_popup',$(this).attr('thumb'));
    
    
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