/**
 * Created by tungbs on 6/11/2015.
 */
$(document).ready(function(){
    $('#reactivate-form').validate({
        rules: {
            email: {
                required: true,
                email: true
            }
        },
        messages: {
            email: {
                required: 'Please enter your email address.',
                email: 'Please enter a valid email address.'
            }
        }
    });
});
