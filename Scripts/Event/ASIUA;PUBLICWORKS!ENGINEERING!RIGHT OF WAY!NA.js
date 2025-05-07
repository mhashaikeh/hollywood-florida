   //Start: Apply Pre-Condition Checklist Condition
    if (AInfo['Critical Location'] == "Yes"){
        if (!appHasCondition("Record", "Applied", "Pre-Construction Meeting", null)) {
            addStdCondition("Record", "Pre-Construction Meeting");
        }
    }
     //End: Apply Pre-Condition Checklist Condition
