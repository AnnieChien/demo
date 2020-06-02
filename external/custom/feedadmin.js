var FEED_ARTWORK_TYPE = "Artwork";
var FEED_URL_TYPE = "Url";
$(document).ready(function(){
    var type = $("#type");
    type.change(function() {
        handleTypeChange(type.val());
    });
    handleTypeChange(type.val());
    
    current_thumbnail = $("#url_thumbnail_picture").val();
    $("#url_thumbnail").attr("src", current_thumbnail);
});

function handleTypeChange(type)
{
    if (type === FEED_ARTWORK_TYPE) {
        artworkSelected();
    } else if (type === FEED_URL_TYPE) {
        urlSelected();
    }
}

function artworkSelected()
{
    $("#url").attr('disabled', 'disabled');
    $("#url_thumbnail").attr('disabled', 'disabled');
    $("#url_artist_name").attr('disabled', 'disabled');
    $("#url_name").attr('disabled', 'disabled');
    $("#url_thumbnail_file").attr('disabled', 'disabled');
    $("#artwork_id").removeAttr('disabled');
}
function urlSelected()
{
    $("#artwork_id").attr('disabled', 'disabled');
    $("#url").removeAttr('disabled');
    $("#url_thumbnail").removeAttr('disabled');
    $("#url_artist_name").removeAttr('disabled');
    $("#url_name").removeAttr('disabled');
    $("#url_thumbnail_file").removeAttr('disabled');
}

$("#url_thumbnail_generator").click(function(evt) {
    var type = $("#type option:selected").val();
    if (type !== FEED_URL_TYPE) {
        return;
    }
    $url = $.trim($("#url").val());
    if ($url === "") {
        return;
    }
    getUrlInfo(
        $url,
        //before send callback
        function () {
        },
        //success callback
        function(url, urlTitle) {
            $("#url_artist_name").val(url);
            $("#url_name").val(urlTitle);
            showUrlThumbnail(url);
        },
        //error callback
        function(errorMessage) {
            alert(data.responseJSON.error.message);
        },
        //done callback
        function() {
        }
    );
});

function showUrlThumbnail(url) {
    $("#url_thumbnail").attr("src", GET_THUMBNAIL_URL + url);
}

$.ajaxSetup({
    beforeSend:function(){
        // show gif here, eg:
        $("#loading").show();
    },
    complete:function(){
        // hide gif here, eg:
        $("#loading").hide();
    }
});