if(wfTask == "Plans Distribution"){
    var capId = aa.cap.getCapID("RES-ELEC-24-000026").getOutput();
    var capModel = aa.cap.getCap(capId).getOutput();
    var creationDate = capModel.getFileDate();

    creationDate  = new Date(creationDate.getEpochMilliseconds());

    var today = new Date();
    var daysDiff = dateDiffInDays(creationDate, today);
    var dueDate = addDaysToDate(today, daysDiff);

    aa.print('creationDate: ' + creationDate);
    aa.print('today: ' + today);
    aa.print('daysDiff: ' + daysDiff);
    aa.print('dueDate: ' + dueDate);

    dueDate = dueDate.getFullYear() + '-' + (dueDate.getMonth()+1) + '-' + dueDate.getDate();
    aa.print('dueDate: ' + dueDate);

    var activeWFTasks = getActiveWorkflowTasks(capId, 'Review');
    
    for(var a in activeWFTasks){
        aa.print('getTaskDescription: ' + activeWFTasks[a].getTaskDescription());

        editTaskDueDateLocal(capId, activeWFTasks[a].getTaskDescription(), dueDate);
    }
}

//SF: 01503281
if(wfTask == "Plans Coordination" && wfStatus ==  "Ready to Issue"){
    var issueDate = aa.util.formatDate(new Date(), "MM/dd/yyyy");
    if(issueDate !=null && issueDate !='') {
        editAppSpecific("Ready to Issue Date", issueDate);
    }
}
//SF: 01503281 END


function dateDiffInDays(date1, date2) {
    // Convert dates to time in milliseconds
    var timeDiff = date2.getTime() - date1.getTime();

    // Convert milliseconds to days
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); // 1000 ms * 3600 s * 24 hr

    return diffDays;
}

function getActiveWorkflowTasks(capId, hasText){
    aa.print('hasText: ' + hasText);
    var activeTasks = [];

    var tasks = aa.workflow.getTasks(capId).getOutput();
    for (y in tasks) {
        var taskDesc = '' + tasks[y].getTaskDescription();

        if (tasks[y].getActiveFlag() == "Y") {
            if(!isEmpty(hasText)){
                if(taskDesc.indexOf(hasText) != -1){
                    activeTasks.push(tasks[y]);
                }
            }else{
                activeTasks.push(tasks[y]);
            }        
        }
    }

    return activeTasks;
}

function isEmpty(val) {
	return val == null || !val || val == undefined || val == '';
}

function addDaysToDate(jsDate, days) {
    var resultDate = new Date(jsDate);
    resultDate.setDate(resultDate.getDate() + days);
    return resultDate;
}

function editTaskDueDateLocal(capId, wfstr, wfdate) 
{
	var useProcess = false;
	var processName = "";

	var taskDesc = wfstr;
	if (wfstr == "*") {
		taskDesc = "";
	}
	var workflowResult = aa.workflow.getTaskItems(capId, taskDesc, processName, null, null, null);
	if (workflowResult.getSuccess())
		wfObj = workflowResult.getOutput();
	else {
		aa.print("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		var fTask = wfObj[i];
		if ((fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) || wfstr == "*") && (!useProcess || fTask.getProcessCode().equals(processName))) {
			wfObj[i].setDueDate(aa.date.parseDate(wfdate));
			var fTaskModel = wfObj[i].getTaskItem();
			var tResult = aa.workflow.adjustTaskWithNoAudit(fTaskModel);
			if (tResult.getSuccess())
				aa.print("Set Workflow Task: " + fTask.getTaskDescription() + " due Date " + wfdate);
			else {
				aa.print("**ERROR: Failed to update due date on workflow: " + tResult.getErrorMessage());
				return false;
			}
		}
	}
}


//Start: email notification if new document adhoc task is denied. Can add other new document tasks for other departments

if ((String(wfTask).toUpperCase().indexOf("NEW DOCUMENT RECEIVED") > -1 || String(wfTask).toUpperCase().indexOf("DOCUMENT REVIEW") > -1) && wfStatus == "Rejected") {
    if(!capId) capId = getCapId();
    sendDocumentReviewNotification(capId, "NEW_DOCUMENT_RECEIVED_DENIED", wfComment);
}

//Start: email notification if new document adhoc task is approved
if (String(wfTask).toUpperCase().indexOf("DOCUMENT REVIEW") > -1 && wfStatus == "Approved") {
    if(!capId) capId = getCapId();
    sendDocumentReviewNotification(capId, "NEW_DOCUMENT_RECEIVED_APPROVED", wfComment);
}

function sendDocumentReviewNotification(capId, emailTemplateName, wfComment) {
    var emailTo = getNotificationEmails("All", false);

    if (emailTo) {
        //set email parameters
        var emailParameters = aa.util.newHashtable();
        var addresses = aa.address.getPrimaryAddressByCapID(capId, "Y");
        var fcapAddressObj;
        if (addresses.getSuccess()) {
            fcapAddressObj = addresses.getOutput().getAddressModel();
        }

        addParameter(emailParameters, "$$PERMITADDR$$", fcapAddressObj);
        addParameter(emailParameters, "$$PERMITWRKDESC$$", workDescGet(capId));

        // Determine department name
        var deptName;
        var appTypeArray = String(aa.cap.getCap(capId).getOutput().getCapType()).split("/");
        if (appTypeArray[0] == "Fire") {
            deptName = "Fire Prevention";
        } else if (appTypeArray[0] == "PublicWorks") {
            deptName = "Engineering Division";
        } else {
            deptName = appTypeArray[0] + " Division";
        }
        getDepartmentParams4Notification(emailParameters, deptName);

        // Get ACA URLs and other standard parameters
        var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
        var acaUrl = acaSite.replace("/Admin/login.aspx", "");
        var buildRecURL = acaUrl + getACAUrl(capId);
        var bureauName = lookup("Reporting Information Standards", "Bureau Name");
        addParameter(emailParameters, "$$BureauName$$", bureauName);
        addParameter(emailParameters, "$$acaRecordUrl$$", buildRecURL);
        addParameter(emailParameters, "$$url4ACA$$", acaUrl);
        addParameter(emailParameters, "$$altID$$", capId.getCustomID());
        addParameter(emailParameters, "$$recordAlias$$", aa.cap.getCap(capId).getOutput().getCapType().getAlias());
        addParameter(emailParameters, "$$AgencyName$$", "Hollywood");
        addParameter(emailParameters, "$$wfComment$$", wfComment);

        // Send notification
        var rFiles = new Array();
        sendNotification("Accela@HollywoodFl.org", emailTo, "", emailTemplateName, emailParameters, rFiles);
    }
}