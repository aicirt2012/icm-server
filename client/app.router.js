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
            controller: 'EmailCtrl',
            resolve: {
                email: function ($route, Email) {
                    return Email.get({id: $route.current.params.id});
                }
            }
        })
        .when('/statistic', {
            templateUrl: 'views/statistics/statistics.html',
            controller: 'StatisticsCtrl',
            resolve: {
                statistics: function (Statistics) {
                    return Statistics.get();
                }
            }
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
