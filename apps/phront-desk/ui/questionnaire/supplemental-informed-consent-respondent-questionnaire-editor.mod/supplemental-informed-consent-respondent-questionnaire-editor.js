
var Promise = require("mod/core/promise").Promise,
    DataEditor = require("mod/ui/data-editor").DataEditor,
    Criteria = require("mod/core/criteria").Criteria,
    DataQuery = require("mod/data/model/data-query").DataQuery,
    Questionnaire = require("business-data.mod/data/main.mod/model/questionnaire/questionnaire").Questionnaire,
    Answer = require("business-data.mod/data/main.mod/model/questionnaire/answer").Answer,
    RespondentQuestionnaire = require("business-data.mod/data/main.mod/model/questionnaire/respondent-questionnaire").RespondentQuestionnaire,
    RespondentQuestionnaireVariableValue = require("business-data.mod/data/main.mod/model/questionnaire/respondent-questionnaire-variable-value").RespondentQuestionnaireVariableValue,
    RespondentQuestionnaireAnswer = require("business-data.mod/data/main.mod/model/questionnaire/respondent-questionnaire-answer").RespondentQuestionnaireAnswer,
    Asset = require("business-data.mod/data/main.mod/model/asset").Asset,
    currentEnvironment = require("mod/core/environment").currentEnvironment;

exports.SupplementalInformedConsentRespondentQuestionnaireEditor = DataEditor.specialize({

    constructor: {
        value: function SupplementalInformedConsentRespondentQuestionnaireEditor() {
            this.super();            
        }
    }

});
