try {
    cap = aa.cap.getCap(capId).getOutput();
    appTypeResult = cap.getCapType();
    appTypeString = appTypeResult.toString();
    appTypeArray = appTypeString.split("/");

    if (appTypeArray[1] == "Complaint" || appTypeArray[1] == "Case"){

        if (inspType == "Initial Inspection"){
            var outcomeResult = getCheckListCustomFieldValue("Outcome", "INVESTIGATION INFORMATION", capId);
            if (matches(outcomeResult,null,undefined,"")){
                showMessage = true;
                cancel = true;
                comment("Checklist must be Completed before Resulting Inspections");
            }
            if (outcomeResult == "Administrative Citation"){
                var adminAmount = getCheckListCustomFieldValue("Administrative Citation Amount", "INVESTIGATION INFORMATION", capId);
                if (matches(adminAmount,null,undefined,"")){
                    showMessage = true;
                    cancel = true;
                    comment("Checklist item 'Administrative Citation Amount' must be Completed before Resulting Inspections");
                }
            }
            if (inspResult == "Not Complied"){
                var repeatOffender = getAppSpecific("Repeat Offender", capId);
                if (matches(repeatOffender,null,undefined,"")){
                    showMessage = true;
                    cancel = true;
                    comment("The custom field 'Repeat Offender' must be populated before resulting the Initial Inspection");
                }
            }
            if (appTypeArray[1] == "Case"){
                if (repeatOffender == "Yes"){
                    var feeExistsResults = feeExists("CODE07","NEW", "INVOICED");
                    if (!feeExistsResults){
                        showMessage = true;
                        cancel = true;
                        comment("Please apply the Repeat Offender Fee before resulting the Initial Inspection");
                    }
                }

                //inspTotalTime displaying as null, need to define new field for time capture
                /*var violationType = getAppSpecific("Violation Type");
                var feeEligible = lookup("FIELD_INSPECTION_FEE_ELIGIBLE", violationType);

                if (feeEligible == "Y"){
                    //inspObj = aa.inspection.getInspection(capId,inspId).getOutput(); 
                    //inspTotalTime = inspObj.getTimeTotal();
                    if (matches(inspTotalTime,null,undefined,"")){
                        showMessage = true;
                        cancel = true;
                        comment("Please apply total Inspection Time before resulting inspection");
                    }

                }*/
            }
        }

        if (inspType == "Follow-Up Inspection"){
             var outcomeResult = String(getCheckListCustomFieldValue("Outcome", "INVESTIGATION INFORMATION", capId));
             if (outcomeResult == "Extension Granted"){
                var InspDate = getCheckListCustomFieldValue("Inspection Date", "INSPECTION DATE", capId);
                if (matches(InspDate,null,undefined,"")){
                    showMessage = true;
                    cancel = true;
                    comment("The custom field 'Next Inspection Date' must be populated before resulting the Follow-Up Inspection");
                }
             }
        }
    }

} catch (err) {
  var emailAddress = "jshear@accela.com"; //email to send report
  aa.sendMail("no-reply@accela.com", emailAddress, "", "IRSB:Enforcement/*/*/*", err + debug + err.stack);
}