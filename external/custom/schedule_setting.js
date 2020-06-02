var SCHEDULE_ACTION_OK = 0;
var SCHEDULE_ACTION_FAIL = 1;
var SCHEDULE_ACTION_DUPLICATE = 2;
var SCHEDULE_ACTION_NOT_FOUND = 3;
var SCHEDULE_ACTION_INVALID_INPUT = 4;

var SCHEDULE_TYPE_DATE = "9";

var current_schedule_template_id = -1;
var current_schedule_item_id = -1;
var current_schedule_set_id = -1;
var schedule_edit_mode = false;
var schedule_copy_mode = false;

var scheduleTemplateNames = [];
var scheduleItemList = [];
var scheduleSetList = [];

$(document).ready(function () {
    if (typeof newSetup !== 'undefined' && newSetup) { // variables set in .volt
        ok = confirm("It seems that you don't have any scheduling setting yet.\n\nDo you want a scheduling sample created for you to start with (recommended)?");
        if (ok)
            window.location.href = createSampleScheduleSetUrl;
        else
            window.location.href = scheduleTemplatesUrl;
    }
    
    if (typeof scheduleTemplateIdList !== 'undefined') {
        var scheduleTemplateIdArray = scheduleTemplateIdList.split(",");
        var scheduleTemplateNameArray = scheduleTemplateNameList.split(",");
        for (var i = 0; i < scheduleTemplateIdArray.length; i++) {
            scheduleTemplateNames[scheduleTemplateIdArray[i]] = scheduleTemplateNameArray[i];
        }
    }
    
    if (typeof scheduleItemIdList !== 'undefined') {
        var scheduleItemIdArray = scheduleItemIdList.split(",");
        var scheduleItemTypeArray = scheduleItemTypeList.split(",");
        var scheduleItemArtworkArray = scheduleItemArtworkList.split(",");
        var scheduleItemUrlArray = scheduleItemUrlList.split(",");
        var scheduleItemTimeArray = scheduleItemTimeList.split(",");
        var scheduleItemPreviousArray = scheduleItemPreviousList.split(",");
        var scheduleItemNextArray = scheduleItemNextList.split(",");
        for (var i = 0; i < scheduleItemIdArray.length; i++) {
            scheduleItemList[scheduleItemIdArray[i]] = {
                schedule_item_type: scheduleItemTypeArray[i],
                artwork: scheduleItemArtworkArray[i],
                url: scheduleItemUrlArray[i],
                schedule_time: scheduleItemTimeArray[i],
                previous: scheduleItemPreviousArray[i],
                next: scheduleItemNextArray[i]
            };
        }
    }
    
    if (typeof scheduleSetIdList !== 'undefined') {
        var scheduleSetIdArray = scheduleSetIdList.split(",");
        var scheduleSetTypeArray = scheduleSetTypeList.split(",");
        var scheduleSetDatekArray = scheduleSetDateList.split(",");
        var scheduleSetTemplateArray = scheduleSetTemplateList.split(",");
        for (var i = 0; i < scheduleSetIdArray.length; i++) {
            scheduleSetList[scheduleSetIdArray[i]] = {
                schedule_set_type: scheduleSetTypeArray[i],
                schedule_set_date: scheduleSetDatekArray[i],
                schedule_set_template: scheduleSetTemplateArray[i],
            };
        }
    }
});

//Click on add schedule template button
$('#add_schedule_template_button').click(function() {
    current_schedule_template_id = -1;
    $("#enter_template_name_text_input").val("");
    $("#enter_template_name_text_input").focus();
    schedule_edit_mode = false;
    schedule_copy_mode = false;
    $("#submit_template_input_button").html(addTemplateLabel);
    $('#enter-schedule-template-name-popup').modal({show: true});
});

$('#submit_template_input_button').click(function() {
    var template_name = $("#enter_template_name_text_input").val().toString().trim();
    if (template_name.length > 0 && templateNameRegex.test(template_name)) {
        var api_url;
        if (schedule_copy_mode)
            api_url = copyTemplateNameUrl;
        else if (schedule_edit_mode)
            api_url = updateTemplateNameUrl;
        else
            api_url = addTemplateUrl;
        $.ajax({
            url: api_url,
            type: "POST",
            dataType: "text",
            data: {
                "template_id": current_schedule_template_id,
                "template_name": template_name
            },
            beforeSend: function() {
            },
            complete:function(){
            },
            success: function(data) {
                var jsonData = jQuery.parseJSON(data);
                if (jsonData.result_code == SCHEDULE_ACTION_OK) {
                    location.reload();
                } else if (jsonData.result_code == SCHEDULE_ACTION_DUPLICATE) {
                    alert('Schedule template "' + template_name + '" already exists.');
                } else if (jsonData.result_code == SCHEDULE_ACTION_INVALID_INPUT) {
                    alert('Please check your input.');
                } else {
                    alert('The server failed to add the schedule template.');
                }
            },
            error: function(data) {
            }
        }).done(function() {
        });
    } else{
        alert('Please enter a valid schedule template name (without ",").');
    }
});

$('#enter-schedule-template-name-content').click(function(e) {
    e.stopPropagation();
});

$("#schedule_item_type_dropdown").change(onScheduleItemTypeChanged);

//Click on add schedule item button
$('#add_schedule_item_button').click(function() {
    current_schedule_item_id = -1;
    $("#schedule_item_type_dropdown").val('1');
    $("#schedule_item_type_dropdown").focus();
    $("#artwork_dropdown").val('0');
    $("#url_dropdown").val('0');
    $("#schedule_time").val('12:00');
    onScheduleItemTypeChanged();
    schedule_edit_mode = false;
    $("#submit_schedule_item_button").html(addScheduleItemLabel);
    $("#delete_schedule_item_button").html(cancelScheduleItemLabel);
    $('#enter-schedule-item-popup').modal({show: true});
});

$('#submit_schedule_item_button').click(function() {
    var api_url;
    if (schedule_edit_mode)
        api_url= updateScheduleItemUrl; // set in .volt
    else
        api_url= addScheduleItemUrl; // set in .volt
    $.ajax({
        url: api_url,
        type: "POST",
        dataType: "text",
        data: {
            "template_id": templateId, // set in .volt
            "schedule_item_id": current_schedule_item_id,
            "schedule_item_type": $("#schedule_item_type_dropdown").val(),
            "artwork":  $("#artwork_dropdown").val(),
            "url": $("#url_dropdown").val(),
            "schedule_time": $("#schedule_time").val(),
        },
        beforeSend: function() {
        },
        complete:function(){
        },
        success: function(data) {
            var jsonData = jQuery.parseJSON(data);
            if (jsonData.result_code == SCHEDULE_ACTION_OK) {
                location.reload();
                refreshDeviceScheduleSet(); // defined in device_control.js
            } else if (jsonData.result_code == SCHEDULE_ACTION_DUPLICATE) {
                alert('Duplicate schedule time ' + $("#schedule_time").val() + '.');
            } else if (jsonData.result_code == SCHEDULE_ACTION_INVALID_INPUT) {
                $('#enter-schedule-item-popup').modal({show: true});
                alert('Please check your input.');
            } else {
                alert('The server failed to add the schedule.');
            }
        },
        error: function(data) {
        }
    }).done(function() {
    });
});

$('#delete_schedule_item_button').click(function() {
    if (!schedule_edit_mode) {
        $('#enter-schedule-item-popup').modal('hide');
        return;
    }
    
    $.ajax({
        url: deleteScheduleItemUrl, // set in .volt
        type: "POST",
        dataType: "text",
        data: {
            "template_id": templateId, // set in .volt
            "schedule_item_id": current_schedule_item_id,
        },
        beforeSend: function() {
        },
        complete:function(){
        },
        success: function(data) {
            var jsonData = jQuery.parseJSON(data);
            if (jsonData.result_code == SCHEDULE_ACTION_OK) {
                location.reload();
                refreshDeviceScheduleSet(); // defined in device_control.js
            } else if (jsonData.result_code == SCHEDULE_ACTION_NOT_FOUNC) {
                alert('Please check your input.');
            } else {
                alert('The server failed to delete the schedule.');
            }
        },
        error: function(data) {
        }
    }).done(function() {
    });
});

$('#enter-schedule-item-content').click(function(e) {
    e.stopPropagation();
});

$('#previous_schedule_item_button').click(function() {
    schedule_item_id = getPreviousScheduleItem(current_schedule_item_id);
    if (schedule_item_id > 0)
        editScheduleItem(schedule_item_id);
});

$('#next_schedule_item_button').click(function() {
    schedule_item_id = getNextScheduleItem(current_schedule_item_id);
    if (schedule_item_id > 0)
        editScheduleItem(schedule_item_id);
});

$('#add_schedule_set_button').click(function() {
    current_schedule_set_id = -1;
    $("#schedule_set_type_dropdown").val("");
    $("#schedule_set_type_dropdown").focus();
    $("#schedule_set_date").val("");
    $("#schedule_set_template_dropdown").val("");
    schedule_edit_mode = false;
    $("#submit_schedule_set_button").html(addScheduleSetLabel);
    onScheduleSetTypeChanged();
    $('#enter-schedule-set-popup').modal({show: true});
});

function onScheduleItemTypeChanged() {
    if ($("#schedule_item_type_dropdown").val() == 1) {
        $("#artwork_dropdown").show();
        $("#url_dropdown").hide();
    } else if ($("#schedule_item_type_dropdown").val() == 2) {
        $("#artwork_dropdown").hide();
        $("#url_dropdown").show();
    } else {
        $("#artwork_dropdown").hide();
        $("#url_dropdown").hide();
    }
}

function editTemplateName(schedule_template_id) {
    current_schedule_template_id = schedule_template_id;
    $("#enter_template_name_text_input").val(getScheduleTemplateName(schedule_template_id));
    $("#enter_template_name_text_input").focus();
    schedule_edit_mode = true;
    schedule_copy_mode = false;
    $("#submit_template_input_button").html(updateTemplateNameLabel);
    $('#enter-schedule-template-name-popup').modal({show: true});
}

function copyScheduleTemplate(schedule_template_id) {
    current_schedule_template_id = schedule_template_id;
    $("#enter_template_name_text_input").val("");
    $("#enter_template_name_text_input").focus();
    schedule_copy_mode = true;
    $("#submit_template_input_button").html(copyTemplateLabel);
    $('#enter-schedule-template-name-popup').modal({show: true});
}

function deleteScheduleTemplate(schedule_template_id) {
    $.ajax({
        url: deleteTemplateUrl, // set in .volt
        type: "POST",
        dataType: "text",
        data: {
            "template_id": schedule_template_id,
        },
        beforeSend: function() {
        },
        complete:function(){
        },
        success: function(data) {
            var jsonData = jQuery.parseJSON(data);
            if (jsonData.result_code == SCHEDULE_ACTION_OK) {
                location.reload();
                refreshDeviceScheduleSet(); // defined in device_control.js
            } else if (jsonData.result_code == SCHEDULE_ACTION_INVALID_INPUT) {
                alert('The template is in use.');
            } else {
                alert('The server failed to delete the schedule.');
            }
        },
        error: function(data) {
        }
    }).done(function() {
    });
}

function editScheduleItem(schedule_item_id) {
    current_schedule_item_id = schedule_item_id;
    $("#schedule_item_type_dropdown").val(getScheduleItemType(schedule_item_id));
    $("#schedule_item_type_dropdown").focus();
    $("#artwork_dropdown").val(getScheduleItemArtwork(schedule_item_id));
    $("#url_dropdown").val(getScheduleItemUrl(schedule_item_id));
    $("#schedule_time").val(getScheduleItemTime(schedule_item_id));
    onScheduleItemTypeChanged();
    schedule_edit_mode = true;
    $("#submit_schedule_item_button").html(updateScheduleItemLabel);
    $("#delete_schedule_item_button").html(deleteScheduleItemLabel);
    $('#enter-schedule-item-popup').modal({show: true});
}

function getScheduleTemplateName(schedule_template_id) {
    if (typeof scheduleTemplateNames[schedule_template_id] === 'undefined')
        return "";
    else
        return scheduleTemplateNames[schedule_template_id];
}

function getPreviousScheduleItem(schedule_item_id) {
    if (typeof scheduleItemList[schedule_item_id] === 'undefined')
        return -1;
    else
        return scheduleItemList[schedule_item_id]["previous"];
}

function getNextScheduleItem(schedule_item_id) {
    if (typeof scheduleItemList[schedule_item_id] === 'undefined')
        return -1;
    else
        return scheduleItemList[schedule_item_id]["next"];
}

function getScheduleItemType(schedule_item_id) {
    if (typeof scheduleItemList[schedule_item_id] === 'undefined')
        return -1;
    else
        return scheduleItemList[schedule_item_id]["schedule_item_type"];
}

function getScheduleItemArtwork(schedule_item_id) {
    if (typeof scheduleItemList[schedule_item_id] === 'undefined')
        return -1;
    else
        return scheduleItemList[schedule_item_id]["artwork"];
}

function getScheduleItemUrl(schedule_item_id) {
    if (typeof scheduleItemList[schedule_item_id] === 'undefined')
        return -1;
    else
        return scheduleItemList[schedule_item_id]["url"];
}

function getScheduleItemTime(schedule_item_id) {
    if (typeof scheduleItemList[schedule_item_id] === 'undefined')
        return '';
    else
        return scheduleItemList[schedule_item_id]["schedule_time"];
}

function editScheduleSet(schedule_set_id) {
    current_schedule_set_id = schedule_set_id;
    $("#schedule_set_type_dropdown").val(getScheduleSetType(schedule_set_id));
    $("#schedule_set_type_dropdown").focus();
    $("#schedule_set_date").val(getScheduleSetDate(schedule_set_id));
    $("#schedule_set_template_dropdown").val(getScheduleSetTemplate(schedule_set_id));
    schedule_edit_mode = true;
    $("#submit_schedule_set_button").html(updateScheduleSetLabel);
    onScheduleSetTypeChanged();
    $('#enter-schedule-set-popup').modal({show: true});
}

function onScheduleSetTypeChanged() {
    if ($("#schedule_set_type_dropdown").val() == SCHEDULE_TYPE_DATE) {
        $("#schedule_set_date").show();
    } else {
        $("#schedule_set_date").hide();
        $("#schedule_set_date").val("");
    }
}

$("#schedule_set_type_dropdown").change(onScheduleSetTypeChanged);

$('#submit_schedule_set_button').click(function() {
    var api_url;
    if (schedule_edit_mode)
        api_url= updateScheduleSetUrl; // set in .volt
    else
        api_url= addScheduleSetUrl; // set in .volt
    $.ajax({
        url: api_url,
        type: "POST",
        dataType: "text",
        data: {
            "schedule_set_id": current_schedule_set_id,
            "schedule_set_device_id": deviceId, // set in .volt
            "schedule_set_type": $("#schedule_set_type_dropdown").val(),
            "schedule_set_date": $("#schedule_set_date").val(),
            "schedule_set_template": $("#schedule_set_template_dropdown").val(),
        },
        beforeSend: function() {
        },
        complete:function(){
        },
        success: function(data) {
            var jsonData = jQuery.parseJSON(data);
            if (jsonData.result_code == SCHEDULE_ACTION_OK) {
                location.reload();
                refreshDeviceScheduleSet(); // defined in device_control.js
            } else if (jsonData.result_code == SCHEDULE_ACTION_DUPLICATE) {
                if ($("#schedule_set_type_dropdown").val() == SCHEDULE_TYPE_DATE)
                    alert('Duplicate recurrence type - ' + $("#schedule_set_type_dropdown option:selected").text() + ' ' +
                        $("#schedule_set_date").val() + '.');
                else
                    alert('Duplicate recurrence type - ' + $("#schedule_set_type_dropdown option:selected").text() + '.');
            } else if (jsonData.result_code == SCHEDULE_ACTION_INVALID_INPUT) {
                $('#enter-schedule-item-popup').modal({show: true});
                alert('Please check your input.');
            } else {
                alert('The server failed to add the schedule set.');
            }
        },
        error: function(data) {
        }
    }).done(function() {
    });
});

$('#enter-schedule-set-content').click(function(e) {
    e.stopPropagation();
});

function getScheduleSetType(schedule_set_id) {
    if (typeof scheduleSetList[schedule_set_id] === 'undefined')
        return -1;
    else
        return scheduleSetList[schedule_set_id]["schedule_set_type"];
}

function getScheduleSetDate(schedule_set_id) {
    if (typeof scheduleSetList[schedule_set_id] === 'undefined')
        return "";
    else
        return scheduleSetList[schedule_set_id]["schedule_set_date"];
}

function getScheduleSetTemplate(schedule_set_id) {
    if (typeof scheduleSetList[schedule_set_id] === 'undefined')
        return -1;
    else
        return scheduleSetList[schedule_set_id]["schedule_set_template"];
}
