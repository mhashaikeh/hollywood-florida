/*------------------------------------------------------------------------------------------------------/
| Program		: PRE_PREPARE_CONTACT_PARAMS.js
| Event			: STDBASE - Pre Script
| Usage			: prepare initial email template parameters
| Created by	: JSHEAR 5/2/2024
/------------------------------------------------------------------------------------------------------*/

var params = aa.util.newHashtable();
getContactParams4Notification(params, "Applicant");
getRecordParams4Notification(params);
var agencyAddress= lookup("RPT_CONFIG","Agency Address Single Line");
addParameter(params, "$$BureauAddress$$", agencyAddress);
aa.env.setValue("CustomEmailParams", params);