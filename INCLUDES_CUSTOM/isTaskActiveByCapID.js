function isTaskActiveByCapID(wfstr, recCapId) // optional process name and cap ID
{
    var useProcess = false;
    var processName = "";

    var workflowResult = aa.workflow.getTaskItems(recCapId, wfstr, processName, null, null, "Y");
    if (workflowResult.getSuccess())
        wfObj = workflowResult.getOutput();
    else {
        logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
        return false;
    }

    for (i in wfObj) {
        fTask = wfObj[i];
        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName)))
            if (fTask.getActiveFlag().equals("Y"))
                return true;
            else
                return false;
    }
    return false;
}
