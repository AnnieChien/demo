var geoLocationTimeout = null;
var timeout = 5000;

$(document).ready(function(){
    i18n.translator.add(device_settingTranslations);
        $('#device-setting-form-step1').validate({
            rules: {
                device_name: {
                    minlength: 2,
                    required: true
                },
                wifi_name: {
                    minlength: 2,
                    required: true
                }
            },
            messages: {
                device_name: {
                    required: i18n('Please enter the display name'),
                    minlength: i18n('Display name must be at least 2 characters long')
                },
                wifi_name: {
                    required: i18n('Please enter the wifi SSID'),
                    minlength: i18n('wifi name must be at least 2 characters long')
                }
            }
        });

    var checkResetWifi = $("#reset_wifi_only");
    if (checkResetWifi.val() !== undefined) {
        onResetWifiChanged();
        checkResetWifi.change(onResetWifiChanged);
    } else {
        checkLocationSupport();
    }
});

function onResetWifiChanged() {
    if ($("#reset_wifi_only").is(":checked")) {
        $("#device_name").attr('disabled', 'disabled');
        $("#time_zone_id").attr('disabled', 'disabled');
    } else {
        $("#device_name").removeAttr('disabled');
        $("#time_zone_id").removeAttr('disabled');
    }
}

function setDefaultTimezone()
{
    clearGeoLocationTimeout();
    var windowsZoneList = $.parseJSON($("#windows_time_zone").val());
    var timezone = jstz.determine();
    var timezoneName = timezone.name();
    if (windowsZoneList[timezoneName] !== undefined) {
        $("select[name='time_zone_id']").val(windowsZoneList[timezoneName]);
    }
}

var LocationService = (function (){
    var position = null;
    init = function(pos) {
        position = pos;
        getCurrentLocation();
    },
    getPosition = function() {
        return position;
    },
    getLocation = function() {
        if (position == null) {
            return null;
        }
        var location = new Object();
        location.latitude = position.coords.latitude;
        location.longitude = position.coords.longitude;
        return location;
    }
    return {
        init : init,
        getPosition : getPosition,
        getLocation : getLocation
    }
}());

function checkLocationSupport()
{
    geoLocationTimeout = setTimeout(function () {
        if (LocationService.getLocation() == null) {
            setDefaultTimezone();
            return;
        }
    }, timeout);

    if (navigator && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(LocationService.init, errorHandler);
    } else {
        console.log("Geo Location is not supported");
        setDefaultTimezone();
    }
}

function errorHandler(err) {
    setDefaultTimezone();
}

function clearGeoLocationTimeout()
{
    if (geoLocationTimeout != null) {
        clearTimeout(geoLocationTimeout);
        geoLocationTimeout = null;
    }
}

function getCurrentLocation()
{
    var location = LocationService.getLocation();
    if (location == null) {
        setDefaultTimezone();
        return;
    }
    var latitude = location.latitude;
    var longitude = location.longitude;
    var api_url = getLocationUrl + '/' + latitude + '/' + longitude;

    $.ajax({
        url: api_url,
        type: "POST",
        dataType: "json",
        beforeSend: function() {
        },
        complete:function(){
        },
        success: function(data) {
            if (data == null || data.timeZoneId === undefined) {
                return;
            }
            var windowsZoneList = $.parseJSON($("#windows_time_zone").val());
            if (windowsZoneList[data.timeZoneId] !== undefined) {
                $("select[name='time_zone_id']").val(windowsZoneList[data.timeZoneId]);
                clearGeoLocationTimeout();
            }
        },
        error: function(data) {
            setDefaultTimezone();
        }
    }).done(function() {
    });
}