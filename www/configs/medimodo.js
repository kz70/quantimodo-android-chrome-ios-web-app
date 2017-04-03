var config = {};

config.appSettings  = {
    appDisplayName : 'MediModo',
    lowercaseAppName : 'medimodo',
    appDescription : "Better health through data.",
    appleId: "1115037661",
    "appIdentifier": "com.quantimodo.medimodo",
    ionicAppId: 'e85b92b4',
    apiUrl : 'https://app.quantimo.do',
    cordovaLocalNotificationsEnabled : false,
    linkToChromeExtension : "https://chrome.google.com/webstore/detail/quantimodo-life-tracking/nojnjdgmjaejpnpehgioddbimopnblga",
    appStorageIdentifier: 'MediModoData*',
    defaultState : 'app.remindersInbox',
    welcomeState : 'app.login',
    headline : 'Medications - Track, Learn, Connect',
    features: [
        ' Follow These Quick Steps to Improve Your Health',
        ' 1. Enter Your Medications',
        ' 2. Record "How I Feel" Responses',
        ' 3. Create Reports of Your Responses and Choose to Connect With Your Doctors'
    ],
    welcomeText:"Let's start off by adding your first medication!",
    mobileNotificationText : "Time to track!",
    backgroundColor: "white",
    wordAliases : {
    },
    remindersInbox : {
        showAddNewMedicationButton : true,
        hideAddNewReminderButton : true,
        showAddHowIFeelResponseButton : true,
        showAddVitalSignButton : true,
        title : 'Reminder Inbox'
    },
    remindersManage : {
        hideAddNewReminderButton : true
    },
    //defaultRemindersType: 'medication',
    appType: 'medication',
    menuType : 'minimal'
};

if(!module){var module = {};}
module.exports = config.appSettings;