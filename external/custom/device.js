$(document).ready(function(){
	
	$('#device-setting-form-step1').validate({
		rules: {
			displayname: {
				minlength: 2,
				required: true
			},
			passcode: {
				minlength: 6,
				required: true
			}
		},
		messages: {
			displayname: {
				required: i18n('Please enter device name'),
				minlength: i18n('Device name must be at least 2 characters long'),
			},
			passcode: {
				required: i18n('Please enter the wifi password'),
				minlength: i18n('Wifi password must be at least 6 characters long'),
			}
		}
	});
});
