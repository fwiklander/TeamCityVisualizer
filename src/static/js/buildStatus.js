function setBuildHistory() {
    projectId = jQuery.data(document.body, "projectId");
    var request = new XMLHttpRequest();

    request.onload = function (response) {
        if (request.status === 200) {}
    }

    // Set up and make the request.
    request.open('GET', '/project/' + projectId + '/history' + buildsToDisplayInHistory, true);
    request.send();
}

function setLastSuccessfulBuildChain() {
    projectId = jQuery.data(document.body, "projectId");
    var request = new XMLHttpRequest();

    request.onload = function (response) {
        if (request.status === 200) {
            result = JSON.parse(request.responseText);
            count = result.buildTypeCount;
            if(count > 0){
                $('#buildChainHeader' + chainIdentifierLastComplete).children('span').html(' - v' + result.version);
                var buildChain = result.chain;
                buildChain.forEach(function(chainItem){
                    var elemId = '#buildType' + chainItem.buildTypeId + chainIdentifierLastComplete;
                    updateBuildStage(elemId, chainItem, false);
                });
            }
        }
    }

    // Set up and make the request.
    request.open('GET', '/project/' + projectId + '/lastCompleteBuildChain', true);
    request.send();
}

function updateCurrentBuildChain() {
    projectId = jQuery.data(document.body, "projectId");
    var request = new XMLHttpRequest();

    request.onload = function (response) {
        if (request.status === 200) {
            result = JSON.parse(request.responseText);
            count = result.buildStageCount;
            if (count > 0) {
                buildStages = result.buildStages;
                for (var stageIndex = 0; stageIndex < count; stageIndex++) {
                    buildStage = buildStages[stageIndex];
                    var elemId = '#buildType' + buildStage.id + chainIdentifierCurrent;
                    var isLastConfiguration = (stageIndex == count - 1);
                    updateBuildStage(elemId, buildStage.lastBuild, isLastConfiguration);
                }
            }
        }
    }

    // Set up and make the request.
    request.open('GET', '/project/' + projectId + '/currentBuildChain', true);
    request.send();
}

function updateBuildStage(elemId, build, isLastConfigurationInChain) {
    var stageElement = $(elemId);

    var cssClass = 'None';
    if (build != null) {
        stageElement.find('#ConfigurationTitle').html(stageElement.data('configName') + (build.version != null ? ('</br>v' + build.version) : ''));

        cssClass = build.status;
        if (cssClass === 'UNKNOWN') {
            // setCanceledByStatus(buildToDisplay['id'], configElement);
        }

        if (build.running != null && build.running && !isElementBlinking(stageElement)) {
            startBlinking(stageElement);
        } else if (isElementBlinking(stageElement) && build.state === 'finished') {
            stopBlinking(stageElement);
            if (isLastConfigurationInChain && cssClass === 'SUCCESS') {
                setLastSuccessfulBuildChain();
            }
        }
    }

    updateStatusCss(stageElement, cssClass);
}