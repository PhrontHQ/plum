var DataEditor = require("mod/ui/data-editor").DataEditor,
    Criteria = require("mod/core/criteria").Criteria,
    DataQuery = require("mod/data/model/data-query").DataQuery,
    DataStream = require("mod/data/service/data-stream").DataStream,
    RangeController = require("mod/core/range-controller").RangeController,
    ServiceEngagement = require("business-data.mod/data/main.mod/model/service-engagement").ServiceEngagement,
    PhrontEvent = require("business-data.mod/data/main.mod/model/event").Event,
    PostalAddress = require("business-data.mod/data/main.mod/model/messaging-channel/postal-address").PostalAddress,
    RespondentQuestionnaire = require("business-data.mod/data/main.mod/model/questionnaire/respondent-questionnaire").RespondentQuestionnaire,
    RespondentQuestionnaireAnswer = require("business-data.mod/data/main.mod/model/questionnaire/respondent-questionnaire-answer").RespondentQuestionnaireAnswer,
    RespondentQuestionnaireVariableValue = require("business-data.mod/data/main.mod/model/questionnaire/respondent-questionnaire-variable-value").RespondentQuestionnaireVariableValue,
    Event = require("business-data.mod/data/main.mod/model/event").Event,
    Asset = require("business-data.mod/data/main.mod/model/asset").Asset,
    ExpiringAssetDownload = require("aws.mod/data/main.mod/model/s3/expiring-asset-download").ExpiringAssetDownload,
    ExpiringObjectDownload = require("aws.mod/data/main.mod/model/s3/expiring-object-download").ExpiringObjectDownload,

    KeyComposer = require("mod/composer/key-composer").KeyComposer;

exports.ReadEventStatus = DataEditor.specialize({

    constructor: {
        value: function ReadEventStatus () {
            this.super();

            //Should be set in the serialization?
            this.type = PhrontEvent;

            this.appointmentOriginId = this.application.url.searchParams.get("appointment_guid");

            this.criteria = new Criteria().initWithExpression("originId == $.originId && parent != null", {
                originId: this.appointmentOriginId
            });

            /* 
            this now blocks canDraw, so we need to set dataLoaded to true when done.
            */

            this.readExpressions = ["participationStatus","respondentQuestionnaires","originId","children","parent"];
            
            //Doesn't work yet when qerying without an object, the backend has to make a new query to get that
            // this.readExpressions = ["respondentQuestionnaires"];

            this.dataController = new RangeController();

            this.dataController.defineBinding("content", {
                source: this,
                "<-": "data"
            });

            //temp:
            // this.dataController.content = [{},{},{},{},{}];
            this.dataController.avoidsEmptySelection = true;


            var consentQuestionnaireFlagCriteria = this.consentQuestionnaireFlagCriteria(this.appointmentOriginId),
                consentQuestionnaireFlagQuery = DataQuery.withTypeAndCriteria(PhrontEvent, consentQuestionnaireFlagCriteria),
                supplementalHealthQuestionnaireFlagCriteria = this.supplementalHealthQuestionnaireFlagCriteria(this.appointmentOriginId,2),
                supplementalHealthQuestionnaireFlagQuery = DataQuery.withTypeAndCriteria(PhrontEvent, supplementalHealthQuestionnaireFlagCriteria);


             Promise.all([this.dataService.fetchData(consentQuestionnaireFlagQuery),this.dataService.fetchData(supplementalHealthQuestionnaireFlagQuery)])
             .then((results) => {
                var consentQuestionnaireFlagQueryResult = results[0],
                supplementalHealthQuestionnaireFlagQueryResult = results[1];

                if(consentQuestionnaireFlagQueryResult.length > 0) {
                    this.hasPatientConsented = true;
                }

                if(supplementalHealthQuestionnaireFlagQueryResult.length > 0) {
                    this.hasPatientHealthFlag = true;
                }

                console.log("consentQuestionnaireFlagQueryResult: ",consentQuestionnaireFlagQueryResult);
                console.log("supplementalHealthQuestionnaireFlagQueryResult: ",supplementalHealthQuestionnaireFlagQueryResult);
            });


            /*
                Test  PostalAddress fetch:
            */
           var postalAddressFromEventCriteria = new Criteria().initWithExpression("partyPostalAddresses.filter{hostedEvents.filter{originId == $.originId}}", {
                originId:  "4130aba0-d35c-4348-af51-23a5f8ffbddd"
            }),
            postalAddressFromEventQuery = DataQuery.withTypeAndCriteria(PostalAddress, postalAddressFromEventCriteria);
            this.dataService.fetchData(postalAddressFromEventQuery)
            .then((results) => {
                console.log("postalAddressFromEventQuery results:",results);
            });

        }
    },
    dataDidChange: {
        value: function () {
            console.log("data:",data);
            var data = this.data,
                event = data && data[0]

            if(event) {
                console.log("event.respondentQuestionnaires: ",event.respondentQuestionnaires);

                /*
                    test Criteria in memory first:
                */

                var respondentQuestionnaires = event.respondentQuestionnaires,
                    promises = [],
                    respondentQuestionnairesPromise,
                    promise;

                if(respondentQuestionnaires === undefined) {
                    respondentQuestionnairesPromise = this.dataService.getObjectProperties(event, ["respondentQuestionnaires"]);
                } else {
                    respondentQuestionnairesPromise = Promise.resolve(respondentQuestionnaires);
                }

                if(respondentQuestionnairesPromise) {

                    promise = respondentQuestionnairesPromise.then(() => {
                        return this.dataService.getObjectsProperties(respondentQuestionnaires, ["questionnaire","respondentVariableValues","respondentAnswers","pdfExport"]);
                    });

                    // for(var i=0, countI = respondentQuestionnaires.length, iRespondentQuestionnaire; (i<CountQueuingStrategy) ; i++) {
                    //     iRespondentQuestionnaire = respondentQuestionnaires[i];
                    //     promises.push(this.dataService.getObjectProperties(iRespondentQuestionnaire,["questionnaire","respondentVariableValues","respondentAnswers","pdfExport"]));
                    // }
                    // promise = Promise.all(promises);
                } else {
                    promise = Promise.resolve(null);
                }

                
                return promise.then(() => {
                    if(event.respondentQuestionnaires) {
                        console.log("event.respondentQuestionnaires[0].completionDate: ",event.respondentQuestionnaires[0].completionDate);

                        return this.dataService.getObjectsProperties(event.valueForExpression("respondentQuestionnaires.map{respondentAnswers}.flatten()"),["questionnaireQuestion","answers"]);    
                    } else {
                        return Promise.resolve(null);
                    }
                })
                .then(() => {
                    if(event.respondentQuestionnaires) {

                        console.log("event.respondentQuestionnaires[0].respondentVariableValues: ",event.respondentQuestionnaires[0].respondentVariableValues);
                        console.log("event.respondentQuestionnaires[0].respondentAnswers: ",event.respondentQuestionnaires[0].respondentAnswers);
                        console.log("event.respondentQuestionnaires[0].pdfExport: ",event.respondentQuestionnaires[0].pdfExport);

                        console.log("event.respondentQuestionnaires[1].respondentVariableValues: ",event.respondentQuestionnaires[1].respondentVariableValues);
                        console.log("event.respondentQuestionnaires[1].respondentAnswers: ",event.respondentQuestionnaires[1].respondentAnswers);
                        console.log("event.respondentQuestionnaires[1].pdfExport: ",event.respondentQuestionnaires[1].pdfExport);

                        
                        var consentQuestionnaireFlagCriteria = this.consentQuestionnaireFlagCriteria(event.originId),
                            consentQuestionnaireFlagCriteriaResult,
                            supplementalHealthQuestionnaireFlagCriteria1 = this.supplementalHealthQuestionnaireFlagCriteria(event.originId, 1),
                            supplementalHealthQuestionnaireFlagCriteria2 = this.supplementalHealthQuestionnaireFlagCriteria(event.originId, 2),
                            supplementalHealthQuestionnaireFlagCriteriaResult1,
                            supplementalHealthQuestionnaireFlagCriteriaResult2;
                        
                            consentQuestionnaireFlagCriteriaResult = consentQuestionnaireFlagCriteria.evaluate(event);
                            supplementalHealthQuestionnaireFlagCriteriaResult1= supplementalHealthQuestionnaireFlagCriteria1.evaluate(event);
                            supplementalHealthQuestionnaireFlagCriteriaResult2= supplementalHealthQuestionnaireFlagCriteria2.evaluate(event);

                            console.log("consentQuestionnaireFlagCriteria evaluates event to: ",consentQuestionnaireFlagCriteriaResult);
                        // if(consentQuestionnaireFlagCriteriaResult.length > 0) {
                        //     this.hasPatientConsented = true;
                        // }

                        // console.log("supplementalHealthQuestionnaireFlagCriteria evaluates event to: ",supplementalHealthQuestionnaireFlagCriteriaResult2);
                        // if(supplementalHealthQuestionnaireFlagCriteriaResult2.length > 0) {
                        //     this.hasPatientHealthFlag = true;
                        // }

                        if(event.respondentQuestionnaires) {
                            this.createExpiringAssetDownloadForAsset(event.respondentQuestionnaires[0].pdfExport || event.respondentQuestionnaires[1].pdfExport);
                        }
                    }
                    return;
                    // this.canDrawGate.setField("dataLoaded", true);
                });

            } else {
                console.error("Didn't find an event with originId: "+this.appointmentOriginId);
                // this.canDrawGate.setField("dataLoaded", true);
                return Promise.resolve();
            }
        }
    },

    createExpiringAssetDownloadForAsset: {
        value: function(asset) {

            if(asset) {

                this.dataService.getObjectProperties(asset,["s3Object"])
                .then(() => {
                    var assetObject = asset.s3Object,
                        newObjectDownload = this.dataService.createDataObject(ExpiringObjectDownload);

                        newObjectDownload.object = assetObject;
                        newObjectDownload.expirationDelay = 800;

                        this.expiringAssetDownload = newObjectDownload;

                    this.dataService.getObjectProperties(newObjectDownload,["signedUrl"])
                    .then(() => {

                        console.log("Not saved newObjectDownload.signedUrl is ", newObjectDownload.signedUrl);
                        this.dataService.discardChanges();

                    });
        
                    //return this.dataService.saveChanges();
                })
                // .then(() => {
                //     this.dataService.getObjectProperties(newObjectDownload,["signedUrl"])
                //     .then(() => {

                //         console.log("newObjectDownload.signedUrl is ", newObjectDownload.signedUrl);
                //     });
                // });
            }

        }
    },

    hasPatientConsented: {
        value: false
    },
    hasPatientHealthFlag: {
        value: false
    },

    expiringAssetDownload: {
        value: undefined
    },

    consentQuestionnaireName: {
        value: "AAOIC Consent Questionnaire"
    },

    consentQuestionnaireFlagCriteria: {
        value: function(originId) {
            /*
                If the first questionnaire's answer to the "Do you accept risks and consent treatment is  No -> Flag!"

                    (Question) consentQuestion.name = "acceptsConsent";
            */
            /*
                    on PhrontEvent:
            */
            var mainQuestionnaireCriteria = new Criteria().initWithExpression("originId == $.originId && parent != null && respondentQuestionnaires.filter{questionnaire.name == $.questionnaireName && respondentAnswers.filter{questionnaireQuestion.question.name == $.questionName && answers.filter{booleanValue == true}}}", {
                originId: originId,
                questionnaireName: 'AAOIC Consent Questionnaire',
                questionName: 'acceptsConsent'
            });

            /*
                This is the one!! Returns respondentQuestionnaires if match criteria
            */

            var mainQuestionnaireCriteria1 = new Criteria().initWithExpression("originId == $.originId && parent != null && respondentQuestionnaires.filter{questionnaire.name == $.questionnaireName && respondentAnswers.filter{questionnaireQuestion.question.name == $.questionName && answers.filter{booleanValue == false}.length > 0}.length > 0}", {
                originId: originId,
                questionnaireName: 'AAOIC Consent Questionnaire',
                questionName: 'acceptsConsent'
            });

            /*
                This one works too!! Returns respondentQuestionnaires if match criteria
            */

            var mainQuestionnaireCriteria12 = new Criteria().initWithExpression("originId == $.originId && parent != null && respondentQuestionnaires.filter{questionnaire.name == $.questionnaireName && respondentAnswers.some{questionnaireQuestion.question.name == $.questionName && answers.some{booleanValue == true}}}", {
                originId: originId,
                questionnaireName: 'AAOIC Consent Questionnaire',
                questionName: 'acceptsConsent'
            });

            /*
                Trying what happens if I switch the ands, will it return a boolan?
            */
            var mainQuestionnaireCriteria13 = new Criteria().initWithExpression("respondentQuestionnaires.filter{questionnaire.name == $.questionnaireName && respondentAnswers.some{questionnaireQuestion.question.name == $.questionName && answers.some{booleanValue == true}}} && originId == $.originId && parent != null", {
                originId: originId,
                questionnaireName: 'AAOIC Consent Questionnaire',
                questionName: 'acceptsConsent'
            });


            return mainQuestionnaireCriteria13;
        }
    },

    supplementalHealthQuestionnaireName: {
        value: "AAOIC Supplemental Health Questionnaire"
    },

    supplementalHealthQuestionnaireFlagCriteria: {
        value: function(originId, criteriaId) {
            /*
                If the first questionnaire's answer to the "Do you accept risks and consent treatment is  No -> Flag!"

                    (Question) consentQuestion.name = "acceptsConsent";
            */
            /*
                    on PhrontEvent:
            */
            /*
                This is the one!! Returns respondentQuestionnaires if match criteria
            */
           var criteria;

            if(criteriaId === 1) {
                criteria = new Criteria().initWithExpression("originId == $.originId && parent != null && respondentQuestionnaires.filter{questionnaire.name == $.questionnaireName && respondentAnswers.filter{questionnaireQuestion.question.isOpenEnded == false && answers.filter{booleanValue == true}.length > 0}.length > 0}", {
                    originId: originId,
                    questionnaireName: this.supplementalHealthQuestionnaireName
                    });        
            } else if(criteriaId === 2) {
                criteria = new Criteria().initWithExpression("originId == $.originId && parent != null && respondentQuestionnaires.filter{questionnaire.name == $.questionnaireName && respondentAnswers.filter{questionnaireQuestion.question.isOpenEnded == false && answers.filter{booleanValue == true}}}", {
                    originId: originId,
                    questionnaireName: this.supplementalHealthQuestionnaireName
                });
            }

            return criteria;
        }
    },


    healthQuestionnaireFlagCriteria: {
        value: function() {
            /*
                If any of the supplemental health questionnaire's answer is  yes -> Flag!"
            */

        }
    },

    handlePatientInvitedInFieldAction: {
        value: function(event) {
            console.log("handlePatientInvitedInFieldAction: data.0.participationStatus is :",this.data[0].participationStatus);
            this.dataService.saveChanges();
        }
    },

    handleInvitePatientButtonAction: {
        value: function(event) {
            this.data[0].participationStatus = Event.participationStatusEmum.InvitedIn;
            this.dataService.saveChanges();
        }
    },


    handleResetAppointmentsButtonAction: {
        value: function() {
            /*
                delete from phront."RespondentQuestionnaire";
                delete from phront."RespondentQuestionnaireAnswer";
                delete from phront."RespondentQuestionnaireVariableValue";
                update phront."Event" set "respondentQuestionnaireIds" = NULL, "participationStatus" = 'Accepted', "participationStatusLogValues" = NULL, "participationStatusLogKeys" = NULL;

                delete all files in the S3 bucket
            */
            this.dataService.deleteData(RespondentQuestionnaire);
            this.dataService.deleteData(RespondentQuestionnaireAnswer);
            this.dataService.deleteData(RespondentQuestionnaireVariableValue);

            var criteria = new Criteria().initWithExpression("parent != null");
            this.dataService.deleteData(Event, criteria, {
                respondentQuestionnaires: null,
                participationStatus: "Accepted",
                participationStatusLog: null
            });

            this.dataService.deleteData(Asset);
            this.dataService.saveChanges();
        }
    },
    
});
