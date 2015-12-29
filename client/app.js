var app = angular.module('EmailApp', ['ngMaterial', 'ngMdIcons', 'ngRoute', 'ngSanitize', 'ngResource', 'angular-jwt']);

app.config(['$routeProvider', function($routeProvider) {

    $routeProvider
        .when('/login', {
            templateUrl: 'views/login/login.html',
            controller: 'LoginCtrl'
        })
        .when('/mydata', {
            templateUrl: 'views/mydata/mydata.html',
            controller: 'MyDataCtrl',
            resolve: {
                user: function(User){
                    return User.me();
                }
            }
        })
        .when('/email', {
            templateUrl: 'views/emaillist/emaillist.html',
            controller: 'EmaillistCtrl'
        })
        .when('/email/:id', {
            templateUrl: 'views/email/email.html',
            controller: 'EmailCtrl'
        })
        .when('/user/:role/:id', {
            templateUrl: 'views/user/user.html',
            controller: 'UserCtrl',
            resolve: {
                user: function($route, User) {
                    return User.get({id: $route.current.params.id});
                }
            }
        })
        .otherwise({
            redirectTo: '/login'
        });
}]);

app.config(function($mdThemingProvider) {
    var customBlueMap = $mdThemingProvider.extendPalette('light-blue', {
        'contrastDefaultColor': 'light',
        'contrastDarkColors': ['50'],
        '50': 'ffffff'
    });
    $mdThemingProvider.definePalette('customBlue', customBlueMap);
    $mdThemingProvider.theme('default')
        .primaryPalette('customBlue', {
            'default': '500',
            'hue-1': '50'
        })
        .accentPalette('pink');
    $mdThemingProvider.theme('input', 'default')
        .primaryPalette('grey')
});

app.run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
    var original = $location.path;
    $location.path = function (path, reload) {
        if (reload === false) {
            var lastRoute = $route.current;
            var un = $rootScope.$on('$locationChangeSuccess', function () {
                $route.current = lastRoute;
                un();
            });
        }
        return original.apply($location, [path]);
    };
}]);

app.config(function Config($httpProvider, jwtInterceptorProvider) {
    jwtInterceptorProvider.tokenGetter = function() {
        return localStorage.getItem('JWT');
    }
    $httpProvider.interceptors.push('jwtInterceptor');
});

app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptorService');
}]);


app.factory('authInterceptorService', ['$q','$location', function ($q, $location){
    var responseError = function (rejection) {
        if (rejection.status === 403) {
            localStorage.removeItem("JWT");
            window.location.href = '#/login';
        }
        return $q.reject(rejection);
    };
    return {
        responseError: responseError
    };
}]);