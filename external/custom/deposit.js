// This identifies your website in the createToken call below
Stripe.setPublishableKey('pk_test_dDgpV0Yma2e7um7gqvcMj4RD');
jQuery(function($) {
	if($('#account-change-fieldset').length > 0) {
		var $accountFieldSet = $('#account-fieldset');
		var $accountChangeFieldSet = $('#account-change-fieldset');
		
		//Disable all field
		$accountChangeFieldSet.find('input:text, input:password, input:file, select, textarea').each(function() {
			$(this).attr("disabled", "disabled");
	    });
		$('#accountchange').click(function() {
			if($(this).is(':checked')) {
				console.log('Checked!');
				$accountFieldSet.hide();
				$accountChangeFieldSet.show();
				$accountChangeFieldSet.find('input:text, input:password, input:file, select, textarea').each(function() {
					$(this).removeAttr("disabled");
			    });
			} else {
				console.log('Unchecked!');
				$accountFieldSet.show();
				$accountChangeFieldSet.hide();
				$accountChangeFieldSet.find('input:text, input:password, input:file, select, textarea').each(function() {
					$(this).attr("disabled", "disabled");
			    });
			}
		});
	}
});

jQuery(function($) {
	// Validate form with jQuery first
	$('#deposit-form').validate({
		rules: {
			country: {
				required: true
			},
			firstname: {
				required: true
			},
			lastname: {
				required: true
			},
			routing: {
				required: true
			},
			account: {
				required: true
			},
			password: {
				required: true
			}
		},
		messages: {
			country: {
				required: 'Country is required!'
			},
			firstname: {
				required: 'First name is required!'
			},
			lastname: {
				required: 'Last name is required!'
			},
			routing: {
				required: 'Routing is required!'
			},
			account: {
				required: 'Account is required!'
			},
			password: {
				required: 'Password is required!'
			}
		}
	});
	$('#deposit-form').submit(function(event) {
		var $form = $(this);
		if($form.valid()) {
	
			//Disable the submit button to prevent repeated clicks
			$form.find('button').prop('disabled', true);
			if($('#account-change-fieldset').length > 0) {
				if(!$('#account').val() && $('#account').is(':disabled')) {
					console.log('No number');
					$form.get(0).submit();
				} else {
					console.log('have number');
					Stripe.bankAccount.createToken($form, stripeResponseHandler);
				}
			} else {
				Stripe.bankAccount.createToken($form, stripeResponseHandler);
			}
		    
		    //Prevent the form from submitting with the default action
		    return false;
		} else {
			return false;
		}
	});
});

var stripeResponseHandler = function(status, response) {
	console.log(response);
	var $form = $('#deposit-form');
	if (response.error) {
		// Show the errors on the form
		$('#deposit-errors-wrapper').show();
		$form.find('.deposit-errors').text(response.error.message);
		$form.find('button').prop('disabled', false);
	} else {
		// response contains id and card, which contains additional card details
		var token = response.id;
		// Insert the token into the form so it gets submitted to the server
		$form.append($('<input type="hidden" name="stripeToken" />').val(token));
		// and submit
		$form.get(0).submit();
	}
};