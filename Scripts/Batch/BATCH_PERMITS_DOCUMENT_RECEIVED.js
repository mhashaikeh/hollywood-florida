//BATCH_PERMITS_DOCUMENT_RECEIVED.js
//Case 01481602 - start
var sql = "select distinct A.B1_ALT_ID from BDOCUMENT B"
sql+= " inner join B1PERMIT A on"
sql+= " A.SERV_PROV_CODE=B.SERV_PROV_CODE"
sql+= " and A.B1_PER_ID1=B.B1_PER_ID1"
sql+= " and A.B1_PER_ID2=B.B1_PER_ID2"
sql+= " and A.B1_PER_ID3=B.B1_PER_ID3"
sql+= " and A.B1_APP_TYPE_ALIAS like '%Permit'"
sql+= " and A.B1_APPL_STATUS in ('Ready to Issue','Closed - Complete','Closed - Approved','Active','Inspection Phase')"
sql+= " where B.SERV_PROV_CODE='HOLLYWOOD' and B.FILE_UPLOAD_BY='DPRUSER'"
sql+= " and DATEDIFF(day,A.B1_FILE_DD,B.REC_DATE)>0"
sql+= " and DATEDIFF(day,GETDATE(),B.REC_DATE)=0"

try{
	var dba = com.accela.aa.datautil.AADBAccessor.getInstance();
	var recList = dba.select(sql,[]);
	for(var m=0; m<recList.size(); m++){
		var altId = recList.get(m)[0];
		aa.print("altId:" + altId);
		var capId = aa.cap.getCapID(altId).getOutput();
		var systemUserObj = aa.person.getUser("ADMIN").getOutput();	
		//var cap = aa.cap.getCap(capId).getOutput();
		//var capStatus = cap.getCapStatus();
		//var module = cap.getCapModel().getModuleName();
		//if(module == "Building" || module == "Fire" || module == "PublicWorks"){
			//if(capStatus == "Ready to Issue" || capStatus == "Closed - Complete" || capStatus=="Closed - Approved" || capStatus=="Active"){
				activateTask(capId, "Application Intake", true);
				updateTask(capId, "Application Intake", "Plans Received", "", "");
				unassignTask(capId,"Application Intake");
				//MAS #01486882
				if (isTaskActive("Inspection"))
					{
					updateTask(capId, "Inspection", "In Progress", "", "");
					}
			//}
		//}
	}
} catch (err) {
	logDebug(err);
    //var emailAddress = "accelaerrors@hollywoodfl.org"; //email to send report
    //aa.sendMail("no-reply@accela.com", emailAddress, "", "DUA;~!~!~!~", err + debug + err.stack);
}

function logDebug(msg){
	aa.print(msg);
}

function logMessage(msg){
	aa.print(msg);
}

function unassignTask(capId,wfstr) // optional process name
{
    // Assigns the task to a user.  No audit.
    //
    var useProcess = false;
    var processName = "";
    /*if (arguments.length == 3) 
        {
        processName = arguments[2]; // subprocess
        useProcess = true;
        }
        */
    //var taskUserResult = aa.person.getUser("ADMIN");


    /*if (taskUserResult.getSuccess())
    var taskUserObj = taskUserResult.getOutput();  //  User Object
    else
        { logMessage("**ERROR: Failed to get user object: " + taskUserResult.getErrorMessage()); return false; }*/

    var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, null, null, null);
    if (workflowResult.getSuccess())
        var wfObj = workflowResult.getOutput();
    else { logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }

    for (i in wfObj) {
        var fTask = wfObj[i];
        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) {
            var taskUserObj = fTask.getTaskItem().getAssignedUser();
            var department = taskUserObj.getDeptOfUser();
            taskUserObj.setDeptOfUser(department);
            taskUserObj.setFirstName("");
            taskUserObj.setMiddleName("");
            taskUserObj.setLastName("");
            taskUserObj.setUserID("");
            //curTask.setAssignedUser(taskUserObj);
            fTask.setAssignedUser(taskUserObj);
            var taskItem = fTask.getTaskItem();
            var adjustResult = aa.workflow.assignTask(taskItem);

            //logMessage("Assigned Workflow Task: " + wfstr + " to ");
            logDebug("Assigned Workflow Task: " + wfstr + " to ");
        }
    }
}

function updateTask(capId,wfstr, wfstat, wfcomment, wfnote) // optional process name, cap id
{
	var useProcess = false;
	var processName = "";
	var itemCap = capId;

	var workflowResult = aa.workflow.getTaskItems(itemCap, wfstr, processName, null, null, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
		return false;
	}

	if (!wfstat)
		wfstat = "NA";

	for (i in wfObj) {
		var fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) {
			var dispositionDate = aa.date.getCurrentDate();
			var stepnumber = fTask.getStepNumber();
			var processID = fTask.getProcessID();
			if (useProcess)
				aa.workflow.handleDisposition(itemCap, stepnumber, processID, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, "U");
			else
				aa.workflow.handleDisposition(itemCap, stepnumber, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, "U");
			//logMessage("Updating Workflow Task " + wfstr + " with status " + wfstat);
			logDebug("Updating Workflow Task " + wfstr + " with status " + wfstat);
		}
	}
}

function activateTask(capId,task, desactivateCurrent) {
	var r = aa.workflow.getTaskItems(capId, "", "", null, null, null);
	if (!r.getSuccess()) {
		throw "**ERROR: Failed to get workflow object: " + r.getErrorMessage();
	}
	var s = r.getOutput();
	for (i in s) {
		var wfTask = s[i];
		var stepNumber = wfTask.getStepNumber();
		if (wfTask.getTaskDescription().toUpperCase().equals(task.toUpperCase())) {
			aa.workflow.adjustTask(capId, stepNumber, "Y", "N", null, null);
		}else{
			if (desactivateCurrent && wfTask.getActiveFlag().equals("Y")) {
				var completeFlag = wfTask.getCompleteFlag();
				aa.workflow.adjustTask(capId, stepNumber, "N", completeFlag, null, null);
			}
		}
	}
}