// This identifies your website in the createToken call below
Stripe.setPublishableKey('pk_test_dDgpV0Yma2e7um7gqvcMj4RD');

var PAYMENT_OK = 0;
var PAYMENT_FAILED = 1;

$body = $("body");

$(document).ready(function(){
    i18n.translator.add(paymentTranslations);
}).ajaxStart(function () {
    $body.addClass("loading");
});

jQuery(function($) {
	if($('#credit-change-fieldset').length > 0) {
		var $creditFieldSet = $('#credit-fieldset');
		var $creditChangeFieldSet = $('#credit-change-fieldset');
		//$creditChangeFieldSet.hide();
		
		//Disable all field
		$creditChangeFieldSet.find('input:text, input:password, input:file, select, textarea').each(function() {
			$(this).attr("disabled", "disabled");
	    });
		$('#creditchange').click(function() {
			if($(this).is(':checked')) {
				console.log('Checked!');
				$creditFieldSet.hide();
				$creditChangeFieldSet.show();
				$creditChangeFieldSet.find('input:text, input:password, input:file, select, textarea').each(function() {
					$(this).removeAttr("disabled");
			    });
			} else {
				console.log('Unchecked!');
				$creditFieldSet.show();
				$creditChangeFieldSet.hide();
				$creditChangeFieldSet.find('input:text, input:password, input:file, select, textarea').each(function() {
					$(this).attr("disabled", "disabled");
			    });
			}
		});
	}
});

jQuery(function($) {
	// Validate form with jQuery first
	$('#payment-form').validate({
		rules: {
			name: {
				required: true
			},
			number: {
				required: true,
				creditcard: true,
				minlength: 13,
				maxlength: 16,
				digits: true
			},
			cvc: {
				required: true
			},
			exp_month: {
				required: true
			},
			exp_year: {
				required: true
			}
		},
		messages: {
			name: {
				required: i18n('Card holder name is required.')
			},
			number: {
				required: i18n('Card number is required.'),
                creditcard: i18n('Please enter a valid credit card number.'),
				minlength: i18n('Please enter a valid credit card number.'),
				maxlength: i18n('Please enter a valid credit card number.'),
				digits: i18n('Please enter a valid credit card number.')
			},
			cvc: {
				required: i18n("Your card's security code is required.")
			},
			exp_month: {
				required: i18n("Your card's expiration month is required.")
			},
			exp_year: {
				required: i18n("Your card's expiration year is required.")
			}
		}
	});
    
	$("#payment").click(function(event) {
	    
		var $form = $('form:eq(0)');
        var rc = false;
        if ((document.getElementsByName('creditchange').length > 0) && !$('#creditchange').is(':checked')) {
            $form.find('button').prop('disabled', true);
            submitPayment(''); // use the save card
        } else {
            var card_brand = getCardType($('#number').val());
            $('#brand').val(card_brand);
            if($form.valid()) {
                //Disable the submit button to prevent repeated clicks
                $form.find('button').prop('disabled', true);
                if($('#credit-change-fieldset').length > 0) {
                    if(!$('#number').val() && $('#number').is(':disabled')) {
                        console.log('No number');
                        submitPayment(''); // use the save card
                    } else {
                        console.log('have number');
                        Stripe.card.createToken($form, stripeResponseHandler);
                    }
                } else {
                    Stripe.card.createToken($form, stripeResponseHandler);
                }
            }
        }
        
        return rc;
	});
});

function submitPayment(stripeToken) {
    $('#payment-errors-wrapper').hide();
    var api_url = submitPaymentUrl;
    var storeCreditCard = 0;
    if ($('#save_credit_card').is(':checked'))
        storeCreditCard = 1;
    var card_id = "";
    if ($('#card_id').length)
        card_id = $('#card_id').val();
    var brand = "Unknown";
    if ($('#brand').length)
        brand = $('#brand').val();
    $.ajax({
        url: api_url,
        type: "POST",
        dataType: "text",
        data: {"stripeToken": stripeToken, 'card_id': card_id, 'brand': brand, 'storeCreditCard': storeCreditCard},
        beforeSend: function() {
        },
        complete:function(){
        },
        success: function(data) {
            var $form = $('form:eq(0)');
            try {
                console.log("data=" + data.toString());
                var jsonData = jQuery.parseJSON(data);
                if (jsonData.result_code == PAYMENT_OK) {
                    window.location.href = jsonData.redirectUrl;
                } else if (jsonData.hasOwnProperty('redirectUrl')) {
                    window.location.href = jsonData.redirectUrl;
                } else {
                    $form.find('.payment-errors').text(i18n(jsonData.failed_message));
                    $('#payment-errors-wrapper').show();
                    window.scrollTo(0,0);
                    $form.find('button').prop('disabled', false);
                    $body.removeClass("loading");
                }
            } catch (ex) {
                console.log(ex);
                $form.find('.payment-errors').text(i18n('Unexpected error.'));
                $('#payment-errors-wrapper').show();
                window.scrollTo(0,0);
                $form.find('button').prop('disabled', false);
                $body.removeClass("loading");
            }
        },
        error: function(data) {
            var $form = $('form:eq(0)');
            $form.find('.payment-errors').text(i18n('Unexpected error.'));
            $('#payment-errors-wrapper').show();
            window.scrollTo(0,0);
            $form.find('button').prop('disabled', false);
            $body.removeClass("loading");
        }
    }).done(function() {
    });
}

var stripeResponseHandler = function(status, response) {
	console.log(response);
	var $form = $('#payment-form');
	if (response.error) {
		// Show the errors on the form
		$('#payment-errors-wrapper').show();
        window.scrollTo(0,0);
		
		$form.find('.payment-errors').text(i18n(response.error.message));
		$form.find('button').prop('disabled', false);
	} else {
		// response contains id and card, which contains additional card details
		var token = response.id;
        submitPayment(token);
	}
};

function getCardType(card_number) {
    var card_type = 'Unknown';
    if (Stripe.card.validateCardNumber(card_number)) {
        if (card_number.substring(0, 2) != '62') // union pay that stripe did not recognize properly
            card_type = Stripe.card.cardType(card_number);
    }
    
    return card_type;
}

function validCardType(card_type) {
    var cards = $('#valid_credit_cards').val().split(",");
    switch (card_type) {
        case "American Express":
            card_type = "amex";
            break;
        case "Diners Club":
            card_type = "diners";
            break;
        case "Discover":
            card_type = "discover";
            break;
        case "JCB":
            card_type = "jcb";
            break;
        case "Master":
            card_type = "master";
            break;
        case "Visa":
            card_type = "visa";
            break;
    }
    
    return cards.indexOf(card_type) >= 0;
}

function validCardTypes() {
    var valid_card_types = "";
    var cards = $('#valid_credit_cards').val().split(",");
    for (var i = 0; i < cards.length; i++) {
        var card_type = "";
        switch (cards[i]) {
            case "amex":
                card_type = "American Express";
                break;
            case "diners":
                card_type = "Diners Club";
                break;
            case "discover":
                card_type = "Discover";
                break;
            case "jcb":
                card_type = "JCB";
                break;
            case "master":
                card_type = "Master";
                break;
            case "visa":
                card_type = "Visa";
                break;
        }
        if (card_type != "") {
            if (valid_card_types != "")
                valid_card_types += ", ";
            valid_card_types += card_type;
        }
    }
    return valid_card_types;
}