//Open up Review Tasks based upon TSI Selection and set Due Date
if (wfStatus ==  "Routed for Review") {
	var expReview = getAppSpecific("Expedited Plan Review");
	var dueDate = getNextWorkDays4Workflow(expReview == "CHECKED" ? 1 : 10, new Date());

	var TSIResult = aa.taskSpecificInfo.getTaskSpecificInfoByTask(capId, wfProcessID, wfStep);
	if (TSIResult.getSuccess()){
		var TSI = TSIResult.getOutput();
		for (a1 in TSI){
			if (matches(TSI[a1].getChecklistComment(),null,undefined,"","UNCHECKED")){
				deactivateTask(TSI[a1].getCheckboxDesc());
			}else{
				// Adjust due date for Fire Review task
				var taskName = TSI[a1].getCheckboxDesc();
				if (taskName == "Fire Review") {
					dueDate = getNextWorkDays4Workflow(30, new Date());
				}
				editTaskDueDate(taskName, dueDate);
		  	}
		}
	}
}

if (appTypeArray[1] != "Amendment") {
    //Start: Apply Processing Fee
    if (matches(wfStatus, "Approved", "Approved w/ Comments", "Revisions Required")) {
        if (wfTask == "Mechanical Review") {
            if (!feeExists("BLD03")) {
                updateFee("BLD03", "BUILDING", "FINAL", 1, "N");
                logDebug("Applied fee: Mechanical Non-Refundable Processing Fee");
            }
        }

        if (wfTask == "Structural Review") {
            if (!feeExists("BLD04")) {
                updateFee("BLD04", "BUILDING", "FINAL", 1, "N");
                logDebug("Applied fee: Structural Non-Refundable Processing Fee");
            }
        }

        if (wfTask == "Plumbing Review") {
            if (!feeExists("BLD05")) {
                updateFee("BLD05", "BUILDING", "FINAL", 1, "N");
                logDebug("Applied fee: Plumbing Non-Refundable Processing Fee");
            }
        }

        if (wfTask == "Electrical Review") {
            if (!feeExists("BLD06")) {
                updateFee("BLD06", "BUILDING", "FINAL", 1, "N");
                logDebug("Applied fee: Electrical Non-Refundable Processing Fee");
            }
        }
    }
    //End: Apply Processing Fee

    //MAS SF#01486264 starts
    if (wfStatus == "Ready to Issue") {
        calcBldPermitFeesAndInvoice();
    }

    if(appTypeArray[1] != "Amendment" && wfStatus == "Re-Calculate Fees" && matches(wfTask, "Permit Issuance", "Inspection")){
        calcBldPermitFeesAndInvoice();
    }
    // MAS SF#01486264 ends
}

//Start: Update Application Expiration Date Field
if (wfStatus != "Issued" && wfTask != "Inspection"){
  var appExpDate = getAppSpecific("Application Expiration Date");
  if (isTaskActive("Plans Coordination") || isTaskComplete('Plans Coordination')){
      var today = new Date();
      today.setDate(today.getDate() + 60);
      var sixtyDaysLaterString = (today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear();
      editAppSpecific("Application Expiration Date", sixtyDaysLaterString);
  }
}
//End: Update Application Expiration Date Field


//Start: Send Issuance email with Building Permit Report
if (wfStatus == "Issued"){

	//Notification and Reports
	var envParameters = aa.util.newHashMap();
	envParameters.put("CapID",capId);
	aa.runAsyncScript("ASYNCRUNBUILDINGPERMITRPT", envParameters, 5000);
		
}
//End: Send Issuance email with Building Permit Report

//MAS #01483120
if (wfStatus ==  "Withdrawn")
{
	closeWorkflow();
}

function closeWorkflow() {
	var r = aa.workflow.getTaskItems(capId, "", "", null, null, null);
	if (!r.getSuccess()) {
		return;
	}
	var s = r.getOutput();
	for (i in s) {
		var wfTask = s[i];
		var stepNumber = wfTask.getStepNumber();

		if (wfTask.getActiveFlag().equals("Y")) {
			var completeFlag = wfTask.getCompleteFlag();
			aa.workflow.adjustTask(capId, stepNumber, "N", completeFlag, null, null);
		}
	}
	logDebug("Complete Workflow called on " + capId);
}
//MAS #01483120