var itemsLimit = 25;
var itemsOffset = 0;
var galleryUrl = window.location.href;
$(document).ready(function(){
    $('#load-more-btn').click(function(){
        itemsOffset = itemsOffset + itemsLimit;
        ajaxPagingUrl = galleryUrl  + '/ajaxpaging/' + itemsLimit + '/' + itemsOffset;
        $.ajax({
            method: 'GET',
            url: ajaxPagingUrl,
        }).done(function(msg){
            $('#artwork_main').append(msg);
            var checkout = $('#checkout').val();
            if ( checkout == 0 ) {
                $('#load-more').hide();
            }
        });
    });
});
