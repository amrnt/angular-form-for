/**
 * For documentation please refer to the project wiki:
 * https://github.com/bvaughn/angular-form-for/wiki/API-Reference#radiofield
 */
angular.module('formFor').directive('radioField',
  function($log) {
    var nameToActiveRadioMap = {};

    return {
      require: '^formFor',
      restrict: 'E',
      templateUrl: 'form-for/templates/radio-field.html',
      scope: {
        attribute: '@',
        disabled: '@',
        help: '@?',
        label: '@?',
        value: '@'
      },
      link: function($scope, $element, $attributes, formForController) {
        if (!$scope.attribute) {
          $log.error('Missing required field "attribute"');

          return;
        }

        if (!nameToActiveRadioMap[$scope.attribute]) {
          nameToActiveRadioMap[$scope.attribute] = {
            defaultScope: $scope,
            scopes: [],
            model: formForController.registerFormField($scope, $scope.attribute)
          };
        }

        // TODO How to handle errors?
        // Main scope should listen and bucket brigade to others!

        var activeRadio = nameToActiveRadioMap[$scope.attribute];
        activeRadio.scopes.push($scope);

        $scope.model = activeRadio.model;

        var $input = $element.find('input');

        $scope.click = function() {
          if (!$scope.disabled) {
            $scope.model.bindable = $scope.value;
          }
        };

        activeRadio.defaultScope.$watch('disabled', function(value) {
          $scope.disabled = value;
        });

        $scope.$watch('model.bindable', function(newValue, oldValue) {
          if (newValue === $scope.value) {
            $input.attr('checked', true);
          } else {
            $input.removeAttr('checked');
          }
        });

        $scope.$on('$destroy', function() {
          activeRadio.scopes.splice(
            activeRadio.scopes.indexOf($scope), 1);

          if (activeRadio.scopes.length === 0) {
            delete nameToActiveRadioMap[$scope.attribute];
          }
        });
      }
    };
  });