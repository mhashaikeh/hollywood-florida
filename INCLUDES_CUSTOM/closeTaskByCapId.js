function closeTaskByCapId(wfstr, wfstat, wfcomment, wfnote) // optional process name, optional capId
{
    var useProcess = false;
    var processName = "";
    var thisCapId = capId;
    if (arguments.length > 4) {
        if (arguments[4] != null) {
            processName = arguments[4]; // subprocess
            useProcess = true;
        }

        if (arguments.length > 5) {
            if (arguments[5] != null) {
                thisCapId = arguments[5];
            }
        }
    }

    var workflowResult = aa.workflow.getTaskItems(thisCapId, wfstr, processName, null, null, null);
    if (workflowResult.getSuccess())
        var wfObj = workflowResult.getOutput();
    else { logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }

    if (!wfstat) wfstat = "NA";

    for (i in wfObj) {
        var fTask = wfObj[i];
        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) {
            var dispositionDate = aa.date.getCurrentDate();
            var stepnumber = fTask.getStepNumber();
            var processID = fTask.getProcessID();

            if (useProcess)
                aa.workflow.handleDisposition(thisCapId, stepnumber, processID, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, "Y");
            else
                aa.workflow.handleDisposition(thisCapId, stepnumber, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, "Y");

            logMessage("Closing Workflow Task: " + wfstr + " with status " + wfstat);
            logDebug("Closing Workflow Task: " + wfstr + " with status " + wfstat);
        }
    }
}