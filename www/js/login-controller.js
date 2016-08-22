app.controller('LoginCtrl',function($rootScope, $scope, $state, $timeout, MaskFac, AppService,  CredentialService, ServerConfig){
	 $scope.loadLogin=false;
	 $scope.ip="";//help populate last ip
	 MaskFac.loadingMask(true, 'Initializing');
	 $scope.$on('$ionicView.enter',function(){

	 	if(CredentialService.isLoggedIn()){
		 	AppService.goHome();
		 	MaskFac.loadingMask(false);
		 }else{
		 	//get server ip from stored
		 	$scope.ip=CredentialService.getIp();
		 	$scope.loadLogin=true;
		 	$scope.logginState = false;
		 	MaskFac.loadingMask(false);

	 	}
	 });

	$scope.show=false;
	$timeout(function(){
		$scope.show=true;
	},500);

	//check if logged in
	$scope.validation={
		msg:"",
		col:""
	};
	$scope.logginState = false;
	function setValidation(msg, success){
		$scope.validation.msg = msg;
		if(success){
			$scope.validation.col = "balanced";
		}else{
			$scope.validation.col = "assertive";
		}
	}

	function validated(){
		AppService.goHome();
	}

  $scope.enableHTTPS = {
      checked: CredentialService.isHttpsEnabled()//false
  };

  //Lara 11Feb16: not needed.
  /*if(localStorage.getItem("isHttps") && localStorage.getItem("isHttps") === 'https') {
    localStorage.setItem("isHttps", 'https');
    $scope.enableHTTPS.checked = true;
  } else {
    localStorage.setItem("isHttps", 'http');
    $scope.enableHTTPS.checked = false;
  }

  var isHTTPSEnabled;

  $scope.enableHTTPSChanged = function(checkedChange) {
    isHTTPSEnabled = checkedChange;
    $scope.enableHTTPS.checked = checkedChange;
    if(checkedChange) {
      localStorage.setItem("isHttps", 'https');
    } else {
      localStorage.setItem("isHttps", 'http');
    }

  };*/

	//CredentialService
	$scope.login=function(u,p,i){

		//deal with log in
		if(u=="" || p=="" || i==""){
			setValidation("Empty Field Not Allowed", false);
		}else{
			//clear validations
			setValidation("");
		}

		$scope.logginState = true;

		MaskFac.loadingMask(true, 'Verifying');

		CredentialService.auth(u,p,i, $scope.enableHTTPS.checked)
		.then(function(res){
			console.log('credentialservice.auth.success:' + JSON.stringify(res));
			//console.log(JSON.stringify(res));

			AppService.goHome();
			MaskFac.loadingMask(false);
		},function(errRes){
			setValidation("Authorization failed.", false);
			$scope.logginState = false;
			MaskFac.loadingMask(false);
			//console.log(JSON.stringify(errRes));
		});
	};



});
