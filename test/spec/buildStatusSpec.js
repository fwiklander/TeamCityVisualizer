var testData = {
  validDataSingleStage: {
    buildTypeCount: 1,
    version: 'version1',
    chain: [{
        buildStageId: 'UnitTestStage'
      }
    ]
  },
  validDataThreeStages: {
    buildTypeCount: 3,
    version: 'version2',
    chain: [{
        buildStageId: 'UnitTestStage1'
      }, {
        buildStageId: 'UnitTestStage2'
      }, {
        buildStageId: 'UnitTestStage3'
      }
    ]
  },
  chainItemWithVersion: {
    buildStageId: 'StageWithVersion',
    version: 'versionInStage1',
    state: 'finished',
    status: 'SUCCESS'
  },
  chainItemWithoutVersion: {
    buildStageId: 'StageWithoutVersion'
  },
  chainItemWithoutVersion: {
    buildStageId: 'CanceledBuild',
    status: 'UNKNOWN'
  },
  chainItemWithOngoingBuild: {
    buildStageId: 'StageWithOngoingBuild',
    running: true
  }
};

var chainIdentifierLastComplete = 'lastComplete';

describe("Visualisation of builds", function () {
  describe("Tests for lastSuccessfulBuildOnSuccess", function () {
    var divElemId = 'buildChainHeader' + chainIdentifierLastComplete;
    beforeEach(function () {
      setFixtures('<div id="' + divElemId + '"><span></span></div>');
      spyOn(window, "updateBuildStage");
    });

    it("should call updateBuildStage when valid build stage", function () {
      lastSuccessfulBuildOnSuccess(testData.validDataSingleStage);
      expect(updateBuildStage).toHaveBeenCalledTimes(1);
    });

    it("should call updateBuildStage for each build stage", function () {
      lastSuccessfulBuildOnSuccess(testData.validDataThreeStages);
      expect(updateBuildStage).toHaveBeenCalledTimes(3);
    });

    it("should call updateBuildStage with correct parameters", function () {
      var data = testData.validDataSingleStage;
      var expectedElemId = '#buildType' + data.chain[0].buildStageId + chainIdentifierLastComplete;
      lastSuccessfulBuildOnSuccess(data);
      expect(updateBuildStage).toHaveBeenCalledWith(expectedElemId, data.chain[0], false);
    });

    it("should set version to the build stage", function () {
      var testValue = ' - v' + testData.validDataSingleStage.version;
      lastSuccessfulBuildOnSuccess(testData.validDataSingleStage);
      var elem = $('#' + divElemId);
      expect(elem.html()).toContain(testValue);
    });
  });

  describe("Tests for updateBuildStage", function(){
    var divElementId = '#configurationTemplate';
    var stageElement; 
    beforeEach(function(){
      loadFixtures('configurationFixture.html');
      stageElement = $(divElementId);

      spyOn(window, "stopBlinking");
      spyOn(window, "setLastSuccessfulBuildChain");
      spyOn(window, "startBlinking");
      spyOn(window, "setBuildHistory");
      spyOn(window, "updateStatusCss");

      jasmine.Ajax.install();
    });

    afterEach(function(){
      jasmine.Ajax.uninstall();
    });

    it("should set CSS class None if no build available", function(){
      var testElement = $(divElementId);
      updateBuildStage(divElementId, null, false);
      expect(stopBlinking).not.toHaveBeenCalled;
      expect(startBlinking).not.toHaveBeenCalled;
      expect(setLastSuccessfulBuildChain).not.toHaveBeenCalled;
      expect(setBuildHistory).not.toHaveBeenCalled;
      expect(updateStatusCss).toHaveBeenCalledTimes(1);
      expect(updateStatusCss).toHaveBeenCalledWith(testElement, 'None');
    });

    it("should set version if version available in build", function(){
      var buildItem = testData.chainItemWithVersion;
      stageElement.data('configName', buildItem.buildStageId);
      updateBuildStage(stageElement, buildItem, false);
      expect($(divElementId).html()).toContain('<br>v' + buildItem.version);
    });

    it("should exclude version part if no version available in build", function(){
      var buildItem = testData.chainItemWithoutVersion;
      stageElement.data('configName', buildItem.buildStageId);
      updateBuildStage(stageElement, buildItem, false);
      expect($(divElementId).html()).not.toContain('<br>v');
    });

    it("should add user information if build was canceled", function(){
      pending("Method is currently not being called, needs implementation");
      var buildItem = testData.chainItemwithCanceledBuild;
      stageElement.data('configName', buildItem.buildStageId);
      updateBuildStage(stageElement, buildItem, false);
      // should be a ajax call
      expect($(divElementId).title).toContain('Some user information');
    });

    it("should blink element if build ongoing", function(){
      var buildItem = testData.chainItemWithOngoingBuild;
      updateBuildStage(stageElement, buildItem, false);
      expect(startBlinking).toHaveBeenCalledTimes(1);
      expect(startBlinking).toHaveBeenCalledWith(stageElement);
    });

    it("should not start to blink element if already blinking", function(){
      var buildItem = testData.chainItemWithOngoingBuild;
      spyOn(window, 'isElementBlinking').and.returnValue(true);
      updateBuildStage(stageElement, buildItem, false);
      expect(startBlinking).not.toHaveBeenCalled();
    });

    it("should stop blinking element if build finished", function(){
      var buildItem = testData.chainItemWithVersion;
      spyOn(window, 'isElementBlinking').and.returnValue(true);
      updateBuildStage(stageElement, buildItem, false);
      expect(stopBlinking).toHaveBeenCalledTimes(1);
      expect(stopBlinking).toHaveBeenCalledWith(stageElement);
      expect(setLastSuccessfulBuildChain).not.toHaveBeenCalled();
    });

    it("should not attempt to stop blinking element if not already blinking", function(){
      var buildItem = testData.chainItemWithVersion;
      spyOn(window, 'isElementBlinking').and.returnValue(false);
      updateBuildStage(stageElement, buildItem, false);
      expect(stopBlinking).not.toHaveBeenCalled();
    });

    it("should update last successful build chain when last configuration finishes with success", function(){
      var buildItem = testData.chainItemWithVersion;
      spyOn(window, 'isElementBlinking').and.returnValue(true);
      updateBuildStage(stageElement, buildItem, true);
      expect(stopBlinking).toHaveBeenCalled();
      expect(setLastSuccessfulBuildChain).toHaveBeenCalled();
    });

    it("should not update last successful build chain when last configuration finishes with failure", function(){
      var buildItem = testData.chainItemWithVersion;
      buildItem.status = 'FAILURE';
      spyOn(window, 'isElementBlinking').and.returnValue(true);
      updateBuildStage(stageElement, buildItem, true);
      expect(stopBlinking).toHaveBeenCalled();
      expect(setLastSuccessfulBuildChain).not.toHaveBeenCalled();
    });
  });
});
