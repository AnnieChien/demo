function sendData(socket, apiVersion, type, method, commandId, params) {
    var input = new Object();
    input.api_version = apiVersion;
    input.type = type;
    input.method = method;
    input.command_id = commandId;
    input.params = params;
    socket.send(JSON.stringify(input));
}
$(function(){
    var token = $('.body-content').attr('token');
    var host = $('.body-content').attr('host');
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
    if (window.WebSocket) {
        socket = new WebSocket(host);
    }
    else if (window.MozWebSocket) {
        socket = new MozWebSocket(host);
    }
    socket.onopen = function (message) {
        var params = new Object();
        params.token = token;
        sendData(socket, '2', 'notification', 'manage.device_invalidate', '-1', params);
    };
    socket.onmessage = function (message) {

    };
    socket.onclose = function (message) {

    };
});