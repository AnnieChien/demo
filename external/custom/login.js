$(document).ready(function(){
    i18n.translator.add(loginTranslations);
	
	$('#login-form').validate({
		rules: {
			 email: {
				 required: true
			 },
			 password: {
				 required: true
			 }
		},
		messages: {
			email: {
				required: i18n('Please enter your e-mail or username'),
			},
			password: {
				required: i18n('Please enter the password'),
			}
		}
	});
});
