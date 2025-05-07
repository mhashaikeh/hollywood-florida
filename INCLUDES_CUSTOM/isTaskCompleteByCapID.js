function isTaskCompleteByCapID(wfstr, recCapId) // optional process name
{
	var useProcess = false;
	var processName = "";

	var workflowResult = aa.workflow.getTaskItems(recCapId, wfstr, processName, "Y", null, null);
	if (workflowResult.getSuccess())
		wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName)))
			if (fTask.getCompleteFlag().equals("Y"))
				return true;
			else
				return false;
	}
}