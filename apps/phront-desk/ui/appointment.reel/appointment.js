var DataEditor = require("montage/ui/data-editor").DataEditor,
    Criteria = require("montage/core/criteria").Criteria,
    DataQuery = require("montage/data/model/data-query").DataQuery,
    PhrontEvent = require("phront/data/main.datareel/model/event").Event,
    currentEnvironment = require("montage/core/environment").currentEnvironment,
    Sender = require("ui/chat/sender").Sender,
    Range = require("montage/core/range").Range,
    Promise = require("montage/core/promise").Promise;

var Bindings = require("montage/core/frb/bindings");


// Preload CallButton to be ready to be displayed on the chat when needed
require("../call-button.reel");
require("ui/chat/unattended-appointment-message.reel");
require("ui/chat/call-practice-message.reel");

/*
    To get "Appointment time passed"
        letter-spacing: -0.1px;

*/


var instanceCount = 0;

exports.Appointment = DataEditor.specialize({
    constructor: {
        value: function Appointment () {

            //temp to avoid drawgate
            //this.super();
            this.instanceNumber = ++instanceCount;
            // console.log(this.constructor.name+" ["+this.instanceNumber+"] constructed");


            this.defineBinding("appointmentTime", {
                source: this,
                "<-": "data.event.scheduledTimeRange.begin"
            });

            // this.defineBinding("patientEvent", {
            //     source: this,
            //     "<-": "data.event.children.0"
            // });

            this.defineBinding("durationToFillFormsBeforeAppointment", {
                source: this,
                "<-": "defaultParticipationStatusExpectedTimeOffsets.get('AdmittanceRequirementsCompleted').begin.abs()"
            });

            this.defineBinding("hasPatientArrived", {
                source: this,
                "<-": "patientEvent.defined() && patientEventParticipationStatusLog.defined() ? patientEventParticipationStatusLog.get('Arrived').defined() : undefined"
            });

            this.addOwnPropertyChangeListener("hasPatientArrived", this);

            this.defineBinding("organization", {
                source: this,
                "<-": "data == undefined || data.event == undefined || data.event.location == undefined || data.event.location.party == undefined || data.event.location.party.parent == undefined ? undefined : data.event.location.party.parent"
            });

            this.defineBinding("organizationCustomerEngagementQuestionnaires", {
                source: this,
                "<-": "organization == undefined || organization.customerEngagementQuestionnaires == undefined ? undefined : organization.customerEngagementQuestionnaires"
            });

            this.defineBinding("hasPatientFormToFill", {
                source: this,
                "<-": "organizationCustomerEngagementQuestionnaires == undefined || organizationCustomerEngagementQuestionnaires.every{rolesRequiredToComplete == undefined || rolesOptionalToComplete == undefined} ? undefined : (organizationCustomerEngagementQuestionnaires.filter{(rolesRequiredToComplete.filter{name == 'Patient'}.length > 0) || (rolesOptionalToComplete.filter{name == 'Patient'}.length > 0)}.length > 0)"
            });


            /* 
                UNCOMMENT ME!

                The following is to debug why the hasPatientRequiredFormToFillBeforeAppointment needs the hasPatientRequiredFormToFillBeforeAppointment_HACK binding to work as expected:

            */
            // var criteria = new Criteria().initWithExpression("organizationCustomerEngagementQuestionnaires.filter{((rolesRequiredToComplete.filter{name == 'Patient'}.length > 0) && participationStatusRequiredByEvent == 'InvitedIn')}.length > 0"),
            // test1 = {
            //     _hasPatientRequiredFormToFillBeforeAppointment: undefined,
            //     organizationCustomerEngagementQuestionnaires: undefined
            // },
            // test2 = {
            //     organizationCustomerEngagementQuestionnaires: [{
            //         name: "A",
            //         rolesRequiredToComplete: undefined,
            //         rolesOptionalToComplete: undefined
            //     },
            //     {
            //         name: "B",
            //         rolesRequiredToComplete: undefined,
            //         rolesOptionalToComplete: undefined
            //     }]
            // },
            // test3 = {
            //     organizationCustomerEngagementQuestionnaires: [{
            //         name: "A",
            //         rolesRequiredToComplete: [
            //             {
            //                 name: 'Patient'
            //             }
            //         ],
            //         participationStatusRequiredByEvent: "InvitedIn",
            //         rolesOptionalToComplete: undefined
            //     },
            //     {
            //         name: "B",
            //         rolesRequiredToComplete: undefined,
            //         participationStatusRequiredByEvent: "InvitedIn",
            //         rolesOptionalToComplete:  [
            //             {
            //                 name: 'Patient'
            //             }
            //         ]
            //     }]
            // };

            // Object.defineProperty(test1,"hasPatientRequiredFormToFillBeforeAppointment", {
            //     get: function() {
            //         return this._hasPatientRequiredFormToFillBeforeAppointment;
            //     },
            //     set: function(value) {
            //         this._hasPatientRequiredFormToFillBeforeAppointment = value;
            //     }
            // });

            // Bindings.defineBinding(test1, "hasPatientRequiredFormToFillBeforeAppointment", {
            //     source: test1,
            //     "<-": "organizationCustomerEngagementQuestionnaires.isUndefined() || organizationCustomerEngagementQuestionnaires.every{rolesRequiredToComplete.isUndefined()} || organizationCustomerEngagementQuestionnaires.every{participationStatusRequiredByEvent.isUndefined()} ? undefined : organizationCustomerEngagementQuestionnaires.filter{((rolesRequiredToComplete.filter{name == 'Patient'}.length > 0) && participationStatusRequiredByEvent == 'InvitedIn')}.length > 0"
            // });
            // console.log("test1.hasPatientRequiredFormToFillBeforeAppointment is ",test1.hasPatientRequiredFormToFillBeforeAppointment );

            // var organizationCustomerEngagementQuestionnaire1 = {},
            //     organizationCustomerEngagementQuestionnaire2 = {},
            //     patientRole = {
            //         name: 'Patient'
            //     };

            // test1.organizationCustomerEngagementQuestionnaires = [organizationCustomerEngagementQuestionnaire1, organizationCustomerEngagementQuestionnaire2];
            // console.log("test1.hasPatientRequiredFormToFillBeforeAppointment is ",test1.hasPatientRequiredFormToFillBeforeAppointment );


            // var result1 = criteria.evaluate(test1);
            // var result2 = criteria.evaluate(test2);
            // var result3 = criteria.evaluate(test3);







            /* 
                hasPatientFormToFill might need to be inlined for perf reasons, but we should be able to optimize expresssions at sme point 
            */
            this.defineBinding("hasPatientFormToFillBeforeAppointment", {
                source: this,
                "<-": "hasPatientFormToFill && (organization.customerEngagementQuestionnaires.filter{((participationStatusRequiredByEvent == 'InvitedIn') || (participationStatusOptionalForEvent == 'InvitedIn'))}.length > 0)"
            });

            /*
                FIX_ME!!!!!! FOR REAL!!!!
                HACK - the expression defining hasPatientRequiredFormToFillBeforeAppointment doesn't lead to what we need 
                because organizationCustomerEngagementQuestionnaires don't have their participationStatusRequiredByEvent property populated when the expression is last evaluated
                and to make things worse, when they get populated, it doesn't trigger a re-evaluation of the right side of the hasPatientRequiredFormToFillBeforeAppointment binding.

                Creating the hasPatientRequiredFormToFillBeforeAppointment_HACK forces the values to be populated in time
 
            */
            this.defineBinding("hasPatientRequiredFormToFillBeforeAppointment_HACK", {
                source: this,
                "<-": "organizationCustomerEngagementQuestionnaires.filter{participationStatusRequiredByEvent == 'InvitedIn'}.length"
            });
    
            this.defineBinding("hasPatientRequiredFormToFillBeforeAppointment", {
                source: this,
                "<-": "organizationCustomerEngagementQuestionnaires == undefined || organizationCustomerEngagementQuestionnaires.every{rolesRequiredToComplete == undefined} || organizationCustomerEngagementQuestionnaires.every{participationStatusRequiredByEvent == undefined} ? undefined : organizationCustomerEngagementQuestionnaires.filter{((rolesRequiredToComplete.filter{name == 'Patient'}.length > 0) && participationStatusRequiredByEvent == 'InvitedIn')}.length > 0"
            });


            /*
                The time range when patient has to fill a mandatory form:

                patientMandatoryFormFillingTimeRange = [@owner.data.event.scheduledTimeRange.begin + defaultParticipationStatusExpectedTimeOffsets.get('AdmittanceRequirementsCompleted').begin, @owner.data.event.scheduledTimeRange.begin + defaultParticipationStatusExpectedTimeOffsets.get('AdmittanceRequirementsCompleted').end]

            */
            this.defineBinding("patientMandatoryFormFillingTimeRange", {
                source: this,
                args: ["data.event.scheduledTimeRange.begin", "defaultParticipationStatusExpectedTimeOffsets.get('AdmittanceRequirementsCompleted')"],
                compute: function (scheduledTimeBegin, admittanceRequirementsCompletedExpectedTimeOffsets) {
                    if(admittanceRequirementsCompletedExpectedTimeOffsets) {
                        var rangeBegin = scheduledTimeBegin.dateByAdjustingDuration(admittanceRequirementsCompletedExpectedTimeOffsets.begin),
                            rangeEnd = scheduledTimeBegin.dateByAdjustingDuration(admittanceRequirementsCompletedExpectedTimeOffsets.end);

                        return new Range(rangeBegin, rangeEnd);
                    } else {
                        return scheduledTimeBegin;
                    }
                }
            });
        
            
            /*
                appointmentArrivalTime = data.event.scheduledTimeRange.begin + defaultParticipationStatusExpectedTimeOffsets.get('Arrived').begin;
            */
            this.defineBinding("appointmentArrivalTime", {
                source: this,
                args: ["data.event.scheduledTimeRange.begin", "defaultParticipationStatusExpectedTimeOffsets.get('Arrived')"],
                compute: function (scheduledTimeBegin, arrivedExpectedTimeOffsets) {
                    if(arrivedExpectedTimeOffsets) {
                        return scheduledTimeBegin.dateByAdjustingDuration(arrivedExpectedTimeOffsets.begin);
                        //return scheduledTimeBegin.dateByAdjustingComponentValues(/*year*/0, /*monthIndex*/0, /*day*/0, /*hours*/0, /*minutes*/arrivedExpectedTimeOffsets.begin.minutes, /*seconds*/0, /*milliseconds*/0);
                     } else {
                         return scheduledTimeBegin;
                     }
                }
            });


            this.defineBinding("hasPatientFilledForms", {
                source: this,
                "<-": "patientEvent == undefined || patientEvent.respondentQuestionnaires == undefined ? undefined : patientEvent.respondentQuestionnaires.defined() && patientEvent.respondentQuestionnaires.every{completionDate.defined()}"
            });

            this.defineBinding("canPatientFillForm", {
                source: this,
                "<-": "patientEvent == undefined || patientMandatoryFormFillingTimeRange == undefined || hasPatientFormToFillBeforeAppointment == undefined || hasPatientFilledForms == undefined ? undefined : (patientMandatoryFormFillingTimeRange.contains(now) || hasPatientArrived) && hasPatientFormToFillBeforeAppointment && hasPatientFilledForms == false"
            });

            this.defineBinding("patientEventParticipationStatusLog", {
                source: this,
                "<-": "patientEvent == undefined ? undefined : patientEvent.defined() && patientEvent.participationStatusLog"
            });


            /*
                Arrival:
            */
            this.defineBinding("patientArrivalExpectedTimeRange", {
                source: this,
                args: ["data.event.scheduledTimeRange.begin", "defaultParticipationStatusExpectedTimeOffsets.get('Arrived')"],
                compute: function (scheduledTimeBegin, arrivedExpectedTimeOffsets) {
                    if(arrivedExpectedTimeOffsets) {
                        var rangeBegin = scheduledTimeBegin.dateByAdjustingDuration(arrivedExpectedTimeOffsets.begin),
                            rangeEnd = scheduledTimeBegin.dateByAdjustingDuration(arrivedExpectedTimeOffsets.end);

                        return new Range(rangeBegin, rangeEnd);
                    } else {
                        return scheduledTimeBegin;
                    }
                }
            });
    
    
            /*
                Check-in:
            */
                this.defineBinding("patientCheckInExpectedTimeRange", {
                    source: this,
                    args: ["data.event.scheduledTimeRange.begin", "defaultParticipationStatusExpectedTimeOffsets.get('CheckedIn')"],
                    compute: function (scheduledTimeBegin, checkedInExpectedTimeOffsets) {
                        if(checkedInExpectedTimeOffsets) {
                            var rangeBegin = scheduledTimeBegin.dateByAdjustingDuration(checkedInExpectedTimeOffsets.begin),
                                rangeEnd = scheduledTimeBegin.dateByAdjustingDuration(checkedInExpectedTimeOffsets.end);
    
                            return new Range(rangeBegin, rangeEnd);
                        } else {
                            return scheduledTimeBegin;
                        }
                    }
                });

            /*
                InvitedIn:
            */

    
            this.defineBinding("hasPatientBeenInvitedIn", {
                source: this,
                //"<-": "patientEventParticipationStatusLog.defined() && patientEventParticipationStatusLog.get('InvitedIn').defined()"
                "<-": "patientEvent == undefined ? undefined : patientEvent.defined() && patientEvent.participationStatus == 'InvitedIn'"
            });
    

            this.defineBinding("canPatientBeInvitedIn", {
                source: this,
                "<-": "hasPatientArrived == undefined || hasPatientFormToFill == undefined || hasPatientRequiredFormToFillBeforeAppointment == undefined || hasPatientFilledForms == undefined ? undefined : hasPatientArrived && (hasPatientFormToFill == false || hasPatientRequiredFormToFillBeforeAppointment == false || (hasPatientRequiredFormToFillBeforeAppointment && hasPatientFilledForms))"
            });

            this.defineBinding("automaticPatientInvitationTimeRange", {
                source: this,
                args: ["patientEventParticipationStatusLog.defined() && patientEventParticipationStatusLog.get('Arrived')", "defaultParticipationStatusExpectedTimeOffsets.get('InvitedIn')",
                "data.event.scheduledTimeRange"],
                compute: function (arrivedTime, invitedInExpectedTimeOffsets, eventScheduledTimeRange) {
                    if(arrivedTime && invitedInExpectedTimeOffsets) {
                        var rangeBegin = arrivedTime.dateByAdjustingDuration(invitedInExpectedTimeOffsets.begin),
                            rangeEnd = eventScheduledTimeRange.begin.dateByAdjustingDuration(invitedInExpectedTimeOffsets.end);

                        return new Range(rangeBegin, rangeEnd);
                    } else {
                        return scheduledTimeBegin;
                    }
                }
            });

            this.defineBinding("shouldPatientBeInvitedInAutomatically", {
                source: this,
                "<-": "defaultParticipationStatusExpectedTimeOffsets.get('InvitedIn').end.isBlank"
            });

            /*
                should display "please come in"
            */
            this.defineBinding("shouldInvitePatientIn", {
                source: this,
                "<-": "canPatientBeInvitedIn && (hasPatientBeenInvitedIn || shouldPatientBeInvitedInAutomatically) && (now <= automaticPatientInvitationTimeRange.end) && chatConversation.has(defaultPatientArrivedMessage)"
            });

            this.defineBinding("shouldWatchForPatientEventInvitedInParticipationStatus", {
                source: this,
                "<-": "canPatientBeInvitedIn && (shouldPatientBeInvitedInAutomatically == false) && (hasPatientBeenInvitedIn == false)"
            });
            this.addOwnPropertyChangeListener("shouldWatchForPatientEventInvitedInParticipationStatus", this);

            /*
                Since we're coverin "now" being before 
            */
            this.defineBinding("shouldInvitePatientToCall", {
                source: this,
                "<-": "canPatientBeInvitedIn && hasPatientBeenInvitedIn == false && (now > automaticPatientInvitationTimeRange.end) && !isServiceEngagementCanceled"
            });

            // this.addPathChangeListener(
            //     "canPatientBeInvitedIn",
            //     this,
            //     "handleCanPatientBeInvitedInChange"
            // );

            this.addPathChangeListener(
                "shouldInvitePatientIn",
                this,
                "handleShouldInvitePatientInChange"
            );

            this.addPathChangeListener(
                "shouldInvitePatientToCall",
                this,
                "handleShouldInvitePatientToCallChange"
            );


            /*
                minuteOffset can be useful live, or with test data.
            */
            this._minuteOffset = Number(this.application.url.searchParams.get("minuteOffset"));    

            this.defineBinding("isServiceEngagementCanceled", {
                source: this,
                "<-": "data.event.participationStatus == undefined ? true : (patientEvent.participationStatus == 'Canceled' || data.event.participationStatus == 'Canceled')"
            });

            /*
                It only makes sense to display this for the latest appointment that will actually happen
            */
            this.defineBinding("shouldHighlightLocationChange", {
                source: this,
                "<-": "data.event.rescheduledEventReferrer == undefined || (data.event.rescheduledEventReferrer.defined() && data.event.rescheduledEventReferrer.location == undefined) || data.event.location == undefined ? false : ((data.event.rescheduledEventReferrer.defined() && (data.event.rescheduledEventReferrer.location != data.event.location)) || (data.event.location.party != patientEvent.participatingParty.supplierRelationships.0.supplier))"
            });


            // this.defineBinding("isServiceEngagementRescheduled", {
            //     source: this,
            //     "<-": "data.event == undefined || data.event.participationStatusLog == undefined|| data.event.rescheduledEvent == undefined || patientEvent == undefined || patientEvent.participationStatusLog == undefined ? false : (data.event.participationStatusLog.has('Rescheduled') || patientEvent.participationStatusLog.has('Rescheduled')) || data.event.rescheduledEvent != null"
            // });
            this.defineBinding("isServiceEngagementRescheduled", {
                source: this,
                "<-": "data.event == undefined || data.event.rescheduledEvent == undefined || patientEvent == undefined || patientEvent.rescheduledEvent == undefined ? false : (data.event.rescheduledEvent != null || patientEvent.rescheduledEvent != null)"
            });


            /*
                It only makes sense to display this for the latest appointment that will actually happen
            */
            this.defineBinding("isServiceEngagementExpired", {
                source: this,
                "<-": "isServiceEngagementCanceled == true || isServiceEngagementRescheduled == true || data.event == undefined ? false : (hasPatientArrived == false && (((now - data.event.scheduledTimeRange.begin) / 1000 / 60 / 60) > 24))"
            });
            
            return this;
        }
    },

    handleShouldWatchForPatientEventInvitedInParticipationStatusChange: {
        value: function(value) {
            // console.log("-------> handleShouldWatchForPatientEventInvitedInParticipationStatusChange "+value);
            if(value) {
                this.watchForPatientEventInvitedInParticipationStatus(this.patientEvent);
            }
        }
    },


    handleShouldInvitePatientInChange: {
        value: function(value) {
            
            // console.log("-------> organizationCustomerEngagementQuestionnaires "+ this.organizationCustomerEngagementQuestionnaires);
            // console.log("-------> handleShouldInvitePatientInChange "+value);
            // console.log("--------------> shouldInvitePatientIn <- canPatientBeInvitedIn && (hasPatientBeenInvitedIn || shouldPatientBeInvitedInAutomatically)");
            // console.log("--------------> canPatientBeInvitedIn "+ this.canPatientBeInvitedIn);
            // console.log("---------------------> canPatientBeInvitedIn <- hasPatientArrived && hasPatientFormToFill != undefined && (hasPatientFormToFill == false || (hasPatientRequiredFormToFillBeforeAppointment && hasPatientFilledForms))");
            // console.log("---------------------> hasPatientArrived "+ this.hasPatientArrived);
            // console.log("---------------------> hasPatientFormToFill "+ this.hasPatientFormToFill);
            // console.log("---------------------> hasPatientRequiredFormToFillBeforeAppointment "+ this.hasPatientRequiredFormToFillBeforeAppointment);
            // console.log("-----------------------------------> organizationCustomerEngagementQuestionnaires ", this.organizationCustomerEngagementQuestionnaires);
            // console.log("-----------------------------------> hasPatientRequiredFormToFillBeforeAppointment_A ", this.hasPatientRequiredFormToFillBeforeAppointment_A);
            // console.log("-----------------------------------> hasPatientRequiredFormToFillBeforeAppointment_B ", this.hasPatientRequiredFormToFillBeforeAppointment_B);
            // console.log("-----------------------------------> hasPatientRequiredFormToFillBeforeAppointment_C ", this.hasPatientRequiredFormToFillBeforeAppointment_C);
            
            // console.log("---------------------> hasPatientFilledForms "+ this.hasPatientFilledForms);

            // console.log("--------------> hasPatientBeenInvitedIn "+ this.hasPatientBeenInvitedIn);
            // console.log("--------------> shouldPatientBeInvitedInAutomatically "+ this.shouldPatientBeInvitedInAutomatically);
            

            if(value) {
                var patientEvent;

                //This should only be true when shouldPatientBeInvitedInAutomatically is true
                if((patientEvent = this.patientEvent) && patientEvent.participationStatus !== PhrontEvent.participationStatusEmum.InvitedIn) {
                    var patientEventParticipationStatus = patientEvent.participationStatus,
                        patientEventParticipationStatusIntValue = PhrontEvent.participationStatusEmum.intValueForMember(patientEventParticipationStatus),
                        arrivedParticipationStatusIntValue = PhrontEvent.participationStatusEmum.intValueForMember(PhrontEvent.participationStatusEmum.Arrived),
                        now = this.now;
    
                    patientEvent.participationStatus = PhrontEvent.participationStatusEmum.InvitedIn;
                    patientEvent.participationStatusLog.set(PhrontEvent.participationStatusEmum.InvitedIn, now);

                    this.dataService.saveChanges()
                    .then(() => {
                        this.addInviteInMessageToConversation();

                    }, (error) => {
                        console.error("Error saving participationStatus/Log to 'InvitedIn'");
                    });
        
                } else {
                    this.addInviteInMessageToConversation();
                }

            }
        }
    },

    addInviteInMessageToConversation: {
        value: function() {
            this.chatConversation.push({
                sender: this.practiceSender,
                text: "Please come in."
            });    
        }
    },

    callPracticeMessageWithText: {
        value: function(text) {
            if(this.data) {
                return {
                    sender: this.practiceSender,
                    text: text,
                    context: {
                        organization: this.data.event.location.party
                    },
                    outputComponentModuleId: "ui/chat/call-practice-message.reel"
                };
            } else {
                return null;
            }

        }
    },

    _defaultCallPracticeMessage: {
        value: undefined
    },
    defaultCallPracticeMessage: {
        get: function() {
            if(!this._defaultCallPracticeMessage) {
                this._defaultCallPracticeMessage = this.callPracticeMessageWithText("Ok, give us a call");
            }
            return this._defaultCallPracticeMessage;
        }
    },

    appointmentCanceledMessage: {
        get: function() {
            if(this.data) {
                return {
                    sender: this.practiceSender,
                    text: "If you need a new appointment, please call.",
                    context: {
                        title: "Appointment Canceled",
                        organization: this.data.event.location.party
                    },
                    outputComponentModuleId: "ui/chat/unattended-appointment-message.reel"
                };
            } else {
                return null;
            }

        }
    },

    appointmentExpiredMessage: {
        get: function() {
            if(this.data) {
                return {
                    sender: this.practiceSender,
                    text: "The time for this appointment has passed. Please call if you need a new appointment.",
                    context: {
                        title: "Appointment has Expired",
                        organization: this.data.event.location.party
                    },
                    outputComponentModuleId: "ui/chat/unattended-appointment-message.reel"
                };
            } else {
                return null;
            }

        }
    },



    handleShouldInvitePatientToCallChange: {
        value: function(value) {
            // console.log("-------> handleShouldInvitePatientToCallChange "+value);
            if(value) {

                var self = this;
                this.dataService.getObjectProperties(this.data.event.location.party,"phoneNumbers")
                .then(() => {
                    //Start a timeInerval to check until we get to the appointment time.
                    // setTimeout(function () {

                    self.chatConversation.push(self.defaultCallPracticeMessage);

                    // require.async("../chat/call-practice-message.reel").then(function (exports) {
                    //     var callPracticeMessage = exports.montageObject ? montageObject : new exports.CallPracticeMessage();
                        
                    //     callPracticeMessage.data = self.data.event.location.party;

                    //     self.chatConversation.push({
                    //         sender: self.practiceSender,
                    //         text: "Ok, give us a call",
                    //         component: callPracticeMessage
                    //     });

                    // });


                    // self.chatConversation.push({
                    //     sender: self.practiceSender,
                    //     text: "Ok, give us a call",
                    //     component: {
                    //         style: "display: inline-block; margin-right: -12px; vertical-align: middle; width: 46px; height: 46px;",
                    //         prototype: "../../call-button.reel",
                    //         values: {
                    //             "phoneNumber": {"<-": "@owner.ownerComponent.ownerComponent.data.event.location.party.phoneNumbers.0.messagingChannel"} //data.event.location.party.phoneNumbers.messagingChannel.nationalNumber
                    //         }
                    //     }
                    // });
                    // }, 3000);
                });
            }

        }
    },
    

    _practiceSender: {
        value: undefined
    },
    practiceSender: {
        get: function() {
            return this._practiceSender || (this._practiceSender = new Sender());
        }
    },
    
    _patientSender: {
        value: undefined
    },
    patientSender: {
        get: function() {
            return this._patientSender || (this._patientSender = new Sender());
        }
    },

    defaultChatMessageText: {
        value: "Let us know you're here."
    },

    _defaultChatMessage: {
        value: undefined
    },
    defaultChatMessage: {
        get: function() {
            return this._defaultChatMessage || (this._defaultChatMessage = {
                "sender": this.practiceSender,
                "text": this.defaultChatMessageText
            });
        }
    },

    defaultLateChatMessageText: {
        value: "Looks like you're running late, please give us a call."
    },

    _defaultLateChatMessage: {
        value: undefined
    },
    defaultLateChatMessage: {
        get: function() {
            return this._defaultLateChatMessage || (this._defaultLateChatMessage = this.callPracticeMessageWithText(this.defaultLateChatMessageText));
        }
    },


    defaultRescheduledEventChatMessageText: {
        value: "This appointment has been rescheduled."
    },
    _defaultRescheduledEventChatMessage: {
        value: undefined
    },
    defaultRescheduledEventChatMessage: {
        get: function() {
            return this._defaultRescheduledEventChatMessage || (this._defaultRescheduledEventChatMessage = {
                "sender": this.practiceSender,
                "text": this.defaultRescheduledEventChatMessageText
            });
        }
    },

    defaultPleaseFillOutAdmittanceFormsText: {
        value: "Please fill out admittance forms."
    },
    _defaultPleaseFillOutAdmittanceFormsMessage: {
        value: undefined
    },
    defaultPleaseFillOutAdmittanceFormsMessage: {
        get: function() {
            return this._defaultPleaseFillOutAdmittanceFormsMessage || (this._defaultPleaseFillOutAdmittanceFormsMessage = {
                "sender": this.practiceSender,
                "text": this.defaultPleaseFillOutAdmittanceFormsText
            });
        }
    },


    defaultPatientArrivedMessageText: {
        value: "I'm here!"
    },

    _defaultPatientArrivedMessage: {
        value: undefined
    },
    defaultPatientArrivedMessage: {
        get: function() {
            return this._defaultPatientArrivedMessage || (this._defaultPatientArrivedMessage = {
                "sender": this.patientSender,
                "text": this.defaultPatientArrivedMessageText
            });
        }
    },



    _chatConversation: {
        value: undefined
    },

    chatConversation: {
        get: function() {
            return this._chatConversation || (this._chatConversation = [
                // this.defaultChatMessage
            ]);
        },
        set: function(value) {
            if(value !== this._chatConversation) {
                this._chatConversation = value;
            }
        }
    },


    _canPatientFillForm: {
        value: undefined
    },

    canPatientFillForm: {
        get: function() {
            return this._canPatientFillForm;
        },
        set: function(value) {
            if(value !== this._canPatientFillForm) {
                this._canPatientFillForm = value;
            }
        }
    },

    _hasPatientFormToFill: {
        value: undefined
    },

    hasPatientFormToFill: {
        get: function() {
            return this._hasPatientFormToFill;
        },
        set: function(value) {
            // console.log("################# set hasPatientFormToFill "+value);
            // console.log("################# set hasPatientFormToFill organization is ", this.organization);
            // console.log("################# set hasPatientFormToFill organizationCustomerEngagementQuestionnaires is ", this.organizationCustomerEngagementQuestionnaires);
            // console.log("################# set hasPatientFormToFill hasPatientFormToFillA is "+this.hasPatientFormToFillA);
            // console.log("################# set hasPatientFormToFill hasPatientFormToFillA2 is "+this.hasPatientFormToFillA2);
            // console.log("################# set hasPatientFormToFill hasPatientFormToFillB is "+this.hasPatientFormToFillB);
            
            // console.log("################# set hasPatientFormToFill organizationCustomerEngagementQuestionnaires.rolesRequiredToComplete is ", (this.organizationCustomerEngagementQuestionnaires && this.organizationCustomerEngagementQuestionnaires.filter((item) => {return item.rolesRequiredToComplete;})));
            // console.log("################# set hasPatientFormToFill organizationCustomerEngagementQuestionnaires.rolesOptionalToComplete is ", (this.organizationCustomerEngagementQuestionnaires && this.organizationCustomerEngagementQuestionnaires.filter((item) => {return item.rolesOptionalToComplete;})));
            
            if(value !== this._hasPatientFormToFill) {
                this._hasPatientFormToFill = value;
            }
        }
    },

    _minuteOffset: {
        value: 0
    },

    _adjustDateTime: {
        value: function(aDate) {
            if(typeof this._minuteOffset === "number" && this.appointmentTime) {
                var now = Date.now(),
                    offsetFromStart = now - this._startTime,
                    //Now apply the offsetFromStart to this appointmentTime
                    adjustedNow = this.appointmentTime.dateByAdjustingComponentValues(/*year*/0, /*monthIndex*/0, /*day*/0, /*hours*/0, /*minutes*/this._minuteOffset, /*seconds*/0, /*milliseconds*/offsetFromStart);
                    //console.log("adjustedNow: ",adjustedNow);
                    return adjustedNow;
            } else {
                return aDate;
            }
        }
    },

    now: {
        get: function() {
            return this._now || this._adjustDateTime(new Date());
        },
        set: function(value) {
            this._now = this._adjustDateTime(value);
        }
    },

    _watchTimeIntervalId: {
        value: undefined
    },

    _startTime: {
        value: undefined
    },

    _watchTimeIntervalDelay: {
        value: 20000
    },
    /*
        The delay we use in setInterval should be taking into account in which phase we are and what could make it change.
        - For filling the form, it's known and set. If now is before this.patientMandatoryFormFillingTimeRange, then the next time we need to make an upate is on this.patientMandatoryFormFillingTimeRange.begin. So we should start then.
    */
    watchTimeIfNeeded: {
        value: function() {
            if(!this._watchTimeIntervalId) {

                this._startTime = Date.now();
                this.now = new Date();
                this._watchTimeIntervalId = setInterval(() => {
                    this.now = new Date();
                },this._watchTimeIntervalDelay);
            }
        }
    },
    

    earlyArrivalMinutes: {
        value: 15
    },

    participationStatusEmum: {
        value: PhrontEvent.participationStatusEmum
    },

    handleHasPatientArrivedChange: {
        value: function(hasPatientArrived) {
            // console.log("-------> handleHasPatientArrivedChange "+hasPatientArrived);
           if(hasPatientArrived) {
                //this.showPatientIsHere();
            }
        }
    },

    nullValue: {
        value: null
    },

    _chat: {
        value: undefined
    },

    chat: {
        get: function() {
            return this._chat;
        },
        set: function(value) {
            this._chat = value;
        }
    },

    readExpressions: {
        value:[
            "event",
            "event.rescheduledEvent"
        ]
    },

    consentmentForm: {
        value: undefined
    },

    handleDirectionsButtonPress: {
        value: function(event) {
            // console.log("handleDirectionsButtonPress:",event);
            var postalAddress  = this.data.event.location.messagingChannel,
                streetAddress = postalAddress.streetAddress,
                locationPoint = postalAddress.location,
                destinationAddress = encodeURIComponent(`${streetAddress} ${postalAddress.locality} ${postalAddress.administrativeArea}  ${postalAddress.primaryPostalCode}`);


                if (currentEnvironment.isApplePlatform) {
                    /*
                        if we're on iOS, open in Apple Maps

                        https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/MapLinks/MapLinks.html

                    */
                    window.open('https://maps.apple.com/?daddr=' + destinationAddress,'_system');
                } else { /* else use Google */
                    window.open('https://maps.google.com/maps?daddr=' + destinationAddress,'_system');
                }
        }
    },
    handleFillOutFormButtonPress: {
        value: function(event) {
            this.dispatchEventNamed("openConsentmentForm", true, true, {serviceEngagement: this.data});
        }
    },
    _isChatButtonFirstPress: {
        value: true
    },
    handleChatButtonPress: {
        value: function (event) {
            if (this._isChatButtonFirstPress) {
                this._isChatButtonFirstPress = false;
                // this.showPatientIsHere();
                this.setPatientArrived();
            }
        }
    },

    showPatientIsHere: {
        value: function() {
            this.chatConversation.push(
                this.defaultPatientArrivedMessage
            );
        }
    },

    /*
        The amount of time we'll poll to get update on the participationStatus
    */
    maxMinutesToWaitForInvitedInStatus: {
        value: 7
    },
    pollingInterval: {
        value: 45000
    },

    _watchForPatientEventInvitedInParticipationStatusIntervalId: {
        value: undefined
    },
    /*
        We can only do polling right now, but this will be replaced by the stack allowing us to do an addEventListener on other people's changes to an object property so that we'll get a data operation bringing that value, and and regular property observing and binding will allow us to know when it happens.
    */
    watchForPatientEventInvitedInParticipationStatus: {
        value: function(patientEvent) {

            if(!this._watchForPatientEventInvitedInParticipationStatusIntervalId) {
                var now = this.now,
                // stopPollDate = now.dateByAdjustingComponentValues(0, 0, 0, 0, this.automaticPatientInvitationTimeRange.end, 0, 0),
                eventStartDate = patientEvent.scheduledTimeRange.begin,
                // initialPpatientEventParticipationStatusIntValue = PhrontEvent.participationStatusEmum.intValueForMember(patientEvent.participationStatus),
                self = this,
                intervalFunction = function intervalFunction() {
                    self.dataService.updateObjectProperties(patientEvent,["participationStatus"])
                    .then(function() {
                        var patientEventParticipationStatusIntValue = PhrontEvent.participationStatusEmum.intValueForMember(patientEvent.participationStatus),
                            currentDate = self.now;

                        if(self.hasPatientBeenInvitedIn || self.shouldInvitePatientToCall) {
                            // console.log("patientEvent.participationStatus is "+patientEvent.participationStatus);
                            //self.chat.showComeIn = true;
                            // self.chatConversation.push({
                            //     sender: self.practiceSender,
                            //     text: "Please come in."
                            // });
                            clearInterval(intervalId);
                            self._watchForPatientEventInvitedInParticipationStatusIntervalId = null;
                        }
                    })
                },
                intervalId;
                /*
                For debugging purposes:
                setTimeout(a=>{
                    patientEvent.participationStatus = PhrontEvent.participationStatusEmum.InvitedIn
                },1000);*/

                //If the patient is late show them to call?
                //if (eventStartDate < now) {
                    // this.dataService.getObjectProperties(this.data.event.location.party,"phoneNumbers")
                    // .then(() => {
                    //     //Start a timeInerval to check until we get to the appointment time.
                    //     setTimeout(function () {
                    //         self.chatConversation.push({
                    //             sender: self.practiceSender,
                    //             text: "Ok, give us a call",
                    //             component: {
                    //                 style: "display: inline-block; margin-right: -12px; vertical-align: middle; width: 46px; height: 46px;",
                    //                 prototype: "../../call-button.reel",
                    //                 values: {
                    //                     "phoneNumber": {"<-": "@owner.ownerComponent.ownerComponent.data.event.location.party.phoneNumbers.0.messagingChannel"} //data.event.location.party.phoneNumbers.messagingChannel.nationalNumber
                    //                 }
                    //             }
                    //         });
                    //     }, 3000);
                    // });
        
                //} else {
                    this._watchForPatientEventInvitedInParticipationStatusIntervalId = intervalId = setInterval(intervalFunction,this.pollingInterval);
                //}


            }
        }
    },

    patientEventPromise: {
        value: undefined
    },

    initializeDataLoadedPromise: {
        value: function () {
            var serviceEngagement = this.data,
            orthodontistEvent,
            calendar,
            eventDefaultCriteria,
            eventDefaultDataQuery,
            self = this;

            //console.debug("appointment ["+Object.hash(this)+"]: initializeDataLoadedPromise");

            //var eventDefaultCriteria = new Criteria().initWithExpression("calendar.b2cCustomerSupplierRelationshipOwner.supplier.parent.b2cCustomerRelationships.filter{(isTemplate == true) && (templateName == 'PracticePatientRelationshipTemplate')}.one().calendars.map{templateEvents}.flatten().filter{participationRoles.some{(name == 'Patient') || (name == 'Attendee')}}.one().participationStatusExpectedTimeOffsets"); 


            this.patientEventPromise = this.dataService.getObjectProperties(serviceEngagement,"event")
            .then(() => {
                orthodontistEvent = serviceEngagement.event;

                //Now that we have the event's scheduledTimeRange, we setup a timer every minutes from now to update now property:
                this.watchTimeIfNeeded();

                return this.dataService.getObjectProperties(orthodontistEvent,"children", "location", "rescheduledEvent", "rescheduledEventReferrer", "participatingParty");
                //return this.dataService.getObjectProperties(orthodontistEvent,"children", "location");
            })
            .then(() => {
                this.patientEvent = orthodontistEvent.children
                    ? orthodontistEvent.children[0]
                    : null;

                if(orthodontistEvent.rescheduledEvent) {
                    return this.dataService.getObjectProperties(orthodontistEvent.rescheduledEvent,"children", "location", "rescheduledEvent")
                    .then(() => {
                        this.patientEvent = orthodontistEvent.children
                            ? orthodontistEvent.children[0]
                            : null;
                        return this.patientEvent;
                    });

                } else {
                    return this.patientEvent;
                }
            });

            return this.patientEventPromise.then((patientEvent) => {
                //If true, patient has signaled he had arrived
                // if(this.shouldWatchForPatientEventInvitedInParticipationStatus(patientEvent)) {
                //     // console.log("self.chat = "+self.chat);
                //     // console.log("this.chat = "+this.chat);
                //     // this.chat.showIAmHere = true;
                //     self.watchForPatientEventInvitedInParticipationStatus(patientEvent);
                // }
                return Promise.all([ 
                    this.dataService.getObjectProperties(orthodontistEvent.location, "party", "messagingChannel"),
                    this.dataService.getObjectProperties(this.patientEvent,"calendar", "participatingParty")
                ]);
            })
            .then((patientEvent) => {
                var patientSupplierRelationshipsPracticePromise,
                    rootPracticePromise,
                    promises;

                patientSupplierRelationshipsPracticePromise = this.dataService.getObjectProperties(this.patientEvent.participatingParty, "supplierRelationships");

                rootPracticePromise = this.dataService.getObjectProperties(orthodontistEvent.location.party, "parent");
                    return Promise.all([
                        rootPracticePromise,
                        patientSupplierRelationshipsPracticePromise
                    ]);
            })
            .then((calendar) => {
                var patientSupplierRelationshipsPracticePromise,
                    eventDefaultDataQueryPromise;

                calendar = this.patientEvent.calendar;

                if(this.patientEvent.participatingParty.supplierRelationships.length && this.patientEvent.participatingParty.supplierRelationships[0].supplier === undefined) {
                    patientSupplierRelationshipsPracticePromise = this.dataService.getObjectProperties(this.patientEvent.participatingParty.supplierRelationships[0], "supplier");  
                }


                eventDefaultCriteria = new Criteria().initWithExpression("isTemplate == true && participationRoles.filter{(name == 'Patient') || (name == 'Attendee')} && calendar.b2cCustomerSupplierRelationshipOwner.isTemplate == true && calendar.b2cCustomerSupplierRelationshipOwner.templateName == 'PracticePatientRelationshipTemplate' && calendar.b2cCustomerSupplierRelationshipOwner.supplier == $.organization", {
                    organization: orthodontistEvent.location.party.parent
                });
                eventDefaultDataQuery = DataQuery.withTypeAndCriteria(PhrontEvent,eventDefaultCriteria);
                eventDefaultDataQueryPromise = this.dataService.fetchData(eventDefaultDataQuery);

                if(patientSupplierRelationshipsPracticePromise) {
                    return Promise.all([
                        eventDefaultDataQueryPromise,
                        patientSupplierRelationshipsPracticePromise
                    ])
                } else {
                    return eventDefaultDataQueryPromise
                }
            })
            .then((resolvedValues) => {

                var result = resolvedValues.length === 2 ? resolvedValues[0] : resolvedValues;

                //console.log("result: ",result);
                if(result && result.length === 1) {
                    this.defaultParticipationStatusExpectedTimeOffsets = result[0].participationStatusExpectedTimeOffsets;
                } else {
                    console.error("defaultParticipationStatusExpectedTimeOffsets wasn't found with query: ",eventDefaultDataQuery);
                }
                return this.defaultParticipationStatusExpectedTimeOffsets;
            });


            /*

                The following is the scaffolding to manually evaluate the default expression in memory to validate it
            */

            /*
            .then(()=> {

                //hard code getting the defaults to test:
                return this.dataService.getObjectProperties(calendar,"b2cCustomerSupplierRelationshipOwner")
                .then(()=> {
                    return calendar.b2cCustomerSupplierRelationshipOwner;
                });

            })
            .then((b2cCustomerSupplierRelationshipOwner)=> {

                //hard code getting the defaults to test:
                return this.dataService.getObjectProperties(b2cCustomerSupplierRelationshipOwner,"supplier")
                .then(()=> {
                    return b2cCustomerSupplierRelationshipOwner.supplier;
                });
            })
            .then((supplier)=> {

                //hard code getting the defaults to test:
                return this.dataService.getObjectProperties(supplier,"parent")
                .then(()=> {
                    return supplier.parent;
                });
            })
            .then((supplierParent)=> {

                //hard code getting the defaults to test:
                return this.dataService.getObjectProperties(supplierParent,"b2cCustomerRelationships")
                .then(()=> {
                    var criteria = new Criteria().initWithExpression("(isTemplate == true) && (templateName == 'PracticePatientRelationshipTemplate')"),
                        filteredB2cCustomerRelationships = supplierParent.b2cCustomerRelationships.filter(criteria.predicateFunction); 
                    
                    return filteredB2cCustomerRelationships;
                    // return supplier.b2cCustomerRelationships;
                    
                });
            })
            .then((b2cCustomerRelationships)=> {

                //hard code getting the defaults to test:
                return this.dataService.getObjectsProperties(b2cCustomerRelationships,"calendars")
                .then(()=> {
                    if(b2cCustomerRelationships.length === 1) {
                        return b2cCustomerRelationships[0].calendars;
                    } else {
                        throw "More than one template calendar found";
                    }
                });
            })
            .then((calendars)=> {

                //hard code getting the defaults to test:
                return this.dataService.getObjectsProperties(calendars,"templateEvents")
                .then(()=> {
                    return calendars[0].templateEvents;
                });
            })
            .then((templateEvents)=> {

                //hard code getting the defaults to test:
                return this.dataService.getObjectsProperties(templateEvents,"participationRoles")
                .then(()=> {
                    return templateEvents[0].participationRoles;
                });
            })
            .then((templateEvents)=> {
                var criteria = new Criteria().initWithExpression("calendar.b2cCustomerSupplierRelationshipOwner.supplier.parent.b2cCustomerRelationships.filter{(isTemplate == true) && (templateName == 'PracticePatientRelationshipTemplate')}.one().calendars.map{templateEvents}.flatten().filter{participationRoles.some{(name == 'Patient') || (name == 'Attendee')}}.one().participationStatusExpectedTimeOffsets"); 
                
                this.defaultParticipationStatusExpectedTimeOffsets = criteria.evaluate(_patientEvent);
                console.log(this.defaultParticipationStatusExpectedTimeOffsets);

                var criteria2 = new Criteria().initWithExpression("now > automaticPatientInvitationTimeRange.end"); 

                var result = criteria2.evaluate(this);
                console.log(result);
    
            });
            */


        }
    },

    defaultParticipationStatusExpectedTimeOffsets: {
        value: undefined
    },

    // shouldWatchForPatientEventInvitedInParticipationStatus: {
    //     value: function(patientEvent) {
    //         if(patientEvent) {
    //             var patientEventParticipationStatus = patientEvent && patientEvent.participationStatus,
    //             patientEventParticipationStatusIntValue = PhrontEvent.participationStatusEmum.intValueForMember(patientEventParticipationStatus),
    //             arrivedParticipationStatusIntValue = PhrontEvent.participationStatusEmum.intValueForMember(PhrontEvent.participationStatusEmum.Arrived);

    //             var isArrived = (patientEvent && patientEvent.participationStatus && patientEvent.participationStatus === PhrontEvent.participationStatusEmum.Arrived);

    //             if(patientEventParticipationStatusIntValue === arrivedParticipationStatusIntValue) {
    //                 return true
    //             }
    //         }
    //         return false;
    //     }
    // },

    setPatientArrived: {
        value: function() {
            var serviceEngagement = this.data,
                orthodontistEvent,
                patientEvent,
                self = this;

            this.patientEventPromise
            .then((patientEvent) => {

                if(patientEvent) {
                    var patientEventParticipationStatus = patientEvent && patientEvent.participationStatus,
                        patientEventParticipationStatusIntValue = PhrontEvent.participationStatusEmum.intValueForMember(patientEventParticipationStatus),
                        arrivedParticipationStatusIntValue = PhrontEvent.participationStatusEmum.intValueForMember(PhrontEvent.participationStatusEmum.Arrived),
                        now = this.now;
    
                    if(patientEventParticipationStatusIntValue <  arrivedParticipationStatusIntValue) {
                        patientEvent.participationStatus = PhrontEvent.participationStatusEmum.Arrived;
                        patientEvent.participationStatusLog.set(PhrontEvent.participationStatusEmum.Arrived, now);

                        return this.dataService.saveChanges()
                        .then(() => {
                            // console.log("Patient [Event "+patientEvent.dataIdentifier+"] Arrived!");
                            self.watchForPatientEventInvitedInParticipationStatus(patientEvent);

                        }, (error) => {
                            console.error("Error saving form data");
                        })
                    } else {
                        console.error("Patient's already set as arrived");
                        self.watchForPatientEventInvitedInParticipationStatus(patientEvent);
                    }

                } else {
                    console.error("Patient Event couldn't be found");
                }
            });
        }
    },

    draw: {
        value: function () {

        }
    }

});
