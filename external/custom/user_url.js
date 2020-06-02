var REMOVE_OK = 1;
var ADD_URL_FAILED = 0;
var ADD_URL_OK = 1;
var ADD_URL_EXISTING = 2;

var URL_NOT_EXISTING = 0;
var UPDATE_URL_STATE_OK = 1;
var UPDATE_URL_STATE_FAIL = 2;

var addingURLs = [];

$(document).ready(function(){
    i18n.translator.add(user_urlTranslations);
    $("#saving-new-url-progress").hide();
    if (isMobile()) {
        //$(".add-url-from-other-button").show();
        $(".remove-url-button").show();
        //$(".add-url-from-other-icon").attr('src', addFeedIconLarge);
    }
});

function fillURL(url) {
    var _url = url;
    if (_url.indexOf("http") != 0) {
        _url = "http://" + url;
    }
    return _url;
}

function strip_text_FRD(data, size, elipse){
    var res = data;
    if (data.length > size) {
        res = data.substr(0, size);
        if (elipse) {
            res = res + "...";
        }
    }
    return res;
}

//function addUrl(url, artistName, tags)
//{
//    var api_url = addNewURLUrl;
//    $.ajax({
//        url: api_url,
//        type: "POST",
//        dataType: "text",
//        data: {"url": url, "artist_name": artistName, "tags": tags},
//        beforeSend: function() {
//        },
//        complete:function(){
//        },
//        success: function(data) {
//            console.log("data=" + data.toString());
//            var idx = -1;
//            for (var i = 0; i < addingURLs.length; i++) {
//                if (addingURLs[i] === jQuery.parseJSON(data).url) {
//                    idx = i;
//                }
//            }
//            if (idx >= 0) {
//                //don't remove this url in the array because we're using the index for view id
//                addingURLs[i] = "";
//            }
//            if (jQuery.parseJSON(data).result_code == ADD_URL_EXISTING) {
//                $("div").remove(".url" + "new_url_place_holder" + idx);
//                showURLExistingAlert();
//            } else if (jQuery.parseJSON(data).result_code == ADD_URL_FAILED) {
//                $("div").remove(".url" + "new_url_place_holder" + idx);
//                alert("Save failed!");
//            } else if (jQuery.parseJSON(data).result_code == ADD_URL_OK) {
//                var jsonData = jQuery.parseJSON(data);
//                console.log("added by=" + jsonData.added_by);
//                var urlItem = urlGridItem(jsonData.url_id, jsonData.url, jsonData.url_md5, jsonData.url_name, jsonData.url_short_name,
//                    jsonData.thumb_url, jsonData.thumb_width, jsonData.thumb_height, jsonData.artist_name, jsonData.added_by, jsonData.short_host, true, true);
//                if (idx >= 0) {
//                    $(".url" + "new_url_place_holder" + idx).replaceWith(urlItem);
//                } else {
//                    $(urlItem). insertAfter(new_url_button);
//                }
//            }
//        },
//        error: function(data) {
//            hideAddModal();
//            alert("error = " + data.responseJSON.error.message);
//        }
//    }).done(function() {
//    });
//}

function addNewUrl(url, artistName, tags, isPrivate, urlSource) {
    addUrl(url, artistName, tags, isPrivate, urlSource,
        function() {

        },
        function(data) {
            console.log("data=" + data.toString());
            var idx = -1;
            for (var i = 0; i < addingURLs.length; i++) {
                if (addingURLs[i] === jQuery.parseJSON(data).url) {
                    idx = i;
                }
            }
            if (idx >= 0) {
                //don't remove this url in the array because we're using the index for view id
                addingURLs[i] = "";
            }
            if (jQuery.parseJSON(data).result_code == ADD_URL_EXISTING) {
                $("div").remove(".url" + "new_url_place_holder" + idx);
                showURLExistingAlert();
            } else if (jQuery.parseJSON(data).result_code == ADD_URL_FAILED) {
                $("div").remove(".url" + "new_url_place_holder" + idx);
                alert(jQuery.parseJSON(data).failed_message);
            } else if (jQuery.parseJSON(data).result_code == ADD_URL_OK) {
                var jsonData = jQuery.parseJSON(data);
                $(".url-list-item-container-" + jsonData.url_md5).remove();
                var urlItem = urlGridItem(jsonData.url, jsonData.url_md5, jsonData.url_name, jsonData.url_short_name,
                    jsonData.thumb_url, jsonData.thumb_width, jsonData.thumb_height, jsonData.artist_name, jsonData.added_by, jsonData.short_host, true, true, isPrivate, jsonData.created_time,
                    jsonData.url_source);
                if (idx >= 0) {
                    $(".url" + "new_url_place_holder" + idx).replaceWith(urlItem);
                } else {
                    $(urlItem). insertAfter(new_url_button);
                }
                if (isMobile()) {
                    $(".thumb-image-container #remove" + jsonData.url_md5).show();
                }
            }
        },
        function() {
            hideAddModal();
            alert("error = " + data.responseJSON.error.message);
        },
        function() {

        });
}

function addUrl(url, artistName, tags, isPrivate, urlSource, beforeSendCallback, successCallback, errorCallback, completeCallback)
{
    var api_url = addNewURLUrl;
    $.ajax({
        url: api_url,
        type: "POST",
        dataType: "text",
        data: {"url": url, 'url_source': urlSource, "artist_name": artistName, "tags": tags, "is_private": isPrivate},
        beforeSend: function() {
            beforeSendCallback();
        },
        complete:function(){
            completeCallback();
        },
        success: function(data) {
            successCallback(data);
        },
        error: function(data) {
            errorCallback();
        }
    }).done(function() {
    });
}

function hideAddModal() {
    $("#saving-new-url-progress").hide();
    $("#add_new_url").attr('readonly', false);
    $('#enter-new-url-popup').modal('hide');
}

function showURLExistingAlert(url) {
    alert(url + i18n(' already added!'));
}

function removeUrl(url)
{
    var api_url = removeURLUrl;
    $.ajax({
        url: api_url,
        type: "POST",
        dataType: "text",
        data: {"url": url},
        beforeSend: function() {
        },
        complete:function(){
        },
        success: function(data) {
            var jsonData = jQuery.parseJSON(data);
            if (jsonData.result_code != REMOVE_OK) {
                return;
            }
            if (jsonData.user_count == 0 || jsonData.is_following == 0) {
                $(".url" + jsonData.url_md5).remove();
            } else {
                $(".thumb-image-container #remove" + jsonData.url_md5).replaceWith(addFeedButton(jsonData.url_md5, jsonData.url, jsonData.url_source));
                $("#added-by-content-" + jsonData.url_md5).html(jsonData.added_by);
                $(".change-url-state-icon-" + jsonData.url_md5).remove();
                $(".url-create-time-label-" + jsonData.url_md5).attr('class', 'url-create-time-label url-create-time-label-' + jsonData.url_md5);
                $("#url-create-time-" + jsonData.url_md5).html(jsonData.created_time);
                if (isMobile()) {
                    $(".thumb-image-container #add" + jsonData.url_md5).show();
                }
            }
        },
        error: function(data) {
        }
    }).done(function() {
    });
}

//Click on new url button
$('#feed-add-button-image').click(function() {
    $('#enter-new-url-popup').modal({show: true});
    $("#new_url_text_input").focus();
});

$('body').on('click', '#feed-unfollow-button-image', function() {
    var api_url = unfollowUrl;
    $.ajax({
        url: api_url,
        type: "POST",
        dataType: "text",
        data: null,
        beforeSend: function() {
        },
        complete:function(){
        },
        success: function(data) {
            console.log("data=" + jQuery.parseJSON(data).result_code);
            if (jQuery.parseJSON(data).result_code == 1) {
                var followBtn = followButton();
                $("#new_url_button").replaceWith(followBtn);
            } else {
                alert(i18n("Unfollow failed, please try again!"));
            }
        },
        error: function(data) {
            alert(i18n("Unfollow failed, please try again!"));
        }
    }).done(function() {
    });
});

$('body').on('click', '#feed-follow-button-image', function() {
    if (currentUserId <= 0) {
        openLoginPage();
    } else {
        var api_url = followUrl;
        $.ajax({
            url: api_url,
            type: "POST",
            dataType: "text",
            data: null,
            beforeSend: function() {
            },
            complete:function(){
            },
            success: function(data) {
                console.log("data=" + jQuery.parseJSON(data).result_code);
                if (jQuery.parseJSON(data).result_code == 1) {
                    var unfollowBtn = unfollowButton();
                    $("#new_url_button").replaceWith(unfollowBtn);
                } else {
                    alert(i18n("Follow failed, please try again!"));
                }
            },
            error: function(data) {
                alert(i18n("Follow failed, please try again!"));
            }
        }).done(function() {
        });
    }
});

$('#enter-new-url-content').click(function(e) {
    e.stopPropagation();
});

$('body').on('click touchstart', '.remove-url-button', function() {
    var url = $(this).attr('url');
    removeUrl(url);
    return false;
});

$('body').on('click', '.add-url-from-other-button', function(event) {
    if (currentUserId <= 0) {
        openLoginPage();
        return false;
    } else {
        event.stopPropagation();
        var url_md5 = $(this).attr('url_md5');
        $(".add-url-from-other-icon-" + url_md5).hide();
        $(".is-private-box-2-" + url_md5).show();
        return false;
    }
});

$('body').on('click', '.private-option-container-2', function() {
    var url = $(this).attr('url');
    var url_source = $(this).attr('url_source');
    var url_md5 = $(this).attr('url_md5');
    addUrlFromOther(url, url, "", url_source, url_md5, 1);
    return false;
});

$('body').on('click', '.public-option-container-2', function() {
    var url = $(this).attr('url');
    var url_source = $(this).attr('url_source');
    var url_md5 = $(this).attr('url_md5');
    addUrlFromOther(url, url, "", url_source, url_md5, 0);
    return false;
});

function addUrlFromOther(url, artistName, tags, url_source, urlMd5, isPrivate) {
    addUrl(url, artistName, tags, isPrivate, url_source,
        function() {
        },
        function(data) {
            console.log("data=" + data.toString());
            var jsonData = jQuery.parseJSON(data);
            if (jsonData.result_code == ADD_URL_EXISTING) {
                showURLExistingAlert();
            } else if (jsonData.result_code == ADD_URL_FAILED) {
                alert(i18n("Save failed!"));
            } else if (jsonData.result_code == ADD_URL_OK) {
                //$(".add-from-other-" + urlMd5).remove();
                $("#added-by-content-" + urlMd5).html(jsonData.added_by);
                $(".add-from-other-" + urlMd5).replaceWith(removeFeedButton(url, urlMd5));
                if (isPrivate == 1) {
                    $(".url-title-grey-dot-separator-" + urlMd5).after(privateStateIcon(urlMd5));
                } else {
                    $(".url-title-grey-dot-separator-" + urlMd5).after(publicStateIcon(urlMd5));
                }
                $(".url-create-time-label-" + urlMd5).attr('class', 'url-create-time-label-owner url-create-time-label-' + urlMd5);
                $("#url-create-time-" + urlMd5).html(jsonData.created_time);
                if (isMobile()) {
                    $(".thumb-image-container #remove" + urlMd5).show();
                }
            }
        },
        function() {
        },
        function() {

        });
}

//$('body').on('hover', '.url-mask-cover', function() {
////$(".url-mask-cover").hover(function () {
//        var urlMd5 = $(this).attr("url_md5");
//        if (urlMd5 != undefined) {
//            //$("#add" + urlMd5).show();
//            $("#remove" + urlMd5).show();
//        }
//    },
//    function() {
//        if (isMobile()) {
//            return;
//        }
//        var urlMd5 = $(this).attr("url_md5");
//        if (urlMd5 != undefined) {
//            //$("#add" + urlMd5).hide();
//            $("#remove" + urlMd5).hide();
//            //$(".add-url-from-other-icon-" + urlMd5).show();
//            //$(".is-private-box-2-" + urlMd5).hide();
//        }
//    }
//);
$('body').on('mouseover', '.url-mask-cover', function() {
    var urlMd5 = $(this).attr("url_md5");
    if (urlMd5 != undefined) {
        //$("#add" + urlMd5).show();
        $("#remove" + urlMd5).show();
    }
});

$('body').on('mouseout', '.url-mask-cover', function() {
    if (isMobile()) {
        return;
    }
    var urlMd5 = $(this).attr("url_md5");
    if (urlMd5 != undefined) {
        //$("#add" + urlMd5).hide();
        $("#remove" + urlMd5).hide();
    }
});

$('body').on('mouseover', '#feed-unfollow-button-image', function() {
    $('#feed-unfollow-button-image').attr('src', unfollowIcon);
});

$('body').on('mouseout', '#feed-unfollow-button-image', function() {
    $('#feed-unfollow-button-image').attr('src', followingIcon);
});

$('#upload_new_url_button').click(function() {
    if ($("#new_url_text_input").val().toString().length > 0 && $("#new_url_source").val().toString().length > 0) {
        var url = fillURL($.trim($("#new_url_text_input").val()));
        var tags = $("#new_url_tag_text_input").val();
        var urlSource = fillURL($.trim($("#new_url_source").val()));
        var isPrivate = $("#is-private-drop-box-content").attr("tabindex");
        //Check URL existing first
        var api_url = checkURLExistingUrl;
        $.ajax({
            url: api_url,
            type: "POST",
            dataType: "text",
            data: {"url": url, "tags": tags, "source": urlSource},
            beforeSend: function () {
                hideAddModal();
                $("#new_url_text_input").val("");
                $("#new_url_source").val("");
                $("#new_url_tag_text_input").val("");
                var urlItem = urlGridItem(url, "new_url_place_holder" + addingURLs.length, i18n("Adding URL..."), i18n("Adding URL..."), "", 0, 0, url, "", strip_text_FRD(getHostFromURL(url), 20, true), false, false, true, '', urlSource);
                addingURLs[addingURLs.length] = url;
                $(urlItem).prependTo(".feed-container");
                //$(urlItem).insertAfter(new_url_button);
            },
            complete: function () {
            },
            success: function (data) {
                var jsonData = jQuery.parseJSON(data);
                if (jsonData.result_code === ADD_URL_EXISTING) {
                    var idx = -1;
                    for (var i = 0; i < addingURLs.length; i++) {
                        if (addingURLs[i] === jQuery.parseJSON(data).url) {
                            idx = i;
                        }
                    }
                    idx = -1;

                    if (idx >= 0) {
                        addingURLs.splice(idx);
                        $("div").remove(".url" + "new_url_place_holder" + idx);
                    }
                    //showURLExistingAlert(jsonData.url);
                    //console.log(data);
                    var jsonData = jQuery.parseJSON(data);
                    
                    $(".url-list-item-container-" + jsonData.url_md5).remove();
                    var urlItem = urlGridItem(jsonData.url, jsonData.url_md5, jsonData.url_name, jsonData.url_short_name,
                        jsonData.thumb_url, jsonData.thumb_width, jsonData.thumb_height, jsonData.artist_name, jsonData.added_by, jsonData.short_host, true, true, isPrivate, jsonData.created_time,
                        jsonData.url_source);
                    if (idx >= 0) {
                        $(".url" + "new_url_place_holder" + idx).replaceWith(urlItem);
                    } else {
                        $('.urlnew_url_place_holder0:eq(0)').remove();
                        //$(urlItem).insertAfter(new_url_button);
                        $('.feed-container:eq(0)').prepend(urlItem);
                    }
                    if (isMobile()) {
                        $(".thumb-image-container #remove" + jsonData.url_md5).show();
                    }
                } else {
                    addNewUrl(jsonData.url, jsonData.url, jsonData.tags, isPrivate, urlSource);
                }
            },
            error: function (data) {
                alert(i18n("Add URL failed!"));
            }
        }).done(function () {
        });
    } else if ($("#new_url_text_input").val().toString().length == 0) {
        alert(i18n("Please enter a Web, Image or GIF URL"));
    } else if ($("#new_url_source").val().toString().length == 0) {
        alert(i18n("Please enter source URL"));
    }
});

function getHostFromURL(url) {
    var l = document.createElement("a");
    l.href = url;
    return l.hostname;
};

function DropDown(el) {
    this.dropContent = el;
    this.initEvents();
}
DropDown.prototype = {
    initEvents : function() {
        var obj = this;
        obj.dropContent.on('click', function(event){
            $(this).toggleClass('active');
            event.stopPropagation();
        });
    }
}

$("#public-option").click(function() {
    $("#current-state-icon").attr('class', 'public-icon-white');
    $("#current-state-label").html(i18n("Public"));
    $("#is-private-drop-box-content").attr("tabindex", 0);
    $("#is-private-drop-box").attr("class", "is-private-drop-box is-private-drop-box-public");
});

$("#private-option").click(function() {
    $("#current-state-icon").attr('class', 'private-icon-white');
    $("#current-state-label").html(i18n("Only me"));
    $("#is-private-drop-box-content").attr("tabindex", 1);
    $("#is-private-drop-box").attr("class", "is-private-drop-box is-private-drop-box-private");
});

$(function() {
    var dropContent = new DropDown( $('#is-private-drop-box-content') );
    $(document).click(function() {
        // all dropdowns
        $('.is-private-drop-box-content').removeClass('active');
    });
});

function newURLTextInputOnBlur() {
    var url = $.trim($("#new_url_text_input").val());
    if (!checkURLIsImage(url)) {
        if (url == "") {
            $("#new_url_source").val("");
        } else {
            $("#new_url_source").val(url);
        }
    }
}

function removeParamFromURL(url) {
    var startPositionOfParams = url.indexOf("?");
    var path = url;
    if (startPositionOfParams >= 0) {
        var path = url.substring(0, startPositionOfParams);
    }
    return path;
}

function getImageExtensionFromUrl(url) {
    var path = removeParamFromURL(url);
    var parts = path.split(".");
    return parts[parts.length - 1].toLowerCase();
}

function checkURLIsImage(url)  {
    var imageFileTypes = ['png', 'gif', 'jpg', 'webp', 'jpeg', 'bmp'];
    var fileType = getImageExtensionFromUrl(url);
    var index = imageFileTypes.indexOf(fileType);
    if (index >= 0) {
        return true;
    } else {
        return false;
    }
}

$('body').on('click', '.change-url-state-icon', function(event) {
    event.stopPropagation();
    $(".is-private-box-3-" + $(this).attr("url-md5")).css("left", $(this).position().left - 6 + "px");
    $(".is-private-box-3-" + $(this).attr("url-md5")).toggle();
});

$('body').on('click', '.private-option-container-3', function() {
    var url = $(this).attr('url');
    var url_md5 = $(this).attr('url_md5');
    $(".is-private-box-3-" + url_md5).toggle();
    if ($(this).attr('is_private') != 1) {
        updateURLstate(1, url, url_md5);
    }
    return false;
});

$('body').on('click', '.public-option-container-3', function() {
    var url = $(this).attr('url');
    var url_md5 = $(this).attr('url_md5');
    $(".is-private-box-3-" + url_md5).toggle();
    if ($(this).attr('is_private') != 0) {
        updateURLstate(0, url, url_md5);
    }
    return false;
});

function updateURLstate(isPrivate, urlText, url_md5) {
    var api_url = updateStateURLUrl;
    $.ajax({
        url: api_url,
        type: "POST",
        dataType: "text",
        data: {"url": urlText, "url_state": isPrivate},
        beforeSend: function () {
        },
        complete: function () {
        },
        success: function (data) {
            var jsonData = jQuery.parseJSON(data);
            if (jsonData.result_code === UPDATE_URL_STATE_FAIL) {
                alert(i18n("Change state failed, Please try again!"));
            } else if (jsonData.result_code === UPDATE_URL_STATE_OK) {
                if (isPrivate == 0) {
                    $(".change-url-state-icon-" + url_md5).replaceWith(publicStateIcon(url_md5));
                } else {
                    $(".change-url-state-icon-" + url_md5).replaceWith(privateStateIcon(url_md5));
                }
            } else if (jsonData.result_code === URL_NOT_EXISTING) {
                alert(i18n("Url does not exist!"));
            }
        },
        error: function (data) {
            alert(i18n("Add URL failed!"));
        }
    }).done(function () {
    });
}

$('html').click(function() {
    $(".is-private-box-3").hide();
    $(".add-url-from-other-icon").show();
    $(".is-private-box-2").hide();
});

function isMobile() {
    try{ document.createEvent("TouchEvent"); return true; }
    catch(e){ return false; }
}

function openLoginPage() {
    window.open(loginPageUrl, "_self");
}

$(document).ready(function(){
    $('#load-more-user-urls-btn').click(function(){
        var ajaxPagingUrl = $("#next-feed-page-url").val();
        console.log("uuu==" + ajaxPagingUrl);
        $.ajax({
            method: 'GET',
            url: ajaxPagingUrl
        }).done(function(msg){
            $("#has-more-feed-page").remove();
            $("#next-feed-page-url").remove();
            $('.feed-container').append(msg);
            if ($("#has-more-feed-page").val() == 0) {
                $('#load-more-user-urls-container').hide();
            }
        });
    });
});