if (wfStatus == "Ready to Issue") { 
    var requiredFields = [
        {field: "Rabies Vaccination Date", message: "Rabies Vaccination Date must be populated"},
        {field: "Rabies Vaccination Expiration Date", message: "Rabies Vaccination Expiration Date must be populated"},
        {field: "Dangerous Dog Tag Number", message: "Dangerous Dog Tag Number must be populated"}
    ];

    for (var i = 0; i < requiredFields.length; i++) {
        var value = getAppSpecific(requiredFields[i].field);
        if (matches(value, null, undefined, "")) {
            showMessage = true;
            cancel = true;
            comment(requiredFields[i].message);
        }
    }
}