angular.module('starter')

	.controller('FavoritesCtrl', function($scope, $state, $ionicActionSheet, $timeout, reminderService, QuantiModo,
										  localStorageService, measurementService, variableCategoryService, $rootScope,
										  $stateParams, utilsService) {

	    $scope.controller_name = "FavoritesCtrl";

		console.debug('Loading ' + $scope.controller_name);
		
	    $scope.state = {
	    	selected1to5Value : false,
			loading : true,
            trackingReminder : null,
            lastSent: new Date(),
			title: "Favorites",
			bloodPressure: {
            	systolicValue: null,
				diastolicValue: null,
				displayTotal: "Blood Pressure"
			},
			favorites: [],
			addButtonText: "Add a Favorite Variable",
			addButtonIcon: "ion-ios-star",
			helpText: "Favorites are variables that you might want to track on a frequent but irregular basis.  Examples: As-needed medications, cups of coffee, or glasses of water",
			moreHelpText: "Tip: I recommend using reminders instead of favorites whenever possible because they allow you to record regular 0 values as well. Knowing when you didn't take a medication or eat something helps our analytics engine to figure out how these things might be affecting you."
	    };

		function getFavoriteTrackingRemindersFromLocalStorage(){
			$rootScope.favoritesArray = [];
			var favorites = localStorageService.getElementsFromItemWithFilters('trackingReminders', 'reminderFrequency', 0);
			if(!favorites){
				//Stop the ion-refresher from spinning
				$scope.$broadcast('scroll.refreshComplete');
				return false;
			}
			for(i = 0; i < favorites.length; i++){
				if($stateParams.variableCategoryName && $stateParams.variableCategoryName !== 'Anything'){
					if($stateParams.variableCategoryName === favorites[i].variableCategoryName){
						$rootScope.favoritesArray.push(favorites[i]);
					}
				} else {
					$rootScope.favoritesArray.push(favorites[i]);
				}
			}
			$rootScope.favoritesArray = variableCategoryService.attachVariableCategoryIcons($rootScope.favoritesArray);
			var i;
			for(i = 0; i < $rootScope.favoritesArray.length; i++){
				$rootScope.favoritesArray[i].total = null;
				if($rootScope.favoritesArray[i].variableName.toLowerCase().indexOf('blood pressure') > -1){
					$scope.state.bloodPressure.reminderId = $rootScope.favoritesArray[i].id;
					$rootScope.favoritesArray[i].hide = true;
				}
				if(typeof $rootScope.favoritesArray[i].defaultValue === "undefined"){
					$rootScope.favoritesArray[i].defaultValue = null;
				}
			}
			//Stop the ion-refresher from spinning
			$scope.$broadcast('scroll.refreshComplete');
		}

		$scope.favoriteAddButtonClick = function () {
			$scope.goToState('app.favoriteSearch', $rootScope.stateParams);
		};

		$scope.trackFavoriteByValueField = function(favoriteItem, $index){
			// if($rootScope.favoritesArray[$index].newDefaultValue !== $rootScope.favoritesArray[$index].defaultValue){
			// 	$rootScope.favoritesArray[$index].defaultValue = $rootScope.favoritesArray[$index].newDefaultValue;
			// 	localStorageService.addToOrReplaceElementOfItemByIdOrMoveToFront($rootScope.favoritesArray[$index]);
			// 	reminderService.postTrackingReminders([$rootScope.favoritesArray[$index]]);
			// }
			$rootScope.favoritesArray[$index].displayTotal = "Recorded " + $rootScope.favoritesArray[$index].total + " " + $rootScope.favoritesArray[$index].abbreviatedUnitName;
			measurementService.postMeasurementByReminder($rootScope.favoritesArray[$index], $rootScope.favoritesArray[$index].total)
				.then(function () {
					console.debug("Successfully measurementService.postMeasurementByReminder: " + JSON.stringify($rootScope.favoritesArray[$index]));
				}, function(error) {
					if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
					console.error('Failed to Track by favorite, Try again!');
				});
		};

		var validationFailure = function (message) {
			utilsService.showAlert(message);
			console.error(message);
			if (typeof Bugsnag !== "undefined") {
				Bugsnag.notify(message, "bloodPressure is " + JSON.stringify($scope.state.bloodPressure), {}, "error");
			}
		};

		$scope.trackBloodPressure = function(){
			if(!$scope.state.bloodPressure.diastolicValue || !$scope.state.bloodPressure.systolicValue){
				validationFailure('Please enter both values for blood pressure.');
				return;
			}
			$scope.state.bloodPressure.displayTotal = "Recorded " + $scope.state.bloodPressure.systolicValue + "/" + $scope.state.bloodPressure.diastolicValue + ' Blood Pressure';
			measurementService.postBloodPressureMeasurements($scope.state.bloodPressure)
				.then(function () {
					console.debug("Successfully measurementService.postMeasurementByReminder: " + JSON.stringify($scope.state.bloodPressure));
				}, function(error) {
					if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
					console.error('Failed to Track by favorite, Try again!');
				});
		};

		$scope.trackByValueField = function(trackingReminder, $index){
			// if($rootScope.favoritesArray[$index].newDefaultValue !== $rootScope.favoritesArray[$index].defaultValue){
			// 	$rootScope.favoritesArray[$index].defaultValue = $rootScope.favoritesArray[$index].newDefaultValue;
			// 	localStorageService.addToOrReplaceElementOfItemByIdOrMoveToFront($rootScope.favoritesArray[$index]);
			// 	reminderService.postTrackingReminders([$rootScope.favoritesArray[$index]]);
			// }
			if($rootScope.favoritesArray[$index].total === null){
				validationFailure('Please specify a value for ' + $rootScope.favoritesArray[$index].variableName);
				return;
			}
			$rootScope.favoritesArray[$index].displayTotal = "Recorded " + $rootScope.favoritesArray[$index].total + " " + $rootScope.favoritesArray[$index].abbreviatedUnitName;
			measurementService.postMeasurementByReminder($rootScope.favoritesArray[$index], $rootScope.favoritesArray[$index].total)
				.then(function () {
					console.debug("Successfully measurementService.postMeasurementByReminder: " + JSON.stringify($rootScope.favoritesArray[$index]));
				}, function(error) {
					if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
					console.error(error);
					console.error('Failed to Track by favorite, Try again!');
				});
		};

		$scope.trackByReminder = function(trackingReminder, modifiedReminderValue){
			if(!modifiedReminderValue){
				modifiedReminderValue = trackingReminder.defaultValue;
			}
			console.debug('Tracking reminder', trackingReminder);
			console.debug('modifiedReminderValue is ' + modifiedReminderValue);
			for(var i = 0; i < $rootScope.favoritesArray.length; i++){
				if($rootScope.favoritesArray[i].id === trackingReminder.id){
					if($rootScope.favoritesArray[i].abbreviatedUnitName !== '/5') {
						$rootScope.favoritesArray[i].total = $rootScope.favoritesArray[i].total + modifiedReminderValue;
						$rootScope.favoritesArray[i].displayTotal = $rootScope.favoritesArray[i].total + " " + $rootScope.favoritesArray[i].abbreviatedUnitName;
					} else {
						$rootScope.favoritesArray[i].displayTotal = modifiedReminderValue + '/5';
					}

				}
			}

			if(!$scope.state[trackingReminder.id] || !$scope.state[trackingReminder.id].tally){
                $scope.state[trackingReminder.id] = {
                    tally: 0
                };
            }

			$scope.state[trackingReminder.id].tally += modifiedReminderValue;
			console.debug('modified tally is ' + $scope.state[trackingReminder.id].tally);

			console.debug('Setting trackByReminder timeout');
            $timeout(function() {
            	if(typeof $scope.state[trackingReminder.id] === "undefined"){
            		console.error("$scope.state[trackingReminder.id] is undefined so we can't send tally in favorite controller. Not sure how this is happening.");
					return;
				}
                if($scope.state[trackingReminder.id].tally) {
                    measurementService.postMeasurementByReminder(trackingReminder, $scope.state[trackingReminder.id].tally)
                        .then(function () {
                        	console.debug("Successfully measurementService.postMeasurementByReminder: " + JSON.stringify(trackingReminder));
                        }, function(error) {
							if (typeof Bugsnag !== "undefined") {
								Bugsnag.notify(error, JSON.stringify(error), {}, "error");
							}
                            console.error(error);
                            console.error('Failed to Track by favorite, Try again!');
                        });
                    $scope.state[trackingReminder.id].tally = 0;
                }
            }, 2000);

		};

		$scope.refreshFavorites = function () {
			if($rootScope.syncingReminders !== true) {
				console.debug("ReminderMange init: calling refreshTrackingRemindersAndScheduleAlarms");
				$scope.showLoader('Syncing...');
				reminderService.refreshTrackingRemindersAndScheduleAlarms().then(function () {
					getFavoriteTrackingRemindersFromLocalStorage();
				});
			} else {
				$scope.$broadcast('scroll.refreshComplete');
			}
		};

	    $scope.init = function(){
			$rootScope.stateParams = $stateParams;

			if($stateParams.variableCategoryName && $stateParams.variableCategoryName  !== 'Anything'){
				$scope.state.addButtonText = "Add favorite " + pluralize($stateParams.variableCategoryName, 1).toLowerCase();
				$scope.state.title = pluralize($stateParams.variableCategoryName, 1) + " Favorites";
				$scope.state.moreHelpText = null;
			}
			if($stateParams.variableCategoryName === 'Treatments') {
				$scope.state.addButtonText = "Add an as-needed medication";
				$scope.state.helpText = "Quickly record doses of medications taken as needed just by tapping.  Tap twice for two doses, etc.";
				$scope.state.addButtonIcon = "ion-ios-medkit-outline";
				$scope.state.title = 'As-Needed Meds';
			}

			if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
			if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
			if($stateParams.presetVariables){
				$rootScope.favoritesArray = $stateParams.presetVariables;
				//Stop the ion-refresher from spinning
				$scope.$broadcast('scroll.refreshComplete');
			} else {
				getFavoriteTrackingRemindersFromLocalStorage();
				$scope.refreshFavorites();
			}
			$scope.showHelpInfoPopupIfNecessary();

	    };

        // when view is changed
    	$scope.$on('$ionicView.enter', function(e) { console.debug("Entering state " + $state.current.name);
			$scope.hideLoader();
    		$scope.init();
    	});

		// Triggered on a button click, or some other target
		$scope.showActionSheet = function(favorite, $index, bloodPressure) {

			var variableObject = {
				id: favorite.variableId,
				name: favorite.variableName
			};


			var actionMenuButtons = [
					{ text: '<i class="icon ion-gear-a"></i>Change Default Value' },
					{ text: '<i class="icon ion-edit"></i>Other Value/Time/Note' },
					{ text: '<i class="icon ion-arrow-graph-up-right"></i>Charts'},
					{ text: '<i class="icon ion-ios-list-outline"></i>' + 'History'},
					{ text: '<i class="icon ion-settings"></i>' + 'Variable Settings'},
					{ text: '<i class="icon ion-android-notifications-none"></i>Add Reminder'}
				];


			if(config.appSettings.favoritesController){
				if(config.appSettings.favoritesController.actionMenuButtons){
					actionMenuButtons = config.appSettings.favoritesController.actionMenuButtons;
				}
			}


			if(bloodPressure){
				actionMenuButtons = [];
			}

			// Show the action sheet
			var hideSheet = $ionicActionSheet.show({
				buttons: actionMenuButtons,
				destructiveText: '<i class="icon ion-trash-a"></i>Delete From Favorites',
				cancelText: '<i class="icon ion-ios-close"></i>Cancel',
				cancel: function() {
					console.debug('CANCELLED');
				},
				buttonClicked: function(index) {
					console.debug('BUTTON CLICKED', index);
					if(index === 0){
						$state.go('app.favoriteAdd', {reminder: favorite});
					}
					if(index === 1){
						$state.go('app.measurementAdd', {trackingReminder: favorite});
					}
					if(index === 2){
						$state.go('app.charts',
							{
								trackingReminder: favorite,
								fromState: $state.current.name,
								fromUrl: window.location.href
							});
					}
					if (index === 3) {
						$scope.goToHistoryForVariableObject(variableObject);
					}
					if (index === 4) {
						$state.go('app.variableSettings',
							{variableName: favorite.variableName});
					}
					if(index === 5){
						$state.go('app.reminderAdd',
							{
								variableObject: variableObject,
								fromState: $state.current.name,
								fromUrl: window.location.href
							});
					}

					return true;
				},
				destructiveButtonClicked: function() {
					if(!bloodPressure){
						$rootScope.favoritesArray.splice($index, 1);
						reminderService.deleteReminder(favorite.id)
							.then(function(){
								console.debug('Favorite deleted: ' + JSON.stringify(favorite));
							}, function(error){
								console.error('Failed to Delete Favorite!  Error is ' + error.message + '.  Favorite is ' + JSON.stringify(favorite));
							});
						localStorageService.deleteElementOfItemById('trackingReminders', favorite.id)
							.then(function(){
								//$scope.init();
							});
						return true;
					}

					if(bloodPressure){
						reminderService.deleteReminder($scope.state.bloodPressure.reminderId)
							.then(function(){
								console.debug('Favorite deleted: ' + JSON.stringify($scope.state.bloodPressure));
							}, function(error){
								console.error('Failed to Delete Favorite!  Error is ' + error.message + '.  Favorite is ' + JSON.stringify($scope.state.bloodPressure));
							});
						localStorageService.deleteElementOfItemById('trackingReminders', $scope.state.bloodPressure.reminderId)
							.then(function(){
								//$scope.init();
							});
						$scope.state.bloodPressure.reminderId = null;
						return true;
					}
				}
			});

			console.debug('Setting hideSheet timeout');
			$timeout(function() {
				hideSheet();
			}, 20000);

		};
		
	});
