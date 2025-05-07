/*------------------------------------------------------------------------------------------------------/
| Program		: PRE_PREPARE_LIC_CONTACT_PARAMS.js
| Event			: STDBASE - Pre Script
| Usage			: prepare initial email template parameters
| Created by	: JSHEAR 5/2/2024
/------------------------------------------------------------------------------------------------------*/

var params = aa.util.newHashtable();
getContactParams4Notification(params, "Qualifying Individual");
aa.env.setValue("CustomEmailParams", params);