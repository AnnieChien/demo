var socket;
var host;
var token = $('#device-control-dialog').attr('token-data');
var shutdown = 0;
var reboot = 1;
var sleep = 2;
var volumeRatio = 0.1;
var brightRatio = 0.2;
var apiVersion = 2;
var ERR_OK = 0;
var STATE_CONNECTED = "connected";
var STATE_DISCONNECTED = "disconnected";

// console.log = function() {};

function sendData(socket,apiVersion,type,method,commandId,params, keepDeviceId){
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
    input.api_version=apiVersion;
    input.type=type;
    input.method=method;
    input.command_id=commandId;
    // ok, this is DIRTY
    if (!keepDeviceId) {
        console.log("SendData :: update device id to guid!");
        // ok, we update real device_id here
        if (params.device_id !== undefined) {
            var guid = DeviceMapper.getDeviceGuid(params.device_id);
            if (guid !== null) {
                params.device_id = guid;
            }
        }
    }
    input.params = params;
    console.log("SendData :: data to send", input);
    socket.send(JSON.stringify(input));
}

function sendCommand(method, params, keepDeviceId) {
    var commandId = 1; // just ... do it for now
    sendData(socket, apiVersion, 'command', method, commandId, params, keepDeviceId);
}

$(document).ready(function(){
    i18n.translator.add(device_controlTranslations);
    var state = 'stop';
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
        console.log("host = " + host);
        socket = createSocket(host);
        socket.onopen = function (message) {
            connect();
        };
        socket.onmessage = function (message) {
            var data = $.parseJSON(message.data);
            //console.log("params = " + JSON.stringify(data));
            var params = data.params;
            if (data.type === "reply") {
                console.log("This is a reply!");
                console.log("method = ", data.method);
                if (data.method === "controller.connect") {
                    console.log("Ok, handle reply!");
                    onConnectReply(data);
                }
                if (data.method === "manager.list_devices") {
                    onDeviceListResult(data);
                }
                if (data.method === "manager.get_device_info") {
                    onDeviceInfoResult(data);
                }
            }
            if (data.type === "notification") {
                if (data.method === "manager.notif.device_state_changed") {
                    onDeviceStateChanged(data);
                }
                if (data.method === "system.status_software_update_downloaded") {
                    var device_id = DeviceMapper.getDeviceId(params.device_id);
                    setSoftwareUpdateDownloaded(device_id);
                }
            }
            if (parseInt(data.params.err_code) === ERR_OK && data.type === "reply") {
                {
                    // THis is DIRTY
                    // the device_id here is the guid, while we need the device fake id (device name)
                    if (undefined !== params.device_id) {
                        var device_id = DeviceMapper.getDeviceId(params.device_id);
                        if (device_id !== null) {
                            params.device_id = device_id;
                        }
                    }
                }
                if (data.method === "cpl.display.get_brightness") {
                    var device_id = params.device_id;
                    var brightness = params.brightness;
                    setBrightness(device_id, brightness);
                }
                if (data.method === "cpl.sound.get_volume") {
                    var device_id = params.device_id;
                    var volume = params.volume;
                    setVolume(device_id, volume);
                }
                if (data.method === "cpl.system.get_time_zone") {
                    var device_id = params.device_id;
                    setTimezone(device_id, params.time_zone_id);
                }
                if (data.method === "cpl.system.get_reboot_time") {
                    var device_id = params.device_id;
                    var time = params.time;
                    setRebootTime(device_id, time);
                }
                if (data.method === "cpl.system.get_sleep_time") {
                    var device_id = params.device_id;
                    var time = params.time;
                    setSleepTime(device_id, time);
                }
                if (data.method === "cpl.system.get_wake_time") {
                    var device_id = params.device_id;
                    var time = params.time;
                    setWakeTime(device_id, time);
                }
                if (data.method === "cpl.network.info") {
                    var device_id = params.device_id;
                    var mac = params.mac;
                    setMacAddress(device_id, mac);
                }
            }
            socket.onclose = function (message) {

            };
        }
    } catch (ex) {
        console.log(ex);
    }

    function createSocket(host) {
        if (window.WebSocket)
            return new WebSocket(host);
        else if (window.MozWebSocket)
            return new MozWebSocket(host);
    }
    $('.btn-sleep').click(function(){
        $('.modal-title').text(i18n("SLEEP"));
        $('.modal-description').text(i18n("Are you sure you want to put FRAMED to sleep?"));
        $('.btn-shutdow-reboot-dialog').val(i18n("SLEEP"));
        var device_id = $(this).attr('device_id');
        $('#device-control-dialog').attr('device_id', device_id);
        $('#device-control-dialog').attr('controlType', sleep);
        $('#device-control-dialog').modal({show:true});
    });
    $('.btn-shutdown').click(function(){
        $('.modal-title').text(i18n("SHUTDOWN"));
        $('.modal-description').text(i18n("Are you sure you want to shutdown FRAMED?"));
        $('.btn-shutdow-reboot-dialog').val(i18n("SHUTDOWN"));
        var device_id = $(this).attr('device_id');
        $('#device-control-dialog').attr('device_id', device_id);
        $('#device-control-dialog').attr('controlType', shutdown);
        $('#device-control-dialog').modal({show:true});
    });
    $('.btn-reboot').click(function(){
        $('.modal-title').text(i18n("REBOOT"));
        $('.modal-description').text(i18n("Are you sure you want to reboot FRAMED?"));
        $('.btn-shutdow-reboot-dialog').val(i18n("REBOOT"));
        var device_id = $(this).attr('device_id');
        $('#device-control-dialog').attr('device_id', device_id);
        $('#device-control-dialog').attr('controlType', reboot);
        $('#device-control-dialog').modal({show:true});
    });
});

function setNotConnectedDevice(device_id) {
    $("div.device-info-head[device_id='" + device_id + "']").children().find('.device-status').text(i18n("Not Connected"));
    $("div.device-info-head[device_id='" + device_id + "']").children().find('.device-description').text(i18n("Framed is powered off, or isn't connected to the internet."));
    $("div.device-setting[device_id='" + device_id + "']").children().find('span').addClass('disabled');
    $("div.device-setting[device_id='" + device_id + "']").children().find("select").attr('disabled', 'disabled');
    $("div.device-setting[device_id='" + device_id + "']").children().find("input").attr('disabled', 'disabled');
    $("div.device-setting[device_id='" + device_id + "']").children().find("a").attr('disabled', 'disabled');
    $("div.shutdown-reboot[device_id='" + device_id + "']").children().find("input").attr('disabled', 'disabled');
    $("div.shutdown-reboot[device_id='" + device_id + "']").children().find(".device-title").addClass('disabled');
    resetSoftwareUpdateDownloaded(device_id);
}

function setConnectedDevice(device_id, version, scheduled_sleep_supported, sleep_command_supported) {
    $("div.device-info-head[device_id='" + device_id + "']").children().find('.device-status').text(i18n("Connected") + version);
    $("div.device-info-head[device_id='" + device_id + "']").children().find('.device-description').text("");
    $("div.device-setting[device_id='" + device_id + "']").children().find('span').removeClass('disabled');
    $("div.device-setting[device_id='" + device_id + "']").children().find("select").removeAttr('disabled');
    $("div.device-setting[device_id='" + device_id + "']").children().find("a").removeAttr('disabled');
    $("div.shutdown-reboot[device_id='" + device_id + "']").children().find("input").removeAttr('disabled');
    if (!sleep_command_supported) {
        $("div.shutdown-reboot[device_id='" + device_id + "']").children().find("[name='sleep']").attr('disabled', 'disabled');
    }
    if (!scheduled_sleep_supported) {
        $("div.device-setting[device_id='" + device_id + "']").children().find("[name='sleeptime']").attr('disabled', 'disabled');
        $("div.device-setting[device_id='" + device_id + "']").children().find("[name='waketime']").attr('disabled', 'disabled');
    } else if ($("div.device-setting[device_id='" + device_id + "']").children().find("[name='sleeptime']").val() < 0) {
        $("div.device-setting[device_id='" + device_id + "']").children().find("[name='waketime']").attr('disabled', 'disabled');
    }
    
    $("div.shutdown-reboot[device_id='" + device_id + "']").children().find(".device-title").removeClass('disabled');
}

function setBrightness(device_id, value) {
    var optionValue = Math.round(parseFloat(value) / brightRatio) - 1;
    $("select[name='brightness'][device_id='" + device_id + "']").val(optionValue);
}

function setVolume(device_id, value) {
    var optionValue = Math.round(parseFloat(value) / volumeRatio);
    $("select[name='volume'][device_id='" + device_id + "']").val(optionValue);
}

function setTimezone(device_id, value) {
    $("select[name='timezone'][device_id='" + device_id + "']").val(value);
}

function setRebootTime(device_id, value) {
    var optionValue = value / 60 / 60;
    $("select[name='reboottime'][device_id='" + device_id + "']").val(optionValue);
}

function setSleepTime(device_id, value) {
    var optionValue;
    if (value >= 0) {
        optionValue = (value / 60 / 60).toFixed(2);
        // temp fix for enableing waketime dropdown
        $("div.device-setting[device_id='" + device_id + "']").children().find("select").removeAttr('disabled');
    } else
        optionValue = value;
    $("select[name='sleeptime'][device_id='" + device_id + "']").val(optionValue);
}

function setWakeTime(device_id, value) {
    var optionValue;
    if (value >= 0)
        optionValue = (value / 60 / 60).toFixed(2);
    else
        optionValue = value;
    $("select[name='waketime'][device_id='" + device_id + "']").val(optionValue);
}

function setMacAddress(device_id, value) {
    $("input[name='mac'][device_id='" + device_id + "']").val(value);
}

function setSoftwareUpdateDownloaded(device_id) {
    var value = $("input[name='reboot'][device_id='" + device_id + "']").val();
    if (typeof value !== "undefined") {
        if (value.indexOf("(update available)") < 0)
            value += " (update available)";
        $("input[name='reboot'][device_id='" + device_id + "']").val(value);
    }
}

function resetSoftwareUpdateDownloaded(device_id) {
    var value = $("input[name='reboot'][device_id='" + device_id + "']").val();
    if (typeof value !== "undefined") {
        var idx = value.indexOf(" (update available)");
        if (idx > 0)
            value = value.substring(0, idx);
        $("input[name='reboot'][device_id='" + device_id + "']").val(value);
    }
}

function getBrightness(device_id) {
    var params = new Object();
    params.device_id = device_id;
    sendData(socket, '2', 'command', 'cpl.display.get_brightness', 1, params);
}

function getVolume(device_id) {
    var params = new Object();
    params.device_id = device_id;
    sendData(socket, '2', 'command', 'cpl.sound.get_volume', 1, params);
}

function getTimezone(device_id) {
    var params = new Object();
    params.device_id = device_id;
    sendData(socket, '2', 'command', 'cpl.system.get_time_zone', 1, params);
}

function getRebootTime(device_id) {
    var params = new Object();
    params.device_id = device_id;
    sendData(socket, '2', 'command', 'cpl.system.get_reboot_time', 1, params);
}

function getSleepTime(device_id) {
    var params = new Object();
    params.device_id = device_id;
    sendData(socket, '2', 'command', 'cpl.system.get_sleep_time', 1, params);
}

function getWakeTime(device_id) {
    var params = new Object();
    params.device_id = device_id;
    sendData(socket, '2', 'command', 'cpl.system.get_wake_time', 1, params);
}

function getMacAddress(device_id) {
    var params = new Object();
    params.device_id = device_id;
    sendData(socket, '2', 'command', 'cpl.network.info', 1, params);
}

function checkSoftwareUpdateStatus(device_id) {
    var params = new Object();
    params.device_id = device_id;
    sendData(socket, '2', 'command', 'cpl.system.check_software_update_status', 1, params);
}

function onBrightnessChange(select) {
    var device_id = $(select).attr('device_id');
    var params = new Object();
    params.device_id = device_id;
    params.brightness = brightRatio * (parseInt(select.value) + 1);
    sendData(socket,'2','command','cpl.display.set_brightness','1',params);
}

function onVolumeChange(select) {
    var device_id = $(select).attr('device_id');
    var params = new Object();
    params.device_id = device_id;
    params.volume = volumeRatio * parseInt(select.value);
    sendData(socket,'2','command','cpl.sound.set_volume','1',params);
}

function onTimezoneChange(select) {
    var device_id = $(select).attr('device_id');
    var params = new Object();
    params.device_id = device_id;
    params.time_zone_id = select.value;
    sendData(socket,'2','command','cpl.system.set_time_zone','1',params);
}

function onRebootTimeChange(select) {
    var device_id = $(select).attr('device_id');
    var params = new Object();
    params.device_id = device_id;
    params.time = 60 * 60 * select.value;
    sendData(socket,'2','command','cpl.system.set_reboot_time','1',params);
}

function onSleepTimeChange(select) {
    var device_id = $(select).attr('device_id');
    var params = new Object();
    params.device_id = device_id;
    if (select.value >= 0)
        params.time = 60 * 60 * select.value;
    else
        params.time = select.value;
    var wake_time_select =  $("div.device-setting[device_id='" + device_id + "']").children().find("[name='waketime']");
    if (select.value >= 0)
        wake_time_select.removeAttr('disabled');
    else
        wake_time_select.attr('disabled', 'disabled');
    sendData(socket,'2','command','cpl.system.set_sleep_time','1',params);
    if (select.value < 0 && wake_time_select.val() >= 0) {
        wake_time_select.val(-1);
        params.time = -1;
        sendData(socket,'2','command','cpl.system.set_wake_time','1',params);
    }
}

function onWakeTimeChange(select) {
    var device_id = $(select).attr('device_id');
    var params = new Object();
    params.device_id = device_id;
    if (select.value >= 0)
        params.time = 60 * 60 * select.value;
    else
        params.time = select.value;
    sendData(socket,'2','command','cpl.system.set_wake_time','1',params);
}

function shutdownReboot() {
    $('#device-control-dialog').modal('hide');
    var controlType = $('#device-control-dialog').attr('controlType');
    var device_id = $('#device-control-dialog').attr('device_id');
    var params = new Object();
    params.device_id = device_id;

    if (controlType == shutdown) {
        sendData(socket,'2','command','system.shutdown','1',params);
    } else if (controlType == reboot) {
        sendData(socket,'2','command','system.reboot','1',params);
    } else if (controlType == sleep) {
        sendData(socket,'2','command','system.sleep','1',params);
    }
}

function cancelDialog() {
    $('#device-control-dialog').modal('hide');
}

function getDeviceList() {
    var params = new Object();
    params.token = token;
    sendData(socket,'2','command','manager.list_devices','1',params);
}

function connect() {
    var params = {
        token: token
    };
    sendCommand('controller.connect', params);
}

function onConnectReply(reply) {
    if (parseInt(reply.params.err_code) === ERR_OK) {
        getDeviceList();
    } else {
        console.log("Unabled to connect to the websocket server!");
        console.log(reply.params);
    }
}

function onDeviceListResult(reply) {
    if (parseInt(reply.params.err_code) === ERR_OK) {
        var list_devices = reply.params.list_devices;
        if (list_devices.length > 0) {
            for (var i = 0; i < list_devices.length; i++) {
                var device = list_devices[i];
                getDeviceInfo(device.device_id);
            }
        }
    }
}

function getDeviceInfo(guid) {
    var params = {
        token: token,
        device_id: guid
    };
    console.log(params);
    sendCommand('manager.get_device_info', params, true);
}

function onDeviceInfoResult(reply) {
    console.log("Ok, got device info result");
    console.log(reply.params);
    if (parseInt(reply.params.err_code) === ERR_OK) {
        console.log("Result is ok!");
        var device_info = reply.params.device_info[0];
        console.log(device_info);
        DeviceMapper.processDeviceInfo(device_info);
        updateDeviceState(device_info.device_id, device_info.state);
    } else {
        console.log("Unable to get device info");
        console.log(reply.params);
    }
}

function onDeviceStateChanged(notification) {
    console.log("Device state is changed", notification);
    var guid = notification.params.device_id;
    var state = notification.params.state;
    console.log(guid, state);
    if (state === STATE_CONNECTED) {
        // state connected could be a new device OR same device but connected with difference name
        // => it'd better to requery device info
        getDeviceInfo(guid);
    } else {
        updateDeviceState(guid, state);
    }
}

function updateDeviceState(guid, state) {
    console.log("let's update device state for ", guid, state);
    var device_id = DeviceMapper.getDeviceId(guid);
    console.log("device id is ", device_id);
    if (device_id === null) {
        return;
    }

    if (state === STATE_CONNECTED) {
        var version = DeviceMapper.getDeviceVersion(guid);
        var scheduled_sleep_supported = false;
        var sleep_command_supported = false;
        if (version != null && version != "") {
            if (versionCompare(version, "2.1.7") >= 0)
                scheduled_sleep_supported = true;
            if (versionCompare(version, "2.1.8") >= 0)
                sleep_command_supported = true;
            version = " (v" + version + ")";
        }
        setConnectedDevice(device_id, version, scheduled_sleep_supported, sleep_command_supported);
        getBrightness(device_id);
        getVolume(device_id);
        getTimezone(device_id);
        getRebootTime(device_id);
        getSleepTime(device_id);
        getWakeTime(device_id);
        getMacAddress(device_id);
        checkSoftwareUpdateStatus(device_id);
    } else {
        setNotConnectedDevice(device_id);
    }
}

function versionCompare(version1, version2) {
    rc = 0;
    try {
        var version_array1 = version1.split(".");
        var version_array2 = version2.split(".");
        for (var i = 0; i < version_array1.length; i++) {
            var v1 = parseInt(version_array1[i]) || 0;
            var v2 = 0;
            if (version_array2.length > i)
                v2 = parseInt(version_array2[i]) || 0;
            if (v1 < v2) {
                rc = -1;
                break;
            }
            else if (v1 > v2) {
                rc = 1;
                break;
            }
        }
        
        if (rc == 0 && version_array2.length > version_array1.length)
            rc = -1;
    } catch (ex) {
        console.log(ex);
    }
    
    return rc;
}

var DeviceMapper = {
    _guid2Name: {},
    _name2Guid: {},
    _guid2Version: {},

    processDeviceInfo: function(info) {
        console.log(info);
        DeviceMapper._guid2Name[info.device_id] = info.name;
        DeviceMapper._name2Guid[info.name] = info.device_id;
        DeviceMapper._guid2Version[info.device_id] = info.version;
    },

    // for now we use name as deviceId. In the future, we use token as deviceId
    // so, deviceId here is not the device_id field of the message, which is guid
    getDeviceGuid: function(deviceId) {
        if (undefined !== DeviceMapper._name2Guid[deviceId]) {
            return DeviceMapper._name2Guid[deviceId];
        }

        return null;
    },

    getDeviceId: function(guid) {
        if (undefined !== DeviceMapper._guid2Name[guid]) {
            return DeviceMapper._guid2Name[guid];
        }

        return null;
    },

    getDeviceVersion: function(guid) {
        if (undefined !== DeviceMapper._guid2Version[guid]) {
            return DeviceMapper._guid2Version[guid];
        }

        return null;
    }
};

function checkInUsed(settingId, callback) {
    url = checkInUsedUrl + "/" + settingId;
    $.ajax({
        url: url,
        dataType: "json",
        success: function(data) {
            callback(data);
        },
        error: function(data) {
            console.log(data);
        }
    });
}

function doDelete(settingId) {
    checkInUsed(settingId, function(data) {
        if (data.err_code == ERR_OK) {
            var ok = false;
            if (data.inused) {
                ok = confirm(i18n("There is a device linked to this setting. Deleting it will refrain the device from connecting.") + "\n\n" + 
                    i18n("Are you sure you want to delete this setting?"));
            } else {
                ok = confirm(i18n("Are you sure you want to delete this setting?"));
            }
            if (ok) {
                window.location.href = deleteDeviceUrl + "/" + settingId;
            }
        } else {
            notifyError(i18n("Unable to delete device!") + " " + JSON.stringify(data));
        }
    });
}

function notifyError(msg) {
    alert(msg);
}

function refreshDeviceScheduleSet() {
    var params = {
        token: token
    };
    sendCommand('manager.refresh_device_schedule_set', params);
}
