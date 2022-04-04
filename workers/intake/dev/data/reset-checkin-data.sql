/* delete from S3 */
delete from phront."Asset"; 
delete from phront."RespondentQuestionnaire";
delete from phront."RespondentQuestionnaireAnswer";
delete from phront."RespondentQuestionnaireVariableValue";
update phront."Event" set "respondentQuestionnaireIds" = NULL, "participationStatus" = 'Accepted', "participationStatusLogValues" = NULL, "participationStatusLogKeys" = NULL where "isTemplate" != true;