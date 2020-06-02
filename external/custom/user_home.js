$(window).scroll(function() {
    var top = window.pageYOffset;
    if (top > 57) {
        $("#home-menu-container").removeClass("home-menu-container");
        $("#home-menu-container").addClass("home-menu-container-fixed");
    } else {
        $("#home-menu-container").addClass("home-menu-container");
        $("#home-menu-container").removeClass("home-menu-container-fixed");
    }
});