var upload_image_url = $('#upload_image_url').val();
var upload_artwork_url = $('#upload_artwork_url').val();
var upload_video_url = $('#upload_video_url').val();
var valid_file_url = $('#valid_file_url').val();
var preview_images_max_quantity = $('#preview_images_max_quantity').val();
var THUMBNAIL_FILE = 5;
var ARTWORK_FILE = 2;
var PREVIEW_IMAGES_FILE = 1;
var VIDEO_FILE = 6;
var fileUploadThumbnail;
var fileUploadArtwork;
var fileUploadPreviewImages;
var fileUploadVideo;
var previewImagesList = [];
var isFilesChanged = false;
var buttonsClicked = false;

$(document).ready(function () {
    i18n.translator.add(submit_artworkTranslations);
    $("#artwork_type_id").data('pre-val', $("#artwork_type_id").val());
    $("#artwork_category_id").data('pre-val', $("#artwork_category_id").val());
    if ($('#status').length)
        $("#status").data('pre-val', $('#status').is(":checked"));
    if ($('#listed_in_gallery').length)
        $("#listed_in_gallery").data('pre-val', $('#listed_in_gallery').is(":checked"));
    if ($('#isprivate').length)
        $("#isprivate").data('pre-val', $('#isprivate').is(":checked"));
    if ($('#display_rotate').length)
        $("#display_rotate").data('pre-val', $('#display_rotate').is(":checked"));
    if ($('#hardware_acceleration').length)
        $("#hardware_acceleration").data('pre-val', $('#hardware_acceleration').is(":checked"));
    var isSubmitForm = $("#is_submit_form").val();
    if (undefined == isSubmitForm) {
        return;
    }

    $('#advanced_properties_field').hide();
    $("#advanced_properties_button").click(function () {
        event.preventDefault();
        if($('#display_rotate').is(':visible')) {
            $('#advanced_icon').removeClass("fa fa-caret-down").addClass("fa fa-caret-right");
            $('#advanced_properties_field').hide();
        } else {
            $('#advanced_icon').removeClass("fa fa-caret-right").addClass("fa fa-caret-down");
            $('#advanced_properties_field').show();
        }
    });

    $("#button_save_draft").click(function () {
        if (!isValidForm()) {
            return false;
        }
        
        var error = 0;
        if (!($('#agreement').is(':checked'))) {
            error = 1
            alert(i18n("Please tick the License Agreement to submit an artwork."));
        }
        if (error) {
            return false;
        }
        
        $("#button_save_draft").attr("disabled", true);
        $("#submit_type").attr('value', 0);
        buttonsClicked = true;
        $("#frm_submit_artwork").submit();
    });
    $("#button_publish").click(function () {
        if (!isValidForm()) {
            return false;
        }
        
        var error = 0;
        if (!($('#agreement').is(':checked'))) {
            error = 1
            alert(i18n("Please tick the License Agreement to submit an artwork."));
        }
        if (error) {
            return false;
        }
        
        if (!confirm(i18n("Are you sure you want to publish? Artwork will be listed publicly and accessible to everyone.\n\n" +
            "By clicking 'OK' below, I accept the Terms and Conditions and acknowledge that my information will be used in accordance with the FRM Privacy Policy.")))
            return false;
        
        $("#button_publish").attr("disabled", true);
        $("#submit_type").attr('value', 1);
        buttonsClicked = true;
        $("#frm_submit_artwork").submit();
    });
    $("#button_view_artwork").click(function () {
        $("#submit_type").attr('value', 2);
        buttonsClicked = true;
        $("#frm_submit_artwork").submit();
    });
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
    if ($("#artwork_url").val() != '' || $("#artwork_file").val() != '') {
        $("#artwork_thumb_name").text($("#artwork_original_file_name").val());
        $("#artwork_thumb_name_container").show();
        $("#artwork_browser_file").hide();
    }
    $("#video_thumb_name").text($("#video_original_file_name").val());
    if ($("#video_original_file_name").val() != '') {
        $("#remove_video").show();
    }

    var artworkChanged = $("#artwork_change").attr('value');
    if (artworkChanged == 1) {
        $("#version_number").attr("readonly", false);
    }

    var preview_images_list_hidden = $("#preview_images_list_hidden").val();
    if (typeof preview_images_list_hidden !== 'undefined' && preview_images_list_hidden !== '') {
        preview_images_list_hidden = preview_images_list_hidden.split(';');
        for (var i = 0; i < preview_images_list_hidden.length; i++) {
            var imageItem = preview_images_list_hidden[i].split(',')[0];
            if (imageItem.indexOf("http") != 0) {
                imageItem = $('#base_url').val() + imageItem;
            }
            createPreviewImageItem(Date.now(), imageItem, preview_images_list_hidden[i]);
        }
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

    $("#artwork_browser_file").click(function (event) {
        event.preventDefault();
        $("#artwork_file_input").click();
    });
    $("#preview_images_browser_button").click(function (event) {
        event.preventDefault();
        $("#preview_images_file_input").click();
    });
    //$("#video_file_browser_button").click(function (event) {
    //    event.preventDefault();
    //    $("#video_file_input").click();
    //});


    $("#image_upload_stop").click(function () {
        if (fileUploadThumbnail != null) {
            fileUploadThumbnail.abort();
        }
    });
    $("#artwork_upload_stop").click(function () {
        if (fileUploadArtwork != null) {
            fileUploadArtwork.abort();
        }
    });
    $("#preview_images_upload_stop").click(function () {
        if (fileUploadPreviewImages != null) {
            fileUploadPreviewImages.abort();
        }
    });
    $("#video_upload_stop").click(function () {
        if (fileUploadVideo != null) {
            fileUploadVideo.abort();
        }
    });

    $("#upload-instructions-help-link").click(function() {
        var win = window.open("https://github.com/filip/FRAMED-2.0-Guide#-artwork-submission", '_blank');
        win.focus();
        event.preventDefault();
    });

    $("#type-of-artwork-help-link").click(function() {
        var win = window.open("https://github.com/filip/FRAMED-2.0-Guide#-artwork-submission", '_blank');
        win.focus();
        event.preventDefault();
    });

    $("#artwork-preview-video-help-link").click(function() {
        var win = window.open("https://www.youtube.com/user/FRAMEDofficial/videos", '_blank');
        win.focus();
        event.preventDefault();
    });

    $("#upload-license-agreement-link").click(function() {
        var win = window.open("/framed_upload_license.html", '_blank');
        win.focus();
        event.preventDefault();
    });

    $(window).bind('beforeunload', function(){
        isTextChanged = false;
        if ($("#name").attr("value") != $("#name").val() ||
            $("#price").attr("value") != $("#price").val() ||
            $("#number_of_editions").attr("value") != $("#number_of_editions").val() ||
            $("#metadata").text() != $("#metadata").val() ||
            $("#artist_name").attr("value") != $("#artist_name").val() ||
            $("#video_link").attr("value") != $("#video_link").val() ||
            $("#artwork_type_id").val() != $("#artwork_type_id").data("pre-val") ||
            $("#keywords").attr("value") != $("#keywords").val() ||
            ($("#delay_for_visibility").length && $("#delay_for_visibility").attr("value") != $("#delay_for_visibility").val()) ||
            ($("#timeout_for_launching").length && $("#timeout_for_launching").attr("value") != $("#timeout_for_launching").val()) ||
            ($('#status').length && $('#status').is(":checked") != $("#status").data("pre-val")) ||
            ($('#listed_in_gallery').length && $('#listed_in_gallery').is(":checked") != $("#listed_in_gallery").data("pre-val")) ||
            ($('#isprivate').length && $('#isprivate').is(":checked") != $("#isprivate").data("pre-val")) ||
            ($('#display_rotate').length && $('#display_rotate').is(":checked") != $("#display_rotate").data("pre-val")) ||
            ($('#hardware_acceleration').length && $('#hardware_acceleration').is(":checked") != $("#hardware_acceleration").data("pre-val")) ||
            $("#artwork_category_id").val() != $("#artwork_category_id").data("pre-val")) {
            isTextChanged = true;
        }
        if ((isTextChanged || isFilesChanged) && !buttonsClicked) {
            return 'You will lost all changes';
        } else {
            buttonsClicked = false;
            isFilesChanged = false;
            //return true;
        }
    });

    // Initial video file upload = false
    //$('#video_file_browser_button').prop('disabled',true);
    
    validateForm();
    uploadThumbnail();
    uploadArtwork();
    uploadPreviewImages();
    //uploadVideo();
    disableUploadPreviewImagesButton();
    //externalVideoLinkCheck();
});

/*
function externalVideoLinkCheck() {
	$('#video_link_check').click(function () {
		if(this.checked) {
			$('#video_link').val('');
			$('#video_link').prop('readonly',true);
			$('#video_file_browser_button').prop('disabled',false);
		} else {
			removeVideo()
			$('#video_file_browser_button').prop('disabled',true);
			$('#video_link').prop('readonly',false);
		}
	});
}
*/

function validateForm() {

    $.validator.addMethod("regex", function (value, element, regexpr) {
        return regexpr.test(value);
    }, "Invalid regex");

    $("#frm_submit_artwork").validate({
        rules: {
            name: {
                required: true,
                maxlength: 200
            },
            keywords: {
                maxlength: 400
            },
            artist_name: {
                required: true,
                maxlength: 255
            },
            price: {
                required: true,
                number: true
            },
            metadata: {
                required: true
            },
            video_link: {
                required: true,
                maxlength: 255
            },
            artwork_category_id: {
                required: true
            },
            number_of_editions: {
                maxlength: 11,
                number: true
            },
            release_date: {
                date: true
            },
            version_number: {
                regex: /^[0-9]{1,10}.[0-9]{0,10}.[0-9]{0,10}$/
            },
            delay_for_visibility: {
                required: true,
                number: true
            },
            timeout_for_launching: {
                required: true,
                number: true
            }
        },
        messages: {
            name: {
                required: i18n("Artwork title is required"),
                maxlength: i18n("Maximum length of the artwork title is 200 characters")
            },
            keywords: {
                maxlength: i18n("Maximum length of the keywords is 400 characters")
            },
            artist_name: {
                required: i18n("Artist name is required"),
                maxlength: i18n("Maximum length of the artist name is 255 characters")
            },
            price: {
                required: i18n("Price is required"),
                number: i18n("Invalid price")
            },
            metadata: {
                required: i18n("Artwork description is required")
            },
            video_link: {
                required: i18n("Video URL is required"),
                maxlength: i18n("Enter a valid video URL")
            },
            artwork_category_id: {
                required: i18n("Artwork category is required")
            },
            number_of_editions: {
                maxlength: i18n("Invalid number of editions"),
                number: i18n("Invalid number of editions")
            },
            release_date: {
                date: i18n("Invalid release date")
            },
            version_number: {
                regex: i18n("Invalid version number")
            },
            delay_for_visibility: {
                required: "Delay for Visibility is required",
                number: "Invalid number"
            },
            timeout_for_launching: {
                required: "Timeout for Launching is required",
                number: "Invalid number"
            }
        },
        invalidHandler: function() {
            $("#button_save_draft").attr("disabled", false);
            $("#button_publish").attr("disabled", false);
        }
    });
}

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
            validFile(data, THUMBNAIL_FILE, function (json) {
                if (json["error_code"] == 100) {
                    data.formData = {type: THUMBNAIL_FILE};
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

function uploadArtwork() {
    var firstName;
    $('#artwork_file_input').fileupload({
        dataType: 'json',
        url: upload_artwork_url,
        add: function (e, data) {
            $('#artwork_browser_file').hide();
            $('#layout_artwork_info_upload .bar').css(
                'width', '0%'
            );
            $("#artwork_upload_percent").text("0%");
            $("#artwork_upload_bar").show();
            $('#layout_artwork_info_upload').slideDown();
            firstName = $("#artwork_thumb_name").text();
            $("#artwork_thumb_name").text(data.files[0].name);
            validFile(data, ARTWORK_FILE, function (json) {
                if (json["error_code"] == 100) {
                    fileUploadArtwork = data.submit();
                    return;
                }
                $("#artwork_thumb_name").text(firstName);
                $("#artwork_upload_bar").slideUp();
                alertUploadError(json["error_code"]);
                $('#artwork_browser_file').show();
            });
            isFilesChanged = true;
        },
        progressall: function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#layout_artwork_info_upload .bar').css(
                'width',
                progress + '%'
            );
            $("#artwork_upload_percent").text(progress + "%");

        },
        done: function (e, data) {
            $("#artwork_upload_percent").text('Completed!');
            $("#artwork_upload_bar").slideUp();

            var json = data.result;
            if (json["error_code"] == 100) {
                $("#artwork_url").attr('value', json["url"]);
                $("#artwork_change").attr('value', 1);
                $("#version_number").attr("readonly", false);
                $("#artwork_original_file_name").attr('value', json['file_name']);
                $("#artwork_thumb_name_container").show();
                return;
            }
            $("#layout_artwork_info_upload").hide();
            alertUploadError(json["error_code"]);
            $('#artwork_browser_file').show();
        },
        fail: function (e, data) {
            $("#artwork_thumb_name").text(firstName);
            $("#artwork_upload_bar").slideUp();
            $('#artwork_browser_file').show();
        }
    });
}

function uploadPreviewImages() {
    var baseUrl = $('#base_url').val();
    $('#preview_images_file_input').fileupload({
        dataType: 'json',
        url: upload_image_url,
        add: function (e, data) {
            $('#layout_preview_images_info_upload .bar').css(
                'width', '0%'
            );
            $('#preview_images_upload_percent').text("0%");
            $('#preview_images_upload_bar').show();
            $('#layout_preview_images_info_upload').slideDown();
            validFile(data, PREVIEW_IMAGES_FILE, function (json) {
                if (json["error_code"] == 100) {
                    data.formData = {type: PREVIEW_IMAGES_FILE};
                    fileUploadPreviewImages = data.submit();
                    return;
                }
                $('#preview_images_upload_bar').slideUp();
                alertUploadError(json["error_code"]);
            });
            isFilesChanged = true;
        },
        progressall: function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#layout_preview_images_info_upload .bar').css(
                'width',
                progress + '%'
            );
            $('#preview_images_upload_percent').text(progress + "%");
        },
        done: function (e, data) {
            $('#image_upload_percent').text('Completed!');
            $('#preview_images_upload_bar').slideUp();

            var json = data.result;
            if (json["error_code"] == 100) {
                createPreviewImageItem(json["image_id"], baseUrl + json["url"], json["url"]);
                disableUploadPreviewImagesButton();
                return;
            }
            $('#layout_preview_images_info_upload').hide();
            alertUploadError(json["error_code"]);
        },
        fail: function (e, data) {
            $("#preview_images_upload_bar").slideUp();
        }
    });
}

//function uploadVideo() {
//    var firstName;
//    $('#video_file_input').fileupload({
//        dataType: 'json',
//        url: upload_video_url,
//        add: function (e, data) {
//            $('#layout_video_info_upload .bar').css(
//                'width', '0%'
//            );
//            $("#video_upload_percent").text("0%");
//            $("#video_upload_bar").show();
//            $('#layout_video_info_upload').slideDown();
//            firstName = $("#video_thumb_name").text();
//            $("#video_thumb_name").text(data.files[0].name);
//            validFile(data, VIDEO_FILE, function (json) {
//                if (json["error_code"] == 100) {
//                    fileUploadVideo = data.submit();
//                    return;
//                }
//
//                $("#video_thumb_name").text(firstName);
//                $("#video_upload_bar").slideUp();
//                alertUploadError(json["error_code"]);
//            });
//
//        },
//        progressall: function (e, data) {
//            var progress = parseInt(data.loaded / data.total * 100, 10);
//            $('#layout_video_info_upload .bar').css(
//                'width',
//                progress + '%'
//            );
//            $("#video_upload_percent").text(progress + "%");
//
//        },
//        done: function (e, data) {
//            $("#video_upload_percent").text('Completed!');
//            $("#video_upload_bar").slideUp();
//
//            var json = data.result;
//            if (json["error_code"] == 100) {
//                $("#video_url").attr('value', json["url"]);
//                $("#video_change").attr('value', 1);
//                $("#video_original_file_name").attr('value', json['file_name']);
//                $("#remove_video").show();
//                return;
//            }
//            $("#layout_video_info_upload").hide();
//            alertUploadError(json["error_code"]);
//        },
//        fail: function (e, data) {
//            $("#video_thumb_name").text(firstName);
//            $("#video_upload_bar").slideUp();
//        }
//    });
//}

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

function removeArtwork() {
    $("#artwork_thumb_name_container").hide();
    $("#artwork_browser_file").show();
    $("#artwork_thumb_name").text('');
    $('#artwork_url').val('');
}

function removePreviewImage(obj) {
    var id = obj.getAttribute("id");
    $('#' + id).remove();
    if (previewImagesList != null) {
        var url = obj.getAttribute("url");
        var indexOf = previewImagesList.indexOf(url);
        if (indexOf != -1) {
            previewImagesList.splice(indexOf, 1);
        }
    }
    isFilesChanged = true;
    disableUploadPreviewImagesButton();
}

function removeVideo() {
    $("#remove_video").hide();
    $("#video_thumb_name").text('');
    $('#video_url').val('');
    $("#video_change").attr('value', 1);
}

function disableUploadPreviewImagesButton() {
    if (previewImagesList.length >= preview_images_max_quantity) {
        $('#preview_images_browser_button').attr('disabled', 'disabled');
    } else {
        $('#preview_images_browser_button').prop("disabled", false);
    }
    $("#preview_images_list_hidden").val(previewImagesList.join(';'));
}

function createPreviewImageItem(id, imageUrl, imagePath) {
    var imageItemTemp = $("#preview_image_item_temp").html().format(id, imageUrl, imagePath);
    $('#preview_images_list').append(imageItemTemp);
    previewImagesList.push(imagePath);
}

function isValidForm() {
    if ($('#image_url').val() == '') {
        alert(i18n('Please upload an artwork thumbnail.'));
        return false;
    }
    if ($('#artwork_url').val() == '') {
        alert(i18n('Please upload an artwork file.'));
        return false;
    }
    //if (previewImagesList.length == 0) {
    //    alert('Please upload least 1 preview image');
    //    return false;
    //}
    return true;
}

function alertUploadError(error_code) {
    if (error_code == 101) {
        alert(i18n("File not found"));
        return;
    }
    if (error_code == 102) {
        alert(i18n("File type not valid"));
        return;
    }
    if (error_code == 103) {
        alert(i18n("File size not valid"));
        return;
    }
    if (error_code == 104) {
        alert("Upload type not valid");
        return;
    }
}

String.prototype.format = function () {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{' + i + '\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};