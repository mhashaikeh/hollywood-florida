function getStateExpDate() {
    try {
        //get all the following dates and return the earliest one
        //State License Expiration Date
        //Insurance Expiration Date
        //Worker's Compensation Expiration Date
        //Occupational License Expiration Date
        var stExpDate = getAppSpecific("State License Expiration Date");
        var insExpDate = getAppSpecific("Insurance Expiration Date");
        var wcExpDate = getAppSpecific("Workers Compensation Expiration Date");

        var dates = [];
        if (stExpDate) dates.push(new Date(stExpDate));
        if (insExpDate) dates.push(new Date(insExpDate));
        if (wcExpDate) dates.push(new Date(wcExpDate));
        
        dates.sort(function(a, b) { return a - b; }); // Sort dates in ascending order
        return dates[0];


    }
    catch (e) {
        var emailAddress = "jshear@mytechsinc.com"; //email to send report
        aa.sendMail("no-reply@accela.com", emailAddress, "", "WTUA:Lisenses/Contractor/*/Application", e + debug + e.stack);
    }
}