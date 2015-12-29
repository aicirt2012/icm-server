app.controller('EmailCtrl', ['$scope', 'email','$routeParams', function($scope, email, $routeParams) {


    var me = $scope;
    me.email = email;




}]);

app.service('Email', function($resource) {
    return $resource('/api/email/:id');
});