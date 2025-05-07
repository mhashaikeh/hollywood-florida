try{
  //Start: Update Application Expiration Date Field
  if (wfStatus != "Issued" && wfTask != "Inspection"){
    var appExpDate = getAppSpecific("Application Expiration Date");
    if (isTaskActive("Plans Coordination") || isTaskComplete('Plans Coordination')){
        var today = new Date();
        today.setDate(today.getDate() + 60);
        var sixtyDaysLaterString = (today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear();
        editAppSpecific("Application Expiration Date", sixtyDaysLaterString);
    }
  }
  //End: Update Application Expiration Date Field

  //Start: Send Issuance email with Building Permit Report
  if (wfStatus == "Issued"){

    //Notification and Reports
    var envParameters = aa.util.newHashMap();
    envParameters.put("CapID",capId);
    aa.runAsyncScript("ASYNCRUNBUILDINGPERMITRPT", envParameters, 5000);
      
  }
  //End: Send Issuance email with Building Permit Report

  //Start: Apply Fees For Review
  if (wfStatus == "Ready to Issue"){
    var licFeeCode;
    var reviewerValuation = AInfo["Reviewer Valuation"];
    if (appMatch("Fire/Permit/Sprinkler/NA")){
      licFeeCode = "FIRE07";
      var sprinkHeads = AInfo['Number of Sprinkler Heads'];
      updateFee('FIRE07', 'FIRE', 'FINAL', sprinkHeads, 'Y');
    }
    if (appMatch("Fire/Permit/Underground Main/NA")){
      licFeeCode = "FIRE24";
      var linearFt = AInfo['Total Linear Ft'];
      updateFee('FIRE24', 'FIRE', 'FINAL', linearFt, 'Y');
    }
    if (appMatch("Fire/Permit/Pump/NA")){
      licFeeCode = "FIRE19";
      updateFee('FIRE19', 'FIRE', 'FINAL', 1, 'Y');
    }
    if (appMatch("Fire/Permit/Eng Life Safety/NA")){
      licFeeCode = "FIRE09";
      updateFee('FIRE09', 'FIRE', 'FINAL', 1, 'Y');  		
    }

    //Start: Apply Building Permit Fee
      var feeAmount = 0;

      if (reviewerValuation <= 1000) {
          feeAmount = 100;
      } else if (reviewerValuation <= 1000000) {
          feeAmount = 100 + (reviewerValuation - 1000) * 0.022;
      } else if (reviewerValuation <= 2000000) {
          feeAmount = 100 + (1000000 - 1000) * 0.022 + (reviewerValuation - 1000000) * 0.0165;
      } else {
          feeAmount = 100 + (1000000 - 1000) * 0.022 + (2000000 - 1000000) * 0.0165 + (reviewerValuation - 2000000) * 0.0115;
      }

      // Apply the fee with the calculated amount
      updateFee("BLD01", "BUILDING", "FINAL", feeAmount, "N");

      // Log the calculated fee amount for reference
      logDebug("Fee Amount Calculated: " + feeAmount);
      //End: Apply Building Permit Fee

      // Start Apply Certificate of Completion Fees
      var isSubPermit = AInfo["Is this application being submitted as a sub-permit to a master building permit"];
      var permitFee = feeAmount;

      // Initialize fee variables
      var feeAmountBLD21 = 0;
      var feeAmountBLD22 = 0;

      // Calculate the fees based on the conditions
      if (isSubPermit == 'No') {
          feeAmountBLD22 = Math.max(permitFee * 0.03, 45);
          updateFee('BLD22', 'BUILDING', 'FINAL', feeAmountBLD22, 'N');
          logDebug("Fee Amount BLD22 Calculated: " + feeAmountBLD22);
      }
      // End Apply Certificate of Completion Fees

      // Start Apply County Fee
      var countyFeeAmount = Math.max((reviewerValuation / 1000) * 0.52, 2);
      updateFee('COUNTY', 'GOVERNMENTAL', 'FINAL', countyFeeAmount, 'N');

      //End Apply County Fee


      // Calculate the STATE fee
      var stateFeeAmount = permitFee * 0.03;
      updateFee('STATE', 'GOVERNMENTAL', 'FINAL', stateFeeAmount, 'N');
      updateFee('BLD24', 'BUILDING', 'FINAL', permitFee, 'N');
      updateFee('BLD25', 'BUILDING', 'FINAL', permitFee, 'N');
      logDebug("STATE Fee Amount Calculated: " + stateFeeAmount);
      logDebug("Technology Fee Amount Calculated: " + (permitFee * 0.02));
      logDebug("Education Fee Amount Calculated: " + (permitFee * 0.01));
      // End Calculate State, Tech, Education Fees
      invoiceAllFees();
  }

} catch (err) {
    var emailAddress = "jshear@mytechsinc.com"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "WTUA;FIRE!PERMIT!~!~", err + debug + err.stack);
}

