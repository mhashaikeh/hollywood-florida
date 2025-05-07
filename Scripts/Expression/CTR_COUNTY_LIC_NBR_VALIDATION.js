var aa = expression.getScriptRoot();
var toPrecision = function (value) {
    var multiplier = 10000;
    return Math.round(value * multiplier) / multiplier;
}
function addDate(iDate, nDays) {
    if (isNaN(nDays)) {
        throw ("Day is a invalid number!");
    }
    return expression.addDate(iDate, parseInt(nDays));
}

function diffDate(iDate1, iDate2) {
    return expression.diffDate(iDate1, iDate2);
}

function parseDate(dateString) {
    return expression.parseDate(dateString);
}

function formatDate(dateString, pattern) {
    if (dateString == null || dateString == '') {
        return '';
    }
    return expression.formatDate(dateString, pattern);
}
  
var servProvCode = expression.getValue("$$servProvCode$$").value;
var currentCapType = expression.getValue("CAP::capType");
var currentAltID = expression.getValue("CAP::capModel*altID");
var countyLicNbr = expression.getValue("ASI::LICENSE INFORMATION::County License Number");
var asiForm = expression.getValue("ASI::FORM");
var totalRowCount = expression.getTotalRowCount();

asiForm.message = "";
expression.setReturn(asiForm);

try {
    var currentCapId = aa.cap.getCapID(currentAltID.value).getOutput();
    if (currentCapId != null && currentCapType.value != null && currentCapType.value.equals(String('Licenses/Contractor/County/Application')) && countyLicNbr.value != null && countyLicNbr.value != "") {
        
        var countyLicNumExists = isContractorCountyLicenseRegistered(countyLicNbr.value, currentCapId);
        var stateLicNumExists = isContractorStateLicenseRegistered(countyLicNbr.value, currentCapId);
        if (countyLicNumExists !== false) {

            // Get the cap model of the found record    
            var foundCap = aa.cap.getCap(countyLicNumExists).getOutput();
            // Get the altID of the found record
            countyLicNumExists = foundCap.getCapModel().getAltID();

            asiForm.blockSubmit = true;
            expression.setReturn(asiForm);
            asiForm.message = "We found an existing county license record: " + countyLicNumExists + ". Please update that record or confirm the license number entered is correct.";
            expression.setReturn(asiForm);
        } else if (stateLicNumExists !== false) {
            // Get the cap model of the found record    
            var foundCap = aa.cap.getCap(stateLicNumExists).getOutput();
            // Get the altID of the found record
            stateLicNumExists = foundCap.getCapModel().getAltID();

            asiForm.blockSubmit = true;
            expression.setReturn(asiForm);
            asiForm.message = "We found an existing state license record: " + stateLicNumExists + ". Please update that record or confirm the license number entered is correct.";
            expression.setReturn(asiForm);
        }
    }
} catch (ex) {
    asiForm.message = "error in expression CTR_COUNTY_LIC_NBR_VALIDATION : " + ex;
    expression.setReturn(asiForm);
}


/* ===================== Internal functions ======================== */

function isContractorCountyLicenseRegistered(countyLicenseNbr, cCapId) {
    // Search for records with matching County License Number
    var capResuls = aa.cap.getCapIDsByAppSpecificInfoField("County License Number", countyLicenseNbr);
    if (capResuls.getSuccess()) {
        var capIDsArr = capResuls.getOutput();              
        
        if (capIDsArr && capIDsArr.length > 0) {
            // Get the current record's cap type
            var currentCapType = aa.cap.getCapTypeModelByCapID(cCapId).getOutput().getCapType();

            // Loop through all found records
            for (var i in capIDsArr) {
                var capID = capIDsArr[i].getCapID();
                if (capID != null) {
                    // Skip if this is the current record being processed
                    if (capID.getID1() == cCapId.getID1() && capID.getID2() == cCapId.getID2() && capID.getID3() == cCapId.getID3()) {
                        continue;
                    }

                    var itemCap = aa.cap.getCap(capID).getOutput();
                    // Only process complete records
                    if (itemCap.isCompleteCap()) {
                        var capType = aa.cap.getCapTypeModelByCapID(capID).getOutput().getCapType();
                        var capStatus = aa.cap.getCap(capID).getOutput().getCapStatus();



                        if (capType == "Licenses/Contractor/County/License") {
                            // For applications, check if the found license is the parent record
                            if (currentCapType == "Licenses/Contractor/County/Application") {
                                var pCapId = getParentByCapId(cCapId);
                                if (pCapId && String(pCapId.getCapClass()).indexOf("INCOMPLETE") != 0) {
                                    if (capID.getID1() == pCapId.getID1() && capID.getID2() == pCapId.getID2() && capID.getID3() == pCapId.getID3()) {
                                        continue;
                                    }
                                }
                            }
                            // Return true if license exists and is not revoked/suspended/disabled
                            if (!matches(capStatus, "Revoked","Suspended", "Disabled")) {
                                return capID;
                                
                            }
                        } else if (capType == "Licenses/Contractor/County/Application" && !matches(capStatus, "Closed - Cancelled", "Closed - Denied", "Closed - Withdrawn")) {
                            // Return true if there's an active application
                            return capID;
                        }
                    }
                }
            }
        }
    }
    return false;
}

function isContractorStateLicenseRegistered(stateLicenseNbr, cCapId) {
    var capResuls = aa.cap.getCapIDsByAppSpecificInfoField("State License Number", stateLicenseNbr);
    if (capResuls.getSuccess()) {
        var capIDsArr = capResuls.getOutput();
        if (capIDsArr && capIDsArr.length > 0) {
            var currentCapType = aa.cap.getCapTypeModelByCapID(cCapId).getOutput().getCapType();
            for (var i in capIDsArr) {
                var capID = capIDsArr[i].getCapID();
                if (capID != null) {
                    // do not count the current record
                    if (capID.getID1() == cCapId.getID1() && capID.getID2() == cCapId.getID2() && capID.getID3() == cCapId.getID3()) {
                        continue;
                    }

                    var itemCap = aa.cap.getCap(capID).getOutput();
                    if (itemCap.isCompleteCap()) {
                        var capType = aa.cap.getCapTypeModelByCapID(capID).getOutput().getCapType();
                        var capStatus = aa.cap.getCap(capID).getOutput().getCapStatus();
                        if (capType == "Licenses/Contractor/State/License") {
                            // make sure the license is not the parent for the current application - cCapId
                            if (currentCapType == "Licenses/Contractor/State/Application") {
                                var pCapId = getParentByCapId(cCapId);
                                if (pCapId && String(pCapId.getCapClass()).indexOf("INCOMPLETE") != 0) {
                                    if (capID.getID1() == pCapId.getID1() && capID.getID2() == pCapId.getID2() && capID.getID3() == pCapId.getID3()) {
                                        continue;
                                    }
                                }
                            }

                            if (!matches(capStatus, "Revoked", "Suspended", "Disabled")) {
                                return capID;
                            }
                        }  else if (capType == "Licenses/Contractor/State/Application" && !matches(capStatus, "Closed - Cancelled", "Closed - Denied", "Closed - Withdrawn")) {
                            return capID;
                        }
                    }
                }
            }
        }
    }
    return false;
}

function matches(eVal, argList) {
    for (var i = 1; i < arguments.length; i++) {
        if (arguments[i] == eVal) {
            return true;
        }
    }
    return false;
}

function getParentByCapId(itemCap) {
    // returns the capId object of the parent.  Assumes only one parent!
    getCapResult = aa.cap.getProjectParents(itemCap, 1);
    if (getCapResult.getSuccess()) {
        parentArray = getCapResult.getOutput();
        if (parentArray.length)
            return parentArray[0].getCapID();
        else {
            aa.print("**WARNING: GetParent found no project parent for this application");
            return false;
        }
    }
    else {
        aa.print("**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
        return false;
    }
}