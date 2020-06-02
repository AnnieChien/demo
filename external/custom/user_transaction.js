//$(document).ready(function () {
    i18n.translator.add(user_transactionTranslations);
    $("#button_deposit").click(function () {
        message = "Are you sure you want to deposit " +
            $("#deposit_amount").val() + " " + $("#default_currency").val() + " to " +
            $("#deposit_method").val() + "?";
        if (!confirm(message))
            return false;
        
        url = $("#button_deposit").attr("url") + $("#deposit_amount").val();
        window.location = url;
    });
    $("#button_deposit_details").click(function () {
        url = $("#button_deposit_details").attr("url");
        window.location = url;
    });
    $("#button_stripe_connect_details").click(function () {
        url = $("#button_stripe_connect_details").attr("url");
        window.location = url;
    });
    $("#button_setting").click(function () {
        url = $("#button_setting").attr("url");
        window.location = url;
    });

    //configure icons link
    var icons = $('.actions');
    $.each(icons, function( index, value ) {
      var link = $(this).find('a:eq(0)').attr('href');
      if(typeof link !== 'undefined'){
        $(this).parent().attr('data-href', link);
      }
    });

    var square = $('.square');

    function squareResize(){
        var squareWidth = Math.floor($(window).width()/square.length);
        $.each(square, function(i, v){
            $(this).css({
                width: squareWidth+'px',
                opacity: 1
            });
        });
    }

    squareResize();

    $( window ).resize(function() {
        squareResize();
    });

    //Change time to relative time for easier reading
    /*var timestamp = $(".timeago");
    $.each(timestamp, function(){
        var relativeTime = $.timeago($(this).text());
        $(this).text(relativeTime);
    });*/

    //Click event for table row which bring user to payment detail page
    $('table').on('click', 'tbody tr', function(){
        window.location.href = $(this).attr('data-href');
    });

    if(__filterObj){
        var el = $('.filterArtwork:eq(0)');
        var ul = $('<ul />');
        var artworks = __filterObj.artworks;
        var baseURL = '/dashboard/';

        var overviewText = $('<a href="'+baseURL+'">' + i18n('Overview') + '</a>');
        $.each(artworks, function(i, item){
            var li = $('<li><a href="'+baseURL+item.artwork_id+'">'+item.name+'</a></li>');
            ul.append(li);
        });


        var all = $('<li />');
        all.append(overviewText);
        ul.prepend(all);

        var current = $('<h2 />');
        
        var filteredArtworkObj = null;
        if(__filterObj.artworkId !== ''){
            filteredArtworkObj = _.find(artworks, function(item){ return item.artwork_id ===  __filterObj.artworkId});
        }
        
        var currentSpan = $('<span>'+artworks.length + i18n(' artworks') + '</span>');
        var arrow = $('<div class="f_arrow" />');
        var overviewTextClone = overviewText.clone();
        if(filteredArtworkObj){
            overviewTextClone.text(filteredArtworkObj.name);
            if(filteredArtworkObj.number_of_editions){
                var remaining = filteredArtworkObj.number_of_editions - filteredArtworkObj.number_of_editions_sold; 
                currentSpan.text(remaining + i18n(' remaining'));   
            } else {
                currentSpan.text(i18n('Unlimited editions'));   
            }
        }
        overviewTextClone.append(arrow);
        current.append(overviewTextClone, currentSpan);
        
        var currentImage = $('<div class="currentImage" />');
        if(__filterObj.artworkId === ''){
            currentImage.addClass('profilePic');
        }
        var transactionHeaderImage = filteredArtworkObj ? filteredArtworkObj.image : __filterObj.artistImage;
        
        currentImage.css('background-image', 'url('+transactionHeaderImage+')');

        var whiteArrow = $('<div class="arrow-up" />');
        el.append(currentImage, current, ul, whiteArrow);

        var arrowPosition = arrow.offset();

        ul.css({
            left: arrowPosition.left-(ul.width()/2-90),
            top: arrowPosition.top + 40
        });
        
        whiteArrow.css({
            left: arrowPosition.left-2,
            top: arrowPosition.top + 36
        });
        //action
        var isFilterShow = false;
        el.on('click', function(evt){
            arrow.removeClass('up_arrow');
            isFilterShow = false;
            ul.toggle(isFilterShow);
            whiteArrow.toggle(isFilterShow);
        });

        current.on('click', function(){
            if(isFilterShow){
                arrow.removeClass('up_arrow');
                isFilterShow = false;
            } else {
                arrow.addClass('up_arrow');
                isFilterShow = true;
            }
            ul.toggle(isFilterShow);
            whiteArrow.toggle(isFilterShow);
            return false;
        })

    }

    $("#do_payment_setup_button").click(function () {
        url = $("#do_payment_setup_button").attr("url");
        $('#payment-setup-reminding-popup').modal('hide');
        window.location = url;
    });

    $("#not_now_button").click(function () {
        $.cookie('no_payment_setup_reminding_' + $("#not_now_button").attr("userid"), 1);
        $('#payment-setup-reminding-popup').modal('hide');
    });

    $.each(square, function(i, v){
        var _this = $(this);
        var num = _this.find('strong:first');
        var integer = num.text().replace(/\D+/g, '');
        if(num.attr('id') == 'pv_num' || num.attr('id') == 'works_num'){
            var comma_separator_number_step = $.animateNumber.numberStepFactories.separator(',')
            num.animateNumber({ 
                number: integer, 
                numberStep: comma_separator_number_step,
                easing: 'easeInQuad' 
            }, 1500, null);
        } else {
            var currencySign = num.text().substr(0, 1);
            var decimal_places;
            var idx = num.text().lastIndexOf('.');
            if (idx < 0)
                decimal_places = 0;
            else
                decimal_places = num.text().length - idx - 1;
            var decimal_factor = decimal_places === 0 ? 1 : Math.pow(10, decimal_places);

            num.animateNumber({
                number: integer,
                numberStep: function(now, tween) {
                    var floored_number = Math.floor(now) / decimal_factor,
                        target = $(tween.elem);

                    if (decimal_places > 0) {
                        // force decimal places even if they are 0
                        floored_number = floored_number.toFixed(decimal_places);
                        //thousands separator
                        if(floored_number > 1000){
                            floored_number = floored_number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        }
                    } else {
                        currencySign = '';
                    }
                    //FOR EU. floored_number = floored_number.toString().replace('.', ',');

                    target.text(currencySign + floored_number);
                }
            }, 1500);
        }
    });

    /*
    $('#num_of_res').animateNumber({ 
        number: TLDR_PLACE.restaurantCount, 
        numberStep: comma_separator_number_step,
        easing: 'easeInQuad' }, 1500, TLDR.initMap);*/
    
//});

$(document).ready(function () {
    //if ($("#payment-setup-reminding-popup").length) {
    //    if (!$.cookie('no_payment_setup_reminding_' + $("#not_now_button").attr("userid")))
    //        $('#payment-setup-reminding-popup').modal({show:true});
    //}
});

//$(function(){
//    $("#user-controller-grid-sold-grid").colResizable({liveDrag:true, draggingClass:""});
//});