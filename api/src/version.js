const pkg = require('../package.json');

// APP_VERSION et GIT_COMMIT sont injectés au déploiement (Jenkins -> SAM -> variables Lambda).
function getVersionInfo() {
  return {
    name: pkg.name,
    version: process.env.APP_VERSION || pkg.version,
    commit: process.env.GIT_COMMIT || 'local',
    stage: process.env.STAGE || 'local',
    lambdaVersion: process.env.AWS_LAMBDA_FUNCTION_VERSION || null,
  };
}

module.exports = { getVersionInfo };
