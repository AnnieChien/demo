var REMOVE_COLLECTION_OK = 1;

$('.btn-remove').click(function () {
    var artwork_installed_id = $(this).attr('artwork_installed');
    removeCollection(artwork_installed_id);
    return false;
});

function removeCollection(artwork_installed_id)
{
    var removeCollectionUrl = $("#removeCollectionUrl").val();
    var api_url = removeCollectionUrl + artwork_installed_id;
    $.ajax({
        url: api_url,
        type: "POST",
        dataType: "text",
        beforeSend: function() {
        },
        complete:function(){
        },
        success: function(data) {
            if (data != REMOVE_COLLECTION_OK) {
                return;
            }
            $(".artwork_installed" + artwork_installed_id).remove();
        },
        error: function(data) {
        }
    }).done(function() {
    });
}