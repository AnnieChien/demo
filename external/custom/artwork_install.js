/**
 * Created by PT on 3/25/2015.
 */

//Install artwork from store
function installArtwork(deviceId) {
    var artworkId = $('#artwork-install').attr('artwork');
    var params = new Object();
    params.device_id = deviceId;
    params.id = artworkId;
    params.version_id = 1;
    params.upgrade = false;
    sendData(socket, '2', 'command', 'artwork.install_from_store', artworkId, params);
}

function showInstallFailed(artworkId) {
    $('#user-installing-status-progress' + artworkId).hide();
    $('#user-installed-downloading-status-progress' + artworkId).hide();
    $('#install-status-container' + artworkId).show();
    $('#background-cover-box' + artworkId).show();
    $('#user-download-failure-status' + artworkId).show();
    $('#install-status-bgr' + artworkId).show();
}

function showDownloadProgress(artworkId, progress) {
    $('#install-status-container' + artworkId).show();
    $('#user-installed-downloading-status-progress' + artworkId).show();
    $('#background-cover-box' + artworkId).show();
    $('#user-download-failure-status' + artworkId).hide();
    var $html_progress = "<div class='status-text-box'><h4>Downloading...</h4><p>" + progress + "%</p></div><div class='progress-bar progress-bar-striped active' role='progressbar' aria-valuenow='" + progress + "' aria-valuemin='0' aria-valuemax='100' style='width: " + progress + "%'></div>";
    $('#user-installed-downloading-status-progress' + artworkId).html($html_progress);
    $('#user-installing-status-progress' + artworkId).hide();
    $('#install-status-bgr' + artworkId).show();
}

function showInstallProgress(artworkId) {
    $('#install-status-container' + artworkId).show();
    $('#background-cover-box' + artworkId).show();
    $('#user-download-failure-status' + artworkId).hide();
    $('#user-installed-downloading-status-progress' + artworkId).hide();
    $('#user-installing-status-progress' + artworkId).show();
    $('#install-status-bgr' + artworkId).show();
}

function hideInstallProgress(artworkId) {
    $('#install-status-container' + artworkId).hide();
    $('#user-installed-downloading-status-progress' + artworkId).hide();
    $('#background-cover-box' + artworkId).hide();
    $('#user-download-failure-status' + artworkId).hide();
    $('#user-installing-status-progress' + artworkId).hide();
    $('#install-status-bgr' + artworkId).hide();
    $('.btn-play-play').css('background-size', '80px 80px');
}

function showDownloadFailure(artworkId) {
    $('#install-status-container' + artworkId).show();
    $('#user-installed-downloading-status-progress' + artworkId).hide();
    $('#background-cover-box' + artworkId).show();
    $('#user-download-failure-status' + artworkId).show();
    $('#user-installing-status-progress' + artworkId).hide();
    $('#install-status-bgr' + artworkId).hide();
    $('.btn-play-play').css('background-size', '0');
}