function setBuildHistory() {
    projectId = jQuery.data(document.body, "projectId");
    var request = new XMLHttpRequest();

    request.onload = function (response) {
        if (request.status === 200) {
            result = JSON.parse(request.responseText);
            count = result.historyCount;
            if (count > 0) {
                var index = 0;
                result.history.forEach(function (historyItem) {
                    var dependencyBuildId = historyItem.buildChain[0].id;
                    var chainIdentifier = chainIdentifierHistory + (index > 0 ? index : '');
                    $('#buildChainHeader' + chainIdentifier).children('span').html('v' + historyItem.version);
                    historyItem.buildChain.forEach(function (buildChainItem) {
                        var elemId = '#buildType' + buildChainItem.buildStageId + chainIdentifier;
                        updateBuildStage(elemId, buildChainItem, false);
                    });
                    $('#buildChainHeader' + chainIdentifier).find('#promoteBuildButton').click(function () {
                        var request = new XMLHttpRequest();
                        request.onload = function (response) {
                            if (request.status === 200) {
                                alert('Build triggered for ' + dependencyBuildId);
                            } else {
                                alert('Build failed to trigger');
                            }
                        }

                        request.open('GET', '/project/' + projectId + '/promoteBuild/' + dependencyBuildId, true);
                        request.send();
                    });
                    index++;
                });
            }
        }
    }

    // Set up and make the request.
    request.open('GET', '/project/' + projectId + '/history/' + buildsToDisplayInHistory, true);
    request.send();
}

function setLastSuccessfulBuildChain() {
    projectId = jQuery.data(document.body, "projectId");
    var request = new XMLHttpRequest();

    request.onload = function(){
      if (request.status === 200) {
        result = JSON.parse(request.responseText);
        lastSuccessfulBuildOnSuccess(result);
      }
    }

    // Set up and make the request.
    request.open('GET', '/project/' + projectId + '/lastCompleteBuildChain', true);
    request.send();
}

function lastSuccessfulBuildOnSuccess(response){
  count = response.buildTypeCount;
  if (count > 0) {
    $('#buildChainHeader' + chainIdentifierLastComplete).children('span').html(' - v' + response.version);
    var buildChain = response.chain;
    buildChain.forEach(function (chainItem) {
      var elemId = '#buildType' + chainItem.buildStageId + chainIdentifierLastComplete;
      updateBuildStage(elemId, chainItem, false);
    });
  }
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

                    if (buildStage.pendingBuilds != null) {
                        var elemQueuedBuild = $(elemId).find('#queuedBuild');
                        if (elemQueuedBuild != null) {
                            elemQueuedBuild.prop('title', buildStage.pendingBuilds + ' build(s) in queue for this configuration');
                            elemQueuedBuild.attr('title', buildStage.pendingBuilds + ' build(s) in queue for this configuration');
                            if (buildStage.pendingBuilds > 0) {
                                elemQueuedBuild.removeClass('template');
                            } else {
                                elemQueuedBuild.addClass('template');
                            }
                        }
                    }
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

        // startBuildElem = stageElement.find('#startBuild');
        // alert('Start build elem is ' + startBuildElem);
        /*stageElement.find('#startBuild').click(function () {
            var request = new XMLHttpRequest();
            request.onload = function (response) {
                if (request.status === 200) {
                    alert('Build triggered');
                }
            }

            request.open('GET', '/configuration/' + build.buildStageId + '/trigger/' + build.id, true);
            request.send();
        });*/

        cssClass = build.status;
        if (cssClass === 'UNKNOWN') {
            // setCanceledByStatus(buildToDisplay['id'], configElement);
        }

        if (build.running != null && build.running && !isElementBlinking(stageElement)) {
            startBlinking(stageElement);
        } else if (isElementBlinking(stageElement) && build.state === 'finished') {
            stopBlinking(stageElement);
            setBuildHistory();
            if (isLastConfigurationInChain && cssClass === 'SUCCESS') {
                setLastSuccessfulBuildChain();
            }
        }
    }

    updateStatusCss(stageElement, cssClass);
}