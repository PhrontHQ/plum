
var Promise = require("montage/core/promise").Promise,
    DataEditor = require("montage/ui/data-editor").DataEditor,
    Criteria = require("montage/core/criteria").Criteria,
    DataQuery = require("montage/data/model/data-query").DataQuery,
    Questionnaire = require("phront/data/main.datareel/model/questionnaire/questionnaire").Questionnaire,
    Answer = require("phront/data/main.datareel/model/questionnaire/answer").Answer,
    RespondentQuestionnaire = require("phront/data/main.datareel/model/questionnaire/respondent-questionnaire").RespondentQuestionnaire,
    RespondentQuestionnaireVariableValue = require("phront/data/main.datareel/model/questionnaire/respondent-questionnaire-variable-value").RespondentQuestionnaireVariableValue,
    RespondentQuestionnaireAnswer = require("phront/data/main.datareel/model/questionnaire/respondent-questionnaire-answer").RespondentQuestionnaireAnswer,
    Asset = require("phront/data/main.datareel/model/asset").Asset,
    currentEnvironment = require("montage/core/environment").currentEnvironment;

exports.ConsentmentForm = DataEditor.specialize({

    constructor: {
        value: function ConsentmentForm() {
            this.super();

            this.application.addEventListener("openConsentmentForm", this, false);
            this.fetchCheckInQuestionnaire();
        }
    },

    formConnectionDescriptor: {
        value: {
            "local": {
                "url": "http://localhost:3000/mod/multipart"
            },
            "mod": {
                "url": "https://kl1yvohwsh.execute-api.us-east-1.amazonaws.com/mod/multipart"
            },
            "test": {
                "url": "https://y52bemv26a.execute-api.us-west-2.amazonaws.com/test/multipart"
            },
            "live": {
                "url": "https://ifepvnvs2i.execute-api.us-east-1.amazonaws.com/live/multipart"
            }
        }
    },

    _checkInQuestionnairePromise: {
        value: undefined
    },

    fetchCheckInQuestionnaire: {
        value: function() {
            if(!this._checkInQuestionnairePromise) {
                var questionnaireName = "AAOIC Consent Questionnaire",
                    nameCriteria = new Criteria().initWithExpression("name == $.name", {
                    name: questionnaireName
                }),
                objectDescriptor = this.dataService.objectDescriptorForType(Questionnaire),
                questionnaireQuery = DataQuery.withTypeAndCriteria(objectDescriptor, nameCriteria);

                this._checkInQuestionnairePromise = this.dataService.fetchData(questionnaireQuery)
                .then((result) => {
                    if(result && result.length === 1) {
                        //Make sure we have what we need when we'll need it
                        return this.dataService.getObjectProperties(result[0], [ "name", "title", "description","questions","userContextVariables","referrerQuestionnaire","respondentQuestionnaires","followUpQuestionnaires"])
                        .then(() => {
                            return result[0]; 
                        })
                    } else {
                        return null;
                    }
                });
            }

            return this._checkInQuestionnairePromise;
        }
    },

    handleOpenConsentmentForm: {
        value: function (event) {
            var serviceEngagement = event.detail.serviceEngagement;
            //todo: filter video list with youtube trailer available.?

            if (serviceEngagement) {
                this.open();
            }
        }
    },

    shouldDismissOverlay: {
        value: function (overlay, eventTargetElement, eventType) {
            //Workaround to not dismiss overlay when jquery date picker is used.
            //console.log("eventTargetElement:", eventTargetElement);
            if (eventTargetElement.parentElement.getAttribute("data-handler") === "selectDay") {
                return false;
            } else {
                return true;
            }
        }
    },

    patient: {
        get: function() {
            if(this._data) {
                if(this._data.participants) {
                    return this._data.participants[1];
                } else {
                    console.log("participants not available on data");
                }
            } else {
                console.log("data not availablw");
            }
        }
    },

    dataDidChange: {
        value: function () {
            if (this._data) {

                this.dataService.getObjectProperties(this._data, "event","participatingParty")
                .then(() => {
                    return this.dataService.getObjectProperties(this._data.event, "children", "participatingParty")
                })
                .then(() => {
                    var formData = {},
                    participants = this._data.participants,
                    patient = participants[1],
                    firstName = patient.name.givenName,
                    lastName = patient.name.familyName;

                    formData.first_name = firstName;
                    formData.last_name = lastName;
    
                    this._formData = formData;
                    //console.log("this._formData: ",this._formData);
                    this._sendDataToIframeIfNeeded();

                });

            }
        }
    },

    // _data: {
    //     value: undefined
    // },
    // data: {
    //     get: function () {
    //         return this._data;
    //     },
    //     set: function (value) {
    //         var isNewValue = value !== this._data;
    //         this.super(value);
    //         if (isNewValue) {

    //             if (this._data) {
    //                 var formData = {},
    //                     participants = this._data.participants,
    //                     patient = participants[1],
    //                     firstName = patient.name.givenName,
    //                     lastName = patient.name.familyName;

    //                 formData.first_name = firstName;
    //                 formData.last_name = lastName;

    //                 this._formData = formData;
    //                 console.log("this._formData: ",this._formData);
    //                 this._sendDataToIframeIfNeeded();
    //             }
    //         }
    //     }
    // },

    _sendDataToIframeIfNeeded: {
        value: function() {
            if (this._iFrameElement && this._iFrameLoaded && this._formData) {
                this._iFrameElement.contentWindow.postMessage(this._formData, "*");
                this._formData = null;
            }
        }
    },

    __iFrameLoaded: {
        value: undefined
    },

    _iFrameLoaded: {
        get: function () {
            return this.__iFrameLoaded;
        },
        set: function (value) {
            this.__iFrameLoaded = value;
            // console.log("this.__iFrameLoaded: ",this.__iFrameLoaded);
            this._sendDataToIframeIfNeeded();
        }
    },

    _iFrameElement: {
        value: undefined
    },

    iFrameElement: {
        get: function () {
            return this._iFrameElement;
        },
        set: function (value) {
            this._iFrameElement = value;

            // console.log("this._iFrameElement: ",this._iFrameElement);

            var self = this;
            window.addEventListener("message", (event) => {
                if(event.data === "iFrameDOMContentLoaded") {
                    this._iFrameLoaded = true;
                } else {
                    self.processSubmitedFormData(event.data);
                }

                // console.log("message: ",event);
                // if (event.origin !== "http://example.org:8080")
                //   return;

                // // ...
            }, false);

            this._sendDataToIframeIfNeeded();


            // var contentDocument, form;
            // if((contentDocument = this._iFrameElement.contentDocument)) {
            //     form = contentDocument.getElementsByTagName("form")[0];
            // }

            // if(form) {
            //     this.form = form;
            // } else {
            //     this._iFrameElement.addEventListener('load', this, true);
            // }
        }
    },

    formSubmissionURL: {
        get: function() {
            return this.formConnectionDescriptor[currentEnvironment.stage];
        }
    },

    submitFormDataIfNeeded: {
        value: function (formData) {
            var formSubmissionURL = this.formSubmissionURL;

            //TEMPORARY HACK TO USE A UUID tha works the roostergrin side:
            formData.appointment_guid = this.data.originId;
            //formData.appointment_guid = "aabb5a69-f8eb-4811-a639-d5639434e54d";
            

            return new Promise(function(resolve, reject) {

                //Set formData on a new FormData:
                var formDataKeys = Object.keys(formData),i,countI,
                    _formData = new FormData();

                for(i=0, countI = formDataKeys.length; (i<countI); i++) {
                    _formData.append(formDataKeys[i], formData[formDataKeys[i]]);
                }

                //Submit the form programmatically
                var request = new XMLHttpRequest();
                request.open("POST", formSubmissionURL.url+"?appointment_guid="+formData.appointment_guid);

                request.addEventListener("load", (event) => {
                    var req = event.target;
                    if (req.status === 200) {
                        //This is where we get the information we need to store the reference to the PDF on S3
                        try {
                            resolve(JSON.parse(req.responseText));
                        } catch(error) {
                            console.log(error);
                            resolve(null);
                            // reject(error);
                        }
                    } else {
                        console.log("formSubmission ("+formSubmissionURL+") response status "+req.status);
                        resolve(null);
                        // reject(
                        //     new Error("Unable to retrieve '" + formSubmissionURL + "', code status: " + req.status)
                        // );
                    }
                }, false);

                request.addEventListener("error", (event) => {
                    var req = event.target;
                    console.log("formSubmission ("+formSubmissionURL+") response status "+req.status);
                    resolve(null);
                    // reject(
                    //     new Error("Unable to retrieve '" + formSubmissionURL + "' with error: " + event.error + ".")
                    // );
                }, false);

                request.send(_formData);

            });
        }
    },

    processSubmitedFormData: {
        value: function (formData) {
            var s3LocationInfo;

            //console.log("processSubmitedFormData:", formData);
            /* 
            Form Data submitted by iFrame looks like this:
            {
                "appointment_guid":"",
                "ipv4":"98.33.36.156",
                "ipv6":"98.33.36.156",
                "user_agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
                "submitted_at":"Wednesday, December 2, 2020 1:56 PM",
                "accept_consent":"yes",
                "first_name":"Steven",
                "last_name":"Rogers",
                "accept_signature_sfs":"937853,280,90,white,black",
                "accept_signature":"x937853:x937853:814460:1028555:1030190:1025582:1027219:1017054:1045929:1043357:1033831:997175:994600:983837:1012976:1014367:1009301:1004873:1007031:1001258:1001262:1001266:1001265:999890:1010178:1012755:990752:991843:1048403:1018210:1025817:808924:789361:786494:836784:841849:849304:822291:826176:831471:832299:868953:873100",
                "accept_signature_file":"accept_signature",
                "accept_signature_caption":"Signature",
                "accept_date":"12/2/2020",
                "responsible_party":"self",
                "positive_covid":"no",
                "last_covid_date":"",
                "fever":"no",
                "cough":"no",
                "breath_issues":"no",
                "chest_pain":"no",
                "resched_signature_sfs":"937853,280,90,white,black",
                "resched_signature":"x937853:815537:809523:1029585:1021686:1046580:1033479:988755:1009821:1002209:955223:954136:981159:973548:967979:970391:970398:970407:970411:973736:975462:952863:958896:1005383:986837:998792:1037083:1022546:806887:811899:786586:796143:801549:839841:849745",
                "resched_signature_file":"resched_signature",
                "resched_signature_caption":"Signature",
                "resched_date":"12/2/2020"
            }
            */
           this.dataService.getObjectProperties(this.data, [ "originId"])
           .then(() => {
                return this.submitFormDataIfNeeded(formData);
           })
           .then((_S3LocationInfo) => {

                s3LocationInfo = _S3LocationInfo;

                return Promise.all([
                    this._checkInQuestionnairePromise,
                    this.dataService.getObjectProperties(this.patient, [ "questionnaires"])
                ]);
            }, (failedValue) => {
                console.error("submit Form Data Error:",failedValue);
            })
            .then((promisesResults) => {
                var checkInQuestionnaire = promisesResults[0],
                    respondentQuestionnaire = this.dataService.createDataObject(RespondentQuestionnaire),
                    submissionDate = formData.submitted_at ? new Date(formData.submitted_at) : null,
                    i, countI;

                    
                respondentQuestionnaire.originId = this.data.originId;
                respondentQuestionnaire.questionnaire = checkInQuestionnaire;
                respondentQuestionnaire.respondent = this.patient;
                if(submissionDate) {
                    respondentQuestionnaire.completionDate = submissionDate;
                }

                //Loop over variables
                var userContextVariables = checkInQuestionnaire.userContextVariables,
                    iVariable,
                    iValue,
                    iAnswer,
                    iRespondentQuestionnaireVariableValue;



                if(userContextVariables) {
                    for(i=0, countI = userContextVariables.length; (i<countI); i++) {
                        iVariable = userContextVariables[i];
                        iAnswer = this.dataService.createDataObject(Answer);
                        iAnswer.name = iVariable.name;

                        switch ( iVariable.name ) {
                            case "ipv4":
                                iAnswer.textValue = formData.ipv4;
                                break;

                            case "ipv6":
                                iAnswer.textValue = formData.ipv6;
                                break;

                            case "userAgent":
                                iAnswer.textValue = formData.user_agent;
                                break;

                            case "submissionDate":
                                iAnswer.timeValue = submissionDate;
                                break;

                            case "signatureFile":
                                iAnswer.textValue = "accept_signature";
                                break;
                                         
                            case "signatureCaption":
                                iAnswer.textValue = "Signature";
                                break;
    
                        }

                        iRespondentQuestionnaireVariableValue = this.dataService.createDataObject(RespondentQuestionnaireVariableValue);
                        iRespondentQuestionnaireVariableValue.respondentQuestionnaire = respondentQuestionnaire;
                        iRespondentQuestionnaireVariableValue.questionnaireVariable = iVariable;
                        iRespondentQuestionnaireVariableValue.values = [iAnswer];
                    }

                }

                //Now process respondent answers:
                var questions = checkInQuestionnaire.questions,
                    iQuestionnaireQuestion,
                    iRespondentQuestionnaireAnswer,
                    iPossibleAnswers,
                    iYesAnswer,
                    iYesAnswersCriteria = new Criteria().initWithExpression("textValue == $textValue && booleanValue == $booleanValue", {
                        textValue: "Yes",
                        booleanValue: true
                    }),
                    iNoAnswer,
                    iNoAnswersCriteria = new Criteria().initWithExpression("textValue == $textValue && booleanValue == $booleanValue", {
                        textValue: "No",
                        booleanValue: false
                    }),
                    iAnswer,
                    iQuestion,
                    iAnswers,
                    signatureSFSAnswer,
                    signatureAnswer;

                if(questions) {
                    for(i=0, countI = questions.length; (i<countI); i++) {
                        iQuestionnaireQuestion = questions[i];
                        iQuestion = iQuestionnaireQuestion.question;
                        iPossibleAnswers = iQuestionnaireQuestion.possibleAnswers;

                        if(iPossibleAnswers && iPossibleAnswers.length === 2 && !iQuestion.isOpenEnded) {
                            iYesAnswer = iPossibleAnswers.filter(iYesAnswersCriteria.predicateFunction)[0];
                            iNoAnswer = iPossibleAnswers.filter(iNoAnswersCriteria.predicateFunction)[0];
                        } else {
                            iAnswer = this.dataService.createDataObject(Answer);
                        }


                        iRespondentQuestionnaireAnswer = this.dataService.createDataObject(RespondentQuestionnaireAnswer);
                        iRespondentQuestionnaireAnswer.respondentQuestionnaire = respondentQuestionnaire;
                        iRespondentQuestionnaireAnswer.questionnaireQuestion = iQuestionnaireQuestion;
                        iRespondentQuestionnaireAnswer.completionDate = submissionDate;
                        iRespondentQuestionnaireAnswer.answers = iAnswers = [];

                        switch ( iQuestion.name ) {
                            case "acceptsConsent":
                                if(formData.accept_consent === "yes") {
                                    iAnswers.push(iYesAnswer);
                                } else {
                                    iAnswers.push(iNoAnswer);
                                }
                                break;

                            case "firstName":
                                iAnswer.name = "firstName";
                                iAnswer.textValue = formData.first_name;
                                iAnswers.push(iAnswer);
                                break;

                            case "lastName":
                                iAnswer.name = "lastName";
                                iAnswer.textValue = formData.last_name;
                                iAnswers.push(iAnswer);
                                break;

                            case "acceptationDate":
                                iAnswer.name = "acceptationDate";
                                iAnswer.timeValue = new Date(formData.accept_date);
                                iAnswers.push(iAnswer);
                                break;

                            case "acceptsSignature":
                                /*
                                    we don't have binaryValue in Answer yet to store the signature itself,
                                    so store boolean for now, if there's a signature, it means yes
                                */
                                if(formData.accept_signature.length > 0) {
                                    iAnswer.name = "accepts";
                                    iAnswer.boolanValue = true;
                                    iAnswers.push(iAnswer);    
                                }

                                /*
                                    Add all other answers for sigature:

                                    "resched_signature_sfs":"937853,280,90,white,black",
                                    "resched_signature":"x937853:815537:809523:1029585:1021686:1046580:1033479:988755:1009821:1002209:955223:954136:981159:973548:967979:970391:970398:970407:970411:973736:975462:952863:958896:1005383:986837:998792:1037083:1022546:806887:811899:786586:796143:801549:839841:849745",
                                    "resched_signature_file":"resched_signature",
                                    "resched_signature_caption":"Signature",
                                */
                                signatureSFSAnswer = this.dataService.createDataObject(Answer);
                                signatureSFSAnswer.name = "acceptsSignatureSfs";
                                signatureSFSAnswer.textValue = formData.accept_signature_sfs;
                                iAnswers.push(signatureSFSAnswer);    

                                signatureAnswer = this.dataService.createDataObject(Answer);
                                signatureAnswer.name = "acceptsSignature";
                                signatureAnswer.textValue = formData.accept_signature;
                                iAnswers.push(signatureAnswer);    

                                break;
                        }

                    }
                }


                if(s3LocationInfo && s3LocationInfo.Key) {
                    //Create the Asset to put on pdfExport property:
                    var pdfAsset = this.dataService.createDataObject(Asset);
                    pdfAsset.s3BucketName = s3LocationInfo.Bucket;
                    pdfAsset.s3ObjectKey = s3LocationInfo.Key;
                    pdfAsset.s3Location = s3LocationInfo.Location;

                    respondentQuestionnaire.pdfExport = pdfAsset;
                }

                //Now supplemental Health Questionnaire, we know there's only one followUpQuestionnaire
                var supplementalHealthQuestionnaire = checkInQuestionnaire.followUpQuestionnaires[0],
                    supplementalHealthQuestionnaireUserContextVariables = checkInQuestionnaire.userContextVariables;

        
                questions = supplementalHealthQuestionnaire.questions;

                var respondentHealthQuestionnaire = this.dataService.createDataObject(RespondentQuestionnaire),
                respondentHealthQuestionnaireCompletionDate = formData.resched_date ? new Date(formData.resched_date) : null;

                respondentHealthQuestionnaire.questionnaire = supplementalHealthQuestionnaire;
                respondentHealthQuestionnaire.respondent = this.patient;
                respondentHealthQuestionnaire.originId = this.data.originId;


                //Finish by setting completionDate on both RespondentQuestionnaires
                if(respondentHealthQuestionnaireCompletionDate) {
                    respondentHealthQuestionnaire.completionDate = new Date(respondentHealthQuestionnaireCompletionDate);
                }


                if(supplementalHealthQuestionnaireUserContextVariables) {
                    for(i=0, countI = supplementalHealthQuestionnaireUserContextVariables.length; (i<countI); i++) {
                        iVariable = supplementalHealthQuestionnaireUserContextVariables[i];
                        iAnswer = this.dataService.createDataObject(Answer);
                        iAnswer.name = iVariable.name;

                        switch ( iVariable.name ) {
                            case "signatureFile":
                                iAnswer.textValue = "resched_signature";
                                break;
                                            
                            case "signatureCaption":
                                iAnswer.textValue = "Signature";
                                break;
                        }

                        iRespondentQuestionnaireVariableValue = this.dataService.createDataObject(RespondentQuestionnaireVariableValue);
                        iRespondentQuestionnaireVariableValue.respondentQuestionnaire = respondentHealthQuestionnaire;
                        iRespondentQuestionnaireVariableValue.questionnaireVariable = iVariable;
                        iRespondentQuestionnaireVariableValue.values = [iAnswer];
                    }
                }


                if(questions) {
                    for(i=0, countI = questions.length; (i<countI); i++) {
                        iQuestionnaireQuestion = questions[i];
                        iQuestion = iQuestionnaireQuestion.question;
                        iPossibleAnswers = iQuestionnaireQuestion.possibleAnswers;

                        if(iPossibleAnswers && iPossibleAnswers.length === 2 && !iQuestion.isOpenEnded) {
                            iYesAnswer = iPossibleAnswers.filter(iYesAnswersCriteria.predicateFunction)[0];
                            iNoAnswer = iPossibleAnswers.filter(iNoAnswersCriteria.predicateFunction)[0];
                        } else {
                            iAnswer = this.dataService.createDataObject(Answer);
                        }

                        iRespondentQuestionnaireAnswer = this.dataService.createDataObject(RespondentQuestionnaireAnswer);
                        iRespondentQuestionnaireAnswer.respondentQuestionnaire = respondentHealthQuestionnaire;
                        iRespondentQuestionnaireAnswer.questionnaireQuestion = iQuestionnaireQuestion;
                        iRespondentQuestionnaireAnswer.completionDate = submissionDate;
                        iRespondentQuestionnaireAnswer.answers = iAnswers = [];

                        switch ( iQuestion.name ) {
                            case "positiveCovid":
                                if(formData.positive_covid === "no") {
                                    iAnswers.push(iNoAnswer);
                                } else {
                                    iAnswers.push(iYesAnswer);
                                }
                                break;

                            case "responsibleParty":
                                iAnswer.textValue = formData.responsible_party;
                                iAnswers.push(iAnswer);
                                break;

                            case "lastPositiveCovidDate":
                                if(formData.last_covid_date) {
                                    iAnswer.timeValue = new Date(formData.last_covid_date);
                                    iAnswers.push(iAnswer);    
                                }
                                break;

                            case "fever":
                                if(formData.fever === "no") {
                                    iAnswers.push(iNoAnswer);
                                } else {
                                    iAnswers.push(iYesAnswer);
                                }
                                break;

                            case "cough":
                                if(formData.cough === "no") {
                                    iAnswers.push(iNoAnswer);
                                } else {
                                    iAnswers.push(iYesAnswer);
                                }
                                break;

                            case "breathingIssues":
                                if(formData.breath_issues === "no") {
                                    iAnswers.push(iNoAnswer);
                                } else {
                                    iAnswers.push(iYesAnswer);
                                }
                                break;

                            case "chestPain":
                                if(formData.chest_pain === "no") {
                                    iAnswers.push(iNoAnswer);
                                } else {
                                    iAnswers.push(iYesAnswer);
                                }
                                break;

                            case "acceptsRescheduleIfSick":
                                if(formData.resched_signature.length > 0) {
                                    iAnswer.name = "accepts";
                                    iAnswer.boolanValue = true;
                                    iAnswers.push(iAnswer);    
                                }

                                /*
                                    Add all other answers for sigature:

                                    "accept_signature_sfs": "937853,280,90,white,black", 
                                    "accept_signature": "x937853:812298:810272:803344:805755:1028378:1030068:1024028:1025130:1027279:1021702:1017777:1018908:1046647:1037371:1032593:1034525:998130:992842:988066:983921:986451:1012206:1013043:1013591:1014138:1014138:1014133:1014133:1014133:1014013:986663:985538:989431:994461:997036:1039087:1041662:1017912:1027189:1029163:810842:813181:815781:789066:795827:801876:843250:840479:848630:821616:825766:830547:827647:832680:870231:876492:872913:877647:882290:855051:853781:858431", 
                                    "accept_signature_file": "accept_signature", 
                                    "accept_signature_caption": "Signature", 

                                */
                                signatureSFSAnswer = this.dataService.createDataObject(Answer);
                                signatureSFSAnswer.name = "acceptsRescheduleIfSickSignatureSfs";
                                signatureSFSAnswer.textValue = formData.resched_signature_sfs;
                                iAnswers.push(signatureSFSAnswer);    

                                signatureAnswer = this.dataService.createDataObject(Answer);
                                signatureAnswer.name = "acceptsRescheduleIfSickSignature";
                                signatureAnswer.textValue = formData.resched_signature;
                                iAnswers.push(signatureAnswer);    

                                break;     
                                
                            case "acceptationDate":
                                iAnswer.timeValue = new Date(formData.resched_date);
                                iAnswers.push(iAnswer);
                                break;
                        }
                    }
                }

                //Now set the 2 respondentQuestionnaire to the patient's event
                var patientEvent = this.data.event.children[0],
                patientEventRespondentQuestionnaires = patientEvent.respondentQuestionnaires;

                if(patientEventRespondentQuestionnaires) {
                    console.error("We already have questionnaires for this patient?")
                } else {
                    patientEventRespondentQuestionnaires = [respondentQuestionnaire,respondentHealthQuestionnaire];
                    patientEvent.respondentQuestionnaires = patientEventRespondentQuestionnaires;
                }

                //Now we need to succesfully postFormData:
                this._postFormData(formData)
                .then((result) => {
                    return this.dataService.saveChanges();
                }, (error) => {
                    console.error("Error posting form data");
                    this.overlay.hide();
                })
                .then(() => {
                    console.log("saveChanges done!");
                    this.overlay.hide();

                }, (error) => {
                    console.error("Error saving form data");
                })
                .catch((error) => {
                    //Here we need to deal with other error?
                    console.error("Unknown error",error);
                })
                
            });


        }
    },

    _postFormData: {
        value: function(formData) {
            /*
                We need to decide how to do this. Direct post to URL? DataService? What URL?
            */
            return Promise.resolve(true);
        }
    },

    handleLoad: {
        value: function (event) {
            //console.log("iFrame loaded");
        }
    },

    _form: {
        value: undefined
    },

    form: {
        get: function () {
            return this._form;
        },
        set: function (value) {
            this._form = value;
            /*
                The form isn't within the component's tree, beacause of what we have to do to make the original form work as-is, so we workaround by listening on application
            */
            //    this._setFormDates();
            //    var self = this;
            //    this._form.onsubmit = function(event) {
            //         self.handleSubmit(event);
            //         return false;
            //    }

            //    this._form.addEventListener("submit", function(event) {
            //        debugger;
            //         self.handleSubmit(event);
            //         return false;
            //    }, true)
            // this.application.addEventListener("submit",this, true);
        }
    },

    _month: {
        value: function (newDate) {
            if ((newDate.getMonth() + 1) / 10 < 1) return `0${newDate.getMonth() + 1}`
            else return newDate.getMonth() + 1
        }
    },

    _setFormDates: {
        value: function () {
            var newDate = new Date(),
                today = `${this._month(newDate)}/${newDate.getDate()}/${newDate.getFullYear()}`;

            this.form["accept_date"].value = today;
            this.form["resched_date"].value = today;
        }
    },


    // handleSubmit: {
    //     value: function (event) {

    //         event.preventDefault();
    //         // window.history.back();

    //         var formData = new FormData( event.target),
    //             formDataIteraror = formData.entries(),
    //             iEntry;

    //         while(iEntry = formDataIteraror.next().value) {
    //             console.log(iEntry);
    //         }


    //         console.log("handleSubmit:",event);

    //     }
    // },

    didDraw: {
        value: function (firstTime) {

            // if(sform) {
            //     document["myform"] = document.getElementsByTagName("form")[0];
            //     this.acceptSignature = new sform.Signature({
            //         id: "signature1",
            //         form_name: "myform",
            //         field_name: "accept_signature",
            //         required: true,
            //         caption: "Signature",
            //         w: 280,
            //         h: 90
            //     });

            //     this.rescheduledSignature = new sform.Signature({
            //         id: "Signature50",
            //         form_name: "myform",
            //         field_name: "resched_signature",
            //         caption: "Signature",
            //         required: true,
            //         w: 280,
            //         h: 90
            //     });

            // }

        }
    },


    player: {
        value: null
    },

    handleCloseButtonAction: {
        value: function () {
            // this.player.src = "";
            this.overlay.hide();
        }
    },

    open: {
        value: function () {
            overlay.classList.add('is-shown');
            this.overlay.show();
        }
    },

    // didShowOverlay: {
    //     value: function (overlay) {
    //         // if (this._trailerId) {
    //         //     var trailerUrl = TRAILER_URL.replace(PLACE_HOLDER, encodeURIComponent(this._trailerId));
    //         //     if (this.player.src !== trailerUrl) {
    //         //         this.player.src = trailerUrl;
    //         //     }
    //         // }
    //         overlay.classList.add('is-shown');
    //     }
    // },

    didHideOverlay: {
        value: function (overlay) {
            // this._trailerId = null;
            overlay.classList.remove('is-shown');
        }

    },

    _overlay: {
        value: undefined
    },

    overlay: {
        get: function () {
            return this._overlay;
        },
        set: function (value) {
            window.consentmentForm = this;
            window.overlay = value;
            this._overlay = value;
        }
    }

});
