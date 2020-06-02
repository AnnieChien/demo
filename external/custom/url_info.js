//This file is use to add Feed URL in admin panel

var GET_THUMBNAIL_URL = "http://api.pagepeeker.com/v2/thumbs.php?code=1873795670&size=a&wait=30&refresh=0&url=";

function fillURL(url) {
    var _url = url;
    if (_url.indexOf("http") != 0) {
        _url = "http://" + url;
    }
    return _url;
}

function getUrlInfo(url, beforeSendCallback, successCallback, errorCallback, doneCallback) {
    var _url = fillURL(url);
    api_url = 'https://www.googleapis.com/pagespeedonline/v2/runPagespeed?filter_third_party_resources=true&screenshot=false&strategy=desktop&url=' + _url;
    $.ajax({
        url: api_url,
        type: "get",
        dataType: "json",
        beforeSend: function() {
            beforeSendCallback();
        },
        success: function(data) {
            console.log("we got the data");
            urlTitle = data.title;
            successCallback(_url, urlTitle);
        },
        error: function(data) {
            errorCallback(data.responseJSON.error.message);
        }
    }).done(function() {
        doneCallback();
        console.log("Ok, done!");
    });
}