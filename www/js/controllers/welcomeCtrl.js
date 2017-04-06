angular.module('starter').controller('WelcomeCtrl', function($scope, $state, $rootScope, quantimodoService, $stateParams) {
    $scope.controller_name = "WelcomeCtrl";
    $rootScope.hideNavigationMenu = true;
    $scope.reportedVariableValue = false;
    $scope.headline = config.appSettings.headline;
    $scope.features = config.appSettings.features;
    $rootScope.showFilterBarSearchIcon = false;
    quantimodoService.getLocalStorageItemAsStringWithCallback('primaryOutcomeRatingFrequencyDescription',
        function(primaryOutcomeRatingFrequencyDescription) {
            if (primaryOutcomeRatingFrequencyDescription) {$scope.primaryOutcomeRatingFrequencyDescription = primaryOutcomeRatingFrequencyDescription;}
            if (!primaryOutcomeRatingFrequencyDescription && $rootScope.isIOS) {$scope.primaryOutcomeRatingFrequencyDescription = 'day';}
            if (!primaryOutcomeRatingFrequencyDescription && !$rootScope.isIOS) {$scope.primaryOutcomeRatingFrequencyDescription = 'daily';}
        }
    );
    $scope.sendReminderNotificationEmails = true;
    $rootScope.sendDailyEmailReminder = true;
    $scope.saveIntervalAndGoToLogin = function(primaryOutcomeRatingFrequencyDescription){
        $scope.saveInterval(primaryOutcomeRatingFrequencyDescription);
        $rootScope.sendToLogin();
    };
    $scope.skipInterval = function(){
        $scope.showIntervalCard = false;
        console.debug('skipInterval: Going to login state...');
        $rootScope.sendToLogin();
    };
    $scope.storeRatingLocally = function(ratingValue){
        $scope.reportedVariableValue = quantimodoService.getPrimaryOutcomeVariable().ratingTextToValueConversionDataSet[ratingValue] ? quantimodoService.getPrimaryOutcomeVariable().ratingTextToValueConversionDataSet[ratingValue] : false;
        var primaryOutcomeMeasurement = quantimodoService.createPrimaryOutcomeMeasurement(ratingValue);
        quantimodoService.addToMeasurementsQueue(primaryOutcomeMeasurement);
        $scope.hidePrimaryOutcomeVariableCard = true;
        $scope.showIntervalCard = true;
    };
    $scope.init = function(){
        $rootScope.hideNavigationMenu = true;
        console.debug($state.current.name + ' initializing...');
        if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
        if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }

    };
    $scope.$on('$ionicView.beforeEnter', function(){
        if($rootScope.user){
            console.debug('Already have user so no need to welcome. Going to default state.');
            $state.go(config.appSettings.defaultState);
        }
    });
    $scope.init();
});