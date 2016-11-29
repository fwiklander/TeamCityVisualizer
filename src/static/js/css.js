function setCanceledByStatus(buildNo, elem) {
    var request = new XMLHttpRequest();

    request.onload = function (response) {
        if (request.status === 200) {
            var result = JSON.parse(request.responseText);
            elem.attr(
                'title',
                'Build canceled by ' + result['canceledInfo']['user']['name'] +
                '; Reason: ' + result['canceledInfo']['text']);
        } else {
            alert('Error code: ' + request.status)
        }
    }

    request.open('GET', '/build/' + buildNo, true);
    request.send();
}

function isElementBlinking(elem) {
    var isBlinking = elem.hasClass('buildOngoing');
    return isBlinking;
}

function startBlinking(elem) {
    elem.addClass('buildOngoing');
}

function stopBlinking(elem) {
    elem.removeClass('buildOngoing');
}

function updateStatusCss(elem, newStatus) {
    if (!elem.hasClass(newStatus)) {
        elem.removeClass('SUCCESS');
        elem.removeClass('FAILURE');
        elem.removeClass('None');

        elem.addClass(newStatus)
    }
}