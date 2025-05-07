function unassignTask(wfstr) // optional process name
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

            logMessage("Assigned Workflow Task: " + wfstr + " to ");
            logDebug("Assigned Workflow Task: " + wfstr + " to ");
        }
    }
}