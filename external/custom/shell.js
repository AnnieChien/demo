/**
 * Created by raycad on 5/22/2015.
 */

var valid_file_url = $('#valid_file_url').val();
var upload_shell_url = $('#upload_shell_url').val();
var SHELL_FILE = 7;
var fileUploadShell;

$(document).ready(function(){
    $("#shell_browser_file").click(function(event){
        event.preventDefault();
        $("#shell_file_input").click();
    });

    if ($("#shell_url").val() != '' || $("#shell_file").val() != '') {
        $("#shell_thumb_name").text($("#shell_original_file_name").val());
        $("#remove_shell").show();
    }

    $("#shell_upload_stop").click(function(){
        if (fileUploadShell != null) {
            fileUploadShell.abort();
        }
    });

    uploadShell();
});

function uploadShell()
{
    var firstName;
    $('#shell_file_input').fileupload({
        dataType: 'json',
        url: upload_shell_url,
        add: function (e, data) {
            $('#layout_shell_info_upload .bar').css(
                'width', '0%'
            );
            $("#shell_upload_percent").text("0%");
            $("#shell_upload_bar").show();
            $('#layout_shell_info_upload').slideDown();
            firstName = $("#shell_thumb_name").text();
            $("#shell_thumb_name").text(data.files[0].name);
            validFile(data, SHELL_FILE, function(json){
                if (json["error_code"] == 100) {
                    fileUploadShell = data.submit();
                    return;
                }
                $("#shell_thumb_name").text(firstName);
                $("#shell_upload_bar").slideUp();
                alertUploadError(json["error_code"]);
            });

        },
        progressall: function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#layout_shell_info_upload .bar').css(
                'width',
                progress + '%'
            );
            $("#shell_upload_percent").text(progress + "%");

        },
        done: function (e, data) {
            $("#shell_upload_percent").text('Completed!');
            $("#shell_upload_bar").slideUp();

            var json = data.result;
            if (json["error_code"] == 100) {
                $("#shell_url").attr('value', json["url"]);
                $("#shell_sha1").attr('value', json["sha1"]);
                $("#shell_change").attr('value', 1);
                $("#shell_original_file_name").attr('value', json['file_name']);
                $("#remove_shell").show();
                return;
            }
            $("#layout_shell_info_upload").hide();
            alertUploadError(json["error_code"]);
        },
        fail: function (e, data) {
            $("#shell_thumb_name").text(firstName);
            $("#shell_upload_bar").slideUp();
        }
    });
}


function validFile(data, type, callback)
{
    var name = data.files[0].name;
    var extension = data.files[0].name.split('.').pop();
    var size = data.files[0].size;

    $.ajax({
        url: valid_file_url,
        type: "POST",
        dataType: "json",
        data: {name: name, extension: extension, size: size, type: type},
        beforeSend: function() {
        },
        complete:function(){
        },
        success: function(data) {
            return callback(data);
        },
        error: function(data) {
        }
    }).done(function() {
    });
}

function removeShell()
{
    $("#remove_shell").hide();
    $("#shell_thumb_name").text('');
    $('#shell_url').val('');
    $('#shell_file').val('');
    $('#shell_original_file_name').val('');
    $('#shell_sha1').val('');
}

function alertUploadError(error_code)
{
    if (error_code == 101) {
        alert("Not found file upload");
        return;
    }
    if (error_code == 102) {
        alert("File type not valid");
        return;
    }
    if (error_code == 103) {
        alert("File size not valid");
        return;
    }
    if (error_code == 104) {
        alert("Upload type not valid");
        return;
    }
}