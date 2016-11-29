function setBuildHistory() {
    var request = new XMLHttpRequest();

    request.onload = function (response) {
        if (request.status === 200) {}
    }

    // Set up and make the request.
    request.open('GET', '/project/DeployTest/history/' + historyElementIds.length, true);
    request.send();
}

// Obsolete this
function setLastSuccessfulBuild(renderedBuildTypes, buildIdentifier) {
    var request = new XMLHttpRequest();
    buildTypeToCheck = renderedBuildTypes[renderedBuildTypes.length - 1];

    request.onload = function (response) {
        if (request.status === 200) {
            buildsForBuildType = JSON.parse(request.responseText).build;
            for (var buildIndex = 0; buildIndex < buildsForBuildType.length; buildIndex++) {
                if (buildsForBuildType[buildIndex].status == 'SUCCESS' && buildsForBuildType[buildIndex].state == 'finished') {
                    for (var i2 = 0; i2 < renderedBuildTypes.length; i2++) {
                        elemId = '#buildType' + renderedBuildTypes[i2]['id'] + buildIdentifier;
                        updateConfigurationStatus($(elemId), buildIdentifier, buildsForBuildType[buildIndex].number);
                    }

                    break;
                }
            }
        }
    }

    // Set up and make the request.
    request.open('GET', '/configuration/' + buildTypeToCheck.id + '/build/', true);
    request.send();
}

function setLastSuccessfulBuildChain(projectId) {
    
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
        stageElement.find('#ConfigurationTitle').html(stageElement.data('configName') + '</br>v' + build.version);

        cssClass = build.status;
        if (cssClass === 'UNKNOWN') {
            // setCanceledByStatus(buildToDisplay['id'], configElement);
        }

        if (build.running != null && build.running && !isElementBlinking(stageElement)) {
            startBlinking(stageElement);
        } else if (isElementBlinking(stageElement) && build.state === 'finished') {
            stopBlinking(stageElement);
            if (isLastConfigurationInChain && cssClass === 'SUCCESS') {
                // setLastSuccessfulBuild(lastCompleteElementIds, 'lastComplete');
            }
        }
    }

    updateStatusCss(stageElement, cssClass);
}

// Obsolete this perhaps
function updateConfigurationStatus(configElement, buildIdentifier, buildNumber = '', isLastConfigurationInChain = false) {
    var request = new XMLHttpRequest();

    request.onload = function (response) {
        if (request.status === 200) {
            var result = JSON.parse(request.responseText);

            var cssClass = 'None';
            if (result['count'] > 0) {
                var buildToDisplay = getBuildToDisplay(result['build'], buildIdentifier, buildNumber);
                if (buildToDisplay == null) {
                    return;
                }

                configElement.find('#ConfigurationTitle').html(configElement.data('configName') + '</br>v' + buildToDisplay['number']);

                cssClass = buildToDisplay['status'];
                if (cssClass === 'UNKNOWN') {
                    setCanceledByStatus(buildToDisplay['id'], configElement);
                }

                if (buildToDisplay['running'] != null && buildToDisplay['running'] && !isElementBlinking(configElement)) {
                    startBlinking(configElement);
                } else if (isElementBlinking(configElement) && buildToDisplay.state === 'finished') {
                    stopBlinking(configElement);
                    if (isLastConfigurationInChain && cssClass === 'SUCCESS') {
                        setLastSuccessfulBuild(lastCompleteElementIds, 'lastComplete');
                    }
                }
            }

            updateStatusCss(configElement, cssClass);
        }
    }

    // Set up and make the request.
    request.open('GET', '/configuration/' + configElement.data('configId') + '/build/', true);
    request.send();
}

function getBuildToDisplay(builds, buildIdentifier, buildNumber) {
    switch (buildIdentifier) {
    case 'current':
        for (var i = 0; i < builds.length; i++) {
            if (builds[i].state != 'queued') {
                return buildToDisplay = builds[i];
            }
        }

        return null;
        break;
    case 'lastComplete':
        for (var i = 0; i < builds.length; i++) {
            if (builds[i].number == buildNumber) {
                return builds[i];
            }
        }

        return null;
        break;
    default:
        return null;
        break;
    }
}
