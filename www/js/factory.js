angular.module('app.factories', [])
.factory('ServerConfig',function($http, $timeout, $q){
	var config = {};
	var imageUrl = "";
	function retrieveConfig(ip){
		var def = $q.defer();
		$http.get('./config.json').then(function(res){
			config = res.data;

      if(ip && ip.indexOf("smartroommobiledata") > -1) {

        config.server = ip;
      } else {
        var isHttps = localStorage.getItem("isHttps");

        config.server = isHttps + '://' + ip + '/smartroommobiledata';

        console.log('SERVER: ' + config.server);
      }

			if(config.simulate){
				//set image url
				config.server ="";
				config.imageurl="./img/";
				config.imagelocation="./img/";
			}
			def.resolve();
		},function(errRes){
			def.reject("unable to retrieve config from json");
		});
		return def.promise;
	}


	return{
		//variables mapping config to json item
		login:"loginurl",
		myReservation:"myreservation",
		scheduleInfo:"scheduleinfo",
		startMeeting: "confirmschedule",
		endMeeting:"endschedule",
		cancelMeeting:"cancelschedule",
    extendMeeting: "extendmeeting",
		searchRoom: "search",
		reserveRoom:"reserve",
		allRoom:"allroom",
		qrCode: "qrcode",
		site: "site",
		floor: "floor",
		scheduleslot: "scheduleslot",
		init:function(ip){
			var def=$q.defer();

			retrieveConfig(ip).then(function(){
				//set config
				//console.log('ServerConfig.init(): config.server->'+ config.server);
				//getip
				imageUrl = config.server + config.imagelocation;
			});
			return def.promise;
		},
		setIpAddr:function(ip){
			var def = $q.defer();
			if(config.simulate){
				//console.log('is simulate setIpAddr');
				config.server="";
				def.resolve();
			}else{
				if(ip){
          config.server = ip;
					console.log('ServerConfig.setIpAddr(): config.server is->' + config.server);
					def.resolve();
				}else{
					def.reject();
				}
			}

			return def.promise;
		},
		getImageUrl:function(){
			var def = $q.defer();
			if(config.imagelocation && config.imagelocation != ''){

				def.resolve(config.server + config.imagelocation);
			}else{
				/*console.log('getImageUrl from config');
				retrieveConfig(config.server).then(function(){
					//console.log('return imageUrl->' + config.serverprotocol + "://" + config.serverip + ":" + config.serverport + "/SMARTRoomMobile/images/www/floorplan/1/");
					def.resolve(config.server + config.imagelocation);
				},function(errRes){
					console.log(errRes);
				});*/
				def.reject();
			}
			return def.promise;
		},
		getLoginUrl:function(){
			var def = $q.defer();
			if(config.loginurl && config.loginurl != ''){
				console.log('getLoginUrl from memory');
				def.resolve(config.server + config.loginurl);
			}else{
				console.log('getLoginUrl from config');
				retrieveConfig(config.server).then(function(){
					//console.log('return imageUrl->' + config.serverprotocol + "://" + config.serverip + ":" + config.serverport + "/SMARTRoomMobile/images/www/floorplan/1/");
					def.resolve(config.server + config.loginurl);
				},function(errRes){
					console.log(errRes);
				});
			}
			return def.promise;
		},
		getRoomCss:function(status){
			try{
				switch(status){
					case "STARTING":
						return 'status-yellow';
					case "STARTED":
						return 'status-red';
					case "PENDING":
						return 'status-yellow';
					default:
						return 'status-green';
				}
			}
			catch(err){
				return 'status-yellow';
			}
		},
		getUrl:function(type){
			var def = $q.defer();
			if(config.simulate){
				def.reject({simulate:true});
			}else{
				if(config[type] && config[type] != ''){
					console.log('getUrl for: ' + type + ' from memory');
					def.resolve(config.server + config[type]);
				}else{
					console.log('getUrl for: ' + type + ' from config');
					retrieveConfig(config.server).then(function(){
						def.resolve(config.server + config[type]);
					},function(errRes){
						console.log(errRes);
					});
				}
			}
			return def.promise;
		},
		getLandingPageOption:function(){
			console.log('ServerConfig.getLandingPageOption()');
			var def = $q.defer();
			if(config["landingpageoptions"] && config["landingpageoptions"] != ''){
				console.log('getLandingPageOption from memory');
				def.resolve(config["landingpageoptions"]);
			}else{
				console.log('getLandingPageOption from config');
				retrieveConfig(config.server).then(function(){
					def.resolve(config["landingpageoptions"]);
				},function(errRes){
					console.log(errRes);
				});
			}
			return def.promise;
		}
		/*,getSearchUrl:function(){
			var def = $q.defer();
			if(config.myreservation && config.myreservation != ''){
				console.log('getReservationUrl from memory');
				def.resolve(config.server + config.myreservation);
			}else{
				console.log('getReservationUrl from config');
				retrieveConfig(config.server).then(function(){
					def.resolve(config.server + config.myreservation);
				},function(errRes){
					console.log(errRes);
				});
			}
			return def.promise;
		},
		getReservationUrl:function(){
			var def = $q.defer();
			if(config.myreservation && config.myreservation != ''){
				console.log('getReservationUrl from memory');
				def.resolve(config.server + config.myreservation);
			}else{
				console.log('getReservationUrl from config');
				retrieveConfig().then(function(){
					def.resolve(config.server + config.myreservation);
				},function(errRes){
					console.log(errRes);
				});
			}
			return def.promise;
		},
		getScheduleInfoUrl:function(){ //Schedule==Reservation
			var def = $q.defer();
			if(config.scheduleinfo && config.scheduleinfo != ''){
				console.log('getScheduleInfoUrl from memory');
				def.resolve(config.server + config.scheduleinfo);
			}else{
				console.log('getScheduleInfoUrl from config');
				retrieveConfig().then(function(){
					def.resolve(config.server + config.scheduleinfo);
				},function(errRes){
					console.log(errRes);
				});
			}
			return def.promise;
		},
		getStartScheduleUrl:function(){ //Schedule==Reservation
			var def = $q.defer();
			if(config.confirmschedule && config.confirmschedule != ''){
				console.log('getStartScheduleUrl from memory');
				def.resolve(config.server + config.confirmschedule);
			}else{
				console.log('getStartScheduleUrl from config');
				retrieveConfig().then(function(){
					def.resolve(config.server + config.confirmschedule);
				},function(errRes){
					console.log(errRes);
				});
			}
			return def.promise;
		},
		getStopScheduleUrl:function(){ //Schedule==Reservation
			var def = $q.defer();
			if(config.endschedule && config.endschedule != ''){
				console.log('getStopScheduleUrl from memory');
				def.resolve(config.server + config.endschedule);
			}else{
				console.log('getStopScheduleUrl from config');
				retrieveConfig().then(function(){
					def.resolve(config.server + config.endschedule);
				},function(errRes){
					console.log(errRes);
				});
			}
			return def.promise;
		},
		getCancelScheduleUrl:function(){ //Schedule==Reservation
			var def = $q.defer();
			if(config.cancelschedule && config.cancelschedule != ''){
				console.log('getCancelScheduleUrl from memory');
				def.resolve(config.server + config.cancelschedule);
			}else{
				console.log('getCancelScheduleUrl from config');
				retrieveConfig().then(function(){
					def.resolve(config.server + config.cancelschedule);
				},function(errRes){
					console.log(errRes);
				});
			}
			return def.promise;
		}*/
		,
		getSiteUrl: function(type) {
			var def = $q.defer();

			if(config.simulate){

				def.reject({simulate:true});
			}else{
				if(config[type] && config[type] != ''){
					def.resolve(config.server + config[type]);
				}else {
					retrieveConfig(config.server).then(function(){
						def.resolve(config.server + config[type]);
					},function(errRes){
						console.log(errRes);
					});
				}
			}
			return def.promise;
		},
		getFloorUrl: function(type) {
			var def = $q.defer();

			if(config.simulate){

				def.reject({simulate:true});
			}else{
				if(config[type] && config[type] != ''){
					def.resolve(config.server + config[type]);
				}else {
					retrieveConfig(config.server).then(function(){
						def.resolve(config.server + config[type]);
					},function(errRes){
						console.log(errRes);
					});
				}
			}
			return def.promise;
		},
		getScheduleSlotUrl: function(type) {
			var def = $q.defer();

			if(config.simulate){

				def.reject({simulate:true});
			}else{
				if(config[type] && config[type] != ''){
					def.resolve(config.server + config[type]);
				}else {
					retrieveConfig(config.server).then(function(){
						def.resolve(config.server + config[type]);
					},function(errRes){
						console.log(errRes);
					});
				}
			}
			return def.promise;
		}
	};
})
.factory('BarcodeScanner',function($q){
	console.log('factory.barcodeScanner init!');
	return{
		scan:function(){
			var def = $q.defer();
			if(cordova){
				cordova.plugins.barcodeScanner.scan(
			      	function (result) {
			      	 	def.resolve({success: !result.cancelled, data: result.text});
			          	/*alert("We got a barcode\n" +
			                "Result: " + result.text + "\n" +
			                "Format: " + result.format + "\n" +
			                "Cancelled: " + result.cancelled);*/
			      },
			      function (error) {
			          def.reject(error);
			      }
			   );
			}else{
				def.reject();
			}

			return def.promise;
		}
	}
})
.factory('MaskFac', function($ionicLoading,$rootScope) {
  var maskTypes = {
    success: {
      icon: '',
      dur: 1000,
      color: ''
    },
    warning: {
      icon: 'ion-alert ',
      dur: 1000,
      color: ''
    },
    error: {
      icon: 'ion-alert assertive',
      dur: 1500,
      color: 'assertive'
    }
  };
  $rootScope.exitImageFullscreen = function () {
    $ionicLoading.hide();
  };
  return{
    showMask:function(type, msg){
      $ionicLoading.show({
          template:  '<label class="' +  type.color +'">' + msg + '</label>' + ' <i class="' + type.icon + '"/>',
          noBackdrop: true,
          duration:type.dur
      });
    },
    //Lara 10Feb16: added image zoom
    imageMask:function(url){

      if(ionic.Platform.isAndroid()) {
        $ionicLoading.show({
          template: '<ion-view title="Home" style="background-color:transparent;"  hide-nav-bar="true"><span class="icon ion-ios-close" style="position: fixed;top:10px;right: 10px;font-size:1.5em;" ng-click="exitImageFullscreen()">&nbsp;close</span><ion-scroll zooming="true" direction="xy" scrollbar-x="false" scrollbar-y="false" min-zoom="1" id="scrolly"  style="width: 100%; height: 80%;top:10%;"><img src="' + url + '"></img></ion-scroll></ion-view>',
          noBackdrop: false
          //,scope: _scope

        });
      } else {
        $ionicLoading.show({
          template: '<ion-view title="Home" style="background-color:transparent;"  hide-nav-bar="true"><span class="icon ion-ios-close" style="position: fixed;top:28px;right: 10px;font-size:1.5em;" ng-click="exitImageFullscreen()">&nbsp;close</span><ion-scroll zooming="true" direction="xy" scrollbar-x="false" scrollbar-y="false" min-zoom="1" id="scrolly"  style="width: 100%; height: 80%;top:10%;"><img src="' + url + '"></img></ion-scroll></ion-view>',
          noBackdrop: false
          //,scope: _scope

        });
      }

    },
    confirmMask:function(title, msg, s, fnCall){
    	$ionicLoading.show({
    	  scope: s,
          template: '<div style="height:100%;width:100%"> <h2>' + title + '</h2><p>' + msg + '</p><br><p><button class="button button-positive" ng-click="'+ fnCall + '()">Yes</button><button class="button button-default" ng-click="closeMask()">No</button></p>',
          noBackdrop: false
      	});
      	console.log($ionicLoading);
    },
    loadingMask:function(show, msg){
      if(show){
        //console.log('loadingMaske shown->' + new Date());
        $ionicLoading.show({
          template: '<img src="ajax-loader.gif"/>' + msg,
          noBackdrop: false
        });
      }else{
        //console.log('loadingMaske hidden->' + new Date());
        $ionicLoading.hide();
      }

    },
    warning: maskTypes.warning,
    error: maskTypes.error,
    success: maskTypes.success
  };
});
