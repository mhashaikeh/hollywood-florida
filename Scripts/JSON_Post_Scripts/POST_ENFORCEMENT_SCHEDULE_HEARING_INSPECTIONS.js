/*------------------------------------------------------------------------------------------------------/
| Program       : POST_ENFORCEMENT_SCHEDULE_HEARING_INSPECTIONS
| Event         : POST SCRIPT
| Usage         : Creates Follow-Up Inspections based upon Hearing WF Statuses
| Created by    : JSHEAR 4/4/2025
| Last Edited   : 
/------------------------------------------------------------------------------------------------------*/

try {
	if (wfTask == "Hearing" && wfStatus == "Stipulated Agreement") {

        TSIInfo = new Array();
        loadTaskSpecific(TSIInfo);

        var inspName = getAssigned();
        var inspRes = aa.person.getUser(inspName);
        if (inspRes.getSuccess()){
            inspectorObj = inspRes.getOutput();
        }else{
            inspectorObj = null 
        }
        var complyTime = TSIInfo["Corrective Action Due Date"];
        if (matches(complyTime,undefined,"")){
            complyTime = null;
        }

        var schedRes = aa.inspection.scheduleInspection(capId, inspectorObj, aa.date.parseDate(dateAdd(complyTime, 0)), null, "Follow-Up Inspection", "Scheduled via Script");

        if (schedRes.getSuccess()){
            logDebug("Successfully scheduled inspection : Initail Inspection for " + dateAdd(complyTime, 0));
        }else{
            logDebug("**ERROR: adding scheduling inspection Initial Inspection: " + schedRes.getErrorMessage());
        }
    }

} catch (err) {
    var emailAddress = "jshear@mytechsinc.com"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "POST_ENFORCEMENT_SCHEDULE_HEARING_INSPECTIONS", err + debug + err.stack);
}



