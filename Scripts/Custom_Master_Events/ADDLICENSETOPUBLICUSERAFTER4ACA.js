 /*------------------------------------------------------------------------------------------------------/
| Program : AddLicenseToPublicUserAfter4ACA.js
| Event   : AddLicenseToPublicUserAfter4ACA
|
| Usage   : Runs after a public user adds a licensed professional to their account
|
| Created by: Thernandez
| Created Date: 10/18/2017
|
| Notes   : NotifyLicensee - Sends Licensed professional an email to verify the connection.
|
|
/------------------------------------------------------------------------------------------------------*/

const approvalEmail = "bldgpermit@hollywoodfl.org";
const accelaEmail  ="Accela@hollywoodfl.org";
const licenseeNotificationTemplate = "ACA_MESSAGE_ADD_NEW_LICENSE_NOTICE_LICENSEE";
const publicUserNotificationTemplate = "ACA_MESSAGE_ADD_NEW_LICENSE_NOTICE_CITIZEN";


eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));



function getMasterScriptText(vScriptName) {
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
    return emseScript.getScriptText() + "";
}

var NotifyLicensee = function () {

    try {
        var licScriptModel = aa.env.getValue("LicenseModel");
        var lisenceeEmail = licScriptModel.getEMailAddress();

        //if Licensee email is empty then send to default approval email
        var toEmail = lisenceeEmail || approvalEmail;
        var fromEmail = (toEmail == approvalEmail ? accelaEmail : approvalEmail);
       
    
        var params = getNotifyLincenseeParams();
        if (lisenceeEmail) addParameter(params, "$$LicenseeEmail$$", " at " + lisenceeEmail);
        var result2;
        var result = aa.document.sendEmailByTemplateName(fromEmail, toEmail, "", licenseeNotificationTemplate, params, new Array());
        if ( params.get("$$UsersEmails$$") != toEmail)  result2 = aa.document.sendEmailByTemplateName(accelaEmail, params.get("$$UsersEmails$$"), "", publicUserNotificationTemplate, params, new Array());
        if (!result.getSuccess() || (result2 && !result2.getSuccess())) {
            throw 'Error sending email.';
        }
    }
    catch (err) {
        //on error       
        aa.env.setValue("ScriptReturnCode", "1");
        aa.env.setValue("ScriptReturnMessage","An error has occured, please contact the building department " + err.message); ;
        // err.message
        // logDebug()
    }
};


var getNotifyLincenseeParams = function () {
    var licScriptModel = aa.env.getValue("LicenseModel");
    var params = aa.util.newHashtable();

    var contact = licScriptModel.getContactFirstName();
    contact = contact ? contact : "test";
    addParameter(params, "$$firstName$$", contact);

    var stateLicense = licScriptModel.getStateLicense();
    addParameter(params, "$$licenseNumber$$", stateLicense);

    var UserSeqNum = aa.env.getValue("UserSeqNum");
    var userInfoResultObj = aa.publicUser.getPublicUser(UserSeqNum);
    var userInfo;
    if (userInfoResultObj.getSuccess()) {
        userInfo = userInfoResultObj.getOutput();
        var associatedContactReturnObject = aa.people.getUserAssociatedContact(UserSeqNum);
        if (associatedContactReturnObject.getSuccess()) {
            var userContact = associatedContactReturnObject.getOutput().toArray();
            if (userContact.length > 0) {
                var firstName = userContact[0]["firstName"] || "";
                var lastName = userContact[0]["lastName"] || "";
                var cellPhone = userContact[0]["phone2"] || "";
            }
            addParameter(params, "$$UserFullName$$", firstName + " " + lastName);
            addParameter(params, "$$UsersPhone$$", cellPhone);
        }

        addParameter(params, "$$UserID$$", userInfo.getUserID());

        addParameter(params, "$$UsersEmails$$", userInfo.getEmail());
    }
    return params;
};


//Notify the Licensee holder by Email of new connection
NotifyLicensee();

