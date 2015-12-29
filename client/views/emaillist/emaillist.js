app.controller('EmaillistCtrl', ['$scope', '$mdSidenav', 'EmailList', function($scope, $mdSidenav, EmailList) {


    var me = $scope;
    me.emaillist = EmailList.query();



    me.selectEmail = function(id){
        window.location.href = '#/email/'+id;
    }

    me.addUser = function(){
        window.location.href = '#/adduser';
    }

    $mdSidenav('left').open();

}]);

app.service('EmailList', function($resource) {
    return $resource('/api/email/list');
});