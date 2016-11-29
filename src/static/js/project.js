var refreshInterval = 6 * 1000 * 1 * 1;
var currentChainElementIds, lastCompleteElementIds, historyElementIds;
var chainIdentifierCurrent = 'current', chainIdentifierLastComplete = 'lastComplete', chainIdentifierHistory = 'history';
var buildsToDisplayInHistory = 2;

function getProject(projectId, callback) {
    var request = new XMLHttpRequest();

    request.onload = function (response) {
        if (request.status === 200) {
            callback(JSON.parse(request.responseText));
        }
    }

    // Set up and make the request.
    request.open('GET', '/project/' + projectId, true);
    request.send();
}

function setProjectInfo(project) {
    jQuery.data(document.body, "projectId", project['id']);
    document.title = project['name'];
    var newProject = $('#projectContentTemplate').clone(true);
    newProject.removeClass('template');
    newProject.prop('id', 'project' + project['id']);
    newProject.find('#projectTitle').html(project['name'] + ' <small>' + (project['description'] != null ? project['description'] : '') + '</small>');
    newProject.find('#collapseLink').prop('href', '#collapse' + project['id']);
    newProject.find('#collapseDiv').prop('id', 'collapse' + project['id'])
    newProject.find('#collapseToggleIcon').click(function () {
        newProject.find("svg").hasClass("template") ?
        $("svg").removeClass("template") :
        $("svg").addClass("template");
    });

    currentChainElementIds = [];
    $('#mainDiv').prepend(newProject);
    var template = newProject.find('#collapse' + project['id']).find('#configurationTemplate');
    newProject.find('#collapse' + project['id']).find('#configurationTemplate').remove();

    var buildIdentifier,
    elemId;

    // Set current build chain
    buildIdentifier = 'current';
    var renderedBuildTypes = setConfigurations(
            template,
            newProject.find('#collapse' + project['id']),
            project['buildTypes']['buildType'],
            buildIdentifier);

    currentChainElementIds.push({
        builds: renderedBuildTypes,
        status: 'current'
    });

    updateCurrentBuildChain();

    // Set last complete build chain
    buildIdentifier = 'lastComplete';
    lastCompleteElementIds = setConfigurations(
            template,
            newProject.find('#collapse' + project['id']),
            project['buildTypes']['buildType'],
            buildIdentifier);

    setLastSuccessfulBuild(lastCompleteElementIds, buildIdentifier);

    // Last n builds (n = buildsToDisplayInHistory)
    historyElementIds = [];
    for (var x = 0; x < buildsToDisplayInHistory; x++) {
        var addedBuilds = setConfigurations(
                template,
                newProject.find('#collapse' + project['id']),
                project['buildTypes']['buildType'],
                chainIdentifierHistory + (x > 0 ? x : ''));

        historyElementIds.push({
            buildTypes: addedBuilds,
            identifier: chainIdentifierHistory + (x > 0 ? x : '')
        });
    }

    setBuildHistory();

    // Set update
    setInterval(updateCurrentBuildChain, refreshInterval);
}

function fakeRefresh() {
    var str = 'Fake refresh: ';
    for (var index = 0; index < currentChainElementIds.length; index++) {
        for (var index = 0; index < currentChainElementIds.length; index++) {
            // alert('builds count: ' + currentChainElementIds[index].builds.length);
            for (var build = 0; build < currentChainElementIds[index].builds.length; build++) {
                if (index === 0 && build === 0) {
                    var elemId = '#buildType' + currentChainElementIds[index].builds[build]['id'] + currentChainElementIds[index].status;
                    // alert('config: ' + 'conf' + '; element id: ' + elemId);
                    updateConfigurationStatus($(elemId), currentChainElementIds[index].status);
                    // var elem = $('buildType' + currentChainElementIds[index].builds[build]['id'] + currentChainElementIds[index].status);
                    // alert('Elem is ' + elem + '; with id ' + elem.id);
                }
            }
        }
    }

    // alert(str);
}

// Här vet vi inget om vilket bygge det är, endast vilken konfiguration... borde kunna användas för att skapa historik...
function setConfigurations(template, configurationDiv, buildTypes, buildIdentifier) {
    switch (buildIdentifier) {
    case 'current':
        var btn = '' // '<a class="btn" href="/configuration/DeployTest_ContinuousIntegration/trigger/">Trigger build</a>'
            configurationDiv.append('Current build chain' + btn);
        break;
    case 'lastComplete':
        configurationDiv.append('Last complete build chain');
        break;
    case 'history':
        configurationDiv.append('Build chain history');
        break;
    default:
        configurationDiv.append('&ensp;');
        break;
    }

    for (var i = 0; i < buildTypes.length; i++) {
        var clone = template.clone();
        clone.prop('id', 'buildType' + buildTypes[i]['id'] + buildIdentifier);
        clone.find('#ConfigurationTitle').html(buildTypes[i]['name'] + '</br>v');
        clone.data('configId', buildTypes[i]['id']);
        clone.data('configName', buildTypes[i]['name']);
        clone.css('position', 'relative');
        clone.css('left', i * 30 + 'px');
        configurationDiv.append(clone);
        if (i > 0) {
            jsPlumb.connect({
                source: ('buildType' + buildTypes[i - 1]['id'] + buildIdentifier),
                target: ('buildType' + buildTypes[i]['id'] + buildIdentifier),
                anchors: ["Right", "Left"],
                endpoint: "Blank",
                connector: "Straight",
                overlays: ["Arrow"],
                connectorOverlays: "Arrow",
                detachable: false
            });
        }

        // updateConfigurationStatus(clone, buildIdentifier);
    }

    return buildTypes;
}

function triggerBuild(configurationId) {

    var request = new XMLHttpRequest();

    request.onload = function (response) {
        if (request.status === 200) {}
    }

    request.open('GET', '/configuration/' + configurationId + '/trigger/', true);
    request.send();
}
