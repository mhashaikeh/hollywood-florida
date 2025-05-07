/*------------------------------------------------------------------------------------------------------/
| Program       : POST_ENFORCEMENT_COLLECTIONS
| Event         : POST SCRIPT
| Usage         : Creates Follow-Up Inspections based upon Hearing WF Statuses
| Created by    : JSHEAR 4/4/2025
| Last Edited   : 
/------------------------------------------------------------------------------------------------------*/

try {
	if (wfTask == "Collections") {
        TSIInfo = new Array();
        loadTaskSpecific(TSIInfo);

        if (matches(wfStatus,"Lien by Special Magistrate","Lien by Treasury")){

            var startDate = TSIInfo["Lien Start Date"];
            var fineAmount = TSIInfo["Lien Daily Fine Amount"];
            if (!matches(startDate,null,undefined,"")){
                editAppSpecific("Lien Start Date", startDate, capId);
            }
            if (!matches(fineAmount,null,undefined,"")){
                editAppSpecific("Lien Daily Fine Amount", fineAmount, capId);
            }
        }
        if (wfStatus == "Lien Released"){

            var releaseDate = TSIInfo["Lien Release Date"];
            var releaseNotes = TSIInfo["Lien Release Notes"];
            if (!matches(releaseDate,null,undefined,"")){
                editAppSpecific("Lien Release Date", releaseDate, capId);
            }
            if (!matches(releaseNotes,null,undefined,"")){
                editAppSpecific("Lien Release Notes", releaseNotes, capId);
            }
        }
    }

} catch (err) {
    var emailAddress = "jshear@mytechsinc.com"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "POST_ENFORCEMENT_COLLECTIONS", err + debug + err.stack);
}