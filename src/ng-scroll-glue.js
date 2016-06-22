/**
 * @name AngularJS Scroll Glue
 * @type AngularJS Module
 * @version 2.0.6
 * @author Santiago G. Marín <santiago@finaldevstudio.com>
 * @description An AngularJs directive that automatically scrolls to the bottom
 *   of an element on changes in it's scope. This is a fork of Lukas Wegmann's
 *   Angular Scroll Glue (https://github.com/Luegg/angularjs-scroll-glue).
 * @license MIT
 * @see https://github.com/stgogm/ng-scroll-glue
 */

(function (angular) {
  'use strict';

  var SCROLL = 'scroll';
  var RESIZE = 'resize';

  function createActivationState($parse, attr, scope) {
    function unboundState(initValue) {
      var activated = initValue;

      return {
        getValue: function () {
          return activated;
        },

        setValue: function (value) {
          activated = value;
        }
      };
    }

    function oneWayBindingState(getter, scope) {
      return {
        getValue: function () {
          return getter(scope);
        },

        setValue: function () {}
      };
    }

    function twoWayBindingState(getter, setter, scope) {
      return {
        getValue: function () {
          return getter(scope);
        },

        setValue: function (value) {
          if (value !== getter(scope)) {
            scope.$apply(function () {
              setter(scope, value);
            });
          }
        }
      };
    }

    if (attr !== '') {
      var getter = $parse(attr);

      if (getter.assign !== undefined) {
        return twoWayBindingState(getter, getter.assign, scope);
      } else {
        return oneWayBindingState(getter, scope);
      }
    } else {
      return unboundState(true);
    }
  }

  function createDirective(module, attrName, direction) {
    module.directive(attrName, [
      '$parse', '$timeout', '$window',

      function ($parse, $timeout, $window) {
        return {
          priority: 1,

          restrict: 'A',

          link: function ($scope, $el, $attrs) {
            var activationState = createActivationState($parse, $attrs[attrName], $scope);
            var $win = angular.element($window);
            var el = $el[0];

            function scrollIfGlued() {
              if (activationState.getValue() && !direction.isAttached(el)) {
                direction.scroll(el);
              }
            }

            function onElementScroll() {
              activationState.setValue(direction.isAttached(el));
            }

            $scope.$watch(scrollIfGlued);

            $timeout(scrollIfGlued, 0, false);

            $win.on(RESIZE, scrollIfGlued);
            $el.on(SCROLL, onElementScroll);

            $scope.$on('$destroy', function () {
              $win.off(RESIZE, scrollIfGlued);
              $el.off(SCROLL, onElementScroll);
            });
          }
        };
      }
    ]);
  }

  var bottom = {
    isAttached: function (el) {
      // + 1 catches off by one errors in chrome
      return el.scrollTop + el.clientHeight + 1 >= el.scrollHeight;
    },

    scroll: function (el) {
      el.scrollTop = el.scrollHeight;
    }
  };

  var top = {
    isAttached: function (el) {
      return el.scrollTop <= 1;
    },

    scroll: function (el) {
      el.scrollTop = 0;
    }
  };

  var right = {
    isAttached: function (el) {
      return el.scrollLeft + el.clientWidth + 1 >= el.scrollWidth;
    },

    scroll: function (el) {
      el.scrollLeft = el.scrollWidth;
    }
  };

  var left = {
    isAttached: function (el) {
      return el.scrollLeft <= 1;
    },

    scroll: function (el) {
      el.scrollLeft = 0;
    }
  };

  var module = angular.module('ngScrollGlue', []);

  createDirective(module, 'scrollGlue', bottom);
  createDirective(module, 'scrollGlueTop', top);
  createDirective(module, 'scrollGlueBottom', bottom);
  createDirective(module, 'scrollGlueLeft', left);
  createDirective(module, 'scrollGlueRight', right);

}(angular));
