var aa = expression.getScriptRoot();

var servProvCode = expression.getValue("$$servProvCode$$");
var isMaster = expression.getValue("ASI::PARENT RECORD INFORMATION::Is this application being submitted as a sub-permit to a master building permit");
var varPermNbr = expression.getValue("ASI::PARENT RECORD INFORMATION::Master Building Permit Number");
var varPermNbrVal = varPermNbr.value;
var varForm = expression.getValue("ASI::FORM");
var useAppSpecificGroupName = false;

if (isMaster.value.toUpperCase() == 'YES' && varPermNbr.value != null && varPermNbr.value != "") {
    varPermNbr.message = "";
    var parentId = aa.cap.getCapID(varPermNbrVal);

    if (!parentId.getSuccess()) {
        varPermNbr.message = varPermNbrVal + " is not a valid Permit Number";
        varForm.blockSubmit = true;
    } else {
        parentId = parentId.getOutput();
        var check4Parent = getParentByCapId(parentId);
        if (!check4Parent) {
            var relcap = aa.cap.getCap(parentId).getOutput();
            var parentStatus = relcap.getCapStatus();
            if (matches(parentStatus, "Closed - Withdrawn", "Closed - Inactive", "Closed - Denied", "Closed Complete")) {
                varPermNbr.message = varPermNbrVal + " is not an active Permit.";
                varForm.blockSubmit = true;
            } else {
                var pType = getAppSpecific("Type of Work", parentId);
                if (matches(pType, "Addition", "Alteration", "New", "New Construction")) {
                    varPermNbr.message = "";
                    varForm.blockSubmit = false;
                } else {
                    varPermNbr.message = varPermNbrVal + " does not have a valid work type.";
                    varForm.blockSubmit = true;
                }
            }
        } else {
            varPermNbr.message = "The number you entered is not a valid master permit number. Please enter an existing master permit number for the property that you would like to link to. For additional assistance please contact the Building Division at 954-921-3335.";
            varForm.blockSubmit = true;
        }
    }
} else {
    varPermNbr.message = "";
    varForm.blockSubmit = false;
}

expression.setReturn(varForm);
expression.setReturn(varPermNbr);

function matches(eVal, argList) {
    for (var i = 1; i < arguments.length; i++) {
        if (arguments[i] == eVal) {
            return true;
        }
    }
    return false;
}

function getParentByCapId(itemCap) {
    // returns the capId object of the parent. Assumes only one parent!
    var getCapResult = aa.cap.getProjectParents(itemCap, 1);
    if (getCapResult.getSuccess()) {
        var parentArray = getCapResult.getOutput();
        if (parentArray.length) {
            return parentArray[0].getCapID();
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function getAppSpecific(itemName, itemCap) {
    var i = 0;
    if (arguments.length == 1) {
        itemCap = capId;
    }

    if (useAppSpecificGroupName) {
        if (itemName.indexOf(".") < 0) {
            return false;
        }
        var itemGroup = itemName.substr(0, itemName.indexOf("."));
        itemName = itemName.substr(itemName.indexOf(".") + 1);
    }

    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
    if (appSpecInfoResult.getSuccess()) {
        var appspecObj = appSpecInfoResult.getOutput();
        if (itemName != "") {
            for (i in appspecObj) {
                if (appspecObj[i].getCheckboxDesc() == itemName && (!useAppSpecificGroupName || appspecObj[i].getCheckboxType() == itemGroup)) {
                    return appspecObj[i].getChecklistComment();
                    break;
                }
            }
        }
    } else {
        return false;
    }
}
