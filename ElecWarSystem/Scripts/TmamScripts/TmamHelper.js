﻿

window.onload = function () {
    RequestTmamStatus();
    numbersE2A();
}
function RequestTmamStatus() {
    $.ajax({
        url: window.location.origin + "/Tmam/GetTmamStatus",
        type: "GET",
        async: true,
        success: function (result) {
            ShowAlertAccordingToStatus(result);
        }
    })
}
function ShowAlertAccordingToStatus(vacationStatus) { // إعادة تسمية المتغير
    $("#alertBox").empty();
    var alertHtml = "";
    $(".hide-after-send").attr('hidden', 'hidden');

    if (!vacationStatus["Submitted"] && !vacationStatus["Recieved"]) {
        $(".hide-after-send").removeAttr('hidden');
        alertHtml = `
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
            <i class="fas fa-exclamation-triangle alert-icon"></i>
            <span class="alert-text">إحترس! لم يتم إرسال التمام حتى الأن</span>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
    } else if (vacationStatus["Recieved"] && vacationStatus["Submitted"]) {
        alertHtml = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="fas fa-check-circle alert-icon"></i>
            <span class="alert-text">تم إرسال التمام إلى مركز عمليات 250 و تم تأكيد الإستلام بنجاح!</span>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
    } else if (!vacationStatus["Recieved"] && vacationStatus["Submitted"]) {
        alertHtml = `
        <div class="alert alert-info alert-dismissible fade show" role="alert">
            <i class="fas fa-info-circle alert-icon"></i>
            <span class="alert-text">تم إرسال التمام إلى مركز عمليات 250 و منتَظَر تأكيد الإستلام</span>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
    }

    $("#alertBox").append(alertHtml);
}

$(document).ready(function () {
    var vacationStatus = { "Submitted": true, "Recieved": false }; // إعادة تسمية المتغير
    ShowAlertAccordingToStatus(vacationStatus);
});

const timeFrom = new Date(1, 1, 1, 22, 0, 0);
const timeTo = new Date(1, 1, 1, 23, 59, 59);
var timeOutCounter = false

function getDateFormated(date) {
    date = new Date(parseInt(date.substr(6)));
    var yyyy = date.getFullYear();
    var mm = date.getMonth() + 1;
    var dd = date.getDate();
    if (mm < 10)
        mm = '0' + mm;
    if (dd < 10)
        dd = '0' + dd;
    return numbersEn2Ar(`${yyyy}/${mm}/${dd}`);
}

function calOut(power) {
    if ($("#existing").val() > power) {
        $("#existing").val(power);
    }
    $("#outdoor").val(power - $("#existing").val());
}

function getTimeInSeconds(date) {
    return (date.getHours() * 60 * 60) + (date.getMinutes() * 60) + date.getSeconds();
}

function timeInRange(timeInSeconds) {
    return (timeInSeconds > getTimeInSeconds(timeFrom) && timeInSeconds < getTimeInSeconds(timeTo));
}

function getTimeRemain(timeInSeconds) {
    var timeRamain = 0;
    var hours = Math.floor(timeInSeconds / (60 * 60));
    timeRamain = timeInSeconds % (60 * 60);
    hours = (hours >= 10) ? hours.toString() : `0${hours}`;
    var minutes = Math.floor(timeRamain / 60);
    minutes = (minutes >= 10) ? minutes.toString() : `0${minutes}`;
    var seconds = timeRamain % 60;
    seconds = (seconds >= 10) ? seconds.toString() : `0${seconds}`;
    return `${hours}:${minutes}:${seconds}`;
}

//setInterval(
//    function () {
//        const d = new Date();
//        if (timeInRange(getTimeInSeconds(d))) {
//            $("#time").text("00:00:00");
//            $(".timeout").attr('readonly', 'readonly');
//            $(".timeout-btn").attr('disabled', 'disabled');
//            $(".hide-after-send").removeAttr('hidden');
//            timeOutCounter = true;
//        } else {
//            var time = numbersEn2Ar(getTimeRemain(getTimeInSeconds(timeFrom) - getTimeInSeconds(d)));
//            $("#time").text(time);
//            $(".timeout").removeAttr('readonly');
//            $(".timeout-btn").removeAttr('disabled');
//            timeOutCounter = false;
//        }
//    }, 1000);

function calOut(power) {
    var power = parseInt($("#power").val());
    var exsting = parseInt($("#existing").val());
    var outing = power - exsting;
    $("#outdoor").val(outing);
}

function toTmamDetails(pg) {
    var sum = parseInt($("#errand").val()) +
            parseInt($("#vacation").val()) +
            parseInt($("#sick-leave").val()) +
            parseInt($("#prison").val()) +
            parseInt($("#absence").val()) +
            parseInt($("#hospital").val()) +
            parseInt($("#out-of-country").val()) +
            parseInt($("#outdoor-camp").val()) +
            parseInt($("#course").val());

    if (parseInt($("#outdoor").val()) !== sum) {
        alert("خطأ فى تجميع التمام!!!");
    }
    else {
        $.ajax({
            url: window.location.origin + "/Tmam/AddTmamDetail",
            type: "POST",
            async: false,
            data: {
                "IsOfficers": (pg == 1) ? true : false,
                "totalPower": parseInt($("#power").val()),
                "errand": parseInt($("#errand").val()),
                "vacation": parseInt($("#vacation").val()),
                "sickLeave": parseInt($("#sick-leave").val()),
                "prison": parseInt($("#prison").val()),
                "absence": parseInt($("#absence").val()),
                "hospital": parseInt($("#hospital").val()),
                "outOfCountry": parseInt($("#out-of-country").val()),
                "outdoorCamp": parseInt($("#outdoor-camp").val()),
                "course": parseInt($("#course").val()),
                "Tmam.AltCommanderID": parseInt($("#person-name").val())
            },
            success: function () {
                if (pg == 2) {
                    window.location.href = window.location.origin + "/sickleave/Index";
                }
                else {
                    window.location.href = window.location.origin + "/Tmam/Index?pg=" + (pg + 1);
                }
            }
        })
    }
}
function UpdatePersonComboBox() {
    $.ajax({
        url: window.location.origin + "/Person/GetPersonsOfRank",
        type: "GET",
        async: false,
        data: {
            "rankID": $("#person-rank").val()
        }, success: function (result) {
            $("#person-name").empty();
            $("#person-name").append("<option></option>");
            for (var index in result) {
                var item = `<option value="${result[index]['ID']}">${result[index]['FullName']}</option>`;
                $("#person-name").append(item);
            }
        }
    })
}
function SubmitTmam() {
    var warning = confirm("إحذر عندما ترسل التمام إلى 250 لا يمكنك تعديله مرة أخرى طبقا لتعليمات إدارة الحرب الإلكترونية برجاء التأكد من صحة التمام قبل إرساله\n هل أنت متأكد من إرسال التمام؟");
    if (warning) {
        $.ajax({
            url: window.location.origin + "/Tmam/SubmiitTmam",
            type: "POST",
            async: false,
            success: function (result) {
                if (result == "") {
                    window.location.href = window.location.origin + "/Tmam/Review"
                } else {
                    alert(`يوجد الأخطاء التالية فى التمام!!! ${result}`);
                }
            }
        })
    }
}




