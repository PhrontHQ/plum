var DataEditor = require("montage/ui/data-editor").DataEditor,
    Criteria = require("montage/core/criteria").Criteria,
    DataQuery = require("montage/data/model/data-query").DataQuery,
    DataStream = require("montage/data/service/data-stream").DataStream,
    RangeController = require("montage/core/range-controller").RangeController,
    ServiceEngagement = require("phront/data/main.datareel/model/service-engagement").ServiceEngagement,
    KeyComposer = require("montage/composer/key-composer").KeyComposer;

exports.Appointments = DataEditor.specialize({

    constructor: {
        value: function Appointments () {
            this.super();

            //Should be set in the serialization?
            this.type = ServiceEngagement;

            this._appointmentOriginId = this.application.url.searchParams.get("appointment_guid");

            this.criteria = new Criteria().initWithExpression("(originId == $.originId) || (event.rescheduledEventReferrer.originId == $.originId)", {
                originId: this._appointmentOriginId
            });

            this.dataController = new RangeController();

            this.dataController.defineBinding("content", {
                source: this,
                "<-": "data"
            });

            //temp:
            // this.dataController.content = [{},{},{},{},{}];
            this.dataController.avoidsEmptySelection = true;

            this.addOwnPropertyChangeListener("data", this);

        }
    },

    handleDataChange: {
        value: function(data) {
            // console.log("-------> handleHasPatientArrivedChange "+hasPatientArrived);
           if(data && data.length > 1) {
               var originalServiceEngagement;
                for(var i=0, countI = data.length, iServiceEngagement; (i<countI); i++) {
                    iServiceEngagement = data[i];
                    if(iServiceEngagement.originId === this._appointmentOriginId && i !== 0) {
                        data.splice(i,1);
                        data.unshift(iServiceEngagement);
                        originalServiceEngagement = iServiceEngagement;
                        break;
                    }
                }

                this.appointmentToSelectAfterDraw = data[data.length -1];

                this.dataController.select(originalServiceEngagement);
                // var self = this;
                // this._setCurrentEventTimeout = setTimeout( function() {
                //     self.dataController.select(data[data.length -1]);
                //     self._setCurrentEventTimeout = null;
                // }, 4000 );
    
            }
        }
    },

    didDraw: {
        value: function (frameTime) {
            if(this.appointmentToSelectAfterDraw && this.dataController.selection[0] !== this.appointmentToSelectAfterDraw) {
                var self = this;
                this._setCurrentEventTimeout = setTimeout( function() {
                    self.dataController.select(self.appointmentToSelectAfterDraw);
                    self._setCurrentEventTimeout = null;
                    self.appointmentToSelectAfterDraw = null;
                }, 6000 );
            }
        }
    },

    enterDocument: {
        value: function (firstTime) {
            if (firstTime) {
                this.templateObjects.keyUp.addEventListener("keyPress", this, false);
                this.templateObjects.keyDown.addEventListener("keyPress", this, false);
                this.templateObjects.keyLeft.addEventListener("keyPress", this, false);
                this.templateObjects.keyRight.addEventListener("keyPress", this, false);
            }
        }
    },
    _data: {
        value: undefined
    },
    data: {
        get: function () {
            return this._data;
        },
        set: function (value) {
            this.super(value);

            // console.log("this.dataController.content: ", this.dataController.content);
            // console.log("this.dataController.selection:", this.dataController.selection);
        }
    },

    handleKeyPress: {
        value: function(event) {
            var contentController = this.dataController;
            var currentMovieIndex = contentController.content.indexOf(contentController.selection.one());

            // Don't change the movie if the flow animation is too far behind
            if (Math.abs(this.templateObjects.appointmentFlow.scroll - currentMovieIndex) > 1) {
                return;
            }

            if (event.identifier === "next") {
                if (currentMovieIndex >= contentController.content.length) {
                    return;
                }
                contentController.select(contentController.content[currentMovieIndex + 1]);
            }
            if (event.identifier === "previous") {
                if (currentMovieIndex < 1) {
                    return;
                }
                contentController.select(contentController.content[currentMovieIndex - 1]);
            }
        }
    },

    _categoryContentController: {
        value: null
    },

    _appointmentFlow: {
        value: null
    },

    appointmentFlow: {
        get: function () {
            return this._appointmentFlow;
        },
        set: function (value) {
            //var self = this;
            this._appointmentFlow = value;
            // this._appointmentFlow.addEventListener("transitionend", function() {
            //     self._flowHiddenCallback();
            //     clearTimeout(this._flowHiddenCallbackTimeout);
            // },false);
        }
    },

    categoryContentController: {
        get: function () {
            return this._categoryContentController;
        },
        set: function (value) {
            if (value == null) { return; }
            this._categoryContentController = value;
            if (this._categoryContentController == null) {
                // first time
                this._displayedContentController = this.dataController;
                this._flowHidden = false;
            } else {
                this._startChangeCategoryTransition();
            }
        }
    },

    _displayedContentController: {
        value: null
    },

    _flowHiddenCallback: {
        value: function () {
            // reset the flow to initial scroll position
            if (this.appointmentFlow) {
                this.appointmentFlow.scroll = 0;
            }
            this._displayedContentController = this.categoryContentController;
            this._flowHidden = false;
            this._detailsHidden = false;
        }
    },
    _flowHiddenCallbackTimeout: {
        value: null
    },


    _startChangeCategoryTransition: {
        value: function () {
            var self = this;

            this._detailsHidden = true;
            this._flowHidden = true;
            this._categoryContentController.select(this._categoryContentController.content[0]);

            // wait .5s until the fade in/out effect is completed
            this._flowHiddenCallbackTimeout = setTimeout( function() {
                self._flowHiddenCallback();
            }, 300 );
        }
    },

    appointmentFlowDidTranslateStart: {
        value: function () {
            this._detailsHidden = true;
        }
    },

    appointmentFlowDidTranslateEnd: {
        value: function (flow) {
            var scroll = Math.round(flow.scroll);
            this.dataController.select(this.dataController.content[scroll]);
            this._detailsHidden = false;
        }
    },

    _flowHidden: {
        value: false
    },

    _detailsHidden: {
        value: false
    }

});
