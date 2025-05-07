/* Moved to ISB;~!~!~!~
//Start: Notice of Comencement Validation
  if (appHasCondition("Record", "Applied", "Notice of Commencement Required", null)) {
      cancel = true;
      showMessage = true;
      comment("Unable to Schedule Inspection - Notice of Commencement Required has been applied to this record");
  }
//Start: Notice of Comencement Validation

// Stop inspection from scheculing if fee due
if (balanceDue > 0) {
    showMessage = true;
    cancel = true;
    comment("Cannot schedule an inspection with a balance due of " + "$" + balanceDue);
}
*/

//Start: Verify Conditions have been met before Final Inspection
if (inspType.indexOf("Final") > -1){
  if (appHasCondition("Permit", "Applied", "As-Builts Required", null) || appHasCondition("Permit", "Document Received", "As-Builts Required", null)) {
      cancel = true;
      showMessage = true;
      comment("Unable to Schedule Inspection - As-Builts Required condition has been applied to this record");
  }

  if (appHasCondition("Permit", "Applied", "Outside Agency/Broward County Clearances Required", null) || appHasCondition("Permit", "Document Received", "Outside Agency/Broward County Clearances Required", null)) {
      cancel = true;
      showMessage = true;
      comment("Unable to Schedule Inspection - Outside Agency/Broward County Clearances Required condition has been applied to this record");
  }

  if (appHasCondition("Permit", "Applied", "Test Results Required", null) || appHasCondition("Permit", "Document Received", "Test Results Required", null)) {
      cancel = true;
      showMessage = true;
      comment("Unable to Schedule Inspection - Test Results Required condition has been applied to this record");
  }

    if (appHasCondition("Permit", "Applied", "Start-Up Report Required", null) || appHasCondition("Permit", "Document Received", "Start-Up Report Required", null)) {
      cancel = true;
      showMessage = true;
      comment("Unable to Schedule Inspection - Start-Up Report Required condition has been applied to this record");
  }

  if (appHasCondition("Permit", "Applied", "Operations and Maintenance Manual and Agreement Required", null) || appHasCondition("Permit", "Document Received", "Operations and Maintenance Manual and Agreement Required", null)) {
      cancel = true;
      showMessage = true;
      comment("Unable to Schedule Inspection - Operations and Maintenance Manual and Agreement Required condition has been applied to this record");
  }

  if (appHasCondition("Permit", "Applied", "Conveyance Documentation Required", null) || appHasCondition("Permit", "Document Received", "Conveyance Documentation Required", null)) {
      cancel = true;
      showMessage = true;
      comment("Unable to Schedule Inspection - Conveyance Documentation Required condition has been applied to this record");
  }
    //Start: Check for Applied Sub-Permit Conditions
    var condResult = aa.capCondition.getCapConditions(capId);

    if (condResult.getSuccess()) {
        var capConds = condResult.getOutput();

        for (var cc in capConds) {
            var thisCond = capConds[cc];
            if (thisCond.getConditionType() == "Sub-Permits" && thisCond.getConditionStatus() == "Applied") {
                cancel = true;
                showMessage = true;
                comment("Unable to Schedule Inspection - Sub-Permit conditions have been applied to this record");
                break;
            }
        }
    }
    //End: Check for Applied Sub-Permit Conditions
}
//End: Verify Conditions have been met before Final Inspection

//Start: Verify Pre-Construction Checklist is uploaded
if (inspType == "Pre-Construction Meeting"){
     if (appHasCondition("Record", "Applied", "Pre-Construction Meeting", null) || appHasCondition("Record", "Document Received", "Pre-Construction Meeting", null)) {
      cancel = true;
      showMessage = true;
      comment("Unable to Schedule Inspection - Pre-Construction Meeting condition has been applied to this record");
  }
}
//End: Verify Pre-Construction Checklist is uploaded