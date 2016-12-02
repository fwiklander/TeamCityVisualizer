var refreshHours = 4;
var refreshMinutes = 0;
var refreshSeconds = 0;
var refreshInterval = (refreshHours * 3600 + refreshMinutes * 60  + refreshSeconds) * 1000;
var currentChainElementIds, historyElementIds;
var chainIdentifierCurrent = 'current', chainIdentifierLastComplete = 'lastComplete', chainIdentifierHistory = 'history';
var buildsToDisplayInHistory = 5;

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
    newProject.find('#collapseDiv').prop('id', 'collapse' + project['id']);
    newProject.find('#collapseToggleIcon').click(function () {
        newProject.find("svg").hasClass("template") ?
        $("svg").removeClass("template") :
        $("svg").addClass("template");
    });

    currentChainElementIds = [];
    $('#mainDiv').prepend(newProject);
    var template = newProject.find('#collapse' + project['id']).find('#configurationTemplate');
    newProject.find('#collapse' + project['id']).find('#configurationTemplate').remove();

    // Set current build chain
    setConfigurations(
        template,
        newProject.find('#collapse' + project['id']),
        project['buildTypes']['buildType'],
        chainIdentifierCurrent);

    updateCurrentBuildChain();

    // Set last complete build chain
    setConfigurations(
        template,
        newProject.find('#collapse' + project['id']),
        project['buildTypes']['buildType'],
        chainIdentifierLastComplete);

    setLastSuccessfulBuildChain();

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
    updateCurrentBuildChain();
}

function setConfigurations(template, configurationDiv, buildTypes, buildIdentifier) {
    var divElement = '<div id="buildChainHeader' + buildIdentifier + '" style="margin-top: 15px;">';
    var versionTemp = '';
    switch (buildIdentifier) {
    case chainIdentifierCurrent:
        divElement += 'Current build chain';
        break;
    case chainIdentifierLastComplete:
        divElement += 'Last complete build chain';
        break;
    case chainIdentifierHistory:
        divElement += 'Build chain history</br>';
        versionTemp = 'v';
        break;
    default:
        versionTemp = 'v';
        break;
    }

    divElement += '<span style="font-size: large;">' + versionTemp +'</span></div>';
    configurationDiv.append(divElement);

    for (var i = 0; i < buildTypes.length; i++) {
        var clone = template.clone();
        clone.prop('id', 'buildType' + buildTypes[i]['id'] + buildIdentifier);
        clone.find('#ConfigurationTitle').html(buildTypes[i].name + '</br>v');
        clone.data('configId', buildTypes[i]['id']);
        clone.data('configName', buildTypes[i]['name']);
        clone.css('position', 'relative');
        clone.css('left', i * 30 + 'px');
        configurationDiv.append(clone);
        if (i > 0) {
            jsPlumb.connect({
                source: ('buildType' + buildTypes[i - 1].id + buildIdentifier),
                target: ('buildType' + buildTypes[i].id + buildIdentifier),
                anchors: ["Right", "Left"],
                endpoint: "Blank",
                connector: "Straight",
                overlays: ["Arrow"],
                connectorOverlays: "Arrow",
                detachable: false
            });
        }
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
