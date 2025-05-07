function dDogRenewalDate() {
    var vPermitObj = new licenseObject(null, parentCapId);

    if (vPermitObj) {
        var expDate = vPermitObj.b1ExpDate;
        
         expDate = new Date(expDate); 
        // Get current exp year and add 1
        var nextYear = expDate.getFullYear() + 1;
        
        // Set to 9/30 of next year
        var newExpDate = new Date(nextYear, 8, 30); // 8 = September
        return newExpDate;
  
    }
}