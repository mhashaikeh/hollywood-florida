/*------------------------------------------------------------------------------------------------------/
| Program : ACA_REQUIRED_PLANNING_DOCS.JS
| Event   : ACA_Before
|
| Usage   : Script to block the users from skipping uploading the document
|
| Client  : N/A
| Action# : N/A
|
| Notes   :
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var showMessage = false;
var showDebug = false;
var preExecute = "PreExecuteForBeforeEvents"
var controlString = "";
var documentOnly = false;
var disableTokens = false;
var useAppSpecificGroupName = false;
var useTaskSpecificGroupName = false;
var enableVariableBranching = false;
var maxEntries = 99;
var rowNumbers = new Array();
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var cancel = false;
var startDate = new Date();
var startTime = startDate.getTime();
var message = "";
var debug = "";
var br = "<BR>";

eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getMasterScriptText("INCLUDES_CUSTOM"));

function getMasterScriptText(vScriptName) {
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
    return emseScript.getScriptText() + "";
}

if (documentOnly) {
    doStandardChoiceActions(controlString, false, 0);
    aa.env.setValue("ScriptReturnCode", "0");
    aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");
    aa.abortScript();
}

var cap = aa.env.getValue("CapModel");
var capId = cap.getCapID();
var servProvCode = capId.getServiceProviderCode()
var publicUser = false;
var currentUserID = aa.env.getValue("CurrentUserID");
var publicUserID = aa.env.getValue("CurrentUserID");
if (currentUserID.indexOf("PUBLICUSER") == 0) {
    currentUserID = "ADMIN";
    publicUser = true
}
var capIDString = capId.getCustomID();
var systemUserObj = aa.person.getUser(currentUserID).getOutput();
var appTypeResult = cap.getCapType();
var appTypeString = appTypeResult.toString();
var appTypeArray = appTypeString.split("/");
var currentUserGroup;
var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0], currentUserID).getOutput()
if (currentUserGroupObj) currentUserGroup = currentUserGroupObj.getGroupName();
var capName = cap.getSpecialText();
var capStatus = cap.getCapStatus();
var sysDate = aa.date.getCurrentDate();
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "");

var AInfo = new Array();
loadAppSpecific4ACA(AInfo);

logDebug("<B>EMSE Script Results for " + capIDString + "</B>");
logDebug("capId = " + capId.getClass());
logDebug("cap = " + cap.getClass());
logDebug("currentUserID = " + currentUserID);
logDebug("currentUserGroup = " + currentUserGroup);
logDebug("systemUserObj = " + systemUserObj.getClass());
logDebug("appTypeString = " + appTypeString);
logDebug("capName = " + capName);
logDebug("capStatus = " + capStatus);
logDebug("sysDate = " + sysDate.getClass());
logDebug("sysDateMMDDYYYY = " + sysDateMMDDYYYY);

if (preExecute.length) doStandardChoiceActions(preExecute, true, 0);

logGlobals(AInfo);

try {
    docsMissing = false;
    showList = true;
    r = new Array();

    var documentCount = 0;
    capIdString = capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3();

    if (appTypeString == "Planning/Pre-App Consult/NA/NA") {
        r[documentCount] = "Survey";
        documentCount++;

        r[documentCount] = "Site Plan";
        documentCount++;

        r[documentCount] = "Cover Letter";
        documentCount++;
    }

    submittedDocListObj = aa.document.getDocumentListByEntity(capIdString, "TMP_CAP").getOutput();
    submittedDocList = new Array();
    if (submittedDocListObj != null) {
        submittedDocList = submittedDocListObj.toArray();
    }
    uploadedDocs = new Array();
    for (var i in submittedDocList) uploadedDocs[submittedDocList[i].getDocCategory()] = true;

    if (r.length > 0 && showList) {
        for (x in r) {
            if (uploadedDocs[r[x]] == undefined) {
                showMessage = true;
                cancel = true;
                if (!docsMissing) {
                    comment("<div class='docList'><span class='fontbold font14px ACA_Title_Color'>The following documents are required: </span><ol>");
                    docsMissing = true;
                }
                comment("<li>" + r[x] + "</li>");
            }
        }
        if (docsMissing) {
            comment("</ol></div>");
        }
    }
} catch (err) {
    var emailAddress = "jshear@mytechsinc.com";
    aa.sendMail("no-reply@accela.com", emailAddress, "", "ACA_REQUIRED_PLANNING_DOCS", err + debug + err.stack);
}

if (debug.indexOf("**ERROR") > 0) {
    aa.env.setValue("ErrorCode", "1");
    aa.env.setValue("ErrorMessage", debug);
} else {
    if (cancel) {
        aa.env.setValue("ErrorCode", "-2");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    } else {
        aa.env.setValue("ErrorCode", "0");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    }
}