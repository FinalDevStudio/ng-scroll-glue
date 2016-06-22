'use strict';

const DELAY = 100;

describe('ngScroll directive', () => {
  var $scope, $compile, $window;

  function template(value) {
    return $('<div/>', {
      html: $('<div/>', {
        attr: {
          'scroll-glue': value
        },

        css: {
          height: '40px',
          overflowY: 'scroll'
        },

        html: $('<div/>', {
          text: 'Hello, {{ name }}!',

          css: {
            height: '100px'
          }
        })
      })
    }).html();
  }

  var templates = {
    withSubPropertyBinding: template('prop.glued'),
    withBindingTop: template('glued'),
    withBinding: template('glued'),
    deactivated: template('false'),
    simple: template('')
  };

  beforeEach(module('ngScrollGlue'));

  beforeEach(inject(($injector) => {
    $scope = $injector.get('$rootScope');
    $compile = $injector.get('$compile');
    $window = $injector.get('$window');
  }));

  afterEach(() => {
    $scope.$destroy();
  });

  function compile(template) {
    return $compile($(template))($scope)
      .appendTo($('body'));
  }

  it('should scroll to bottom of element on changes', (done) => {
    var $element = compile(templates.simple)[0];

    $scope.name = 'World';

    $scope.$digest();

    setTimeout(function () {
      expect($element.scrollTop).to.equal($element.scrollHeight - $element.clientHeight);
      done();
    }, DELAY);
  });

  it('should be deactivated if the scroll-glue attribute is set to `false`', (done) => {
    var $element = compile(templates.deactivated)[0];

    $scope.name = 'World';

    $scope.$digest();

    setTimeout(() => {
      expect($element.scrollTop).to.equal(0);
      done();
    }, DELAY);
  });

  it('should turn off auto scroll after user scrolled manually', (done) => {
    var $element = compile(templates.simple)[0];

    $scope.$digest();

    $element.scrollTop = 0;

    setTimeout(() => {
      $scope.name = 'World';
      $scope.$digest();

      expect($element.scrollTop).to.equal(0);

      done();
    }, DELAY);
  });

  it('should turn on auto scroll after user scrolled manually to bottom of element', (done) => {
    var $element = compile(templates.simple)[0];

    $scope.$digest();

    $element.scrollTop = 0;

    setTimeout(() => {
      $scope.$digest();

      expect($element.scrollTop).to.equal(0);

      $element.scrollTop = $element.scrollHeight;

      setTimeout(() => {
        $scope.$digest();

        expect($element.scrollTop).to.equal($element.scrollHeight - $element.clientHeight);

        done();
      }, DELAY);
    });
  });

  it('should turn off when the bound value is false', (done) => {
    $scope.glued = true;

    var $element = compile(templates.withBinding)[0];

    $scope.glued = false;
    $scope.$digest();

    setTimeout(() => {
      expect($element.scrollTop).to.equal(0);
      done();
    }, DELAY);
  });

  it('should update the bound value', (done) => {
    $scope.glued = true;

    var $element = compile(templates.withBinding)[0];

    $scope.$digest();

    $element.scrollTop = 0;

    setTimeout(() => {
      expect($scope.glued).to.be.false;
      done();
    }, DELAY);
  });

  it('should update the bound value in sub properties', (done) => {
    $scope.prop = {
      glued: true
    };

    var $element = compile(templates.withSubPropertyBinding)[0];

    $scope.$digest();

    $element.scrollTop = 0;

    setTimeout(() => {
      expect($scope.prop.glued).to.be.false;
      done();
    }, DELAY);
  });

  it('should scroll to top when using scroll-glue-top', (done) => {
    var $element = compile(templates.withBindingTop)[0];

    $element.scrollTop = 100;

    $scope.name = 'World';
    $scope.$digest();

    setTimeout(() => {
      expect($element.scrollTop).to.equal($element.scrollHeight - $element.clientHeight);
      done();
    }, DELAY);
  });

  it('should scroll on window resize if glued', (done) => {
    var event = document.createEvent('HTMLEvents');
    var $element = compile(templates.simple)[0];

    event.initEvent('resize', true, true);

    $window.dispatchEvent(event);

    setTimeout(() => {
      expect($element.scrollTop).to.equal($element.scrollHeight - $element.clientHeight);
      done();
    }, DELAY);
  });
});
