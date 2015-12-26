app.controller('LoginCtrl', ['$scope', 'Authenticate', '$mdSidenav', function($scope, Authenticate, $mdSidenav) {

    var me = $scope;

    //TODO Remove only for simple testing
    me.email = 'user1@tum.de';
    me.pw = '123';

    me.login = function(){
        Authenticate.login(me.email,me.pw).then(function(data){
            console.log('logged in',data);
            window.location.href = '#/user';
        }, function(){
            console.log('login failed');
        });
    }

    $mdSidenav('left')
        .close();



}]);

app.service('Authenticate', function($resource) {
    var Login = $resource('/api/login');


    this.login = function(email, pw){
        var p = Login.save({
            email : email,
            pw: pw
        }).$promise;
        p.then(function(data){
            localStorage.setItem('JWT', data.token);
        },function(){
            console.error("fail@loginUser");
        });
        return p;
    };

    this.logout = function(){
        localStorage.removeItem('JWT');
    }
});

