$(document).ready(function(){
    i18n.translator.add(registerTranslations);
	$( "#credit_expire" ).datepicker({ dateFormat: 'mm/yy' });

    $.validator.addMethod(
        "regex",
        function(value, element, regexp) {
            return this.optional(element) || regexp.test(value);
        },
        i18n("Please check your input.")
    );

    $.validator.addMethod(
        "blacklist",
        function(value, element, blacklist) {
            if ($.inArray(value.toLowerCase(), blacklist) == -1) {
                return true;
            } else {
                return false;
            }
        },
        i18n("Please check your input.")
    );

	$('#register-form').validate({
		rules: {
			 username: {
				 minlength: usernameMinLength,
                 maxlength: usernameMaxLength,
				 required: true,
                 regex: usernameRegex,
                 blacklist: blacklist
			 },
			 password: {
				 minlength: passMinLength,
				 required: true
			 },
			 repeatPassword: {
				 minlength: passMinLength,
				 required: true,
				 equalTo: "#password"
			 },
			 email: {
				 required: true,
				 email: true
			 }
		},
		messages: {
			username: {
				required: i18n('Please enter a username.'),
				minlength: i18n('Your username must consist of at least %{i1} characters.', {i1: usernameMinLength}),
                maxlength: i18n('Your username must be shorter than %{i1} characters.', {i1: usernameMaxLength}),
                regex: i18n("Invalid: letters, numbers and underscore ( _ ) only."),
                blacklist: i18n("Invalid username.")
			},
			password: {
				required: i18n('Please enter the password.'),
				minlength: i18n('Your password must be at least %{i1} characters long.', {i1: passMinLength}),
			},
			repeatPassword: {
				required: i18n('Please enter the password again.'),
				minlength: i18n('Your password must be at least %{i1} characters long.', {i1: passMinLength}),
				equalTo: i18n('Please enter the same password as above.')
			},
			email: {
				required: i18n('Please enter your email address.'),
				email: i18n('Please enter a valid email address.')
			}
		}
	});
});
