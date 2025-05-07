/*------------------------------------------------------------------------------------------------------/
| Program        : POST_DDOG_RENEWAL_ISSUANCE.js
| Event          : STDBASE - Post Script
| Usage          : Update License information after issuance and cap created
| Created by     : JSHEAR 5/12/2024
/------------------------------------------------------------------------------------------------------*/

try {

   logDebug("parentLic: " + parentCapId);


    //Copy Documents to Parent
    copyDocumentsToCapID(capId, parentCapId);
    updateTask("Permit Status", "Active", "", "", "", parentCapId);

    // Mark renewal as complete
    var renewalCapProject = getRenewalCapByParentCapIDForIncomplete(parentCapId);
    if (renewalCapProject) {
        renewalCapProject.setStatus("Complete");
        renewalCapProject.setRelationShip("R");
        aa.cap.updateProject(renewalCapProject);
        aa.cap.updateAccessByACA(capId, "N");
    } else {
        logDebug("No incomplete renewal project found for parentCapId: " + parentCapId.getCustomID());
    }

        

} catch (err) {
    var emailAddress = "jshear@mytechsinc.com"; // email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "POST_DDOG_RENEWAL_ISSUANCE", err + debug);
}
