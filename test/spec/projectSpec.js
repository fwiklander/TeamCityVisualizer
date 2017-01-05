describe("User messages", function () {
  beforeEach(function () {
    // jasmine.Ajax.install();
  });

  afterEach(function () {
    // jasmine.Ajax.uninstall();
  });

  describe("Tests for displayUserMessage", function () {
    var testElement,
    testMessage;

    beforeEach(function () {
      jasmine.clock().install();
      var elemId = 'messageContent';
      testMessage = 'This is a unit test';
      setFixtures(sandbox({
          id: elemId,
          style: 'display: none;'
        }));

      spyOn(window, 'scrollMessageContent');

      displayUserMessage(testMessage, 'ok');
      testElement = $('#' + elemId);
    });

    afterEach(function () {
      jasmine.clock().uninstall();
    });

    it("should display a div with the supplied text", function () {
      expect(testElement.attr('style')).not.toContain('display: none;');
      expect(testElement.text()).toContain(testMessage);
    });

    it("should be positioned at the top of the page", function () {
      expect(scrollMessageContent).toHaveBeenCalledTimes(1);
    });

    it("should hide the user message after 10 seconds", function () {
      spyOn(window, 'hideUserMessage');
      jasmine.clock().tick(10000);
      expect(hideUserMessage).toHaveBeenCalled();
    });
  });

  describe("Tests for hideUserMessage", function () {
    beforeEach(function () {
      setFixtures(sandbox({
          id: 'messageContent',
          style: 'display: inline-block;'
        }));

      displayUserMessage('Testing hiding the user message');
    });

    it("should hide the message content div", function () {
      hideUserMessage();
      expect($('#messageContent').attr('style')).toContain('display: none;');
    });

    it("should clear the text message", function () {
      hideUserMessage();
      expect($('#messageContent').text()).toEqual('');
    });
  });

  describe("Tests for scrollMessageContent", function () {
    it("should position the element at the top of the view", function () {
      var elemId = 'messageContent';
      setFixtures(sandbox({
          id: elemId
        }));
      testElement = $('#' + elemId);
      scrollMessageContent();
      expect(testElement.attr('style')).toContain('top: 0px;');
    });
  });
});

describe("Render build chains", function () {
  var configurationDiv;
  var template;
  var buildTypeData = {
    mock: [{
        id: 'thisIsAMock'
      }
    ],
    singleBuildStep: [{
        id: 'singleBuildStepId',
        name: 'singleBuildStepName'
      }
    ],
    noBuildTypes: [],
    multipleBuildTypes: [{
        id: 'myBuildType0',
        name: 'myBuildTypeName0'
      }, {
        id: 'myBuildType1',
        name: 'myBuildTypeName1'
      }, {
        id: 'myBuildType2',
        name: 'myBuildTypeName2'
      }
    ]
  };

  beforeEach(function () {
    var elemId = 'configurationDiv';
    setFixtures(sandbox({
        id: elemId
      }));

    createTemplateElement();

    configurationDiv = $('#' + elemId);
  });

  function createTemplateElement() {
    template = sandbox({
        id: 'mockTemplate'
      });
    template.append(sandbox({
        id: 'ConfigurationTitle'
      }));
    // '<div id="mockTemplate"><div id="ConfigurationTitle"></div></div>';
  }

  afterEach(function () {});

  describe("Tests for setConfigurations", function () {
    beforeEach(function () {
      spyOn(window, 'renderBuildSteps');
    });

    it("should create header for current build chain", function () {
      setConfigurations(template, configurationDiv, buildTypeData.mock, chainIdentifierCurrent);
      expect(configurationDiv.text()).toContain('Current build chain');
    });

    it("should not create promote build button for current build chain", function () {
      setConfigurations(template, configurationDiv, buildTypeData.mock, chainIdentifierCurrent);
      expect(configurationDiv.text()).toContain('Current build chain');
      expect(configurationDiv.html()).not.toContain('<button id="promoteBuildButton"');
    });

    it("should create header for last successful build chain", function () {
      setConfigurations(template, configurationDiv, buildTypeData.mock, chainIdentifierLastComplete);
      expect(configurationDiv.text()).toContain('Last complete build chain');
      expect(configurationDiv.html()).not.toContain('<button id="promoteBuildButton"');
    });

    it("should not create promote build button for last successful build chain", function () {
      setConfigurations(template, configurationDiv, buildTypeData.mock, chainIdentifierLastComplete);
      expect(configurationDiv.text()).toContain('Last complete build chain');
      expect(configurationDiv.html()).not.toContain('<button id="promoteBuildButton"');
    });

    it("should create header for historic build chains", function () {
      setConfigurations(template, configurationDiv, buildTypeData.mock, chainIdentifierHistory);
      expect(configurationDiv.text()).toContain('Build chain history');
      expect(configurationDiv.text()).toContain('Promote build');
    });

    it("should create promote build button for historic build chains", function () {
      setConfigurations(template, configurationDiv, buildTypeData.mock, chainIdentifierHistory);
      expect(configurationDiv.text()).toContain('Promote build');
      expect(configurationDiv.html()).toContain('<button id="promoteBuildButton"');
    });

    it("should call renderBuildSteps with the same parameters", function () {
      setConfigurations(template, configurationDiv, buildTypeData.mock, chainIdentifierHistory);
      expect(renderBuildSteps).toHaveBeenCalledWith(template, configurationDiv, buildTypeData.mock, chainIdentifierHistory);
    });
  });

  describe("Tests for renderBuildSteps", function () {
    beforeEach(function () {
      spyOn(window, 'setBuildChainArrow');
    });

    afterEach(function () {});

    it("Should not do anything if there are no build types", function () {
      renderBuildSteps(template, configurationDiv, buildTypeData.noBuildTypes, chainIdentifierCurrent);
      expect(configurationDiv.html()).not.toContain('<div id="buildType');
      expect(setBuildChainArrow).not.toHaveBeenCalled();
    });

    it("should create a div for a supplied build step", function () {
      var buildSteps = buildTypeData.singleBuildStep;
      renderBuildSteps(template, configurationDiv, buildSteps, chainIdentifierCurrent);
      expect(configurationDiv.html()).toContain('<div id="buildType' + buildSteps[0].id);
    });

    it("should create a div for each supplied build step", function () {
      var buildSteps = buildTypeData.multipleBuildTypes;
      renderBuildSteps(template, configurationDiv, buildSteps, chainIdentifierCurrent);
      expect(configurationDiv.html()).toContain('<div id="buildType' + buildSteps[0].id);
      expect(configurationDiv.html()).toContain('<div id="buildType' + buildSteps[1].id);
      expect(configurationDiv.html()).toContain('<div id="buildType' + buildSteps[2].id);
    });

    it("should create an arrow for all but the first step", function () {
      var buildSteps = buildTypeData.multipleBuildTypes;
      var chainIdentifier = chainIdentifierCurrent;
      renderBuildSteps(template, configurationDiv, buildSteps, chainIdentifier);
      expect(setBuildChainArrow).toHaveBeenCalledTimes(2);
      expect(setBuildChainArrow).toHaveBeenCalledWith('buildType' + buildSteps[0].id + chainIdentifier, 'buildType' + buildSteps[1].id + chainIdentifier);
      expect(setBuildChainArrow).toHaveBeenCalledWith('buildType' + buildSteps[1].id + chainIdentifier, 'buildType' + buildSteps[2].id + chainIdentifier);
    });

    it("should add data to the element", function () {
      var buildSteps = buildTypeData.singleBuildStep;
      var chainIdentifier = chainIdentifierCurrent;
      renderBuildSteps(template, configurationDiv, buildSteps, chainIdentifier);
      var stepElement = $('#' + 'buildType' + buildSteps[0].id + chainIdentifier);
      expect(stepElement.data('configId')).toEqual(buildSteps[0].id);
      expect(stepElement.data('configName')).toEqual(buildSteps[0].name);
    });

    it("should set position of the element", function () {
      var buildSteps = buildTypeData.singleBuildStep;
      var chainIdentifier = chainIdentifierCurrent;
      renderBuildSteps(template, configurationDiv, buildSteps, chainIdentifier);
      var stepElement = $('#' + 'buildType' + buildSteps[0].id + chainIdentifier);
      expect(stepElement.attr('style')).toContain('position: relative;');
      expect(stepElement.attr('style')).toContain('left: ');
    });

    it("should set position correctly for element", function () {
      var buildSteps = buildTypeData.multipleBuildTypes;
      var chainIdentifier = chainIdentifierCurrent;
      var index = 2;
      renderBuildSteps(template, configurationDiv, buildSteps, chainIdentifier);
      var stepElement = $('#' + 'buildType' + buildSteps[index].id + chainIdentifier);
      expect(stepElement.attr('style')).toContain('left: ' + index * 30 + 'px;');
    });

    it("should not create a build chain arrow if only one build type", function () {
      var buildSteps = buildTypeData.singleBuildStep;
      renderBuildSteps(template, configurationDiv, buildSteps, chainIdentifierCurrent);
      expect(setBuildChainArrow).not.toHaveBeenCalled();
    });
  });

  describe("Tests for setBuildChainArrow", function () {
    it("should call jsPlumb with correct parameters", function () {
      spyOn(jsPlumb, 'connect');
      setBuildChainArrow('sourceId', 'targetId');
      expect(jsPlumb.connect).toHaveBeenCalledTimes(1);
      expect(jsPlumb.connect).toHaveBeenCalledWith({
        source: 'sourceId',
        target: 'targetId',
        anchors: ["Right", "Left"],
        endpoint: "Blank",
        connector: "Straight",
        overlays: ["Arrow"],
        connectorOverlays: "Arrow",
        detachable: false
      });
    });
  });

  describe("Tests for getProject", function () {
    var callbackFunction;
    var testProjectId = 'someProjectId';
    var testResponseMessage = {
      val: 'This is a unit test'
    };

    beforeEach(function () {
      callbackFunction = jasmine.createSpy('callback');
      jasmine.Ajax.install();
    });

    afterEach(function () {
      callbackFunction = null;
      jasmine.Ajax.uninstall();
    });

    it("should call the callback function on success", function () {
      getProject(testProjectId, callbackFunction);
      var request = jasmine.Ajax.requests.mostRecent();
      request.respondWith({
        status: 200,
        responseText: JSON.stringify(testResponseMessage)
      });

      expect(request.url).toBe('/project/' + testProjectId);
      expect(request.method).toBe('GET');
      expect(callbackFunction).toHaveBeenCalledWith(testResponseMessage);
    });

    it("should not call callback function on failure", function () {
      getProject(testProjectId, callbackFunction);
      var request = jasmine.Ajax.requests.mostRecent();
      request.respondWith({
        status: 500,
        responseText: JSON.stringify(testResponseMessage)
      });

      expect(request.url).toBe('/project/' + testProjectId);
      expect(request.method).toBe('GET');
      expect(callbackFunction).not.toHaveBeenCalled();
    });
  });

  describe("Tests for setProjectInfo", function () {
    var projectTemplate,
    configurationTemplate,
    collapseTemplate;
    var testData = getJSONFixture('projectData.json');

    beforeEach(function () {
      projectTemplate = null;
      configurationTemplate = null;
      collapseTemplate = null;
      loadFixtures('projectFixture.html');
      spyOn(window, 'setConfigurations');
      spyOn(window, 'updateCurrentBuildChain');
      spyOn(window, 'setLastSuccessfulBuildChain');
      spyOn(window, 'setBuildHistory');
    });

    it("should call setConfigurations for all three sections", function () {
      var data = testData.validProjectSimple;
      projectTemplate = $('#projectContentTemplate').clone(true);
      collapseTemplate = projectTemplate.find('#collapseLink');
      configurationTemplate = projectTemplate.find('#collapseLink').find('#configurationTemplate');

      projectTemplate.prop('id', 'project' + data.id);
      collapseTemplate.prop('id', 'collapse' + data.id);

      setProjectInfo(data);

      expect(setConfigurations).toHaveBeenCalledTimes(2 + buildsToDisplayInHistory);
      expect(setConfigurations).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(Object), data.buildTypes.buildType, chainIdentifierCurrent);
      expect(setConfigurations).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(Object), data.buildTypes.buildType, chainIdentifierLastComplete);
      expect(setConfigurations).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(Object), data.buildTypes.buildType, chainIdentifierHistory);
    });

    it("should update parameters for created project markup", function () {
      var data = testData.validProjectSimple;
      setProjectInfo(data);

      projectTemplate = $('#project' + data.id);
      collapseTemplate = $('#collapse' + data.id);
      expect(projectTemplate.prop('id')).toEqual('project' + data.id);
      expect(collapseTemplate.prop('id')).toEqual('collapse' + data.id);
      expect(projectTemplate.find('#collapseLink').prop('href')).toContain('collapse' + data.id);
      expect(projectTemplate.find('#projectTitle').html()).toEqual(data.name + ' <small>' + data.description + '</small>');
    });

    it("should not set undefined if no description available", function () {
      var data = testData.validProjectSimple;
      data.description = null;

      setProjectInfo(data);
      projectTemplate = $('#project' + data.id);

      expect(projectTemplate.find('#projectTitle').html()).toEqual(data.name + ' <small></small>');
    });
  });
});
