var Component = require("montage/ui/component").Component,
//var DataEditor = require("montage/ui/data-editor").DataEditor,
    Promise = require('montage/core/promise').Promise,
    defaultLocalizer = require("montage/core/localizer").defaultLocalizer,
    CacheManager = require('core/cache-manager.js').CacheManager,
    Date = require("global").Date;


/*
            "iFrame": {"@": "iFrame"},


,
    "iFrame": {
        "value": {"#": "iframe-form"},
        "listeners": [
            {
                "type": "load",
                "listener": {"@": "owner"},
                "capture": false
            }
        ]

    }
    */

/*

https://tops-forms.com/covid-consent-form/index.html?appointment_guid=9c6cce28-83f6-4e4f-bcb2-48a62e2089db

?appointment_guid=9c6cce28-83f6-4e4f-bcb2-48a62e2089db

*/

exports.Main = Component.specialize({
    constructor: {
        value: function Main () {

            /*
            // Test localize
            defaultLocalizer.locale = 'fr';
            defaultLocalizer.localize("hello").then(function (localized) {
                console.log(localized);
            });
            */

            var localeParam = this.getParameterByName('lang');
            if (localeParam) {
                defaultLocalizer.locale = localeParam;
            }

            // this._initialDataLoad = this.moviesService.load();
            this._initialDataLoad = Promise.resolve([]);

            // Add events
            CacheManager.events.error = function (error) {
                console.error('MainUpdate', 'error', error);
            };
            CacheManager.events.cached = function () {
                console.log('MainUpdate', 'up-to-date (cached)');
            };
            CacheManager.events.noUpdate = function () {
                console.log('MainUpdate', 'up-to-date (noUpdate)');
            };
            CacheManager.events.checking = function () {
                console.log('MainUpdate', 'checking');
            };
            CacheManager.events.updateReady = function () {
                console.log('MainUpdate', 'updateReady');
            };
            CacheManager.events.noupdate = function () {
                console.log('MainUpdate', 'noupdate');
            };
            CacheManager.confirmOnUpdateReady = true;
            CacheManager.listenToUpdate();
            CacheManager.checkForUpdate();

              // Handle page visibility change
              // Set the name of the hidden property and the change event for visibility
            var hidden, visibilityChange;
            if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
            hidden = "hidden";
            visibilityChange = "visibilitychange";
            } else if (typeof document.msHidden !== "undefined") {
            hidden = "msHidden";
            visibilityChange = "msvisibilitychange";
            } else if (typeof document.webkitHidden !== "undefined") {
            hidden = "webkitHidden";
            visibilityChange = "webkitvisibilitychange";
            }

            document.addEventListener(visibilityChange, this, false);


            // function checkNotificationPromise() {
            //     try {
            //       Notification.requestPermission().then();
            //     } catch(e) {
            //       return false;
            //     }
            
            //     return true;
            //   }
            
            // function askNotificationPermission() {
            //     // function to actually ask the permissions
            //     function handlePermission(permission) {
            //       // set the button to shown or hidden, depending on what the user answers
            //       if(Notification.permission === 'denied' || Notification.permission === 'default') {
            //         console.log("notifications blocked");
            //       } else {
            //         console.log("notifications allowed");
            //       }
            //     }
              
            //     // Let's check if the browser supports notifications
            //     if (!('Notification' in window)) {
            //       console.log("This browser does not support notifications.");
            //     } else {
            //       if(checkNotificationPromise()) {
            //         Notification.requestPermission()
            //         .then((permission) => {
            //           handlePermission(permission);
            //         })
            //       } else {
            //         Notification.requestPermission(function(permission) {
            //           handlePermission(permission);
            //         });
            //       }
            //     }
            //   }


            //   askNotificationPermission();

        }
    },

    handleVisibilitychange: {
        value: function(event) {
            console.log("handleVisibilityChange: document.visibilityState is ",event.target.visibilityState);
        }
    },


    getParameterByName: {
            value: function (name, url) {
            if (!url) {
                url = window.location.href;
            }

            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) {
                return null;
            } else if (!results[2]) {
                return '';
            } else {
                return decodeURIComponent(results[2].replace(/\+/g, " "));   
            }
        }
    },

    // moviesService: {
    //     value: sharedMoviesService
    // },

    _initialDataLoad: {
        value: null
    },

    templateDidLoad: {
        value: function () {
            var self = this;
        }
    },

    /**
        iOS 7.0.x iPhone/iPod Touch workaround. After switching from portrait to landscape
        mode, Safari shows the content full screen. If the top or bottom of the content is
        clicked, navigation bars appear hiding content. This workaround reduces the height
        of the content.
    */
    _windowScroll: {
        value: function (self) {
            if ((window.innerHeight === window.outerHeight) || (window.innerHeight !== this._element.offsetHeight)) {
                window.scrollTo(0, 0);
                self.templateObjects.appointments.movieFlow.handleResize();
                window.clearTimeout(self._windowScrollTimeout);
                self._windowScrollTimeout = window.setTimeout(function () {
                    self._windowScroll(self);
                }, 700);
            }
        }
    },

    /**
        iOS 7.0.x iPhone/iPod Touch workaround
    */
    _windowScrollTimeout: {
        value: null
    },

    handleOrientationchange: {
        value: function () {
            var self = this;

            window.scrollTo(0, 0);
            // iOS 7.0.x iPhone/iPod Touch workaround
            if (navigator.userAgent.match(/(iPhone|iPod touch);.*CPU.*OS 7_0_\d/i)) {
                window.clearTimeout(this._windowScrollTimeout);
                if (Math.abs(window.orientation) === 90) {
                    self._windowScrollTimeout = window.setTimeout(function () {
                        self._windowScroll(self);
                    }, 1000);
                }
            }
        }
    },

    enterDocument: {
        value: function (firstTime) {
            if (firstTime) {
                window.addEventListener("orientationchange", this, false);
            }
        }
    },
    
    handleIFrameLoad: {
        value: function(event) {
            console.log("handleIFrameLoad:",event);
        }
    },
    _iFrame: {
        value: undefined
    },
    _iFrame: {
        value: undefined
    },
    handleInlineFormSubmit: {
        value: function(event) {
            console.log("handleInlineFormSubmit:",event);
            event.preventDefault();
            return false;
        }
    },
    handleEvent: {
        value: function(event) {
            //console.log("handleEvent:",event);
            var iFrameDocument = event.target.contentDocument;
            //console.log(iFrameDocument);
        }
    },
    iFrame: {
        get: function() {
            return this._iFrame;
        },
        set: function(value) {
            this._iFrame = value;
            value.addEventListener("load",this);
        }
    }
});
