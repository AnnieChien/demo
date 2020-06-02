$(document).ready(function(){
	if(typeof initation_requestTranslations !== 'undefined'){
    	i18n.translator.add(initation_requestTranslations);
	}
	$('#invitation-request-form').validate({
		rules: {
			 email: {
				 required: true,
				 email: true
			 },
			 name: {
				 required: true
			 }
		},
		messages: {
			name: {
				required: i18n('Please enter your name')
			},
			email: {
				required: i18n('Please enter your email address'),
				email: i18n('please enter a valid email address')
			}
		}
	});
});
