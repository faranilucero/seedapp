var globalVars = {} || globalVars;

globalVars.MODE = 'production',
globalVars.serverURL = globalVars.MODE === 'test' ? 'http://localhost:8080': 'https://seedappjs.herokuapp.com';

var routerApp = angular.module('routerApp', ['ui.router']);
    
routerApp.config(function($stateProvider, $urlRouterProvider, $httpProvider) {    
    $urlRouterProvider.otherwise('/home');

    $stateProvider
    // HOME STATES AND NESTED VIEWS ========================================
    .state("forms", {
      url: "/forms",
      templateUrl: "partial-forms.html",
      authenticate: true      
    })
    .state("login", {
      url: "/login",
      templateUrl: "partial-login.html",
      authenticate: false
    })    

    .state('home', {
        url: '/home',
        templateUrl: 'partial-home.html',
        authenticate: false
    })
    // nested list with custom controller
    .state('home.list', {
        url: '/list',
        templateUrl: 'partial-home-list.html',
        controller: function($scope) {
            $scope.dogs = ['Bernese', 'Husky', 'Goldendoodle'];
        },
        authenticate: false
    })
    // nested list with just some random string data
    .state('home.paragraph', {
        url: '/paragraph',
        template: 'Paragraph content goes here.',
        authenticate: false
    })
    .state('about', {
        url: '/about',
        views: {

            // the main template will be placed here (relatively named)
            '': { templateUrl: 'partial-about.html' },

            // the child views will be defined here (absolutely named)
            'columnOne@about': { template: 'Look I am a column!' },

            // for column two, we'll define a separate controller 
            'columnTwo@about': { 
                templateUrl: 'table-data.html',
                controller: 'dataController'
            }
        },
        authenticate: false        
    });
});

// CONTROLLERS
routerApp.controller('dataController', function($scope) {    
    $scope.message = 'test message';
    $scope.items = [
        {
            name: 'item 1',
            price: 50
        },
        {
            name: 'item 2',
            price: 10000
        },
        {
            name: 'item 3',
            price: 20000
        }
    ];
});


// AUTHENTICATION SERVICE
routerApp.service('AuthService', function() {
    this.isAuthenticated = function() {
        var returnValue = false;
        jQuery.ajax({
          type: 'POST',
          url: globalVars.serverURL + '/isSignedIn',
          data: {email : window.localStorage.email},
          success: function(results) {
            if (results.signedInStatus) {
                window.localStorage.isSignedIn = true;
                returnValue = true;
            }
          },
          dataType: 'json',
          async: false
        });
        return returnValue;
    };
});

// LISTENER FOR ANGULAR STATE CHANGES
routerApp.run(function ($rootScope, $state, AuthService) {
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
      if (toState.authenticate && !AuthService.isAuthenticated()){
        // User isn’t authenticated
        $state.transitionTo("login");
        event.preventDefault(); 
      }
    });
});