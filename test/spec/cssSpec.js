var blinkingElement, nonBlinkingElement;
var testResponse = {
  canceledInfo: {
    user: {
      name: 'Unit Test'
    },
    text: 'This is a unit test'
  }
};

/*describe("Test setup verification", function(){
it("Should have a blinking element defined", function(){
expect(blinkingElement).toBeDefined();
});

it("Should have a non-blinking element defined", function(){
expect(nonBlinkingElement).toBeDefined();
});
});*/

describe("CSS changes", function () {
  beforeEach(function () {
    setFixtures(sandbox({
        id: 'blinking',
        class: 'buildOngoing'
      }));
    appendSetFixtures(sandbox({
        id: 'nonBlinking'
      }));
    blinkingElement = $('#blinking');
    nonBlinkingElement = $('#nonBlinking');
    jasmine.Ajax.install();
  });

  afterEach(function () {
    jasmine.Ajax.uninstall();
    blinkingElement = nonBlinkingElement = null;
  });

  describe("isElementBlinking", function () {
    it("should indicate blinking based on CSS class", function () {
      var elementBlinking = isElementBlinking(blinkingElement);
      expect(elementBlinking).toBeTruthy();
    });

    it("should indicate not blinking on absence of CSS class", function () {
      var elementBlinking = isElementBlinking(nonBlinkingElement);
      expect(elementBlinking).toBeFalsy();
    });
  });

  describe("Flashing element can be toggled on/off", function () {
    it("startBlinking should add CSS class to element", function () {
      startBlinking(nonBlinkingElement);
      expect(nonBlinkingElement).toHaveClass('buildOngoing');
    });

    it("stopBlinking should remove CSS class to element", function () {
      stopBlinking(blinkingElement);
      expect(blinkingElement).not.toHaveClass('buildOngoing');
    });
  });

  describe("Canceled build", function () {
    it("should call the build endpoint with the build number", function () {
      var buildNo = 1;
      setCanceledByStatus(buildNo, nonBlinkingElement);
      var request = jasmine.Ajax.requests.mostRecent();
      request.respondWith({
        status: 200,
        responseText: JSON.stringify(testResponse)
      });

      expect(request.url).toBe('/build/' + buildNo);
      expect(request.method).toBe('GET');
    });

    it("Should set the name of the user who triggered the build", function () {
      setCanceledByStatus(1, nonBlinkingElement);
      var request = jasmine.Ajax.requests.mostRecent();
      request.respondWith({
        status: 200,
        responseText: JSON.stringify(testResponse)
      });

      expect(nonBlinkingElement.attr('title')).toBeDefined();
      expect(nonBlinkingElement.attr('title')).toContain(testResponse.canceledInfo.user.name);
    });

    it("Should set the reason for the cancellation", function () {
      setCanceledByStatus(1, nonBlinkingElement);
      var request = jasmine.Ajax.requests.mostRecent();
      request.respondWith({
        status: 200,
        responseText: JSON.stringify(testResponse)
      });

      expect(nonBlinkingElement.attr('title')).toBeDefined();
      expect(nonBlinkingElement.attr('title')).toContain(testResponse.canceledInfo.text);
    });
  });
});
