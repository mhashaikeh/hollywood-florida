/*------------------------------------------------------------------------------------------------------/
| Program		: ACA_RES_COMM_DEMOLITION_PAGE.js
| Event			: ACA_Onload
|
| Usage			: Skip Utility Release Information page based on "Scope of Demolition" selection
|
| Client		: HOLLYWOOD
| Created by	: STEPHANIE ALMODOVAR
| Created On	: 11/07/2024
| MAS TICKET    : 01477278
|
| Notes			: Checks if "Scope of Demolition" is set to "Accessory Structure Demolition", "Exterior Demolition", or "Interior Demolition"  
|                 Default behavior is to show the page
|                 Page is hidden only if "Scope of Demolition" is "Accessory Structure Demolition", "Exterior Demolition", or "Interior Demolition"  
|
/------------------------------------------------------------------------------------------------------*/
showDebug = false;

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, true));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS", null, true));
eval(getScriptText("INCLUDES_CUSTOM", null, true));
var SCRIPT_VERSION = 9.0;

var message = "";
var debug = "";
var err = "";
var useAppSpecificGroupName = false;

var cancel = false;
var capModel = aa.env.getValue('CapModel');
var capId = capModel.getCapID();
cap = capModel;

try {
    var appSpecificInfo = new Array();
    loadAppSpecific4ACA(appSpecificInfo);

    var scopeOfDemo = appSpecificInfo["Scope of Demolition"];

    if (scopeOfDemo && scopeOfDemo == "Complete Building Demolition") {
        aa.env.setValue("ReturnData", "{'PageFlow':{'HidePage':'N'}}");
    } else {
        aa.env.setValue("ReturnData", "{'PageFlow':{'HidePage':'Y', 'StepNumber': '1', 'PageNumber':'3'}}");
    }
}
catch (err) {
    cancel = true;
    message += "A system error has occured: " + err.message;
    debug = debug + " Additional Information Required: " + err.message;
}

if (cancel) {
    cancel = true;
    showMessage = true;
    aa.env.setValue("ErrorCode", -1);
    aa.env.setValue('ErrorMessage', '<br><font color=#D57C55><b>' + message + '</b></font>');
}

/************************************************************
| FUNCTION USED BY THIS SCRIPT - DO NOT REMOVE/EDIT
 ************************************************************/
/************************************************************
 * Imports all Accela custom functions.
 *
 * 	@param vScriptName - Script to import
 * 	@returns {String}
 ************************************************************/

function getScriptText(vScriptName, servProvCode, useProductScripts) {
    if (!servProvCode) {
        servProvCode = aa.getServiceProviderCode();
    }

    vScriptName = vScriptName.toUpperCase();

    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();

    try {
        if (useProductScripts) {
            var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
        }
        else {
            var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
        }

        return emseScript.getScriptText() + "";
    }
    catch (err) {
        return "";
    }
}

//***********************************************************************
//------------------------HELPER FUNCTIONS-------------------------------
//***********************************************************************

function loadAppSpecific4ACA(thisArr) {
    // Returns an associative array of App Specific Info
    // Optional second parameter, cap ID to load from
    //
    // uses capModel in this event

    var itemCap = capId;

    if (arguments.length >= 2) {
        itemCap = arguments[1]; // use cap ID specified in args

        var fAppSpecInfoObj = aa.appSpecificInfo.getByCapID(itemCap).getOutput();

        for (loopk in fAppSpecInfoObj) {
            if (useAppSpecificGroupName) {
                thisArr[fAppSpecInfoObj[loopk].getCheckboxType() + "." + fAppSpecInfoObj[loopk].checkboxDesc] = fAppSpecInfoObj[loopk].checklistComment;
            } else {
                thisArr[fAppSpecInfoObj[loopk].checkboxDesc] = fAppSpecInfoObj[loopk].checklistComment;
            }
        }
    } else {
        var capASI = capModel.getAppSpecificInfoGroups();

        if (!capASI) {
            logDebug("No ASI for the CapModel");
        } else {
            var i = capModel.getAppSpecificInfoGroups().iterator();

            while (i.hasNext()) {
                var group = i.next();
                var fields = group.getFields();

                if (fields != null) {
                    var iteFields = fields.iterator();

                    while (iteFields.hasNext()) {
                        var field = iteFields.next();

                        if (useAppSpecificGroupName) {
                            thisArr[field.getCheckboxType() + "." + field.getCheckboxDesc()] = field.getChecklistComment();
                        } else {
                            thisArr[field.getCheckboxDesc()] = field.getChecklistComment();
                        }
                    }
                }
            }
        }
    }
}