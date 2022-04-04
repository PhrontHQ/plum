// serverless injected by serverless-scriptable-plugin
// noinspection JSUnresolvedVariable
const sls = serverless;

//console.log(sls);

// noinspection JSUnresolvedVariable
const versionString = sls.service.custom.versionString;
console.log("myMajorVersion: ",versionString);

sls.service.custom.versionComponents = versionString.split(".");
console.log(`[${__filename}] Updated versionComponents: ${sls.service.custom.versionComponents}`);
console.log(`[${__filename}] Updated myMajorVersion: ${sls.service.custom.myMajorVersion}`);
