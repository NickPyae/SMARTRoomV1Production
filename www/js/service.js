angular.module('app.services', [])
.service('RoomService', function($rootScope,$timeout,$q, $http, CredentialService, ServerConfig){
	var self = this;
	//CONSTANTS TO BE USED THROUGHOUT ROOMS
	self.started = 'started';
	self.starting = 'starting';
	self.pending = 'pending';
	self.roomList = [];
	self.reservedRoomList = [];
	function roomInfo(rId, rName, rImg, rStatus, rMeetingInfo, rMeetingStart, rMeetingEnd, rReservedDate, rLocationId,
					  rSiteName, rSeatingCapacity, rFloorplan, rFloorName){
		var room={};
		room.id =rId;
		room.name = rName;
		room.meetingInfo = rMeetingInfo;
		room.meetingStart = rMeetingStart;
		room.meetingEnd = rMeetingEnd;
		room.reservedDate = rReservedDate;
		room.img = rImg;
		room.status = rStatus;
		room.siteId=rLocationId;
		room.siteName = rSiteName;
		room.seatingCapacity = rSeatingCapacity;
		room.floorplanImg = rFloorplan;
		room.floorName = rFloorName;
		return room;
	}

	function roomDetails(rId, rName, rLocation, rSiteID, rSeating, rTimeslots, rImg, rFloor){
		var _room ={};
		_room.id = rId;
		_room.name = rName;
		_room.location = rLocation;
		_room.siteID = rSiteID;
		_room.seating = rSeating;
		_room.slots = [];
		angular.forEach(rTimeslots,function(s){
			_room.slots.push(roomSlot(s));
		});
		_room.img = rImg;
		_room.floor = rFloor;
		return _room;
	}

	function roomSlot(rTimeslots){
		var _slot = {};

		// Nick
    _slot.originalStart = rTimeslots.start;
		_slot.start = tConvert(rTimeslots.start);
		_slot.end = tConvert(rTimeslots.end);
    _slot.originalEnd = rTimeslots.end;
		// Status --> Starting, Started,  Vacant or Pending
		_slot.status = angular.lowercase(rTimeslots.status);
		_slot.info = rTimeslots.info;
		_slot.contact = rTimeslots.contact;
		_slot.num = rTimeslots.num;
		_slot.jabber = rTimeslots.jabber;

		// Lara
		//_slot.start = rTimeslots.slotStartTime;
		//_slot.end = rTimeslots.slotEndTime;

		// Lara
		//console.log(rTimeslots);
		/*if(rTimeslots.schedules && rTimeslots.schedules.length >0){
			_slot.status = rTimeslots.schedules[0].status;
			_slot.info = rTimeslots.schedules[0].name;
			if(rTimeslots.schedules[0].contactname)
				_slot.contact = rTimeslots.schedules[0].contactname;
			if(rTimeslots.schedules[0].contactno)
				_slot.num = rTimeslots.schedules[0].contactno;
			if(rTimeslots.schedules[0].contactjabber)
				_slot.jabber = rTimeslots.schedules[0].contactjabber;
		}*/

		return _slot;
	}

	function attendeeDetails(a){
		var _details = {};
		_details.name = a.name;
		_details.num = a.tel; //call/msg
		_details.email = a.email;
		return _details;
	}
	function meetingDetails(mId, mMeetingName, mRoomName, mLocation, mSiteID, mStatus, mStart, mEnd, mImg, mFloor, mAttendees, floorName){
		var _meeting ={};
		_meeting.id = mId;
		_meeting.name = mMeetingName;
		_meeting.roomName = mRoomName;
		_meeting.location = mLocation;

		_meeting.status = mStatus;
		_meeting.attendees = [];
		 _meeting.count = "Attendees: ";
		 _meeting.count +=  mAttendees ? mAttendees.length : 'N.A'; //Bug fix here- i can't get Attendees. and length to render at the same time
		angular.forEach(mAttendees,function(a){
			_meeting.attendees.push(attendeeDetails(a));
			//_meeting.count++;
		});

		_meeting.siteID = mSiteID;
		_meeting.img = mImg;// ? mImg: "8pax.jpg";
		_meeting.floor = mFloor;// ? mFloor: "L14.png";
		_meeting.start = mStart;
		_meeting.end = mEnd;
    _meeting.floorName = floorName;

		//for testing


		return _meeting;
	}
	var cannedAttendees=[{
					 	"name": "alice",
				        "tel" : "+6512345678",
				        "email": "alice.ang@ebd.com"
				    },{
				        "name": "betty",
				        "tel" : "+6512345678",
				        "email": "betty.bu@ebd.com"
				    },{
				        "name": "celia",
				        "tel" : "+6512345678",
				        "email": "celia.cho@ebd.com"
				    },{
				        "name": "dania",
				        "tel" : "+6512345678",
				        "email": "dania.dong@ebd.com"
				    },{
				        "name": "elaine"
				    },{
				        "name": "fiona",
				        "tel" : "+6512345678",
				        "email": "fiona.fang@ebd.com"
			       	},{
				        "name": "gina",
				        "tel" : "+6512345678",
				        "email": "gina.goh@ebd.com"
				    },{
				        "name": "helena",
				        "tel" : "+6512345678",
				        "email": "helena.hong@ebd.com"
				    },{
				        "name": "ilysia",
				        "tel" : "+6512345678",
				        "email": "ilysia.ing@ebd.com"
				    },{
				        "name": "jane",
				        "tel" : "+6512345678",
				        "email": "jane.ju@ebd.com"
				    },{
				        "name": "kaitlyn",
				        "tel" : "+6512345678",
				        "email": "kaitlyn.kong@ebd.com"
					}];
	//for reservation-controller.js
	self.getMeetingInfo=function(id){

		// Get additional values from Reservations web service
		var reservedRoomList = self.getReservedRoomList();

    var siteID = null;
		var roomImg = null;
		var siteName = null;
		var floorplanImage = null;
    var floorName = null;

		for(var index in reservedRoomList) {
			if(reservedRoomList[index].id === id) {
				siteID = reservedRoomList[index].siteId;
				roomImg = reservedRoomList[index].img;
				siteName = reservedRoomList[index].siteName;
				floorplanImage = reservedRoomList[index].floorplanImg;
        floorName = reservedRoomList[index].floorName;
				break;
			}
		}

		var def = $q.defer();
		if(!id)
			def.reject("id not found");
		//return room info
		//$http.get("./test/reservation-detail-" + id + ".json").then(function (res){

    var encodedScheduleId = btoa(id);

		ServerConfig.getUrl(ServerConfig.scheduleInfo).then(function(res){

      var url = res + "?callback=JSON_CALLBACK&scheduleid=" + encodedScheduleId;
      //var url = res + "?callback=JSON_CALLBACK&scheduleid=" + id;

      console.log('Schedule Detail: ' + url);
			$http.jsonp(url).
				success(function (data, status, headers, config) {
					console.log(JSON.stringify(data));
					var m = data;
          var status = null;

					/*var hwMany = Math.floor(Math.random()* 11 + 1);
					m.attendees=cannedAttendees.slice(0, hwMany);*/
          if(m.status.toLowerCase() === 'starting') {
              status = 'RESERVED';
          } else if (m.status.toLowerCase() === 'started') {
              status = 'OCCUPIED';
          } else if(m.status.toLowerCase() === 'pending') {
              status = 'PENDING ADMIN APPROVAL';
          }

					var myQueriedMeeting = meetingDetails(m.id, m.schedulename, m.roomname,
						siteName, siteID, status, tConvert(m.StartTime), tConvert(m.EndTime),
								 roomImg, floorplanImage, m.Attendees, floorName);

					// meetingDetails with fake attendees.
					/*var myQu eriedMeeting = meetingDetails(m.id, m.schedulename, m.roomname,
						siteName, siteID, m.status, m.StartTime, m.EndTime,
						roomImg, floorplanImage, m.attendees);*/

					def.resolve(myQueriedMeeting);
				}).
				error(function(data, status, headers, config) {
					console.log('RoomService:failed to establish connection to server');
					def.reject(data);
				});
		},function(errRes){

			if(errRes.simulate){
				console.log('is simulate');
				$http.get("./test/reservation-detail-" + id + ".json").then(function (res){
					var data= res.data;
					console.log(JSON.stringify(data));
					var m = data;
					var hwMany = Math.floor(Math.random()* 11 + 1);
					m.attendees=cannedAttendees.slice(0, hwMany);
					var myQueriedMeeting = meetingDetails(m.meetingId, m.name, m.roomname,
								m.sitename, m.status, m.starttime, m.endtime,
								 m.imagesrc, m.floorplan, m.attendees);
					console.log(myQueriedMeeting);
					def.resolve(myQueriedMeeting);
				},function(data) {
					console.log('RoomService:failed to get reservation-detail-' + id + ".json");
					def.reject(data);
				});
			}else{
				console.log('RoomService:failed to establish config');
				def.reject(errRes);
			}
		});

		return def.promise;
	};
	//for home-controller.js to query
	self.getRoomInfo= function(id){
		var def = $q.defer();

		/*if(!id)
			def.reject("id not found");
		//return room info
		$http.get("./test/dashboard-roomquery-" + id + ".json").then(function (res){
			console.log('received simulated values');
			var r = res.data;
			var myQueriedRoom = roomDetails(r.roomid, r.roomname,
						r.sitename, r.seatingcapacity, r.timeslots,
						 r.imagesrc, r.floorplan);

			def.resolve(myQueriedRoom);
		},function(errRes){
			console.log('failed to receive simulated values');
			console.log(JSON.stringify(errRes));
			def.reject(errRes);
		});*/

    var encodedUid = btoa(CredentialService.getUid());
    var encodedRid = btoa(id);
    // Today's date is always added for room slots
    var encodedFromDate = btoa(formatDate(new Date()));

		ServerConfig.getScheduleSlotUrl(ServerConfig.scheduleslot).then(function(res){

			// Get all rooms from Rooms web service
			var roomList = self.getRoomList();

			var siteID = null;
			var roomImg = null;
			var siteName = null;
			var seatingCap = null;
			var floorplanImage = null;

			for(var index in roomList) {
				if(roomList[index].id === id) {
					siteID = roomList[index].siteId;
					roomImg = roomList[index].img;
					siteName = roomList[index].siteName;
					seatingCap = roomList[index].seatingCapacity;
					floorplanImage = roomList[index].floorplanImg;
					break;
				}
			}

      var url = res + "?callback=JSON_CALLBACK&userid=" + encodedUid +
        "&rid=" + encodedRid + "&FromDate=" + encodedFromDate;

			/*var url = res + "?callback=JSON_CALLBACK&userid=" + CredentialService.getUid() +
			"&rid=" + id;*/

			console.log('ServerConfig.getScheduleSlotUrl ---> ' + url);

			$http.jsonp(url)
				.success(function (data, status, headers, config) {
					console.log('ScheduleSlot: ' + JSON.stringify(data));

					var myQueriedRoom = null;

					angular.forEach(data,function(r){

						 myQueriedRoom = roomDetails(r.id, r.name,
							siteName, siteID, seatingCap, r.slots,
							roomImg, floorplanImage);
					});

					def.resolve(myQueriedRoom);
				})
				.error(function(errRes){
					console.log(JSON.stringify(errRes));
					def.reject(errRes);
				});
		});

		return def.promise;
	};

	self.getRoomSlots = function(roomID, fromDate) {
		var def = $q.defer();
		var useDate = formatDate(fromDate);

    var encodedUid = btoa(CredentialService.getUid());
    var encodedRid = btoa(roomID);
    var encodedFromDate = btoa(useDate);

		ServerConfig.getScheduleSlotUrl(ServerConfig.scheduleslot).then(function(res){

      var url = res + "?callback=JSON_CALLBACK&userid=" + encodedUid +
        "&rid=" + encodedRid + "&FromDate=" + encodedFromDate;

			/*var url = res + "?callback=JSON_CALLBACK&userid=" + CredentialService.getUid() +
				"&rid=" + roomID + "&FromDate=" + useDate;*/

			console.log('Get Slots ---> ' + url);

			$http.jsonp(url)
				.success(function (data, status, headers, config) {
					console.log('Slots: ' + JSON.stringify(data));

					var roomSlots = null;

					angular.forEach(data,function(r){

						roomSlots = r.slots;
					});

					def.resolve(roomSlots);
				})
				.error(function(errRes){
					console.log(JSON.stringify(errRes));
					def.reject(errRes);
				});
		});

		return def.promise;
	};

	//for home-controller.js to query dashboard rooms
	self.getAllRooms=function(){
		var def = $q.defer();
		//return all rooms -BUG: URL not working. CORS on server side?

    var encodedUid = btoa(CredentialService.getUid());

		ServerConfig.getUrl(ServerConfig.allRoom).then(function(res){

			var url = res + "?callback=JSON_CALLBACK&userid=" + encodedUid;
      //var url = res + "?callback=JSON_CALLBACK&userid=" + CredentialService.getUid();
			console.log('self.getAllRooms ---> ' + url);
        	$http.jsonp(url)
        	.success(function (data, status, headers, config) {
				//console.log(JSON.stringify(data));
				var lstRooms =[];
				var scheduleName = null;
				var startTime = null;
				var endTime = null;

				angular.forEach(data,function(r){

					if(angular.lowercase(r.ResourceType) === 'room') {

						if(r.nextschedule.length > 0) {
							// nextschedule is missing starttime, endtime missing
							// r.nextschedule will be array of object
							console.log('NextSchedule --> ', JSON.stringify(r.nextschedule));

							// Get next schedule name, start time & end time
							//angular.forEach(r.nextschedule, function(nextSchedule) {
							//	scheduleName = nextSchedule.schedulename;
							//	startTime = formatHourMin(parseInt(nextSchedule.startTime));
							//	endTime = formatHourMin(parseInt(nextSchedule.endTime));
							//});
              schedulName= r.nextschedule[0].schedulename;
              startTime= formatHourMin(parseInt(r.nextschedule[0].startTime));
              endTime= formatHourMin(parseInt(r.nextschedule[0].endTime));

							// Reservation date is empty
							lstRooms.push
							(
								roomInfo(r.roomid, r.roomname, r.imagesrc, angular.lowercase(r.status), scheduleName, tConvert(startTime), tConvert(endTime), '', r.siteid,
									r.sitename, r.seatingcapacity, r.floorplan, r.floorname)

							);
						}
						else{
							console.log('NoNextSchedule --> ', JSON.stringify(r));
							lstRooms.push(roomInfo(r.roomid, r.roomname, r.imagesrc, angular.lowercase(r.status), '', '', '', '', r.siteid, r.sitename,
								r.seatingcapacity, r.floorplan, r.floorname));
						}
					}
				});

				/** Nick */
				self.setRoomList(lstRooms);

				def.resolve(lstRooms);
			})
			.error(function(a,b,c,d){
				console.log('failed to read config file');
				console.log(JSON.stringify(a));
				console.log(b);
				console.log(c);
				console.log(d);
				def.reject(a);
			});
		});
		/*$http.get("./test/dashboard.json").then(function (res){
			console.log('received simulated values');
			var lstRooms =[];
			angular.forEach(res.data,function(r){
				if(r.nextschedule != ""){
					lstRooms.push(
						roomInfo(r.roomid, r.roomname, r.imagesrc, r.status,
						r.nextschedule.name, r.nextschedule.starttime,
						 r.nextschedule.endtime, r.siteid)
					);
				}
				else{
					lstRooms.push(roomInfo(r.roomid, r.roomname, r.imagesrc, r.status, "", "", "", r.siteid));
				}
			});
			def.resolve(lstRooms);
		},function(errRes){
			console.log('failed to receive simulated values');
			console.log(JSON.stringify(errRes));
			def.reject(errRes);
		});*/

		return def.promise;
	};


  self.getMyReservationForSpecificRoom = function(roomID) {
    var def = $q.defer();
    //return all rooms
    //$http.get("./test/reservation.json").then(function (data){

    var encodedUid = btoa(CredentialService.getUid());

    ServerConfig.getUrl(ServerConfig.myReservation).then(function(res){

      var url = res + "?callback=JSON_CALLBACK&userid=" + encodedUid;
      //var url = res + "?callback=JSON_CALLBACK&userid=" + CredentialService.getUid();

      console.log('self.getMyReservationForSpecificRoom -> ', url);

      var roomData = null;
      $http.jsonp(url)
        .success(function (data, status, headers, config) {

          var lstRooms =[];

          angular.forEach(data,function(r){
            try{
              var reservedDate = getFormatReservedDate(r.date);

              lstRooms.push(
                //use scheduleid instead of roomid
                //roomInfo(r.roomid, r.roomname, r.imagesrc, r.status,

                /*roomInfo(r.scheduleid, r.roomname, r.imagesrc, r.status,
                 r.name, r.starttime, r.endtime, r.siteid)*/

                // floorname being set empty since this field does not exist in json from web service
                // roomInfo has reservation date
                roomInfo(r.scheduleid, r.roomname, r.imgsrc, angular.lowercase(r.status), r.name, tConvert(r.starttime), tConvert(r.endtime), reservedDate, r.siteid,
                  r.sitename, r.seatingcapacity, r.floorplan, r.floorname)
              );

              //Lara 29Jan16: only catch the first reservation for this roomId
              if(!roomData && r.roomid === roomID) {
                roomData = r;
              }
            }catch(err){
              console.log(err);
            }
          });

          /** Nick */
          self.setReservedRoomList(lstRooms);

          def.resolve(roomData);
        })
        .error(function(errRes){
          console.log('failed to read config file');
          def.reject(errRes);

        });
    },function(errRes){
        def.reject(errRes);
    });
    return def.promise;
  }
	//for reservation-controller.js to query
	self.getMyReservations=function(){
		var def = $q.defer();
		//return all rooms
		//$http.get("./test/reservation.json").then(function (data){

    var encodedUid = btoa(CredentialService.getUid());

		ServerConfig.getUrl(ServerConfig.myReservation).then(function(res){

      var url = res + "?callback=JSON_CALLBACK&userid=" + encodedUid;
      //var url = res + "?callback=JSON_CALLBACK&userid=" + CredentialService.getUid();

			console.log('Reservation URL: ' + url);
        	$http.jsonp(url)
			.success(function (data, status, headers, config) {
				console.log(JSON.stringify(data));
				var lstRooms =[];
				angular.forEach(data,function(r){
					try{
            var reservedDate = getFormatReservedDate(r.date);

						lstRooms.push(
							//use scheduleid instead of roomid
							//roomInfo(r.roomid, r.roomname, r.imagesrc, r.status,

							/*roomInfo(r.scheduleid, r.roomname, r.imagesrc, r.status,
							r.name, r.starttime, r.endtime, r.siteid)*/

							// floorname being set empty since this field does not exist in json from web service
							// roomInfo has reservation date
							roomInfo(r.scheduleid, r.roomname, r.imgsrc, angular.lowercase(r.status), r.name, tConvert(r.starttime), tConvert(r.endtime), reservedDate, r.siteid,
								r.sitename, r.seatingcapacity, r.floorplan, r.floorname)
						);
					}catch(err){
						console.log(err);
					}
				});

				/** Nick */
				self.setReservedRoomList(lstRooms);

				def.resolve(lstRooms);
			})
			.error(function(errRes,b,c){
				console.log('failed to read config file');
				def.reject(errRes);

			});
		},function(errRes){
			if(errRes.simulate){
				$http.get("./test/reservation.json").then(function (res){
					var data= res.data;
					console.log(JSON.stringify(data));
					console.log(data.length);
					var lstRooms =[];
					angular.forEach(data,function(r){
						try{
							lstRooms.push(
								//use scheduleid for live instead of roomid
								roomInfo(r.roomid, r.roomname, r.imagesrc, angular.lowercase(r.status),
								r.nextschedule.name, r.nextschedule.starttime, r.nextschedule.endtime, r.siteid)
							);
						}catch(err){
							console.log(err);
						}
					});
					def.resolve(lstRooms);
				},function(errRes){
					console.log("failed to receive reservation.json");
					def.reject(errRes);
				});
			}else{
				console.log('failed to read config file');
				def.reject(errRes);
			}
		});
		return def.promise;
	};

   function getFormatReservedDate(date) {

     var newDate = new Date(date);

     var month = parseInt(newDate.getMonth() + 1);

     var months = {
          1: 'January',
          2: 'February',
          3: 'March',
          4: 'April',
          5: 'May',
          6: 'June',
          7: 'July',
          8: 'August',
          9: 'September',
          10: 'October',
          11: 'November',
          12: 'December'
      };
      //Lara 10Feb16: shorten the date
     var strMonth = month >9 ? month.toString(): '0'+month;
     //return months[month] + ' ' + newDate.getDate() + ', ' + newDate.getFullYear();
     return newDate.getDate() + '/' + strMonth + '/' + newDate.getFullYear();
   }

	//for reservation-controller.js to query
	function pad(n, width, z) {
	  z = z || '0';
	  n = n + '';
	  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	}
	function formatHourMin(_t){
		//HH:mm
		t = new Date(_t);
		return  pad(t.getHours(),2) + ":" + pad(t.getMinutes(),2);
	}
	function formatDate(_d){
		//dd-mm-yyyy
		d= new Date(_d);
		return pad(d.getDate(), 2) + "-" + pad((d.getMonth() + 1), 2) + "-" + d.getFullYear();
	}
	function formatDate_YYYY(_d){
		//yyyy-mm-dd
		d= new Date(_d);
		return  d.getFullYear() + "-" + pad((d.getMonth() + 1), 2) + "-" + pad(d.getDate(), 2) ;
	}

	function tConvert (time) {
		// Check correct time format and split into components
		time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

		if (time.length > 1) { // If time format correct
			time = time.slice (1);  // Remove full string match value
			time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
			time[0] = +time[0] % 12 || 12; // Adjust hours
		}
		return time.join (''); // return adjusted time or original string
	}

	//for search-controller.js
	self.getAvailableRooms=function(_date, start, end, pax, floorID){
		var def=$q.defer();
		var useDate = formatDate(_date);

    var encodedUid = btoa(CredentialService.getUid());
    var encodedFromDate = btoa(useDate);
    var encodedEndDate = btoa(useDate);
    var encodedCapacity = btoa(pax);
    var encodedStartTime = btoa(formatHourMin(start));
    var encodedEndTime = btoa(formatHourMin(end));
    var encodedFloorID = btoa(floorID);

		ServerConfig.getUrl(ServerConfig.searchRoom).then(function(res){

      var url = res + "?callback=JSON_CALLBACK&userid=" + encodedUid +
        "&FromDate=" + encodedFromDate +
        "&EndDate=" + encodedEndDate +
        "&seatingcapacity=" + encodedCapacity +
        "&StartTime=" + encodedStartTime +
        "&EndTime=" + encodedEndTime +
        "&Floor=" + encodedFloorID;

        //var url = res + "?callback=JSON_CALLBACK&userid=" + CredentialService.getUid() +
        //	"&FromDate=" + useDate +
        //	"&EndDate=" + useDate +
        //	"&seatingcapacity=" + pax +
        //	"&StartTime=" + formatHourMin(start) +
        //	":00&EndTime=" + formatHourMin(end);

			console.log('Search URL: ' + url);
			//$http.get("/test/search.json").then(function (res){
			$http.jsonp(url)
			.success(function (data, status, headers, config) {
				//console.log('received simulated values');
				var rooms = data;
				var lstRoom = [];

				console.log('Available Rooms: ' + JSON.stringify(rooms));

				/*var timeslots = [{"start":"08:00","end":"08:14","status":"VACANT","info":""},
					{"start":"08:15","end":"08:29","status":"VACANT","info":""},
					{"start":"08:30","end":"08:44","status":"VACANT","info":""}];*/

				angular.forEach(rooms, function(r){
					//add artificial timeslots for test

					lstRoom.push
					(
						roomDetails(r.roomid, r.roomname,
								r.sitename, r.siteid, r.seatingcapacity, null,
								 r.imagesrc, r.floorplan)
					);

				});
				def.resolve(lstRoom);
			})
			.error(function(errRes){

				console.log('failed to receive simulated values');
				def.reject(errRes);

			});
		},function(errRes){
			if(errRes.simulate){
					console.log('is simulate');
					$http.get("./test/search.json").then(function (res){
						//console.log('received simulated values');
						var data= res.data;
						var rooms = data;
						var lstRoom = [];
						/*angular.forEach(rooms,function(r){
							//add artificial timeslots for test
							var timeslots = [{
						       	"start": "17:00",
						        "end": "18:00",
								"status":"VACANT",
								"info":"",
						        "schedules": []
						    },{
						       	"start": "18:00",
						        "end": "19:00",
								"status":"VACANT",
								"info":"",
						        "schedules": []
						    },{
						       	"start": "19:00",
						        "end": "20:00",
								"status":"VACANT",
								"info":"",
						        "schedules": []
						     },{
						       	"start": "21:00",
						        "end": "22:00",
								"status":"VACANT",
								"info":"",
						        "schedules": []
						    },{
						       	"start": "22:00",
						        "end": "23:00",
								"status":"VACANT",
								"info":"",
						        "schedules": []
						     },{
						       	"start": "23:00",
						        "end": "24:00",
								"status":"VACANT",
								"info":"",
						        "schedules": []
						    }];
							lstRoom.push(
								roomDetails(r.roomid, r.roomname,
										r.sitename, r.seatingcapacity, timeslots,
										 r.imagesrc, r.floorplan)
							);
						});*/
						def.resolve(lstRoom);
					},function(errRes){
						console.log('unable to load search.json');
						def.reject(errRes);
					});
				}else{
					console.log('failed to read config file');
					def.reject(errRes);
				}
		});
		return def.promise;
	};
	//for reservation-controller.js to query
	self.manageMeeting=function(id, start, cancel, end){
		var def= $q.defer();
		var useUrl;
		if(cancel){
			useUrl = ServerConfig.getUrl(ServerConfig.cancelMeeting);
		}else if(start){
			useUrl = ServerConfig.getUrl(ServerConfig.startMeeting);
		}else if(end) {
			//end
			useUrl = ServerConfig.getUrl(ServerConfig.endMeeting);
		} else {
      useUrl = ServerConfig.getUrl(ServerConfig.extendMeeting);
    }

    var encodedUid = btoa(CredentialService.getUid());
    var encodedScheduleID = btoa(id);

		useUrl.then(function(res){
      var url = res + "?callback=JSON_CALLBACK&userid=" + encodedUid +
        "&scheduleid=" + encodedScheduleID;

			/*var url = res + "?callback=JSON_CALLBACK&userid=" + CredentialService.getUid() +
			"&scheduleid=" + id;*/

      console.log(url);

			$http.jsonp(url).
				success(function (data, status, headers, config) {
        console.log('self.manageMeeting: ' + JSON.stringify(data));
					def.resolve(data);
				}).
				error(function(data, status, headers, config){
					console.log('failed to connect to server');
					def.reject(errRes);
				});
		},function(errRes){
			if(errRes.simulate){
				def.resolve();
			}else{
				console.log('failed to read config file');
				def.reject(errRes);
			}

		});

		return def.promise;
	};

	//for room-reservation confirmation slot time display
	self.formatSlotDisplay=function(slots, onNull){
		//if a to b, b to c, f to g -> should display a-> c, f->g
		var useSlot="";
		var isChecked=false;
		var b="";
		var assignedLast=false;
		//tabulate slots
		angular.forEach(slots,function(s){
			//try and get stretches of time
			if(s.checked){
				isChecked=true;
				if(b!="" && b==s.start){
					//this.start == prev.end
					b=s.end;
					console.log('b is NOT empty, assign new->' + b);
				}else{
					//previous wasn't selected || this.start != prev.end;
					//this slot can't be linked, throw out b, create new slot
					useSlot +=b + "</li>";

					console.log('b is NOT SAME, throw->' + b);
					b=s.end;
					console.log('b is EMPTY, assign new->' + b);
					/*if(useSlot!="")
						useSlot+="<br>";*/

					useSlot += "<li>" + s.start + " to ";

				}
				assignedLast=false;


			}else{
				console.log('slot NOT checked->' + JSON.stringify(s));
				//this slot can't be linked, throw out b, create new slot
				useSlot +=b + "</li>";
				assignedLast=true;
				b="";//reset b
			}


			console.log('useSlot is->' + useSlot);
		});

		if(!assignedLast){
			useSlot +=b + "</li>";
		}

		if(!isChecked && onNull)
			useSlot= onNull; //useSlot= $scope.slot;

		//return
		return "Time Slot(s): <b>" + useSlot + "</b>";
	},
    //general reservation
	self.reserveRoom=function(id, _date, start, end, name){
		var def=$q.defer();
		console.log(JSON.stringify({d:_date, s:start, e:end, n:name}));
		//var useDate = formatDate_YYYY(_date);
		var url = null;
    try
    {
      var encodedUid = btoa(CredentialService.getUid());
      var encodedStartDate = btoa(_date);
      var encodedEndDate = btoa(_date);
      var encodedStartTime = btoa(start);
      var encodedEndTime = btoa(end);
      var encodedSubject = btoa(name);
      var encodedRid = btoa(id);
    }catch(err){
      def.reject("Invalid characters not allowed");
    }


		ServerConfig.getUrl(ServerConfig.reserveRoom).then(function(res){


			url = res + "?callback=JSON_CALLBACK&UserId=" + encodedUid +
				"&StartDate=" + encodedStartDate +
				"&EndDate=" + encodedEndDate +
				"&StartTime=" + encodedStartTime +
				"&EndTime=" + encodedEndTime +
				"&subject=" + encodedSubject +
				"&RoomId=" + encodedRid;

			/*url = res + "?callback=JSON_CALLBACK&UserId=" + CredentialService.getUid() +
				"&StartDate=" + _date +
				"&EndDate=" + _date +
				"&StartTime=" + start +
				"&EndTime=" + end +
				"&subject=" + name +
				"&RoomId=" + id;*/

			console.log('Reservation URL: ' + url);


				$http.jsonp(url)
					.success(function (data, status, headers, config) {
						if (data.success === true)
						{
							console.log('StartTime: ' + start);
							console.log('EndTime: ' + end);
							console.log('StartDate: ' + _date);
							console.log('EndDate: ' + _date);
							console.log('Reserved ---> ' + JSON.stringify(data));
							def.resolve();
						}else{
							console.log('Reserved Room Failed --> ' + JSON.stringify(data));
							def.reject(JSON.stringify(data));
						}
					})
					.error(function(errRes, status, headers, config){
						console.log('failed to connect to server');
            console.log(errRes);
            console.log(status);
						def.reject(errRes);
					});
		},function(errRes){
			if(errRes.simulate){
				def.resolve();
			}else{
				console.log('failed to read config file');
				def.reject(errRes);
			}
		});
		return def.promise;
	};
	//Helper Functions for Rooms
	self.getImageUrl=function(){
		return ServerConfig.getImageUrl();
	};
	self.getRoomCss=function(status){
		try{
			switch(angular.lowercase(status)){
				case self.starting:
					return 'status-yellow';
				case self.started:
					return 'status-red';
				case self.pending:
					return 'status-yellow';
				default:
					return 'status-green';
			}
		}
		catch(err){
			return 'status-yellow';
		}
	};
	self.getStatusCss=function(status){

    if(status && status.toLowerCase() === 'reserved') {
      status = 'starting';
    } else if (status && status.toLowerCase() === 'occupied') {
      status = 'started';
    } else if(status && status.toLowerCase() === 'pending admin approval') {
      status = 'pending';
    }

		if(status && angular.lowercase(status) == self.started){
			return "assertive";
		}
		else{
			return "balanced";
		}
	};
	self.isStarted=function(status){

    if(status && status.toLowerCase() === 'reserved') {
      status = 'starting';
    } else if (status && status.toLowerCase() === 'occupied') {
      status = 'started';
    } else if(status && status.toLowerCase() === 'pending admin approval') {
      status = 'pending';
    }

		if(angular.lowercase(status) == self.started){
			console.log('RoomSErvice.isStarted():' + JSON.stringify({statusIs: status, compIs: self.started}));
			return true;
		}else{
			console.log('RoomSErvice.isStarted():' + JSON.stringify({statusIs: status, compIs: self.starting}));
			return false;
		}
	};

	self.decodeQrCode = function(roomID){
		var def= $q.defer();
		ServerConfig.getUrl(ServerConfig.qrCode).then(function(res){

        var encodedUid = btoa(CredentialService.getUid());
        var encodedRid = btoa(roomID);

        var url = res + "?callback=JSON_CALLBACK&userid=" + encodedUid + "&rid= " +
          encodedRid;

        	/*var url = res + "?callback=JSON_CALLBACK&userid=" + CredentialService.getUid() + "&rid= " +
				roomID;*/

        	$http.jsonp(url)
			.success(function (data, status, headers, config) {
				console.log('QR Service --> ' + JSON.stringify(data));
				def.resolve(data);
			})
			.error();
		}
		,function(errRes){
			if(errRes.simulate){
				$http.get("./test/qr-init.json").then(function (res){
					var data= res.data;
					console.log(JSON.stringify(data));
					def.resolve({ack: data["type"] == 0, id: data["roomid"], name: data["roomname"]});
				},function(errRes){
					console.log("failed to receive reservation.json");
					def.reject(errRes);
				});
			}else{
				console.log('failed to read config file');
				def.reject(errRes);
			}
		});
		return def.promise;
	};


	/** Nick */
	self.getRoomList = function() {
		return self.roomList;
	};

	self.setRoomList = function(roomList) {
		self.roomList = roomList;
	};

	self.getReservedRoomList = function() {
		return self.reservedRoomList;
	};

	self.setReservedRoomList = function(reservedRoomList) {
		self.reservedRoomList = reservedRoomList;
	};
})
.service('AppService',function($rootScope, $state, AppConfigService){
	var self= this;
	self.eventSuccess=function(type,data){
		doEvent(type,data);
	};
	//for tab-controller.js
	self.newSearch=function(){
		$rootScope.$broadcast('search.refresh');
	}
	$rootScope.$on('event.success',function(event, curr){
		console.log('event.success.received! curr is->' + curr);
		doEvent(curr);

	});

	self.goHome=function(){
		console.log('can go home?');
		AppConfigService.getPreferredLandingPageState().then(function(res){
			console.log('go.Home->' + res);
			$state.go(res);
		},function(err){
			console.log(JSON.stringify(err));
		});
	};

	function doEvent(type, data){
		switch(type){
			case 'login':
				$state.go('tab.home');
				break;
			case 'logout':
				$state.go('login');
				break;
			case 'room-reserved':
				$state.go('tab.reservation');
				break;
			case 'qr-ack':
				$state.go("tab.reservation-detail",{param:data});
				break;
			case 'qr-book':
				$state.go("tab.home-roomschedule",{param:data});
				break;
			case 'mend':
			case 'mcancel':
				$state.go('tab.reservation');
				break;

		}
	}
})
//CredentialService holds username, password & IP.
.service('CredentialService', function($rootScope, $http, $q, ServerConfig){
//this service handles all the credential storage, log in, log out
	    var self = this;
	    self.isInit=false;
	    //self.username=null;
	    //self.displayName=null;
	    self.isLoggedIn = function(){
	        console.log("self.uid is->" + self.getUid());
	        console.log("self.getDisplayName is->" + self.getDisplayName());
	        var id= self.getUid();
	        if(id == '' || id == null || id=='undefined'){
	        	return false;
	        }else{
	        	return true;
	        }
	    };
	    function resetCredentials(){
	    	localStorage.setItem("username", "");
			  localStorage.setItem("name", "");
			  localStorage.setItem("password", "");
			  localStorage.username="";
			  localStorage.name="";
			  localStorage.password = "";
	    }

	    self.getDisplayName=function(){
	    	var ret = localStorage.getItem("name");
	    	if(ret =="" || ret == null){
	    		ret = localStorage.name;
	    	}
	    	return ret;
	    };

	    self.getUid=function(){
	    	var ret = localStorage.getItem("username");

	    	if(ret =="" || ret == null){
	    		ret = localStorage.username;
	    	}
	    	return ret;
	    };

		self.getPassword = function() {
			var password = localStorage.getItem("password");

			if(password=="" || password==null) {
				password = localStorage.password;
			}

			return password;
		}
    //Lara 11Feb16: added - return http protocol based on boolean param
    self.getHttpProtocol=function(isHttps){
      return isHttps?"https" : "http";
    };
  //Lara 11Feb16: added - return boolean whether protocol is https
    self.isHttpsEnabled=function(){
      var isHttps=localStorage.getItem("isHttps");
      if(isHttps=="" || isHttps==null){
        isHttps=localStorage.isHttps;
      }
      return isHttps == 'https' ? true : false;
    };


		/*self.saveCredentials = function(username,password,ip,isHttpsEnabled) {
			localStorage.setItem("username", username);
			localStorage.setItem('password', password);
			localStorage.setItem("serverip", ip);
      localStorage.setItem('isHttps', isHTTPSEnabled);
			localStorage.username = username;//? why set so many:some cannot work in IOS
			localStorage.serverip = ip;//? why set so many:some cannot work in IOS
			localStorage.password = password;
      localStorage.isHttps = isHTTPSEnabled;
		}*/

    self.getIp=function(){
	    	var ret = localStorage.getItem("serverip");
	    	if(ret =="" || ret == null){
	    		ret = localStorage.serverip;
	    	}

	    	console.log('serverip from localStorage is->' + ret);
	    	return ret;
	    };
	    //auth sets Uid/DisplayName
	    self.auth=function(username,password,ip, isHTTPSEnabled){

        //Lara 10Feb16: this portion is redundant, every re-authentication, the user must specify protocol
        //var isHttps = localStorage.getItem("isHttps");

        //if(isHttps || isHTTPSEnabled) {
        console.warn("@CredentialService.auth(): isHTTPEnabled->%s", isHTTPSEnabled.toString());
        var  http = self.getHttpProtocol(isHTTPSEnabled);


	    	var def= $q.defer();
	        var url="";//get frin ServerConfig
	        //var url = $scope.httpprotocol + "://" + $scope.baseURL + ":" + $scope.port + $scope.basePath + $scope.authenticate + "?callback=JSON_CALLBACK&UserId=" + username + "&StartDate=" + new Date() + "&Password=" + password ;

        // Server address appended by following path
        var _ip = http + '://' + ip + '/smartroommobiledata';
        //console.warn("_ip is->%s",_ip);
        ServerConfig.setIpAddr(_ip).then(function(res){//pass ip down to server config
	        	ServerConfig.getUrl(ServerConfig.login).then(function(res){

              try {
                var encodedUsername = btoa(username);
                var encodedPassword = btoa(password);
              }catch(err){
                def.reject({success:false});
              }
              var url = res + "?callback=JSON_CALLBACK&UserId=" + encodedUsername + "&Password=" + encodedPassword ;
              //var url = res + "?callback=JSON_CALLBACK&UserId=" + username + "&Password=" + password ;

              $http.jsonp(url).
						success(function (data, status, headers, config) {
							console.log('Login: ' + JSON.stringify(data));
							if (data.success === true) {
								//return username for display?
								console.log('auth: data.success');
								localStorage.setItem("username", username);
								localStorage.setItem("name", data.name);
								localStorage.setItem('password', password);
                localStorage.setItem('isHttps', http);
								localStorage.setItem("serverip", ip);
								localStorage.username = username;//? why set so many:some cannot work in IOS
								localStorage.name = data.name;//? why set so many:some cannot work in IOS
								localStorage.serverip = ip;//? why set so many:some cannot work in IOS
								localStorage.password = password;
                localStorage.isHttps = http;
								/*self.username = username;
								self.displayName = data.name*/
								def.resolve({success:true, name:data.name});
							}
							else
							{
								console.log('reject credentials');
								//resetCredentials();
								def.reject({success:false});
							}
						}).
						error(function (data, status, headers, config) {
							//resetCredentials();

							def.reject({success:false, error: status, data:data});
						});
				},function(errRes){
					if(errRes.simulate){
						console.log('is simulate self.auth');
						def.resolve({success:true, name:username});
					}else{
						alert('unable to get login url from server config');
						def.reject({success:false, error:JSON.stringify(errRes)});
					}
				});


	        },function(errRes){
	        	alert('unable to save ip addr');
				def.reject({success:false, error:JSON.stringify(errRes)});
	        });

			return def.promise;
	    };

	    self.init=function(){
	    	console.log('CredentialService.init()!');
	    	ServerConfig.init(self.getIp());
	    	self.isInit=true;
	    }
	    self.logout=function(){
          console.log('Logging out. Clearing all local storage!');
			    resetCredentials();
	    };

	    //init on start
	    if(!self.isInit)
	    	self.init();
})
.service('AppConfigService',function($http, $q, $rootScope, ServerConfig, CredentialService, $ionicPopup, MaskFac, $ionicHistory, $state){
	var self=this;
	//private, localstoragekeys
	var keys={
		keyFilterSite:"filterSite",
		keyFilterLevel:"filterLevel",
		keyLandingPage:"landingPage"
	};
	//my options
	self.filterOptions={};
	self.landingPageOptions=[];
	//my settings
	self.landingPage='';
	self.filter={
		site:"",
		level:""
	};

  self.floors = [];
	self.isInit=false;


	function requestFilterOptions(){

		console.log('@AppConfigService.requestFilterOptions()!');
		var def= $q.defer();

		/*ServerConfig.getSiteUrl(ServerConfig.site).then(function(res){
			var url = res + "?callback=JSON_CALLBACK&userid=" + CredentialService.getUid();

			console.log('ServerConfig.getSiteUrl ---> ' + url);

			$http.jsonp(url).
				success(function (data, status, headers, config) {
					console.log('Site Data: ' + JSON.stringify(data));

				}).
				error(function (data, status, headers, config) {
					//resetCredentials();

					def.reject({success:false, error: status, data:data});
				});

		});*/

		ServerConfig.getFloorUrl(ServerConfig.floor).then(function(res){
			MaskFac.loadingMask(true, 'Loading');

      var encodedUid = btoa(CredentialService.getUid());

      var url = res + "?callback=JSON_CALLBACK&userid=" + encodedUid;
      //var url = res + "?callback=JSON_CALLBACK&userid=" + CredentialService.getUid();

			console.log('ServerConfig.getFloorUrl ---> ' + url);

			var siteSettingList = [];
			var floorSettingList = [];

			$http.jsonp(url).
				success(function (data, status, headers, config) {

					console.log('Floor & Site Data: ' + JSON.stringify(data));

					siteSettingList.push({displayName: "Any", value: ""});
					floorSettingList.push({displayName: "Any", value: "", floorID: ""});

					for(var index in data) {
						siteSettingList.push({displayName: data[index].SiteName, value: data[index].siteid});
						floorSettingList.push({displayName: data[index].name, value: data[index].name, floorID: data[index].id});
					}

					// Removing duplicate entry from list
					var siteArray = {};
					for ( var i=0, len= siteSettingList.length; i < len; i++ ) {
						siteArray[siteSettingList[i]['displayName']] = siteSettingList[i];
					}

					siteSettingList = [];
					for ( var key in siteArray ) {
						siteSettingList.push(siteArray[key]);
					}

					var floorArray = {};
					for ( var i=0, len= floorSettingList.length; i < len; i++ ) {
						floorArray[floorSettingList[i]['displayName']] = floorSettingList[i];
					}

					floorSettingList = [];
					for ( var key in floorArray ) {
						floorSettingList.push(floorArray[key]);
					}

					self.filterOptions = {
						site: siteSettingList,
						level: floorSettingList
					};

					MaskFac.loadingMask(false);

					def.resolve(self.filterOptions);
				}).
				error(function (data, status, headers, config) {
					MaskFac.loadingMask(false);

          /*var confirmPopup = $ionicPopup.confirm({
            title: 'Connection Error',
            template: 'Unable to connect to server. Do you want to change your server IP and try again?',
            okText: 'Logout'
          });
          confirmPopup.then(function(res) {
            if(res) {
              CredentialService.logout();

              $state.go('login');
            }
          });*/

          //$rootScope.ip = CredentialService.getIp();
          //
          //var myPopup = $ionicPopup.show({
          //  template: '<input type="text" ng-model="ip">',
          //  title: 'Connection Error',
          //  subTitle: 'Unable to connect to server. Please update your URL.',
          //  scope: $rootScope,
          //  buttons: [
          //    { text: 'Cancel' },
          //    {
          //      text: '<b>Connect</b>',
          //      type: 'button-positive',
          //      onTap: function(e) {
          //        if (!$rootScope.ip) {
          //          //don't allow the user to close unless he enters wifi password
          //          e.preventDefault();
          //        } else {
          //          return $rootScope.ip;
          //        }
          //      }
          //    }
          //  ]
          //});
          //myPopup.then(function(res) {
          //  MaskFac.loadingMask(true, 'Connecting');
          //
          //  var username =  CredentialService.getUid();
          //  var password = CredentialService.getPassword();
          //  var newIP = res;
          //
          //  CredentialService.auth(username, password, newIP)
          //    .then(function(res){
          //      console.log('Authenticating with server using new IP: ' + newIP);
          //      self.getPreferredLandingPageState().then(function(res){
          //        console.log('go.Home->' + res);
          //        $state.go(res);
          //      },function(err){
          //        console.log(JSON.stringify(err));
          //      });
          //
          //      MaskFac.loadingMask(false);
          //    },function(errRes){
          //      $ionicPopup.alert({
          //        title: 'Connection Error',
          //        template: 'Unable to connect to server. Please quit your app and launch it again after you have successfully connected to your office wifi or vpn.',
          //        buttons: []
          //      });
          //
          //      MaskFac.loadingMask(false);
          //    });
          //});

					def.reject({success:false, error: status, data:data});
				});
		});


		//TODO: populate from lihock
		/*self.filterOptions={
			site:[{displayName:"Any",value:""},{displayName:"MBFC Level 62",value:1},{displayName:"Tung Centre",value:2},{displayName:"Vietnam",value:3}],
			level:[{displayName:"Any",value:""},{displayName:"Singapore",value:1},{displayName:"Australia",value:2},{displayName:"Vietnam",value:3}]
		};
		def.resolve(self.filterOptions);*/
		return def.promise;
	}


	function requestLandingPageOptions(){
		var def= $q.defer();
		ServerConfig.getLandingPageOption().then(function(res){
			self.landingPageOptions=res;
			def.resolve();
		},function(err){
			def.reject(err);
		});
		return def.promise;
	}


	function jsonSearch(arr,val){
		var ret=arr[0];
		if(val){
			angular.forEach(arr,function(op){
				if(op.value == val){
					console.log('found ' + op.value);
					ret = op;
				}
			});
		}
		return ret;
	}

	function retrieveFilters() {
		console.log('AppConfigService.retrievingAppConfig()');
		//fill defaults if setting not found
		var _site = retrieveSettings(keys.keyFilterSite);
		var _level = retrieveSettings(keys.keyFilterLevel);

		self.filter={
			site: jsonSearch(self.filterOptions.site, _site),
			level: jsonSearch(self.filterOptions.level, _level)
		};

		console.log('filter->' + JSON.stringify(self.filter));
	};

	function retrieveLandingPage(){
		console.log('AppConfigService.retrievingAppConfig()');
		//fill defaults if setting not found

		var _landing = retrieveSettings(keys.keyLandingPage);

		self.landingPage= jsonSearch(self.landingPageOptions, _landing);

		console.log('landingpage->' + JSON.stringify(self.landingPage));

	}
	function storeSettings(n,v){
		localStorage.setItem(n, v);
		localStorage[n]=v;
	}
	function retrieveSettings(n){
		var ret = localStorage.getItem(n);
    	if(ret =="" || ret == null){
    		ret = localStorage[n];
    	}

    	return ret;
	}

	this.prepareFilter = function() {
		var def= $q.defer();

		requestFilterOptions().then(function(){
			retrieveFilters();

			def.resolve();
		},function(errFilter){
			def.reject(errFilter);
		});

		return def.promise;
	};

	function init(){
		console.log('AppConfigService.init()!');
		var def= $q.defer();

		//requestFilterOptions().then(function() {
    //	retrieveFilters();
    //	requestLandingPageOptions().then(function(){
    //		console.log(self.landingPageOptions);
    //		retrieveLandingPage();
    //		self.isInit=true;
    //		console.log('AppConfigService.self.isInit: true')
    //		def.resolve();
    //	},function(errLanding){
    //		//console.log(JSON.stringify(errLanding));
    //		def.reject(errLanding);
    //	});
    //}, function(errFilter) {
    //	//console.log(JSON.stringify(errFilter));
    //	def.reject(errFilter);
    //});

    requestLandingPageOptions().then(function(){
      console.log(self.landingPageOptions);
      retrieveLandingPage();
      self.isInit=true;
      console.log('AppConfigService.self.isInit: true')
      def.resolve();
    },function(errLanding){
      //console.log(JSON.stringify(errLanding));
      def.reject(errLanding);
    });

		return def.promise;
	}
	//for home.html
	self.isFilterCriteriaMet= function(siteId, levelId){
		if(self.filter.site.value || self.filter.level.value){
			if(self.filter.site.value && self.filter.level.value){
			 	if(siteId == self.filter.site.value && levelId==self.filter.level.value){
			 		return true;//has site & level filter
			 	}else{
			 		return false;
			 	}
			}
			else if(self.filter.site.value  && siteId == self.filter.site.value){
				return true;//has site filter only
			}else if(self.filter.level.value  && levelId == self.filter.level.value){
				return true;//has level filter only
			}

			return false;

		}else{

			return true;
		}
	};


	self.save=function(landing,site,level){
		storeSettings(keys.keyLandingPage, landing);
		storeSettings(keys.keyFilterSite, site);
		storeSettings(keys.keyFilterLevel, level);
		console.log('**check save***');
		retrieveLandingPage();
		retrieveFilters();
	};

	self.getPreferredLandingPageState=function(){
		console.log("@AppConfigService.getPreferredLandingPageState()")
		var def=$q.defer();
		if(self.landingPage){
			console.log("@AppConfigService is init, return landingpage value");
			def.resolve(self.landingPage.value);

		}
		else{
			console.log("@AppConfigService requires init");
			init().then(function(){
				def.resolve(self.landingPage.value);
			});
		}
		return def.promise;
	};

	//find out if any filter was set on the user side.
	self.hasFilter=function(def){
		if(!def){
			def =$q.defer();
		}
		 if(!self.isInit){
			init().then(function(){
				console.log('hasFilter is recurssing after init');

				self.hasFilter(def);
			});
		}else if((self.filter.site && self.filter.site.value) || (self.filter.level && self.filter.level.value)){
			console.log('hasFilter resolved, true');
			console.log('siteFilter->' + JSON.stringify(self.filter.site));
			console.log('levelFilter->' + JSON.stringify(self.filter.site))
			def.resolve(true);
		}else{
			console.log('hasFilter resolved, false');
			def.resolve(false);
		}
		return def.promise;
	};


	$rootScope.$on('deviceReady',function(){
		console.log("AppConfigService deviceReady!");
		init();
	});
});
