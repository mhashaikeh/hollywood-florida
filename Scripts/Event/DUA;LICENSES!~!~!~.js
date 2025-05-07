/*------------------------------------------------------------------------------------------------------/
| Program		: DUA;LICENSES!~!~!~.js
| Event			: Document Upload After
| Usage			: Update record status and workflow task when document is uploaded by public user
| Notes			: Post Go-Live 1140
| Created by	: ECATES
| Created on	: 08/12/2024 
/------------------------------------------------------------------------------------------------------*/
try{
    if (publicUser){
        cap = aa.cap.getCap(capId).getOutput();
        capStatus = cap.getCapStatus();
        if (capStatus == "Additional Info Required")
        {
            updateAppStatus("Pending", "");
            var appIntake = isTaskActive("Application Intake");
            if (appIntake)
            {
                updateTask("Application Intake", "Additional Info Received", "", "");
                unassignTask("Application Intake");
            }
            var modReview = isTaskActive("Modification Review");
            if (modReview)
            {
                updateTask("Modification Review", "Additional Info Received", "", "");
                unassignTask("Modification Review");
            }
            var regIssuance = isTaskActive("Registration Issuance");
            if (regIssuance)
            {
                updateTask("Registration Issuance", "Additional Info Received", "", "");
                unassignTask("Registration Issuance");
            }
        }
        else if((appMatch("Licenses/Contractor/State/License") || appMatch("Licenses/Contractor/County/License")) && (capStatus != "Closed" || capStatus != "Revoked"))
        {
            eval(loadScript("ADHOCHANDLER"));
            adHocHanlder.addAddHocTask(capId, "New Document Received - License", "", "");
        }
    }
} catch (err) {
    var emailAddress = "accelaerrors@hollywoodfl.org"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "DUA;~!~!~!~", err + debug + err.stack);
}