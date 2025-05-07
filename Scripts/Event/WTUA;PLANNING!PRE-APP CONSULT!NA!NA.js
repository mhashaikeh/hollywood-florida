if (wfTask == "Application Intake" && wfStatus == "Accepted"){
	userID = getAssigned(capId);
	if (!matches(userID,null,undefined,"")){
		assignTask("Plans Distribution",userID);
		assignTask("Meeting",userID);
	}
}

//Aggregate all Review Comments into Record Comments
if (wfTask.toLowerCase().indexOf("review") >= 0){
    // Get all workflow tasks for the current record
    var wfResult = aa.workflow.getTasks(capId);
    if (wfResult.getSuccess()) {

        var wfTasks = wfResult.getOutput();
        var noActiveReviews = true;
        var commentsToAdd = "";

        // Step 1: Check if there are any active Review tasks
        for (var i in wfTasks) {
            var task = wfTasks[i];
            var taskName = task.getTaskDescription();
            if (taskName.toLowerCase().indexOf("review") >= 0) {
                var isActive = task.getActiveFlag() == "Y";
                if (isActive) {
                    noActiveReviews = false;
                    break;
                }
            }
        }

        // Step 2: If no Review tasks are active, aggregate comments
        if (noActiveReviews) {
            for (var j in wfTasks) {
                var task = wfTasks[j];
                var taskName = task.getTaskDescription();
                var taskStatus = task.getDisposition();
                var taskComment = task.getDispositionComment();

                // Check for tasks with "Review" in name and status "Complete w/ Comments"
                if (taskName.toLowerCase().indexOf("review") >= 0) {
                    var commentToAdd = (taskStatus == "Complete w/ Comments" && taskComment) ? taskComment : "None provided";
                    logDebug("taskName: " + taskName + " taskComment: " + commentToAdd);
                    commentsToAdd += taskName + " Comment:\n" + commentToAdd + "\n\n";
                }
            }

            // Step 3: Add aggregated comments to record comments if there are any
            if (commentsToAdd) {
                createCapComment(commentsToAdd, capId);
                logDebug("Successfully added comments to record: " + commentsToAdd)
            }
        }
    }else{
        logDebug("Error retrieving workflow tasks: " + wfResult.getErrorMessage());
    }
}