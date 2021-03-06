app.controller('ReservationCtrl',function($rootScope, $scope, $q, $timeout, RoomService, MaskFac, ServerConfig, $cordovaNetwork){

	document.addEventListener('deviceready', function () {
		// listen for Online event
		$rootScope.$on('$cordovaNetwork:online', function(event, networkState){
			$scope.loadReservations();
		});

	}, false);

	$scope.rooms=[];
	var imageUrl= null;
	setImage().then(function(res){
		imageUrl = res;
	});


	$scope.loadReservations= function(){
		MaskFac.loadingMask(true, 'Loading');
		RoomService.getMyReservations()
		.then(function(res){
			$scope.rooms = res; //load rooms and entry
			MaskFac.loadingMask(false);
		},function(errRes){
			//failed to load rooms
			MaskFac.loadingMask(false);
			MaskFac.showMask(MaskFac.error, 'Loading reservations failed');
		});
	};
	$scope.roomCss=function(status){
		return	RoomService.getRoomCss(status);
	};


	//get Image url - if serverConfig not initialized, set url ="" so that later it will launch
	$scope.getImage=function(siteID, path){
		if(imageUrl){
			if(siteID && path) {
				return imageUrl + '/' + siteID + '/' + path;
			} else {
				return './img/noimageavailable.png';
			}
		}
		else{
			return '';
		}
	};

	var t = null;
	function setImage(){
		var def=$q.defer();
		RoomService.getImageUrl().then(function(res){
			if(t)
				$timeout.cancel(t);
			imageUrl = res;
			def.resolve(res);
		},function(){
			t = $timeout(function(){
				setImage();
			},500);
		});
		return def.promise;
	}

	 $scope.today="today";
	 $scope.loadReservations();

}).controller('ReservationDetailCtrl',function($scope, $state, $stateParams, $ionicPopup,$window,
	$ionicActionSheet, $timeout, $ionicNavBarDelegate, RoomService, AppService, MaskFac){

  // Get data upon scanning QR. If there is no star or end, then the data comes from parent reservations view
  // String Format from QR -> roomID,start or end --> 1100,start or 1100,end
  var params = $stateParams.param.split(',');

  if(params[1] === 'start' || params[1] === 'end') {
    RoomService.getMyReservationForSpecificRoom(params[0])
      .then(function(res){

        $scope.param = res.scheduleid;

        initDetailsFromQR();

        if(params[1] === 'start') {
          showConfirm('Start', startMeetingFromQR);
        } else {
          showConfirm('End', endMeetingFromQR);
        }

      },function(errRes){
        //failed to load rooms
          MaskFac.showMask(MaskFac.error, "Loading reservation details failed");
      });
  } else {
    $scope.param = $stateParams.param;

    //==initializing information
    initDetails();
  }

  $scope.meeting = {};

  $scope.goToReservations = function() {
      $state.go('tab.reservation');
  };

  //$scope.imageUrl = "";
	var imageUrl = "";

	$scope.statusCss=RoomService.getStatusCss(null);//get default
	//get image Url
	RoomService.getImageUrl().then(function(res){
		//$scope.imageUrl = res;
		imageUrl = res;
	});
  console.log('enter reservation-controller.js');
	$scope.getImage=function(siteID, path){
		if(imageUrl){
			if(siteID && path) {
        console.log("siteID:%s, path:%s",siteID,path);
				return imageUrl + '/' + siteID + '/' + path;
			} else {
				return './img/noimageavailable.png';
			}
		}
		else{
			return '';
		}
	};
  $scope.fullScreen=function(url){
    MaskFac.imageMask(url);
  };

  function initDetailsFromQR(){
    MaskFac.loadingMask(true, "Loading");
    RoomService.getMeetingInfo($scope.param).then(function(res){
      $scope.meeting=res;
      $scope.statusCss= RoomService.getStatusCss($scope.meeting.status);//update

      $timeout(function(){
        MaskFac.loadingMask(false);
      },500);
    },function(errRes){
      console.log(JSON.stringify(errRes));
      MaskFac.loadingMask(false);
      MaskFac.showMask(MaskFac.error, "Oops an error occured. <br>Please try again");
      $timeout(function(){$state.go('tab.reservation')},2000);
    });
  }

	//get room info
	function initDetails(){
    MaskFac.loadingMask(true, "Loading");
		RoomService.getMeetingInfo($stateParams.param).then(function(res){
			$scope.meeting=res;
			$scope.statusCss= RoomService.getStatusCss($scope.meeting.status);//update

			$timeout(function(){
				MaskFac.loadingMask(false);
			},500);
		},function(errRes){
			console.log(JSON.stringify(errRes));
			MaskFac.loadingMask(false);
			MaskFac.showMask(MaskFac.error, "Oops an error occured. <br>Please try again");
			$timeout(function(){$state.go('tab.reservation')},2000);
		});
	}


	$scope.buttonCss=function(status){
		return	'button-' + $scope.statusCss;
	};

	$scope.attendeeInfo=function(a){
    console.log(a);
		var buttonConfig = [];
		if(!a.num)//do nothing if no information available
			return;
		if(a.num && a.num !=''){
			buttonConfig.push({ text: '<b>Call ' + a.num + '</b>' });
			buttonConfig.push({ text: '<b>Message ' + a.num + '</b>' });
			buttonConfig.push({ text: '<b>Go to Whatsapp </b>' });
		}
		if(a.email && a.email !=""){
			buttonConfig.push({ text: '<b>Email ' + a.email + '</b>'});
		}
		var hideSheet = $ionicActionSheet.show({
	     titleText: a.name,
	     buttons: buttonConfig,
	     buttonClicked: function(index) {
	     	switch(index){
	     		case 0:
		     		//call;
            		var ref = $window.open('tel:' + a.num, '_system', 'location=no');
            		ref.addEventListener('exit', $scope.exit);
		     		break;
	     		case 1:
		     		//msg
					 var ref = $window.open('sms:' + a.num, '_system', 'location=no');
					 ref.addEventListener('exit', $scope.exit);
		     		break;
		     	case 2:
		     		//msg
					 var ref = $window.open('whatsapp://send?text= hi ' + a.name, '_system', 'location=no');
					 ref.addEventListener('exit', $scope.exit);
		     		break;
	     		default:
		     		//email;
		     		 var ref = $window.open('mailto:' + a.num, '_system', 'location=no');
					 ref.addEventListener('exit', $scope.exit);
		     		break;
	     	};
	       return true;
	     },
	     destructiveText: 'Close',
	     destructiveButtonClicked: function() {
	      	return true;
        }
	   });
	};

	//for confirmation
	$scope.startMeeting = function(){
 		//execute
     	RoomService.manageMeeting($scope.param, true, null, null).then(function(data){
        if(data[0].success === true) {
            //reload details
            initDetails();

            MaskFac.showMask(MaskFac.success, 'Reservation started.');
        } else {
            MaskFac.showMask(MaskFac.error, 'Starting reservation failed');
        }

     	},function(errRes){
     		MaskFac.showMask(MaskFac.error, JSON.stringify(errRes));
     	});
	};
	$scope.endMeeting = function(){
		//execute
     	RoomService.manageMeeting($scope.param, null, null, true).then(function(data){
        if(data[0].success === true) {
          MaskFac.showMask(MaskFac.success, "Reservation ended.");
          //go to load reservations
          AppService.eventSuccess('mend');
        } else {
          MaskFac.showMask(MaskFac.error, 'Ending reservation failed');
        }

     	},function(errRes){
     		MaskFac.showMask(MaskFac.error, JSON.stringify(errRes));
     	});
	};
	$scope.cancelMeeting = function(){
		//execute
     	RoomService.manageMeeting($scope.param, null, true, null).then(function(data){
        if(data[0].success === true) {
          MaskFac.showMask(MaskFac.success, "Reservation cancelled.");
          //go to load reservations
          AppService.eventSuccess('mcancel');
        } else {
          MaskFac.showMask(MaskFac.error, 'Cancelling reservation failed');
        }

     	},function(errRes){
     		MaskFac.showMask(MaskFac.error, JSON.stringify(errRes));
     	});
	};
  $scope.extendMeeting = function(){
    //execute
    RoomService.manageMeeting($scope.param, null, null, null).then(function(data){
      if(data[0].success === true) {
        //reload details
        initDetails();

        MaskFac.showMask(MaskFac.success, "Reservation extended.");

      } else {
        MaskFac.showMask(MaskFac.error, 'Extending reservation failed');
      }

    },function(errRes){
      MaskFac.showMask(MaskFac.error, JSON.stringify(errRes));
    });
  };
	/*$scope.closeMask=function(){
		MaskFac.loadingMask(false);
	}*/
	function showConfirm(type, fn){
		$ionicPopup.confirm({
		     title: '<b>' + type +' Reservation</b>',
		     okText: 'Yes',
		     cancelText: 'No',
		     template: 'Do you wish to '+ angular.lowercase(type)+' your reservation?'
		   })
     	.then(function(res) {
		     if(res) {
		       fn();
		     }
	   	});
	}
	$scope.manageMeeting=function(status){
		var buttonConfig = [];
		var title = "Manage";
		var actionSheetConfig = {};
		if(RoomService.isStarted(status)){
			//only allow end

			actionSheetConfig={
				titleText: 'Manage Reservation',
          buttons: [{ text: '<b>Extend Reservation</b>' }],
            buttonClicked: function(index) {
              switch(index){
               case 0:
                showConfirm('Extend', $scope.extendMeeting);
                break;
            };
            return true;
            },
			     destructiveText: 'End Reservation',
			     destructiveButtonClicked: function() {
			     	//get confirmation
			     	//MaskFac.confirmMask('End Meeting?', 'Do you wish to end your meeting', $scope, 'endMeeting');
			     	showConfirm('End', $scope.endMeeting);
			      	return true;
		        },
			     cancelText: 'Close',
			     cancel: function() {
			      	return true;
		        }
			}
		}else{
			actionSheetConfig={
				titleText: 'Manage Reservation',
		     	buttons: [{ text: '<b>Start Reservation</b>' }],
		     	buttonClicked: function(index) {
			     	switch(index){
			     		case 0:
				     		//start;
				     		//MaskFac.confirmMask('Start Meeting?', 'Do you wish to start your meeting', $scope, 'startMeeting');
				     		showConfirm('Start', $scope.startMeeting);
				     		break;
			     	};
			       return true;
		     	},
		     	destructiveText: 'Cancel Reservation',
			    destructiveButtonClicked: function() {
			     	//MaskFac.confirmMask('Cancel Meeting?', 'Do you wish to cancel your meeting', $scope, 'cancelMeeting');
			     	showConfirm('Cancel', $scope.cancelMeeting);
			      	return true;
		        },
		        cancelText: 'Close',
			     cancel: function() {
			      	return true;
		        }
			}


		}
		var hideSheet = $ionicActionSheet.show(actionSheetConfig);
	};

	//https://github.com/driftyco/ionic/issues/3064
	//bug in nav title alignment
	$scope.$on('$ionicView.afterEnter', function(event, state) {
      $timeout(function() {
        $ionicNavBarDelegate.align('left');
      }, 650);
  });

  function startMeetingFromQR() {
    RoomService.manageMeeting($scope.param, true, null, null).then(function(data){
      if(data[0].success === true) {

        initDetailsFromQR();

        MaskFac.showMask(MaskFac.success, 'Reservation started.');
      } else {
        MaskFac.showMask(MaskFac.error, 'Starting reservation failed');
      }

    },function(errRes){
      MaskFac.showMask(MaskFac.error, JSON.stringify(errRes));
    });
  }

  function endMeetingFromQR() {
    RoomService.manageMeeting($scope.param, null, null, true).then(function(data){
      if(data[0].success === true) {
        MaskFac.showMask(MaskFac.success, 'Reservation ended.');
        //go to load reservations
        AppService.eventSuccess('mend');
      } else {
        MaskFac.showMask(MaskFac.error, 'Ending reservation failed');
      }

    },function(errRes){
      MaskFac.showMask(MaskFac.error, JSON.stringify(errRes));
    });
  }

});
