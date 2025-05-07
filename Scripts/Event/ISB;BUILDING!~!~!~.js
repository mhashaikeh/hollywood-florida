
//Start: Uplift Report Validation
if (inspType == "Roofing Final Inspection"){
  if (appHasCondition("Permit", "Applied", "Uplift Report Required", null)) {
      cancel = true;
      showMessage = true;
      comment("The Uplift Report Required Condition must be met before scheduling the Final Inspection");
  }
}
//End: Uplift Report Validation

/* Moved to ISB;~!~!~!~
//Start: Notice of Comencement Validation
  if (appHasCondition("Record", "Applied", "Notice of Commencement Required", null)) {
      cancel = true;
      showMessage = true;
      comment("Unable to Schedule Inspection - Notice of Commencement Required has been applied to this record");
  }
//Start: Notice of Comencement Validation
*/

//Start: Verify Mechanical Documents are uploaded before Final
if (inspType == "Final Mechanical Inspection") {
    var missingDocs = [];
    var conditions = [
        "Test and Balance Report Required",
        "Certified Welder Certificate Required",
        "EPL Display Card Required"
    ];

    for (var i = 0; i < conditions.length; i++) {
        if (appHasCondition("Permit", "Applied", conditions[i], null)) {
            missingDocs.push(conditions[i]);
        }
    }

    if (missingDocs.length > 0) {
        cancel = true;
        showMessage = true;
        comment("Unable to Schedule Inspection - The following Conditions must be met before scheduling the Final Inspection:\n" + missingDocs.join("\n"));
    }
}
//End: Verify Mechanical Documents are uploaded before Final


//Start: Verify Structural Documents are uploaded before Final
if (inspType == "Final Structural Inspection") {
    var missingDocs = [];
    var conditions = [
        "Concrete Compaction Required",
        "Proof of Subterranean Termite Treatment Required"
    ];

    for (var i = 0; i < conditions.length; i++) {
        if (appHasCondition("Permit", "Applied", conditions[i], null)) {
            missingDocs.push(conditions[i]);
        }
    }

    if (missingDocs.length > 0) {
        cancel = true;
        showMessage = true;
        comment("Unable to Schedule Inspection - The following Conditions must be met before scheduling the Final Inspection:\n" + missingDocs.join("\n"));
    }
}
//End: Verify Structural Documents are uploaded before Final


//Start: Verify Antenna Documents are uploaded before Final
if (inspType == "Final Tower Inspection"){
  if (appHasCondition("Permit", "Applied", "Special Inspector Final Letter Required", null)) {
      cancel = true;
      showMessage = true;
      comment("The Special Inspector Final Letter Required Condition must be met before scheduling the Final Inspection");
  }
}
//End: Verify Antenna Documents are uploaded before Final

/* Moved to ISB;~!~!~!~
// Stop inspection from scheculing if fee due
if (balanceDue > 0) {
    showMessage = true;
    cancel = true;
    comment("Cannot schedule an inspection with a balance due of " + "$" + balanceDue);
}
*/