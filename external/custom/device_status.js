$(document).ready(function(){
	if ($.cookie('devicesetuppop') == null) {
	    if( $('#deviceSetupModal').length ) {
			$("#deviceSetupModal").modal('show');
		}
		$('.modal').on('show.bs.modal', function (e) {
			$(this).on('click', function (e) {
			    $(this).modal('hide');
			});
			$(this).css({ 'display': 'table', 'width': '100%', 'height': '100%' });
			$(this).find('.modal-dialog').css({ 'padding': '0px', 'display': 'table-cell', 'vertical-align': 'middle' });
			$(this).find('.modal-content').css({ 'width': '500px','max-width': '600px', 'margin': '0px auto' });
		});
		
		$('.modal').on('hidden.bs.modal', function (e) {
			$(this).find('.modal-content').removeAttr('style');
			$(this).find('.modal-dialog').removeAttr('style');
		});
		$.cookie('devicesetuppop', 1,{ expires : 10 });
	}
});