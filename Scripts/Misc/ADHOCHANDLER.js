/*------------------------------------------------------------------------------------------------------/
| Program : ADHOCHANDLER.js
| Event   : ADHOCHANDLER
|
| Usage   : Script helper to add adhoc tasks to a record.
|
| Client  : N/A
| Action# : N/A
|
| Notes   :
|
| //To load the script use the following:
        var loadScript = function (scriptName) {
            scriptName = scriptName.toUpperCase();
            var emse = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
            var script = emse.getScriptByPK(aa.getServiceProviderCode(), scriptName, "ADMIN");
            return script.getScriptText() + "";
        }
        eval(loadScript("ADHOCHANDLER"));

 //To add an adhoc task use the following:
       adHocHanlder.addAddHocTask(capId, "TaskName", "User", "CapId");

/------------------------------------------------------------------------------------------------------*/
var adHocHanlder = {};


(function () {
    const adHocProcess = "ADHOCPROCESS"

    function addAddHocTask(capId, taskName, note, comment){
        if (capId && taskName) {
           var  tasks = getTasks(capId,[taskName],true);
           if (tasks.length === 0) {
                addTask(taskName, note, "Admin", capId);
                tasks = getTasks(capId, [taskName], true);
           }

            for (var i = 0; i < tasks.length; i++) {
                updateTask(capId, "Admin", tasks[i], "", comment, note);
            }

        }
        else {
            logDebug("capId and taskName must be present to add adhoc task");
        }
    }


    function addTask(taskName, note, user, capId) {

		var userObj = aa.person.getUser(user);
		if (!userObj.getSuccess()) {
			logDebug("Did not find user while adding adhoc task");
			return;
		}

		var task = aa.workflow.getTasks(capId).getOutput()[0].getTaskItem();
		task.setProcessCode(adHocProcess);
		task.setTaskDescription(taskName);
		task.setDispositionNote(note);
		task.setProcessID(0);
		task.setAssignmentDate(aa.util.now());
		task.setDueDate(aa.util.now());
		task.setAssignedUser(userObj.getOutput());
		var workflow = aa.proxyInvoker.newInstance("com.accela.aa.workflow.workflow.WorkflowBusiness").getOutput();
		var result = workflow.createAdHocTaskItem(task);
		if (!result) {
			logDebug("failed to add AdHocTask");
		}
                if(unassignTask) unassignTask(taskName);
	}


    function updateTask(capId, user, task, taskStatus, comment, note, processName, dispositionFlag) {
		if (dispositionFlag) {
			aa.workflow.handleDisposition(capId, task.getStepNumber(), taskStatus, aa.date.getCurrentDate(), note, comment, aa.person.getUser(user).getOutput(), dispositionFlag);
		} else {
			task.setDisposition(taskStatus);
			task.setDispositionComment(comment);
			task.setDispositionNote(note);
			task.setDispositionDate(aa.util.now());
			task.setSysUser(aa.person.getUser(user).getOutput());
			var taskItem = task.getTaskItem();
			taskItem.setStatusDate(aa.util.now());
			aa.workflow.handleDisposition(taskItem, capId);
		}
	}

    
	function getTasks(capId, taskNames, isActive) {

		var result = aa.workflow.getTaskItems(capId, null, "", null, null, isActive ? "Y" : null);
		if (result.getSuccess()) {
			var taskResults = [];
			var tasks = result.getOutput();
			for (var i = 0; i < tasks.length; i++) {
				var task = tasks[i];
				for (var j = 0; j < taskNames.length; j++) {
					// TODO do we need this process id check?
					if (task.getTaskDescription().toUpperCase().equals(taskNames[j].toUpperCase()) /*&& task.getProcessID().equals(processId)*/) {
						taskResults.push(task);
						break;
					}
				}
			}

			return taskResults;
		}
		else {
			logDebug("Failed to get workflow object: " + result.getErrorMessage());
			return null;
		}
	}

    
    adHocHanlder.addAddHocTask = addAddHocTask;
})();
