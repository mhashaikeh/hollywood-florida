if (wfTask == "Application Intake" && wfStatus ==  "Accepted") {
    recAssigned = getAssigned(capId);
    if (matches(recAssigned,null,undefined,"")){
        cancel = true;
        showMessage = true;
        comment("Error: Record must be assigned to a staff member.");   
    }

    if (MEETINGINFORMATION.length == 0) {
        cancel = true;
        showMessage = true;
        comment("Error: At least one entry is required in the Meeting Information table.");
    }
}