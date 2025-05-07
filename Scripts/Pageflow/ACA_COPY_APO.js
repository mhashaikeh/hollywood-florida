/*------------------------------------------------------------------------------------------------------/
| Program : ACA_COPY_PARENT.js
| Event   : ACA_COPY_PARENT
| PageFlow:
| Created By: JSHEAR
| Creation Date: 10/6/2024
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : N/A
| Action# : N/A
|
| Notes   : |
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
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
try {
    var permitNum = AInfo['Related Permit Number'];
    if (!matches(permitNum,null,undefined,"")){
        var parentCapId = getApplication(permitNum);
        logDebug("Parent is " + parentCapId);
        if(parentCapId) {
            var parentCap = aa.cap.getCapViewBySingle4ACA(parentCapId);
            copyAddresses4ACA(parentCapId, capId);
            logDebug("Copying the Parcel...");
            cap.setCapParcelModel(parentCap.getCapParcelModel());
            cap.setParcelModel(parentCap.getParcelModel());
            logDebug("Copying the Owner...");
            cap.setCapOwnerModel(parentCap.getCapOwnerModel());
            cap.setOwnerModel(parentCap.getOwnerModel());
        }
    }

    if (appTypeString == "PublicWorks/Utilities/Atlas Request/NA"){
        var specAddr = AInfo['Do you have a specific address'];
        if (specAddr == "No") {
            aa.env.setValue("ReturnData", "{'PageFlow':{'HidePage':'Y'}}");
        }
    }

}
catch (err) {
    var emailAddress = "jshear@mytechsinc.com"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "ACA_COPY_APO", debug + err + err.stack);
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


function copyAddresses4ACA(pFromCapId, pToCapId)
{
  //Copies all property addresses from pFromCapId to pToCapId
  if (pToCapId==null)
  {
    var vToCapId = capId;
  }
  else
  {
    var vToCapId = pToCapId;
  }
  //check if target CAP has primary address
  var priAddrExists = false;
  var capAddressResult = aa.address.getAddressByCapId(vToCapId);
  if (capAddressResult.getSuccess())
  {
    Address = capAddressResult.getOutput();
    for (yy in Address)
    {
      if ("Y" == Address[yy].getPrimaryFlag())
      {
        priAddrExists = true;
        logDebug("Target CAP has primary address");
        break;
      }
    }
  }
  else
  {
    logDebug("**ERROR: Failed to get addresses: " + capAddressResult.getErrorMessage());
    return false;
  }

  //get addresses from originating CAP
  var capAddressResult = aa.address.getAddressWithAttributeByCapId(pFromCapId);
  var copied = 0;
  if (capAddressResult.getSuccess())
  {
    Address = capAddressResult.getOutput();
    for (yy in Address)
    {
      newAddress = Address[yy];
      //debugObject(newAddress);
      newAddress.setCapID(vToCapId);
      //if (priAddrExists)
        //newAddress.setPrimaryFlag("N"); //prevent target CAP from having more than 1 primary address
      cap.setAddressModel(newAddress);
      //aa.address.createAddressWithAPOAttribute(vToCapId, newAddress);
      logDebug("Copied address from " + pFromCapId.getCustomID() + " to " + vToCapId.getCustomID());
      copied++;
    }
  }
  else
  {
    logMessage("**ERROR: Failed to get addresses: " + capAddressResult.getErrorMessage());
    return false;
  }
  return copied;
}
