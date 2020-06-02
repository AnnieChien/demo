
$(document).ready(function(){
    $('body').on('mouseover', '.following-follow-button', function() {
        $('#following-follow-button-' + $(this).attr('user_id')).attr('src', unfollowIcon);
    });

    $('body').on('mouseout', '.following-follow-button', function() {
        $('#following-follow-button-' + $(this).attr('user_id')).attr('src', followingIcon);
    });

    $('body').on('mouseover', '.follower-follow-button', function() {
        if ($(this).attr('is_following') == 1) {
            $('#follower-follow-button-' + $(this).attr('user_id')).attr('src', unfollowIcon);
        }
    });

    $('body').on('mouseout', '.follower-follow-button', function() {
        if ($(this).attr('is_following') == 1) {
            $('#follower-follow-button-' + $(this).attr('user_id')).attr('src', followingIcon);
        }
    });

    $('body').on('click', '.following-follow-button', function() {
        var api_url = $(this).attr('unfollow_url');
        var user_id = $(this).attr('user_id');
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
                    $("#following-item-" + user_id).remove();
                    $("#follower-follow-button-" + user_id).attr('src', followIcon);
                    $("#follower-follow-button-" + user_id).attr('is_following', 0);
                    //var followBtn = followButton();
                    //$("#new_url_button").replaceWith(followBtn);
                } else {
                    alert("Unfollow failed, please try again!");
                }
            },
            error: function(data) {
                alert(alert("Unfollow failed, please try again!"));
            }
        }).done(function() {
        });
    });

    $('body').on('click', '.follower-follow-button', function() {
        var is_following = $(this).attr('is_following');
        if (is_following == 1) {
            var api_url = $(this).attr('unfollow_url');
        } else {
            var api_url = $(this).attr('follow_url');
        }
        var user_id = $(this).attr('user_id');
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
                if (jQuery.parseJSON(data).result_code == 1) {
                    if (is_following == 1) {
                        $("#follower-follow-button-" + user_id).attr('src', followIcon);
                        $("#follower-follow-button-" + user_id).attr('is_following', 0);
                        $("#following-item-" + user_id).remove();
                    } else {
                        $("#follower-follow-button-" + user_id).attr('src', followingIcon);
                        $("#follower-follow-button-" + user_id).attr('is_following', 1);
                    }
                } else {
                    alert("Unfollow failed, please try again!");
                }
            },
            error: function(data) {
                alert(alert("Unfollow failed, please try again!"));
            }
        }).done(function() {
        });
    });
});