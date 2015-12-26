app.controller('MyDataCtrl', ['$scope', '$mdSidenav', 'user', 'MyData', function($scope, $mdSidenav, user, MyData) {


    var me = $scope;
    me.user = user;

    me.breadcrumb = function(){
        return 'Meine Daten';
    }

    me.submitPersonalData = function(){
        MyData.personal.update({
            gender: me.user.gender,
            name: me.user.name,
            tel: me.user.tel,
            mobil: me.user.mobil,
            email: me.user.email
        });
    }


    me.submitAvailability = function(){
        MyData.availability.update(me.user.availability);
    }

    $mdSidenav('left')
        .open();

}]);

app.service('MyData', function($resource) {

    var Personal = $resource('/api/mydata/personal', null, {
        'update': { method:'PUT' }
    });

    var Availability = $resource('/api/mydata/availability', null, {
        'update': { method:'PUT' }
    });



    return {
        personal: Personal,
        availability: Availability
    };
});