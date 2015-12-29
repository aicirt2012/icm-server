app.controller('StatisticsCtrl', ['$scope', 'Statistics', function($scope) {


    var me = $scope;
    me.email = email;




}]);

app.service('Statistics', function($resource) {
    return $resource('/api/statistics');
});