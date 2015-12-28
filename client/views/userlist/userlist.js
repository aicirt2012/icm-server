app.controller('UserlistCtrl', ['$scope', '$mdSidenav', 'EmailList', function($scope, $mdSidenav, EmailList) {


    var me = $scope;
    me.emaillist = EmailList.query();



    me.selectUser = function(id){
        window.location.href = '#/user/'+me.selectedRole.id+'/'+id;
    }

    me.addUser = function(){
        window.location.href = '#/adduser';
    }

    $mdSidenav('left').open();

}]);

app.service('EmailList', function($resource) {
    return $resource('/api/email/list');
});