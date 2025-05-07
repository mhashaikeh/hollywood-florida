/*------------------------------------------------------------------------------------------------------/
| Program : ACA_REQUIRE_ROW_LICENSE_PROFESSIONAL.JS
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
    var powerGasCommFacility = AInfo['Power, Gas and Communication Facility'];
    var waterSewerDrainage = AInfo['Water, Sewer or Drainage Facility'];
    var powerPole = AInfo['Power Pole'];
    var conduitInstallation = AInfo['Conduit Installation'];
    var sidewalkRepairReplacement = AInfo['Sidewalk Repair or Replacement'];
    var adaRamp = AInfo['ADA Ramp'];
    var land = AInfo['Landscaping'];

    var lpList = cap.getLicenseProfessionalList();
    var lpTypes = [];
    if (lpList != null && lpList.size() > 0) {
        for (var i = 0; i < lpList.size(); i++) {
            lpTypes.push(lpList.get(i).getLicenseType() + ""); // Ensure string type
        }
    }

    // Check if at least one License Professional is selected
    if (lpTypes.length === 0) {
        cancel = true;
        showMessage = true;
        comment("This application requires at least one License Professional to be selected.");
    }

    var requiredContractors = {
        "Power, Gas and Communication Facility": [
        	"Certified Electrical Contractor (EC)",
        	"Certified Gas Line Specialty Contractor",
        	"Certified Utility and Excavation Contractor",
        	"Directional Drilling Contractor",
        	"Fuel Transmission and Distribution Lines Contractor",
        	"Jack and Bore Installer Contractor",
        	"Registered Gas Line Specialty Contractor",
            "Registered Utility and Excavation Contractor",
            "Secondary Utility and Excavation Contractor",
            "Underground and Aerial Utility Transmission and Distribution Lines Contractor",
            "Underground Utility and Excavation Contractor"
        ],
        "Water, Sewer or Drainage Facility": [
        	"Certified Utility and Excavation Contractor",
        	"Pipe Bursting Contractor",
        	"Pipeline Rehabilitation Contractor",
            "Registered Utility and Excavation Contractor",
            "Secondary Utility and Excavation Contractor"
        ],
        "Power Pole": [
            "Certified Electrical Contractor (EC)",
            "Certified Utility and Excavation Contractor",
            "Underground and Aerial Utility Transmission and Distribution Lines Contractor",
            "Underground Utility and Excavation Contractor"
        ],
        "Conduit Installation": [
        	"Certified Electrical Contractor (EC)",
        	"Directional Drilling Contractor",
        	"Jack and Bore Installer Contractor",
            "Registered Utility and Excavation Contractor",
            "Secondary Utility and Excavation Contractor",
            "Underground and Aerial Utility Transmission and Distribution Lines Contractor",
            "Underground Utility and Excavation Contractor"
        ],
        "Sidewalk Repair or Replacement": [
        	"Certified General Contractor",
        	"Concrete Driveways, Curbs, Gutters, Driveway Entrances and Sidewalks Contractor",
        	"Major Roads Contractor",
        	"Minor Roads Contractor",
        	"Pavers Contractor",
            "Striping, Marking and Signage of Roadways, including pavements Contractor"
        ],
        "ADA Ramp": [
        	"Certified General Contractor",
        	"Major Roads Contractor",
        	"Minor Roads Contractor",
        	"Pavers Contractor",
            "Striping, Marking and Signage of Roadways, including pavements Contractor"
        ],
        "Landscaping": [
        	"Landscape Contractor"
        ]
    };

    var checkedFields = [
        { field: powerGasCommFacility, name: "Power, Gas and Communication Facility" },
        { field: waterSewerDrainage, name: "Water, Sewer or Drainage Facility" },
        { field: powerPole, name: "Power Pole" },
        { field: conduitInstallation, name: "Conduit Installation" },
        { field: sidewalkRepairReplacement, name: "Sidewalk Repair or Replacement" },
        { field: adaRamp, name: "ADA Ramp" },
        { field: land, name: "Landscaping" }
    ];

    for (var i = 0; i < checkedFields.length; i++) {
        var field = checkedFields[i];
        if (field.field == "CHECKED") {
            var contractorsForField = requiredContractors[field.name];
            var validContractorFound = lpTypes.some(function (lpType) {
                return contractorsForField.indexOf(lpType) >= 0;
            });

            if (!validContractorFound) {
                cancel = true;
                showMessage = true;
                comment("The custom field '" + field.name + "' requires at least one of the following contractors: " + contractorsForField.join(", ") + ".");
                break; // Exit loop after first failed validation
            }
        }
    }
} catch (err) {
    var emailAddress = "jshear@mytechsinc.com"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "ACA_REQUIRE_ROW_LICENSE_PROFESSIONAL", err + debug + err.stack);
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


/***************************************************************************/