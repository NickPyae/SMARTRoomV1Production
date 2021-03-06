app.controller('SearchCtrl', function ($rootScope, $scope, $state, $stateParams, RoomService, AppService, AppConfigService, MaskFac, $cordovaNetwork) {

    document.addEventListener('deviceready', function () {
      // listen for Online event
      $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
        prepareFilter();
      });

    }, false);

    prepareFilter();

    function prepareFilter() {
      MaskFac.loadingMask(true, 'Loading');
      AppConfigService.prepareFilter().then(function () {

        $scope.filterOptions = AppConfigService.filterOptions;

        $scope.userSettings = {
          levelFilter: AppConfigService.filter.level
        };
        MaskFac.loadingMask(false);
      }, function (errRes) {
        MaskFac.loadingMask(false);
        MaskFac.showMask(MaskFac.error, 'Loading available floors failed');
      });
    };


    $scope.options = {};
    function getClosestHalf(now, plus) {
      var add = plus ? 1 : 0;

      if (now.getMinutes() > 30) {
        return new Date(1970, 0, 1, now.getHours() + 1 + add, 0, 0);
      } else if (now.getMinutes() < 30) {
        return new Date(1970, 0, 1, now.getHours() + add, 30, 0);
      }
    }

    $scope.$on('search.refresh', function () {
      var now = new Date();
      var _param = $stateParams.param;
      $scope.options = {
        //des:"abc",
        date: now,
        start: getClosestHalf(now, false),
        end: getClosestHalf(now, true),
        seats: 1
      };
    });

    $scope.progress = {
      current: 0,
      step: 25,
      max: 100
    };
    //==Validation
    $scope.validated = true;
    $scope.errorMsg = "";
    function timeValidate(start, end) {
      if (start && end && start < end) {
        return true;
      } else {
        return false;
      }
    }

    //progress validation
    $scope.$watch('options', function (nv) {
      var total = 0;
      angular.forEach(nv, function (item) {
        if (item && item != "") {
          total += $scope.progress.step;
        }
      });

      //time/seats validation
      if (!timeValidate(nv.start, nv.end)) {
        $scope.errorMsg = "Start Time must be earlier than End Time";
        $scope.validated = false;
      } else if (nv.seats < 1 || nv.seats > 5000) {
        $scope.errorMsg = "Seating Capacity Min. 1 | Max. 5000";
        $scope.validated = false;
      } else {
        $scope.validated = true;
      }
      //Maintain search on back
      $scope.progress.current = total;
    }, true);
    //==End Validation


    $scope.search = function (options) {
      //$stateParams.param="true";

      if (!$scope.userSettings.levelFilter.value) {
        options.floorID = '';
      } else {
        options.floorID = $scope.userSettings.levelFilter.floorID;
      }

      $state.go('tab.search-result', {param: JSON.stringify(options)});
    };
    AppService.newSearch();

  })
  .controller('SearchResultCtrl', function ($scope, $stateParams, $timeout, $ionicPopup, RoomService, MaskFac, AppService, $ionicScrollDelegate) {
    MaskFac.loadingMask(true, 'Searching');
    var param = JSON.parse($stateParams.param);
    console.log(param);
    //$scope.imageUrl = "";
    var imageUrl = null;
    //get image Url
    RoomService.getImageUrl().then(function (res) {
      //$scope.imageUrl = res;
      imageUrl = res;
    });

    $scope.getImage = function (siteID, path) {
      if (imageUrl) {
        if (siteID && path) {
          return imageUrl + '/' + siteID + '/' + path;
        } else {
          return './img/noimageavailable.png';
        }
      }
      else {
        return '';
      }
    };

    $scope.fullScreen=function(url){
      MaskFac.imageMask(url);
    };

    //==show time slot which user searched for
    $scope.slot = tConvert(formatTime(param.start)) + " to " + tConvert(formatTime(param.end));
    function formatTime(_t) {
      var t = new Date(_t);
      return pad(t.getHours(), 2) + ":" + pad(t.getMinutes(), 2);
    }

    function pad(n, width, z) {
      z = z || '0';
      n = n + '';
      return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }

    function formatDate(_d) {
      var d = new Date(_d);
      return pad(d.getDate(), 2) + "-" + pad((d.getMonth() + 1), 2) + "-" + d.getFullYear();
    }

    //==end

    $scope.lstRoom = [];
    $scope.loadNext = 5;
    $scope.AllRoom = [];
    $scope.reserve = {des: ""};

    $scope.loadMore = function () {
      var addThese = [];
      if ($scope.lstRoom.length + $scope.loadNext >= $scope.AllRoom.length)
        addThese = $scope.AllRoom.slice($scope.lstRoom.length, $scope.AllRoom.length);
      else
        addThese = $scope.AllRoom.slice($scope.lstRoom.length, $scope.lstRoom.length + $scope.loadNext);

      angular.forEach(addThese, function (r) {
        $scope.lstRoom.push(r);
      });
      /*$scope.lstRoom= $scope.AllRoom.slice(0, $scope.lstRoom.length + $scope.loadNext);
       console.log($scope.lstRoom);*/
      $timeout(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete'); //to update the screen
      }, 1000);
    };

    $scope.getSlots = function (roomID, slotShow) {

      if (slotShow === true) {
        MaskFac.loadingMask(true, 'Loading');

        RoomService.getRoomSlots(roomID, param.date).then(function (res) {

          angular.forEach($scope.lstRoom, function (room) {

            if (room.id === roomID) {

              if (room.slots.length > 0) {
                room.slots.splice(0, room.slots.length);
              }

              angular.forEach(res, function (s) {
                room.slots.push(roomSlot(s));
              });
            }
          })

          MaskFac.loadingMask(false);
        });
      }
    }

    function roomSlot(rTimeslots) {
      var _slot = {};

      _slot.originalStart = rTimeslots.start;
      _slot.start = tConvert(rTimeslots.start);
      _slot.end = tConvert(rTimeslots.end);
      _slot.originalEnd = rTimeslots.end;
      // Status --> Starting, Started, Vacant or Pending
      _slot.status = angular.lowercase(rTimeslots.status);
      _slot.info = rTimeslots.info;
      _slot.contact = rTimeslots.contact;
      _slot.num = rTimeslots.num;
      _slot.jabber = rTimeslots.jabber;

      return _slot;
    }

    function tConvert(time) {
      // Check correct time format and split into components
      time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

      if (time.length > 1) { // If time format correct
        time = time.slice (1);  // Remove full string match value
        time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
        time[0] = +time[0] % 12 || 12; // Adjust hours
      }
      return time.join (''); // return adjusted time or original string
    }

    //==ON INIT->see param structure from SearchCtrl;
    RoomService.getAvailableRooms(param.date, param.start, param.end, param.seats, param.floorID).then(function (res) {
      $scope.AllRoom = res;
      $scope.lstRoom = $scope.AllRoom.slice(0, $scope.loadNext + 5);
      MaskFac.loadingMask(false);
    }, function (errRes) {
      MaskFac.loadingMask(false);
      MaskFac.showMask(MaskFac.error, 'Searching rooms failed');
    });
    //==end

    //scope functions
    $scope.roomCss = function (status) {
      return RoomService.getRoomCss(status);
    };
    function callReservation(id, name, start, end) {
      if (!start || !end) {
        start = param.start;
        end = param.end;
      }
    }

    $scope.slotShowIconCss = function (isShow) {
      if (isShow) {
        return "ion-arrow-up-b";
      }
      else {
        return "ion-arrow-down-b";
      }
    };

    function getSlotDisplayConf(slots) {
      //if a to b, b to c, f to g -> should display a-> c, f->g
      var useSlot = "";
      var isChecked = false;
      var b = "";
      var assignedLast = false;
      //tabulate slots
      angular.forEach(slots, function (s) {
        //try and get stretches of time

        if (s.checked) {
          isChecked = true;
          if (b != "" && b == s.start) {
            //this.start == prev.end
            b = s.end;

          } else {
            //previous wasn't selected || this.start != prev.end;
            //this slot can't be linked, throw out b, create new slot
            useSlot += b;

            b = s.end;

            if (useSlot != "")
              useSlot += ",<br>";

            useSlot += s.start + " to ";

          }
          assignedLast = false;


        } else {
          //this slot can't be linked, throw out b, create new slot
          useSlot += b;
          assignedLast = true;
          b = "";//reset b
        }
      });

      if (!assignedLast) {
        useSlot += b;
      }

      if (!isChecked)
        useSlot = $scope.slot;

      //return
      return "Time: <b>" + useSlot + "</b>";
    }

    $scope.lstSelected = [];

    $scope.selectTimeSlot = function (slot, slots) {
      if ($scope.lstSelected.length == 1) {
        $scope.lstSelected.push(slot);
        //console.log($scope.lstSelected);
        groupSlots(slots, $scope.lstSelected[0], $scope.lstSelected[1]);

      } else {
        //restart
        $scope.lstSelected = [];
        /*angular.forEach($scope.lstSelected,function(s){
                                                                                                                         s.selected=false;
                                                                                                         });*/
        //console.log('lstSelected== 2, restart');
        $scope.lstSelected.push(slot);
        //console.log('restart, push slot');
        groupSlots(slots, $scope.lstSelected[0], $scope.lstSelected[1] ? $scope.lstSelected[1] : null);
      }

      console.log(slot);

    };

    //algo to verify valid date range is selected
    function groupSlots(allSlots, _first, _second) {
      var myFirst, mySecond;
      var lstSelected = [];//reset lstSelected
      //console.log('in group slots');
      if (_first && _second) {
        //console.log('first && second exist');
        //start sorting which is start which is end
        //check in between slots
        var f1 = parseInt(_first.originalStart.replace(/([A-Za-z])/g, '').replace(":", ""));
        var f2 = parseInt(_second.originalStart.replace(/([A-Za-z])/g, '').replace(":", ""));
        if (f1 > f2) {
          //console.log('first > second ' + f1 + '>' + f2);
          myFirst = f2;
          mySecond = f1;
        } else {
          //console.log('first < second ');
          myFirst = f1;
          mySecond = f2;
        }

        for (var i = 0; i < allSlots.length; i++) {
          var sNum = parseInt(allSlots[i].originalStart.replace(/([A-Za-z])/g, '').replace(":", ""));

          if (sNum >= myFirst && sNum <= mySecond) {
            if (allSlots[i].status == 'vacant') {
              //console.log({sNUmIs:sNum, myFNum:myFirst, mySNum:mySecond});
              allSlots[i].checked = true;
              lstSelected.push(allSlots[i]);
            } else {
              //erase all
              angular.forEach(allSlots,function(s){
                if (s != _first) {
                  s.checked = false;
                }
              });

              lstSelected = [];
              //exit
              break;
            }
          }
          else {
            allSlots[i].checked = false;
          }
        }
      } else {
        //console.log('not all exist, erase slots');
        lstSelected = [];
        //reset
        angular.forEach(allSlots, function (s) {
          if (_first && s.originalStart == _first.originalStart) {
            s.checked = true;
            lstSelected.push(s);
          } else {
            s.checked = false;
          }
        });
      }
    }

    function getFormatDate(date) {
      //yyyy-mm-dd
      var d = new Date(date);
      return d.getFullYear() + "-" + pad((d.getMonth() + 1), 2) + "-" + pad(d.getDate(), 2);
    }

    $scope.reserve = function (id, name, slots, enforceDefaultSelection) {


      var useSlot = "";

      var isSlotChecked = false;
      if(enforceDefaultSelection){
        isSlotChecked=true;
        //Lara 10Feb16: this will the default slot
        useSlot = RoomService.formatSlotDisplay([], $scope.slot);
      }else{
        //Lara 10Feb16: this will use the selected slot
        useSlot = RoomService.formatSlotDisplay(slots, $scope.slot);
        if (slots.length === 0) {
          isSlotChecked = false;
        }

        if (slots.length !== 0) {
          angular.forEach(slots, function (s) {
            if (s) {
              if (s.checked) {
                isSlotChecked = true;
              }
            }
          });
        }
      }


      if (isSlotChecked === true) {

        try{cordova.plugins.Keyboard.disableScroll(false);}catch(err){}

        var mypopup = null;
        //$scope.regex = /^[ A-Za-z0-9_@\/\\.,#&$%@():!+-]*$/;
        //Lara 11Feb16: http://stackoverflow.com/questions/1444666/regular-expression-to-match-all-characters-on-a-u-s-keyboard
        $scope.regex=/^[\x20-\x7F]*$/;

        //Lara 11Feb16: Added regex on input as btoa will fail.
        mypopup = $ionicPopup.show({
          //template: '<input type="text" ng-model="reserve.des" placeholder="Please Enter Description"><div field-req ng-hide="reserve.des"></div>',
          template: 'Room: <b>' + name + '</b><br>Date: <b>' + formatDate(param.date) + '</b>' + '</b><br>' + useSlot + '<br><form name="myForm"><input type="text" placeholder="Subject" name="subject" ng-pattern="regex" ng-model="reserve.des" required>' +
          '<div field-req ng-show="myForm.subject.$error.required"></div>'+'<div invalid-char ng-show="myForm.subject.$error.pattern"></div></form>',
          title: 'Confirm Reservation ',
          //subTitle: 'Room: <b>' + name + '</b><br>Date: <b>' + formatDate(param.date) + '</b>'+ '</b><br>' + useSlot,
          scope: $scope,
          buttons: [
            {text: 'Cancel'},
            {
              text: '<b>Reserve</b>',
              type: 'button-positive',
              onTap: function (e) {

                if ($scope.reserve.des && $scope.reserve.des != "") {
                  return $scope.reserve.des;
                } else {
                  e.preventDefault();
                }
              }
            }
          ]
        });

        mypopup.then(function (res) {
          if (res) {
            //callReservation(id, res);
            MaskFac.loadingMask(true, 'Processing');
            var selectedSlots = [];
            var todayDate = getFormatDate(param.date);
            //Lara 10Feb16:  allow clicking 'Reserve' for searched time frame
            if(enforceDefaultSelection){
              var s = $scope.slot.split("to");
              selectedSlots.push({'start': tConvert(s[0].replace(' ','')), 'end': s[1]});//start is important
              selectedSlots.push({'start': s[1], 'end': tConvert(s[1].replace(' ',''))});//end is important
            }else{
              angular.forEach(slots, function (s) {
                if (s.checked) {
                  selectedSlots.push({'start': s.start, 'end': s.end});
                  console.log("selectedSlots->%s",JSON.stringify(selectedSlots));
                }
              });
            }

            console.warn(selectedSlots);
            var start = selectedSlots[0].start;
            var end = selectedSlots[selectedSlots.length - 1].end;
            var subject = res;

            RoomService.reserveRoom(id, todayDate, start, end, subject)
              .then(function (res) {
                MaskFac.loadingMask(false);
                MaskFac.showMask(MaskFac.success, "Reservation successful.");
                //Lara  10Feb16: allow page to show room reserved mask before transitting
                $timeout(function(){
                  //go to reservations
                  AppService.eventSuccess('room-reserved');
                },1000);

              }, function (errRes) {
                MaskFac.showMask(MaskFac.error, "Error reserving room. Please try again");
              });
          }
        });

      } else {
        MaskFac.showMask(MaskFac.warning, 'Please select time slots first');
      }
    };

    $scope.selRoom = null;
    $scope.viewOtherSlots = function (r) {
      $scope.selRoom = r;
      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        templateUrl: 'view-slots.html',
        title: 'Reserve Room: ' + r.name,
        scope: $scope
        ,
        buttons: [
          {text: 'Cancel'},
          {
            text: '<b>Reserve</b>',
            type: 'button-balanced',
            onTap: function (e) {
              if (!$scope.selRoom.des) {
                //don't allow the user to close unless he enters wifi password
                e.preventDefault();
              } else {
                return $scope.selRoom.des;
              }

              //if no slots click
              //e.preventDefault();
              //else
              //call reserveRoom();
            }
          }
        ]
      });
      myPopup.then(function (res) {
        if (res) {
          callReservation(r.id, res);
        }
      });
    };

    //Suggestions for sticky
    //use ionic.domUtil.getPositionInParent(document.query(...)); to find if item has passed header.

  });
