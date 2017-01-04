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

    it("should display a div with the supplied text", function () {
      expect(testElement.attr('style')).not.toContain('display: none;');
      expect(testElement.text()).toContain(testMessage);
      pending('Method should display the div, currently not implemented');
    });

    it("should be positioned at the top of the page", function () {
      expect(scrollMessageContent).toHaveBeenCalledTimes(1);
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
});
