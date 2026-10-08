import fs from 'node:fs';
const evidence=JSON.parse(fs.readFileSync('docs/acceptance-evidence.json'));
const capabilities=JSON.parse(fs.readFileSync('public/capabilities.json'));
const full=evidence.fullProductionAccepted&&evidence.hotelEntrance&&evidence.testEntrances.length>=5&&['iphone-safari','android-chrome'].every(platform=>evidence.deviceWalks.filter(w=>w.platform===platform&&w.pass&&w.artifact).length>=5);
if(capabilities.navigationEnabled&&!full){console.error('FULL_PRODUCTION_BLOCKED: physical entrance and device-walk acceptance required.');process.exit(1);}
if(!full&&!(evidence.staticReleaseAuthorized&&evidence.staticReleaseAuthorization&&!capabilities.navigationEnabled)){
 console.error('PRODUCTION_BLOCKED: v1.4 physical gates are unmet; no user-authorized static release decision is recorded.');process.exit(1);
}
console.log(JSON.stringify({profile:full?'full':'static',navigationEnabled:capabilities.navigationEnabled,site:evidence.site,approved:true}));
