//var $payalDisplayFieldSet = $('#paypal-display-fieldset');
//var $payalChangeFieldSet = $('#paypal-change-fieldset');
var $stripeDisplyFieldSet = $('#stripe-display-section-fieldset');
var $stripeConnectFieldSet = $('#stripe-connect-section-fieldset');
//var $origin_paypal_email = $('#origin_paypal_email');
//var $paypal_email = $('#paypal_email');

$(document).ready(function () {
    $("#change_stripe_connect").click(function (event) {
        event.preventDefault();
        //$stripeDisplyFieldSet.hide();
        //$stripeConnectFieldSet.show();
        window.location = $('#stripe_connect_url').val();
    });
    $("#stripe_connect").click(function (event) {
        event.preventDefault();
        window.location = $('#stripe_connect_url').val();
    });
    //$paypal_email.on('input propertychange paste', function (event) {
    //    $payalChangeFieldSet.show();
    //});
});

//function switchToPaypal($usingPaypal) {
//    $('#cb_use_paypal').prop('checked', $usingPaypal);
//    if ($usingPaypal) {
//        $('#use_paypal').val(1);
//        $payalDisplayFieldSet.show();
//        if ($paypal_email.val() == '' || $paypal_email.val() != $origin_paypal_email.val())
//            $payalChangeFieldSet.show();
//        $stripeDisplyFieldSet.hide();
//        $stripeConnectFieldSet.hide();
//    } else {
//        $('#use_paypal').val(0);
//        $payalDisplayFieldSet.hide();
//        $payalChangeFieldSet.hide();
//        $("#paypal_email").val('');
//        $("#confirm_paypal_email").val('');
//        if ($('#stripe_connected').val() == 1) {
//            $stripeDisplyFieldSet.show();
//            $stripeConnectFieldSet.hide();
//        } else {
//            $stripeDisplyFieldSet.hide();
//            $stripeConnectFieldSet.show();
//        }
//    }
//}

jQuery(function($) {
    if ($('#stripe_connected').val() == 1) {
        $stripeDisplyFieldSet.show();
        $stripeConnectFieldSet.hide();
    } else {
        $stripeDisplyFieldSet.hide();
        $stripeConnectFieldSet.show();
    }
    //switchToPaypal($('#use_paypal').val() == 1);
    //
	//$('#cb_use_paypal').click(function() {
    //    if ($(this).is(':checked')) {
    //        $("#paypal_email").val($("#default_email").val());
    //    } else {
    //    }
	//	switchToPaypal($(this).is(':checked'));
	//});
});
