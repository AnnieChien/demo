var upload_image_url = $('#upload_image_url').val();
var valid_file_url = $('#valid_file_url').val();
var FEED_THUMBNAIL = 4;
var fileUploadThumbnail;
var isFilesChanged = false;
var buttonsClicked = false;

$(document).ready(function () {
    var image_url = $('#image_url').val();
    if (image_url != '') {
        if (image_url.indexOf('http') != 0) {
            image_url = $('#base_url').val() + image_url;
        }
        $("#image_thumb_image").attr('src', image_url);
        $("#image_thumb").show();
        $("#none_image").hide();
        $("#image_thumb_name").text($("#image_original_file_name").val());
        $("#remove_thumbnail").show();
    }

    $("#none_image, #image_thumb_image").click(function () {
        $("#image_file").click();
    });
    $("#layout_image").on("click", function (event) {
        if (event.target !== this) {
            return;
        }
        $("#image_file").click();
    });

    $("#image_upload_stop").click(function () {
        if (fileUploadThumbnail != null) {
            fileUploadThumbnail.abort();
        }
    });

    uploadThumbnail();
});

function uploadThumbnail() {
    var baseUrl = $('#base_url').val();
    var firstName;
    $('#image_file').fileupload({
        dataType: 'json',
        url: upload_image_url,
        type: "POST",
        add: function (e, data) {
            $('#layout_image_info_upload .bar').css(
                'width', '0%'
            );
            $('#image_upload_percent').text("0%");
            $("#image_upload_bar").show();
            $('#layout_image_info_upload').slideDown();
            firstName = $("#image_thumb_name").text();
            $('#image_thumb_name').text(data.files[0].name);
            validFile(data, FEED_THUMBNAIL, function (json) {
                if (json["error_code"] == 100) {
                    data.formData = {type: FEED_THUMBNAIL};
                    fileUploadThumbnail = data.submit();
                    return;
                }

                $('#image_thumb_name').text(firstName);
                $('#image_upload_bar').slideUp();
                alertUploadError(json["error_code"]);
            });
            isFilesChanged = true;
        },
        progressall: function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#layout_image_info_upload .bar').css(
                'width',
                progress + '%'
            );
            $('#image_upload_percent').text(progress + "%");
        },
        done: function (e, data) {
            $('#image_upload_percent').text('Completed!');
            $("#image_upload_bar").slideUp();

            var json = data.result;
            if (json["error_code"] == 100) {
                $('#image_thumb_image').attr('src', baseUrl + json["url"]);
                $('#image_url').attr('value', json["url"]);
                $('#image_thumb').show();
                $('#none_image').hide();
                $('#image_change').attr('value', 1);
                $('#image_original_file_name').attr('value', json['file_name']);
                $("#remove_thumbnail").show();
                return;
            }
            $("#layout_image_info_upload").hide();

            if ($('#image_url').val() == '') {
                $("#none_image").show();
            }
            alertUploadError(json["error_code"]);
        },
        fail: function (e, data) {
            $('#image_thumb_name').text(firstName);
            $('#image_upload_bar').slideUp();
        }
    });
}

function validFile(data, type, callback) {
    var name = data.files[0].name;
    var extension = data.files[0].name.split('.').pop();
    var size = data.files[0].size;

    $.ajax({
        url: valid_file_url,
        type: "POST",
        dataType: "json",
        data: {name: name, extension: extension, size: size, type: type},
        beforeSend: function () {
        },
        complete: function () {
        },
        success: function (data) {
            return callback(data);
        },
        error: function (data) {
        }
    }).done(function () {
    });
}

function removeThumbnail() {
    $('#image_thumb').hide();
    $('#none_image').show();
    $("#remove_thumbnail").hide();
    $("#image_thumb_name").text('');
    $('#image_url').val('');
    $('#image_thumb_image').attr('src', '');
}

function alertUploadError(error_code) {
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
