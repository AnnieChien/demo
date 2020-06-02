$(document).ready(function () {
    $("#button_pay").click(function () {
        if (!confirm("Are you sure you want pay USD" + $("#amount_to_pay").val() + " to artist " + $("#id").val() + "?"))
            return false;
        
        url = $("#button_pay").attr("url");
        url = url.substring(0, url.length - 1) + $("#id").val() + "/" + $("#amount_to_pay").val();
        window.location = url;
    });
});
