var aa = expression.getScriptRoot();

var servProvCode = expression.getValue("$$servProvCode$$");
var isMaster = expression.getValue("ASI::PARENT RECORD INFORMATION::Is this application being submitted as a sub-permit to a master building permit");
var varPermNbr = expression.getValue("ASI::PARENT RECORD INFORMATION::Master Building Permit Number");
var varPermNbrVal = varPermNbr.value;
var varForm = expression.getValue("ASI::FORM");

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
                varPermNbr.message = "";
                varForm.blockSubmit = false;
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
