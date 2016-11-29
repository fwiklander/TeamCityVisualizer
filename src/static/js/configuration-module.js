function setStatus(configurationId){
    var request = new XMLHttpRequest();

    request.onload = function(response) {
        if (request.status === 200)
        {
            var result = JSON.parse(request.responseText);

            var elementId = '#config' + configurationId;
            var cssClass = 'None';
            if(result['count'] > 0){
                var buildToDisplay;
                for(var i=0; i<result['count']; i++){
                    if(result['build'][i]['state'] != 'queued'){
                        buildToDisplay = result['build'][i];
                        break;
                    }
                }

                cssClass = buildToDisplay['status'];
                if(cssClass == 'UNKNOWN'){
                    setCanceledByStatus(buildToDisplay['id'], elementId);
                }

                if(buildToDisplay['running'] != null && buildToDisplay['running'] && !isElementBlinking(elementId)){
                    startBlinking(elementId);
                }
                else if(isElementBlinking(elementId) && (buildToDisplay['running'] == null || !buildToDisplay['running'])){
                    stopBlinking(elementId);
                }
            }

            updateStatusCss(elementId, cssClass);
        }
    }

    // Set up and make the request.
    request.open('GET', '/configuration/' + configurationId + '/build', true);
    request.send();
}

function setCanceledByStatus(buildNo, elementId){
    var request = new XMLHttpRequest();

    request.onload = function(response) {
        if (request.status === 200)
        {
            var result = JSON.parse(request.responseText);
            $(elementId).attr(
                'title',
                'Build canceled by ' + result['canceledInfo']['user']['name'] +
                '; Reason: ' + result['canceledInfo']['text']);
        }
        else{
            alert('Error code: ' + request.status)
        }
    }

    request.open('GET', '/build/' + buildNo, true);
    request.send();
}

function isElementBlinking(elementId){
    var isBlinking = $(elementId).hasClass('buildOngoing');
    // alert('is blinking: ' + isBlinking);
    return isBlinking;
}

function startBlinking(elementId){
    // alert('start blinking');
    $(elementId).addClass('buildOngoing');
}

function stopBlinking(elementId){
    // alert('stop blinking');
    $(elementId).removeClass('buildOngoing');
}

function updateStatusCss(elementId, newStatus){
    if(!$(elementId).hasClass(newStatus)){
        $(elementId).removeClass('SUCCESS');
        $(elementId).removeClass('FAILURE');
        $(elementId).removeClass('None');

        $(elementId).addClass(newStatus)
    }
}