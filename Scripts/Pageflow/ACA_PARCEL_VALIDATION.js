/*------------------------------------------------------------------------------------------------------/
| Program : ACA_PARCEL_VALIDATION.JS
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
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
var showMessage = false; // Set to true to see results in popup window
var showDebug = false; // Set to true to see debug messages in popup window
var preExecute = "PreExecuteForBeforeEvents"
var controlString = ""; // Standard choice for control
var documentOnly = false; // Document Only -- displays hierarchy of std choice steps
var disableTokens = false; // turn off tokenizing of std choices (enables use of "{} and []")
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false; // Use Group name when populating Task Specific Info Values
var enableVariableBranching = false; // Allows use of variable names in branching.  Branches are not followed in Doc Only
var maxEntries = 99; // Maximum number of std choice entries.  Entries must be Left Zero Padded
var rowNumbers = new Array();
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var cancel = false;
var startDate = new Date();
var startTime = startDate.getTime();
var message = ""; // Message String
var debug = ""; // Debug String
var br = "<BR>"; // Break Tag

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
var servProvCode = capId.getServiceProviderCode() // Service Provider Code
var publicUser = false;
var currentUserID = aa.env.getValue("CurrentUserID");
var publicUserID = aa.env.getValue("CurrentUserID");
if (currentUserID.indexOf("PUBLICUSER") == 0) {
    currentUserID = "ADMIN";
    publicUser = true
} // ignore public users
var capIDString = capId.getCustomID(); // alternate cap id string
var systemUserObj = aa.person.getUser(currentUserID).getOutput(); // Current User Object
var appTypeResult = cap.getCapType();
var appTypeString = appTypeResult.toString(); // Convert application type to string ("Building/A/B/C")
var appTypeArray = appTypeString.split("/"); // Array of application type string
var currentUserGroup;
var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0], currentUserID).getOutput()
if (currentUserGroupObj) currentUserGroup = currentUserGroupObj.getGroupName();
var capName = cap.getSpecialText();
var capStatus = cap.getCapStatus();
var sysDate = aa.date.getCurrentDate();
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "");

var AInfo = new Array(); // Create array for tokenized variables
loadAppSpecific4ACA(AInfo); // Add AppSpecific Info
//loadTaskSpecific(AInfo);            // Add task specific info
//loadParcelAttributes(AInfo);            // Add parcel attributes
//loadASITables();
//loadASITables4ACA();
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



/*------------------------------------------------------------------------------------------------------/
| BEGIN Event Specific Variables
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| END Event Specific Variables
/------------------------------------------------------------------------------------------------------*/

if (preExecute.length) doStandardChoiceActions(preExecute, true, 0); // run Pre-execution code

logGlobals(AInfo);

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/


try {

//Start: Verify Folio Numbers match between sub and master
if (!matches(AInfo["Master Building Permit Number"],null,undefined,"")){
    pCapId = getApplication(AInfo["Master Building Permit Number"]);
    var capFolio = cap.getParcelModel().getParcelNo();
    var pCapFolio = String(getParcelNumber(pCapId));
    if (capFolio != pCapFolio){
        showMessage = true;
        cancel = true;
        comment("Folio number mismatch: The Folio number on the parent record does not match the one provided for this record.");
    }
}


if (appMatch("Building/Commercial/Demolition/NA")){
    if (AInfo['Scope of Demolition'] == "Complete Building Demolition"){
        var capModel = aa.env.getValue("CapModel");
        targetCapId = capModel.getCapID();
        capId = targetCapId;

        var ParcelValidatedNumber = capModel.getParcelModel().getParcelNo();
        var zoneHist = getGISInfo2ASB("HOLLYWOOD", "HISTORIC DISTRICT", "DESCRIPTION");
        if (!matches(zoneHist,null,undefined,"")){
            showMessage = true;
            cancel = true;
            comment("Complete Building Demolition within a Historical District must be submitted via BCLA.  For additional assistance please contact the Building Division at 954-921-3335.");
        }
    }
}
    

} catch (err) {
    var emailAddress = "accelaerrors@hollywoodfl.org"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "ACA_PARCEL_VALIDATION", err + debug + err.stack);
}


/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

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

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
function getGISInfo2ASB(svc, layer, attributename) // optional: numDistance, distanceType
{
    try {
        var numDistance = 0
        if (arguments.length >= 4) numDistance = arguments[3]; // use numDistance in arg list
        var distanceType = "feet";
        if (arguments.length == 5) distanceType = arguments[4]; // use distanceType in arg list
        var retString;

        var bufferTargetResult = aa.gis.getGISType(svc, layer); // get the buffer target
        if (bufferTargetResult.getSuccess()) {
            var buf = bufferTargetResult.getOutput();
            buf.addAttributeName(attributename);
        }
        else { logDebug("**ERROR: Getting GIS Type for Buffer Target.  Reason is: " + bufferTargetResult.getErrorType() + ":" + bufferTargetResult.getErrorMessage()); return false }

        var gisObjResult = aa.gis.getParcelGISObjects(ParcelValidatedNumber); // get gis objects on the parcel number
        if (gisObjResult.getSuccess())
            var fGisObj = gisObjResult.getOutput();
        else { logDebug("**ERROR: Getting GIS objects for Parcel.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage()); return false }

        for (a1 in fGisObj) // for each GIS object on the Parcel.  We'll only send the last value
        {
            var bufchk = aa.gis.getBufferByRadius(fGisObj[a1], numDistance, distanceType, buf);

            if (bufchk.getSuccess())
                var proxArr = bufchk.getOutput();
            else { showMessage = true; logMessage("**WARNING: Retrieving Buffer Check Results.  Reason is: " + bufchk.getErrorType() + ":" + bufchk.getErrorMessage()); return false }

            for (a2 in proxArr) {
                var proxObj = proxArr[a2].getGISObjects();  // if there are GIS Objects here, we're done
                for (z1 in proxObj) {
                    var v = proxObj[z1].getAttributeValues()
                    retString = v[0];
                }
            }
        }

        return retString;
    }
    catch (err) {
        logDebug("A JavaScript Error occurred: function getGISInfo2ASB: " + err.message);
        logDebug(err.stack);
    }
}

