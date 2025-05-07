try {
    // MAS SF#01486146
    if (appTypeArray[1] != "Amendment") {
        if (wfStatus == "Issued") {
            var validationMsg = "";
            if (balanceDue > 0) {
                validationMsg = "The Permit cannot be issued with a balance due of " + "$" + balanceDue + "\n";
            }
            if (!isLicenseProfActive()) {
                validationMsg += "The Permit cannot be issued, Contractor is in an Inactive Status" + "\n";
            }

            var pCapId = getParent();
            if (pCapId) {
                var permitIssued = isTaskActiveByCapID("Inspection", pCapId);
                if (!permitIssued) {
                    validationMsg += "The Master Permit must be in an issued status";
                }
            }

            if (validationMsg != "") {
                showMessage = true;
                cancel = true;
                comment(validationMsg);
            }
        }
    }

    if (wfStatus == "Ready to Issue") {
        //Start: Condition Validation Check
        if (appHasCondition("County", "Applied", "Manual License Number and Expiration Validation Required", null) || appHasCondition("Liquified Petroleum", "Applied", "Manual License Number and Expiration Validation Required", null)) {
            cancel = true;
            showMessage = true;
            comment("The 'Manual License Number and Expiration Validation Required' condition must be met");
        }

        if (appHasCondition("Permit", "Applied", "Broward County Surface Water Management License Required", null) || appHasCondition("Permit", "Document Received", "Broward County Surface Water Management License Required", null)) {
            cancel = true;
            showMessage = true;
            comment("The 'Broward County Surface Water Management License Required' condition must be met");
        }

        if (appHasCondition("Sub-Permits", "Applied", "Maintenance of Traffic Permit Required", null)) {
            cancel = true;
            showMessage = true;
            comment("The 'Maintenance of Traffic Permit Required' condition must be met");
        }
        //End:  Condition Validation Check
    }
} catch (err) {
    var emailAddress = "jshear@accela.com"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "WTUB;~!~!~!~", err + debug + err.stack);
}