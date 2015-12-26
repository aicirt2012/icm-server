
app.controller('IndexCtrl', ['$scope', '$mdBottomSheet','$mdSidenav', '$mdUtil', '$mdDialog', 'User', 'Authenticate', function($scope, $mdBottomSheet, $mdSidenav, $mdUtil, $mdDialog, User, Authenticate){
    var me = $scope;


    me.user = User.me();

    $scope.leftOpen = true;

    me.menu = [
        {
            link : 'event',
            title: 'Eventverwaltung',
            icon: 'event'
        },
        {
            link : 'user',
            title: 'Personalverwaltung',
            icon: 'group'
        },
        {
            link : 'organization',
            title: 'Einrichtungsverwaltung',
            icon: 'home'
        }
    ];
    me.admin = [
        {
            link : 'mydata',
            title: 'Meine Daten',
            icon: 'settings'
        },
        {
            link: 'logout',
            title: 'Logout',
            icon: 'logout'
        }
    ];
    me.openView = function(url){
        if(url == 'logout'){
            Authenticate.logout();
            window.location.href = '#/login';
            $scope.leftOpen = false;
        }else
            window.location.href = '#/'+url;
            $scope.leftOpen = true;
    };
    /*
     $scope.showListBottomSheet = function($event) {
     $scope.alert = '';
     $mdBottomSheet.show({
     template: '<md-bottom-sheet class="md-list md-has-header"> <md-subheader>Settings</md-subheader> <md-list> <md-item ng-repeat="item in items"><md-item-content md-ink-ripple flex class="inset"> <a flex aria-label="{{item.name}}" ng-click="listItemClick($index)"> <span class="md-inline-list-icon-label">{{ item.name }}</span> </a></md-item-content> </md-item> </md-list></md-bottom-sheet>',
     controller: 'ListBottomSheetCtrl',
     targetEvent: $event
     }).then(function(clickedItem) {
     $scope.alert = clickedItem.name + ' clicked!';
     });
     };
     */

}]);

/*
 app.controller('ListBottomSheetCtrl', function($scope, $mdBottomSheet) {
 $scope.items = [
 { name: 'Share', icon: 'share' },
 { name: 'Upload', icon: 'upload' },
 { name: 'Copy', icon: 'copy' },
 { name: 'Print this page', icon: 'print' },
 ];

 $scope.listItemClick = function($index) {
 var clickedItem = $scope.items[$index];
 $mdBottomSheet.hide(clickedItem);
 };
 });
 */