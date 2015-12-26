app.controller('UserlistCtrl', ['$scope', '$mdSidenav', 'UserList', function($scope, $mdSidenav, UserList) {


    var me = $scope;

    me.userlist = UserList.query();

    me.roles = [
        {id: 'helper', label: 'Helfer'},
        {id: 'team', label: 'Team'},
        {id: 'organizer', label: 'Organisator'}
    ];

    me.selectedTabNr = 1;
   // me.selectedRole = me.roles[1];
    me.$watch('selectedTabNr', function(newValue) {
        me.selectedRole = me.roles[me.selectedTabNr];
        me.breadcrumb = 'Personalverwaltung > '+ me.selectedRole.label;
    });

    me.isSelectedRole = function(user){
        return me.selectedRole.id == user.role;
    }

    me.selectUser = function(id){
        window.location.href = '#/user/'+me.selectedRole.id+'/'+id;
    }

    me.addUser = function(){
        window.location.href = '#/adduser';
    }

    $mdSidenav('left')
        .open();

}]);

app.service('UserList', function($resource) {
    return $resource('/api/user/list');
});