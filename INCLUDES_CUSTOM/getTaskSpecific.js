function getTaskSpecific(wfName, itemName) // optional: itemCap
{
    var updated = false;
    var i = 0;
    itemCap = capId;
    if (arguments.length == 3)
        itemCap = arguments[2]; // use cap ID specified in args
    //
    // Get the workflows
    //
    var workflowResult = aa.workflow.getTaskItems(itemCap, wfName, null, null, null, null);
    if (workflowResult.getSuccess())
        wfObj = workflowResult.getOutput();
    else {
        logDebug("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
        return false;
    }

    //
    // Loop through workflow tasks
    //
    for (i in wfObj) {
        fTask = wfObj[i];
        stepnumber = fTask.getStepNumber();
        processID = fTask.getProcessID();
        if (wfName.equals(fTask.getTaskDescription())) // Found the right Workflow Task
        {
            TSIResult = aa.taskSpecificInfo.getTaskSpecifiInfoByDesc(itemCap, processID, stepnumber, itemName);
            if (TSIResult.getSuccess()) {
                var TSI = TSIResult.getOutput();
                if (TSI != null) {
                    var TSIArray = new Array();
                    TSInfoModel = TSI.getTaskSpecificInfoModel();
                    var TSIvalue = TSInfoModel.getChecklistComment();
                    return TSIvalue;
                } else
                    logDebug("No task specific info field called " + itemName + " found for task " + wfName);
            } else {
                logDebug("**ERROR: Failed to get Task Specific Info objects: " + TSIResult.getErrorMessage());
                return false;
            }
        } // found workflow task
    } // each task
}
