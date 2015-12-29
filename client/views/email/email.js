app.controller('EmailCtrl', ['$scope', 'Email', function($scope, Email) {


    var me = $scope;
    me.email = Email.get();




}]);

app.service('Email', function($resource) {
    return $resource('/api/email/:id');
});