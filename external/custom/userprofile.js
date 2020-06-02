$(document).ready(function(){
	$('#profile-work-tab').on('click', function(){
		console.log("work tab");
        $("#profile-work-tab-content").show();
        $("#profile-about-tab-content").hide();
        $("#profile-work-tab").removeClass("profile-work-tab-title-normal");
        $("#profile-work-tab").addClass("profile-work-tab-title-focus");
        $("#profile-about-tab").addClass("profile-about-tab-title-normal");
        $("#profile-about-tab").removeClass("profile-about-tab-title-focus");
	});
    $('#profile-about-tab').on('click', function(){
        console.log("about tab");
        $("#profile-about-tab-content").show();
        $("#profile-work-tab-content").hide();
        $("#profile-work-tab").removeClass("profile-work-tab-title-focus");
        $("#profile-work-tab").addClass("profile-work-tab-title-normal");
        $("#profile-about-tab").removeClass("profile-about-tab-title-normal");
        $("#profile-about-tab").addClass("profile-about-tab-title-focus");
    });
});