describe("Setup for markup", function(){
  beforeEach(function(){
    jasmine.Ajax.install();
  });
  
  afterEach(function(){
    jasmine.Ajax.uninstall();
  });

  describe("Tests for displayUserMessage", function(){
    var testElement, testMessage;

    beforeEach(function(){
      var elemId = 'messageContent';
      testMessage = 'This is a unit test';
      setFixtures(sandbox({id: elemId, style: 'display: none;'}));

      spyOn(window, 'scrollMessageContent');

      displayUserMessage(testMessage, 'ok');
      testElement = $('#' + elemId);
    });

    it("should display a div with the supplied text", function(){
      expect(testElement.attr('style')).not.toContain('display: none;');
      expect(testElement.text()).toContain(testMessage);
      pending('Method should display the div, currently not implemented');
    });

    it("should be positioned at the top of the page", function(){
      // expect(testElement.attr('style')).toContain('top: 0px;');
      expect(scrollMessageContent).toHaveBeenCalledTimes(1);
    });
  });
  
  describe("Tests for scrollMessageContent", function(){
    it("should position the element at the top of the view", function(){
      var elemId = 'messageContent';
      setFixtures(sandbox({id: elemId}));
      testElement = $('#' + elemId);
      scrollMessageContent();
      expect(testElement.attr('style')).toContain('top: 0px;');
    });
  });
});
