// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

// module dependencies
var app = angular.module('smartroom', [
    'ionic',
    'ngAnimate',
    'ngCordova',
    'ngIOS9UIWebViewPatch',
    'app.directives',
    'app.services',
    'app.factories',
    'app.filters'
]);

app.run(function($ionicPlatform, CredentialService, ServerConfig, AppConfigService, $rootScope, $state, $cordovaNetwork, $ionicPopup) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Disable bouncing from login form input
      cordova.plugins.Keyboard.disableScroll(true);
    }

    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    // Allow android hardware back button only when current state is not login.
    // Otherwise exit app upon back button click.
    $ionicPlatform.registerBackButtonAction(function(event){
      if($state.current.name == 'login') {
        ionic.Platform.exitApp();
      } else {
         navigator.app.backHistory();
      }
    }, 100);

    document.addEventListener('deviceready', function () {

      // listen for Online event
      $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
        CredentialService.init();

        console.log('CredentialService.init()?');

        $rootScope.$broadcast('deviceReady');
      });

      // listen for Offline event
      $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
        $ionicPopup.alert({
          title: 'Connection Error',
          template: 'Unable to connect to server. Please check your internet connection or VPN and try again.'
        });
      });

    }, false);

  });
});
app.config(function($stateProvider, $ionicConfigProvider, $urlRouterProvider) {

  $ionicConfigProvider.tabs.position('bottom');

  // Override tabs background color for android
  $ionicConfigProvider.tabs.style('standard');

  // Clear text from back button
  $ionicConfigProvider.backButton.text('').icon('ion-ios-arrow-back');

  // Disable ios style swipe back navigation
  $ionicConfigProvider.views.swipeBackEnabled(false);

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    .state('login',{
     url: "/login",
     cache:false,
     templateUrl: "templates/login.html",
     controller: "LoginCtrl"
    })
    .state('tab',{
      url: "/tab",
      abstract:true,
      templateUrl: "templates/main.html",
      controller: "TabCtrl"
    })
    .state('tab.home',{
      url: "/home",
      cache:false,
      views:{
        'tab-home': {
          templateUrl: "templates/home.html",
          controller: "HomeCtrl"
        }
      }
    })
    .state('tab.home-roomschedule',{
      url: "/home-roomschedule/:param",
      cache:false,
      views:{
        'tab-home': {
          templateUrl: "templates/home-roomschedule.html",
          controller: "HomeRoomScheduleCtrl"/*,
          params:['roomId']*/
        }
      }
    })
    .state('tab.reservation',{
      url: "/reservation",
      cache:false,
      views:{
        'tab-reservation': {
          templateUrl: "templates/reservation.html",
          controller: "ReservationCtrl"
        }
      }
    }).state('tab.reservation-detail',{
      url: "/reservation-detail/:param",
      cache:false,
      views:{
        'tab-reservation': {
          templateUrl: "templates/reservation-detail.html",
          controller: "ReservationDetailCtrl"
        }
      }
    })
    .state('tab.search',{
      url: "/search",
      cache:false,
      views:{
        'tab-search': {
          templateUrl: "templates/search.html",
          controller: "SearchCtrl"
        }
      }
    })
    .state('tab.search-result',{
      url: "/search-result/:param",
      cache:false,
      views:{
        'tab-search': {
          templateUrl: "templates/search-result.html",
          controller: "SearchResultCtrl"
        }
      }
    })
    .state('tab.scan',{
      url: "/scan",
      cache:false,
      views:{
        'tab-scan': {
          templateUrl: "templates/scan.html",
          controller: "ScanCtrl"
        }
      }
    })
    .state('tab.setting',{
      url: "/setting",
      cache:false,
      views:{
        'tab-setting': {
          templateUrl: "templates/setting.html",
          controller: "SettingCtrl"
        }
      }
    })
    .state('tab.setting-app',{
      url: "/setting-app",
      cache:false,
      views:{
        'tab-setting': {
          templateUrl: "templates/setting-app.html",
          controller: "SettingAppCtrl"
        }
      }
    })
    .state('tab.account-settings', {
      url: "/account-settings",
      cache: false,
      views: {
          'tab-setting': {
            templateUrl: "templates/account-settings.html",
            controller: "AppSettingsCtrl"
          }
      }
    })

  ;

    $urlRouterProvider.otherwise('/login');
});

app.controller('TabCtrl',function(){

});
