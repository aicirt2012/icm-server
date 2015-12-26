app.controller('UserCtrl', ['$scope', '$mdSidenav', 'User', '$routeParams', 'user', function($scope, $mdSidenav, User, $routeParams, user) {


    var me = $scope;

    me.user = user;


    me.genders = User.genders;
    me.roles = User.roles;

    for(var i = 0; i<User.roles.length; i++)
       if(User.roles[i].id == $routeParams.role)
           me.selectedRole = User.roles[i];

    me.tabs = [
        {id: 'personaldata', label: 'Persönliche Daten'},
        {id: 'availability', label: 'Verfügbarkeit'},
        {id: 'events', label: 'Events'}
    ];
    me.selectedTabNr = 1;


    me.$watch('selectedTabNr', function(newValue) {
        console.log('Tab: ');
    });

    me.breadcrumb = function(){
        return 'Personalverwaltung > '+me.selectedRole.label + ' > ' + me.user.name;
    }

    $mdSidenav('left')
        .toggle();

    $mdSidenav('left')
        .open();

}]);

app.service('User', function($resource) {

    var Me = $resource('/api/user/me');
    var User = $resource('/api/user/:id');
    var genders = [{id: 'MALE', label: 'Herr'},{id: 'FEMALE', label: 'Frau'}];
    var roles = [
        {id: 'helper', label: 'Helfer'},
        {id: 'team', label: 'Team'},
        {id: 'organizer', label: 'Organisator'}
    ];

    return {
        genders: genders,
        roles: roles,
        get: User.get,
        post: User.post,
        me: Me.get
    }
});