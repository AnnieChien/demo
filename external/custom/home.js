$("#home-image").hover(function(){
    $(this).attr("src", function(index, attr){
        return attr.replace(".png", "_on.png");
    });
}, function(){
    $(this).attr("src", function(index, attr){
        return attr.replace("_on.png", ".png");
    });
});

/*
$('#home-image').click(function(){
	videoWidth = $(this).width();
	videoHeight = $(this).height();
	video = '<iframe src="'+ $(this).attr('data-video') +'" width="100%" height="'+videoHeight+'" frameborder="0" class="home-video"></iframe>';
	$(this).replaceWith(video);
});
*/

$(document).ready(function(){
	$('.modal').on('show.bs.modal', function (e) {
		$(this).on('click', function (e) {
		    $(this).modal('hide');
		});
		$(this).css({ 'display': 'table', 'width': '100%', 'height': '100%' });
		$(this).find('.modal-dialog').css({ 'padding': '0px', 'display': 'table-cell', 'vertical-align': 'middle' });
		$(this).find('.modal-content').css({ 'width': '100%','max-width': '600px','overflow-y':'auto','height':'100%', 'max-height':'500px', 'margin': '0px auto' });
	});
	
	$('.modal').on('hidden.bs.modal', function (e) {
		$(this).find('.modal-content').removeAttr('style');
		$(this).find('.modal-dialog').removeAttr('style');
	});
});

//Auto expand dropdown menu on mobile and tablet version
$('.collapse.navbar-collapse').on('shown.bs.collapse', function(){
    $('#user-icon-dropdown').addClass('open');
});