/*
    https://www.serverless.com/framework/docs/providers/aws/guide/variables/#reference-variables-in-javascript-files
*/

module.exports = async ({ options, resolveVariable }) => {
    // We can resolve other variables via `resolveVariable`
    const projectVersion = await resolveVariable('self:custom.projectVersion');
   
    // Resolver may return any JSON value (null, boolean, string, number, array or plain object)
    return projectVersion.split(".");
  }