angular.module('starter')

	.controller('RemindersManageCtrl', function($scope, authService, $ionicPopup, localStorageService, $state,
												reminderService, $ionicLoading, measurementService, utilsService,
												$stateParams, $filter){

	    $scope.controller_name = "RemindersManageCtrl";

		console.log('Loading ' + $scope.controller_name);
	    
	    $scope.state = {
			variableCategory : $stateParams.variableCategoryName,
	    	showMeasurementBox : false,
	    	selectedReminder : false,
	    	reminderDefaultValue : "",
	    	selected1to5Value : false,
	    	allReminders : [
	    	],
	    	trackingRemindersNotifications : [
	    	],
	    	filteredReminders : [
	    	],
	    	measurementDate : new Date(),
	    	slots : {
				epochTime: new Date().getTime()/1000,
				format: 24,
				step: 1
			},
			variable : {},
			isDisabled : false
	    };

		if($stateParams.variableCategoryName){
			$scope.state.title = "Manage " + $filter('wordAliases')($stateParams.variableCategoryName);
			$scope.state.addButtonText = "Add New " + pluralize($filter('wordAliases')($stateParams.variableCategoryName), 1);
		} else {
			$scope.state.title = "Manage Reminders";
			$scope.state.addButtonText = "Add new reminder";
		}

	    $scope.select_primary_outcome_variable = function($event, val){
	        // remove any previous primary outcome variables if present
	        jQuery('.primary_outcome_variables .active_primary_outcome_variable').removeClass('active_primary_outcome_variable');

	        // make this primary outcome variable glow visually
	        jQuery($event.target).addClass('active_primary_outcome_variable');

	        jQuery($event.target).parent().removeClass('primary_outcome_variable_history').addClass('primary_outcome_variable_history');

	        $scope.state.selected1to5Value = val;

		};

	    var utils = {
    	    startLoading : function(){
    	    	// show spinner
    			$ionicLoading.show({
    				noBackdrop: true,
    				template: '<p class="item-icon-left">Fetching your reminders...<ion-spinner icon="lines"/></p>'
    		    });
    	    },

    	    stopLoading : function(){
    	    	// hide spinner
    	    	$ionicLoading.hide();
    	    },

    	    // alert box
	        showAlert : function(title, cssClass) {
				return $ionicPopup.alert({
					cssClass : cssClass? cssClass : 'calm',
					okType : cssClass? 'button-'+cssClass : 'button-calm',
					title: title
				});
	        }
	    };

	    var getVariable = function(variableName){
	    	measurementService.getVariablesByName(variableName)
	    	.then(function(variable){
	    		$scope.state.variable = variable;
	    	}, function(){
	    		utils.showAlert('Can\'t find variable. Try again!', 'assertive').then(function(){
	    			$state.go('app.historyAll');
	    		});
	    	});
	    };

	    var getTrackingReminders = function(){
	    	//utils.startLoading();
	    	reminderService.getTrackingReminders($stateParams.variableCategoryName)
	    	.then(function(reminders){
	    		$scope.state.allReminders = reminders;
	    		utils.stopLoading();
	    	}, function(){
	    		utils.stopLoading();
	    		console.log("failed to get reminders");
				console.log("need to log in");
				$ionicLoading.hide();
				utilsService.showLoginRequiredAlert($scope.login);
	    	});
	    };
		
	    $scope.cancel = function(){
	    	$scope.state.showMeasurementBox = !$scope.state.showMeasurementBox;
	    	
	    	if($scope.state.title === "Edit Measurement"){
				$state.go('app.historyAll');
			}
	    };

	    $scope.track = function(reminder, modifiedReminderValue){
			console.log('modifiedReminderValue is ' + modifiedReminderValue);
	    	reminderService.trackReminder(reminder.id, modifiedReminderValue)
	    	.then(function(){
	    		$scope.init();

	    	}, function(err){
	    		utils.showAlert('Failed to Track Reminder, Try again!', 'assertive');
	    	});
	    };

	    $scope.skip = function(reminder){
	    	
	    	reminderService.skipReminder(reminder.id)
	    	.then(function(){
	    		$scope.init();

	    	}, function(err){
	    		utils.showAlert('Failed to Skip Reminder, Try again!', 'assertive');
	    	});
	    };

	    // when date is updated
	    $scope.currentDatePickerCallback = function (val) {
	    	if(typeof(val)==='undefined'){
	    		console.log('Date not selected');
	    	} else {
	    		$scope.state.measurementDate = new Date(val);
	    	}
	    };

		// when time is changed
		$scope.currentTimePickerCallback = function (val) {
			if (typeof (val) === 'undefined') {
				console.log('Time not selected');
			} else {
				var a = new Date();
				a.setHours(val.hours);
				a.setMinutes(val.minutes);
				$scope.state.slots.epochTime = a.getTime()/1000;
			}
		};

	    $scope.snooze = function(reminder){
	    	reminderService.snoozeReminder(reminder.id)
	    	.then(function(){
	    		$scope.init();

	    	}, function(err){
	    		utils.showAlert('Failed to Snooze Reminder, Try again!', 'assertive');
	    	});
	    };

	    var setupTracking = function(unit, variableName, dateTime, value){
	    	console.log('track : ' , unit, variableName, dateTime, value);

	    	if(dateTime.indexOf(" ") !== -1) 
	    		dateTime = dateTime.replace(/\ /g,'+');

	    	$scope.state.title = "Edit Measurement";
	    	$scope.state.showMeasurementBox = true;

	    	$scope.state.selectedReminder = {
	    		variableName : variableName,
	    		abbreviatedUnitName : unit
	    	};
	    	$scope.state.reminderDefaultValue = value;
	    	$scope.state.slots.epochTime = moment(dateTime).unix();
	    	$scope.state.measurementDate = moment(dateTime)._d;
	    	getVariable(variableName);
	    };

	    // constructor
	    $scope.init = function(){

			// get user token
			authService.getAccessTokenFromAnySource().then(function(token){
				var unit = utilsService.getUrlParameter(location.href, 'unit', true);
				var variableName = utilsService.getUrlParameter(location.href, 'variableName', true);
				var dateTime = utilsService.getUrlParameter(location.href, 'dateTime', true);
				var value = utilsService.getUrlParameter(location.href, 'value', true);

				if($stateParams.unit !== null && typeof $stateParams.unit !== "undefined"
					&& $stateParams.variableName !== null && typeof $stateParams.variableName !== "undefined"
					&& $stateParams.dateTime !== null && typeof $stateParams.dateTime !== "undefined"
					&& $stateParams.value !== null && typeof $stateParams.value !== "undefined"){

					setupTracking($stateParams.unit,
						$stateParams.variableName,
						$stateParams.dateTime,
						$stateParams.value);

				} else if(unit || variableName || dateTime || value){

					$scope.state.title = "Edit Measurement";
					$scope.state.showMeasurementBox = true;

					if(unit && variableName && dateTime && value){
						setupTracking(unit,
							variableName,
							dateTime,
							value);
					} else {
						$scope.state.isDisabled = true;
						utils.showAlert('Missing Parameters, need unit, variableName, dateTime and value!','assertive');
					}

				} else if($state.is('app.reminders_manage') || $state.is('app.reminders_manage_category')){
					getTrackingReminders();
				} else {
					getTrackingReminderNotifications();
				}
			}, function(){
				$ionicLoading.hide();
				console.log("need to log in");
				//utilsService.showLoginRequiredAlert($scope.login);
			});
			
	    };

	    $scope.saveMeasurement = function(){

	    	var dateFromDate = $scope.state.measurementDate;
	    	var timeFromDate = new Date($scope.state.slots.epochTime * 1000);

	    	dateFromDate.setHours(timeFromDate.getHours());
	    	dateFromDate.setMinutes(timeFromDate.getMinutes());
	    	dateFromDate.setSeconds(timeFromDate.getSeconds());

	    	console.log("reported time: ", moment(dateFromDate).unix());

	    	var category = "Emotions";

	    	if($scope.state.selectedReminder.variableCategoryName) {
	    		category = $scope.state.selectedReminder.variableCategoryName;
	    	}
	    	if($scope.state.variable.category) {
	    		category = $scope.state.variable.category;
	    	}

	    	console.log("selected Category: ", category);

	    	var isAvg = true;
	    	if($scope.state.selectedReminder.combinationOperation) {
	    		isAvg = $scope.state.selectedReminder.combinationOperation !== "MEAN";
	    	}
	    	if($scope.state.variable.combinationOperation) {
	    		isAvg = $scope.state.variable.combinationOperation !== "MEAN";
	    	}

	    	console.log("selected combinationOperation is Average?: ", isAvg);
	    	
	    	// populate params
	    	var params = {
	    	    variable : $scope.state.selectedReminder.variableName,
	    	    value : $scope.state.reminderDefaultValue,
	    	    epoch : moment(dateFromDate).valueOf(),
	    	    unit : $scope.state.selectedReminder.abbreviatedUnitName,
	    	    category : category,
	    	    isAvg : isAvg
	    	};

	    	if($scope.state.selectedReminder.abbreviatedUnitName === '/5') {
				params.value = $scope.state.selected1to5Value;
            }

			utils.startLoading();
    		var usePromise = true;
    	    // post measurement
    	    measurementService.post_tracking_measurement(params.epoch,
    	        params.variable,
    	        params.value,
    	        params.unit,
    	        params.isAvg,
    	        params.category,
				params.note,
				usePromise)
    	    .then(function(){
    	    	if($scope.state.title === "Edit Measurement"){
    	    		utils.stopLoading();
    	    		utils.showAlert('Measurement Updated!').then(function(){
    	    			$state.go('app.historyAll');
    	    		});
    	    	} else {
    	    		$scope.state.showMeasurementBox = false;
    	    		$scope.skip($scope.state.selectedReminder);
    	    		$scope.init();
    	    	}
    	    }, function(){
    	    	utils.stopLoading();
    	    	utils.showAlert('Failed to post measuement, Try again!','assertive');
    	    });

	    };

	    $scope.editMeasurement = function(reminder){

	    	$scope.state.showMeasurementBox = true;
	    	$scope.state.selectedReminder = reminder;
	    	$scope.state.reminderDefaultValue = reminder.defaultValue;
	    	$scope.state.slots.epochTime = moment.utc(reminder.trackingReminderNotificationTime).unix();
	    	$scope.state.measurementDate = new Date(reminder.trackingReminderNotificationTime);

	    	if($scope.state.selectedReminder.abbreviatedUnitName === '/5'){
	    		setTimeout(function(){
	    			jQuery('.primary_outcome_variables .active_primary_outcome_variable').removeClass('active_primary_outcome_variable');
	    			jQuery('.primary_outcome_variables img:nth-child('+ reminder.defaultValue +')').addClass('active_primary_outcome_variable');
	    			jQuery('.primary_outcome_variables img:nth-child('+ reminder.defaultValue +')').parent().removeClass('primary_outcome_variable_history').addClass('primary_outcome_variable_history');
	    		}, 500);

	    		$scope.state.selected1to5Value = reminder.defaultValue;
	    	}
	    };

	    $scope.edit = function(reminder){
	    	reminder.fromState = $state.current.name;
	    	$state.go('app.reminder_add', {reminder : reminder});
	    };

	    $scope.deleteReminder = function(reminder){
	    	utils.startLoading();
	    	reminderService.deleteReminder(reminder.id)
	    	.then(function(){

	    		utils.stopLoading();
	    		utils.showAlert('Reminder Deleted.');
	    		$scope.init();

	    	}, function(err){

	    		utils.stopLoading();
	    		utils.showAlert('Failed to Delete Reminder, Try again!', 'assertive');
	    	});
	    };

        // when view is changed
    	$scope.$on('$ionicView.enter', function(e){
    		$scope.init();
    	});

	});