$(document).ready(function($) {
	// Get wrapper width and height
	var wrapperWidth = $('#artwork-thumb-wrapper').width();
	var wrapperHeight = $('#artwork-thumb-wrapper').height();
	
	$('video').mediaelementplayer({
		defaultVideoWidth: wrapperWidth,
		defaultVideoHeight: 330
	});
});