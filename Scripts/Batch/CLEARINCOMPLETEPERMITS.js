/* -------------------------------------------------------------------------------------------------
| Program  : BATCH_BLD_LATE_FEE_NOTIFICATION
| Trigger  : Batch
| Client   : City of Fresno
| Script ID: 
| Frequency: Daily
| ------------------------------------------------------------------------------------------------------ */
var SCRIPT_VERSION = 3.0;

function getScriptText(vScriptName, servProvCode, useProductScripts) {
    if (!servProvCode) servProvCode = aa.getServiceProviderCode();
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    try {
        if (useProductScripts) {
            var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
        } else {
            var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
        }
        return emseScript.getScriptText() + "";
    } catch (err) {
        return "";
    }
}

var useCustomScriptFile = true;  // if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM
var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_FOR_EMSE");
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") {
    useSA = true;
    SA = bzr.getOutput().getDescription();
    bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_INCLUDE_SCRIPT");
    if (bzr.getSuccess()) {
        SAScript = bzr.getOutput().getDescription();
    }
}

if (SA) {
    eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA, useCustomScriptFile));
    eval(getScriptText("INCLUDES_ACCELA_GLOBALS", SA, useCustomScriptFile));
    eval(getScriptText(SAScript, SA));
} else {
    eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, useCustomScriptFile));
    eval(getScriptText("INCLUDES_ACCELA_GLOBALS", null, useCustomScriptFile));
}

eval(getScriptText("INCLUDES_CUSTOM", null, useCustomScriptFile));

try{

    //Adding no upload activity ...
    var sql = "select P.B1_ALT_ID, count(V.SD_PRO_DES), DATEDIFF(day, P.REC_DATE, GETDATE()) AS days_diff " + 
        "from B1PERMIT P, GPROCESS_HISTORY V " + 
        "where  " + 
        "P.B1_PER_ID1 = V.B1_PER_ID1 " + 
        "and P.B1_PER_ID2 = V.B1_PER_ID2 " + 
        "and P.B1_PER_ID3 = V.B1_PER_ID3 " + 
        "and P.B1_APP_TYPE_ALIAS in (select R1_APP_TYPE_ALIAS from R3APPTYP where R1_APP_TYPE_ALIAS like '%permit%') " + 
        "group by P.B1_ALT_ID, DATEDIFF(day, P.REC_DATE, GETDATE())  " + 
        "having count(V.SD_PRO_DES) <= 1 and DATEDIFF(day, P.REC_DATE, GETDATE()) = 31";
    
    var rows = doSQL(sql);
	for(i in rows){
		var row = rows[i];
		var altId = row.B1_ALT_ID;
        aa.print('altId: ' + altId);

        var capId = aa.cap.getCapID(altId).getOutput();
        closeAllActiveTasks("", "Closed via script", capId)
        updateAppStatus("Closed - Withdrawn", "", capId);
        
        //send email
        var contArr = getContactArray(capId);
        for (x in contArr){
            if (!matches(contArr[x]["contactType"], null)) {
                var contEmail = contArr[x]["email"];
                aa.print('contEmail: ' + contEmail);
                if(contEmail){
                    var emailParameters = aa.util.newHashtable();
                    addParameter(emailParameters, "$$ALTID$$", altId);
                    sendNotification("Accela@HollywoodFL.org", contEmail, "", "PERMIT_WITHDRAWN", emailParameters, null, capId);
                    aa.print("Email Successfully sent to " + contEmail);

                }else{
                    aa.print("No email address found for " + contArr[x]["firstName"] +" " + contArr[x]["lastName"] +" ' email not sent");
                }
            }
        }
    }

    aa.print("Completed Successfully");
}catch(e){
    aa.print('ERROR: ' + e + ". Stack: " + e.stack);
    aa.print("Failed");
}

function isEmpty(val) {
	return val == null || !val || val == undefined || val == '';
}

function doSQL(sql) {

    try {
        var valuesArr = [];
        var conn = aa.db.getConnection();
        var sStmt = conn.prepareStatement(sql);

        if (sql.toUpperCase().indexOf("SELECT") == 0) {
            var rSet = sStmt.executeQuery();
            while (rSet.next()) {
                var obj = {};
                var md = rSet.getMetaData();
                var columns = md.getColumnCount();
                for (i = 1; i <= columns; i++) {
                    obj[md.getColumnName(i)] = String(rSet.getString(md.getColumnName(i)));
                }
                obj.count = rSet.getRow();
                valuesArr.push(obj);
            }
            rSet.close();
            sStmt.close();
            conn.close();
            return valuesArr;
        }
    } catch (err) {
        printDebug(err.message);
        aa.print4Batch(err.message);
    }
}

function closeAllActiveTasks(wfstat, wfcomment, pCapId) // optional process name 
{
    var useProcess = false;
    var processName = "";
    if (arguments.length == 4) {
        processName = arguments[3];
        // subprocess
        useProcess = true;
    }

    var workflowResult = aa.workflow.getTasks(pCapId);
    if (workflowResult.getSuccess())
        wfObj = workflowResult.getOutput();
    else {
        logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
        return false;

    }

    for (i in wfObj) {
        fTask = wfObj[i];
        if (fTask.getActiveFlag().equals("Y") && (!useProcess || fTask.getProcessCode().equals(processName))) {
            aa.print(fTask.getTaskDescription() + " is Active");
            var stepnumber = fTask.getStepNumber();
            var processID = fTask.getProcessID();
            var dispositionDate = aa.date.getCurrentDate();
            var completeFlag = fTask.getCompleteFlag();
            if (useProcess) {
                aa.workflow.handleDisposition(pCapId, stepnumber, processID, wfstat, dispositionDate, "", wfcomment, systemUserObj, "U");
                aa.workflow.adjustTask(pCapId, stepnumber, processID, "N", completeFlag, null, null);
            }
            else {
                aa.workflow.handleDisposition(pCapId, stepnumber, wfstat, dispositionDate, "", wfcomment, systemUserObj, "U");
                aa.workflow.adjustTask(pCapId, stepnumber, "N", completeFlag, null, null);
            }
        }
    }
}