try{
    // Start Apply NOC Condition
    var estCost = AInfo['Estimated Cost (Job Value)'];
    var isMechanical = appTypeArray[2] == "Mechanical";
    var isRoof = appTypeArray[1] == "Roofing";
    var typeOfWork = AInfo['Type of Work'];
    var scopeOfWork = AInfo['Scope of Work'];

    function ensureNOCCondition() {
        if (!appHasCondition("Record", "Applied", "Notice of Commencement Required", null)) {
            addStdCondition("Record", "Notice of Commencement Required");
        }
    }

    var parcelInfo =  ["*"];
    var parcelArrayValues = getGISInfo2multiAttribute("HOLLYWOOD", "Parcels", parcelInfo);
    if (parcelArrayValues){
        var censusTract = parseFloat(parcelArrayValues.get("USE_CODE"));
        if (!matches(censusTract,89,86,85,73)){
            if (estCost > 5000) {
                if ((isMechanical && typeOfWork == "Replacement" && scopeOfWork == "Air Conditioning" && estCost >= 15000) ||
                    (isMechanical && typeOfWork == "New") ||
                    (!isRoof && !isMechanical) ||
                    (isRoof && typeOfWork != "Roof to Wall Connection")) {
                    ensureNOCCondition();
                }
            }
        }
    }

    // End Apply NOC COndition

    //Start: Add Docs Needed Prior to Final Inspection Conditions
    //Removed as per request 757 - Update: added per EIC 07252024
    if (isMechanical && appTypeArray[1] == "Commercial"){
            if (!appHasCondition("Permit", "Applied", "Test and Balance Report Required", null)) {
          addStdCondition("Permit", "Test and Balance Report Required");
        }
        if (!appHasCondition("Permit", "Applied", "Certified Welder Certificate Required", null)) {
          addStdCondition("Permit", "Certified Welder Certificate Required");
        }
        //Removing as per request 766
        //if (!appHasCondition("Permit", "Applied", "EPL Display Card Required", null)) {
          //addStdCondition("Permit", "EPL Display Card Required");
        //}
    }
    //End: Add Docs Needed Prior to Final Inspection Conditions

    //Start Apply Parent to Sub-Permit
    if(!matches(AInfo["Master Building Permit Number"],null,"", "undefined")){
        addParent(AInfo["Master Building Permit Number"]);
    }
    //End Apply Parent to Sub-Permit

    /* Moved to CTRCA;~!~!~!~
    //Start: Notify LP upon Submission
    var licenseProfResult = aa.licenseProfessional.getLicensedProfessionalsByCapID(capId);
    if (licenseProfResult.getSuccess()) {
        var licenseProfList = licenseProfResult.getOutput();
        if (licenseProfList) {
            for (thisLP in licenseProfList) {
                if (licenseProfList[thisLP].getLicenseNbr() != null) {
                    var licNbr = licenseProfList[thisLP].getLicenseNbr();
                    var firstName = licenseProfList[thisLP].getContactFirstName();
                    var lastName = licenseProfList[thisLP].getContactLastName();
                    var eMail = licenseProfList[thisLP].getEmail();
                    emailParameters = aa.util.newHashtable();
                    var deptName = (appTypeArray[0] == "PublicWorks") ? "Engineering Division" : appTypeArray[0] + " Division";
                    getDepartmentParams4Notification(emailParameters, deptName);
                    var sysDate = aa.date.getCurrentDate();
                    var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "MM/DD/YYYY");
                    addParameter(emailParameters, "$$altID$$", capId.getCustomID());
                    addParameter(emailParameters, "$$recordAlias$$", cap.getCapType().getAlias());
                    addParameter(emailParameters, "$$ContactName$$",""+firstName + " " + lastName);
                    addParameter(emailParameters, "$$licNbr$$",""+licNbr);
                    addParameter(emailParameters, "$$mmddyy$$", sysDateMMDDYYYY);
                    sendNotification("Accela@HollywoodFL.org",eMail,"","SS_LP_APPLIED_NOTIFICATION",emailParameters,null,capId)
                }
            }
        }
    }
    //End: Notify LP upon Submission
    */

    /*Removing 07032024 - Submission emails now sent by EPH
    //Start: Send Notification for sub-permits upon Submission
    if (AInfo['Is this application being submitted as a sub-permit to a master building permit'] == "Yes"){
        var notificationTemplate = "SS_APP_SUBMITTAL_AA";

        var priContact = getContactObj(capId,"Applicant");
        var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
        var acaUrl = acaSite.replace("/admin/Login.aspx", "")
        if(priContact){
            var eParams = aa.util.newHashtable(); 
            addParameter(eParams, "$$altID$$", capId.getCustomID());
            addParameter(eParams, "$$recordAlias$$", cap.getCapType().getAlias());
            addParameter(eParams, "$$ContactName$$", priContact.capContact.firstName + " " + priContact.capContact.lastName);
            var contactEmail = ""+priContact.capContact.getEmail();
            addParameter(eParams, "$$url4ACA$$", acaUrl);
            sendNotification("Accela@HollywoodFL.org",contactEmail,"",notificationTemplate,eParams,null,capId)
        }
    }
    //End: Send Notification for sub-permits upon Submission
    */

    //Start: Add Inspection District
    if(appTypeArray[1] != "Amendment"){
        //setGISDistricts2(capId, "Code Districts", true);
        setGISDistricts3(capId,true); //Case 01481428
    }
    //End: Add Inspection District

} catch (err) {
    var emailAddress = "accelaerrors@hollywoodfl.org"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "CTRCA:BUILDING/*/*/*", err + debug + err.stack);
}