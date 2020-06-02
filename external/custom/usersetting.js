$(document).ready(function(){
    i18n.translator.add(usersettingTranslations);
	$('#add-file').on('click', function(){
		$('input[type=file]').trigger('click');
	});
    $('#account-setting-form').validate({
        rules: {
            currentPassword: {
                minlength: passMinLength,
                required: true
            },
            newPassword: {
                minlength: passMinLength,
                required: true
            },
            newPasswordConfirm: {
                minlength: passMinLength,
                required: true,
                equalTo: "#newPassword"
            }
        },
        messages: {
            currentPassword: {
                required: i18n('Please enter the current password'),
                minlength: i18n('Your password must be at least %{i1} characters long.', {i1: passMinLength}),
            },
            newPassword: {
                required: i18n('Please enter the new password'),
                minlength: i18n('Your password must be at least %{i1} characters long.', {i1: passMinLength}),
            },
            newPasswordConfirm: {
                required: i18n('Please enter the re-password'),
                minlength: i18n('Your password must be at least %{i1} characters long.', {i1: passMinLength}),
                equalTo: i18n('Please enter the same password as above')
            }
        }
    });
	$('#enableChangePassword').click(function () {
        setInputStatus();
    });

    var cover_url = $('#cover').val();
    if (cover_url != undefined && cover_url != '') {
        if (cover_url.indexOf('http') != 0) {
            cover_url = $('#base_url').val() + cover_url;
        }
        $("#cover_image").attr('src', cover_url);
        $("#cover_container").show();
        $("#none_image").hide();
    }

    setInputStatus();
});

function setInputStatus() {
    if ($('#enableChangePassword').prop('checked')) {
        $('#currentPassword').attr('disabled', false);
        $('#newPassword').attr('disabled', false);
        $('#newPasswordConfirm').attr('disabled', false);
    } else {
        $('#currentPassword').attr('disabled', true);
        $('#newPassword').attr('disabled', true);
        $('#newPasswordConfirm').attr('disabled', true);
    }
}

function readURLCover(input, parent_tag) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#cover_image').attr('src', e.target.result);
            $('#cover_container').show();
            $('#none_image').hide();
        };

        reader.readAsDataURL(input.files[0]);
    }
}

function readURL(input, parent_tag) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $(parent_tag).attr('src', e.target.result)
        };

        reader.readAsDataURL(input.files[0]);
    }
}