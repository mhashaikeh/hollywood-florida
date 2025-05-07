
    //getRecordEmails helper function to get distinct record emails
    //sendTo: "All" for all contacts and professionals, "Professionals" for only professionals, "Contacts" for only contacts
    function getNotificationEmails(sendTo,primaryOnly) {
        //Start getRecordEmails
        var allContactsAndProffesionals = "All";
        var licenseProfessionalsOnly = "Professionals";
        var contactsOnly = "Contacts";
            
        function getContactEmails(primaryOnly) {
            var contactResult = aa.people.getCapContactByCapID(capId);
            var contactEmails = "";
            if (contactResult.getSuccess()) {
                contactResult = contactResult.getOutput();
                for (i in contactResult) {
                    if (primaryOnly) {
                        if (!contactResult[i].isPrimary) {
                            continue;
                        }
                    }

                    var email = contactResult[i].getEmail() + "";
                    if (email) {
                        contactEmails += email + ";";
                    }
                }
            }
            return contactEmails;
        }

        function getRecordLicenseEmails(primaryOnly) {

            var profEmail = "";

            // get LP email addresses
            var result = aa.licenseProfessional.getLicensedProfessionalsByCapID(capId);
            var licenseProfList = result.getOutput();
            if (licenseProfList) {
                for (var i in licenseProfList) {
                    if (primaryOnly) {
                        if (!licenseProfList[i].getPrintFlag().equals("Y")) {
                            continue;
                        }
                    }
                    var email = licenseProfList[i].getEmail();
                    if (email) {
                        profEmail += email + ";";
                    }
                }
            }

            return profEmail;
        }

        
        function getUnique(to) {
            var uniqueEmails = [];
            var emails = to.split(";");
            for (var i = 0; i < emails.length; i++) {
                var email = emails[i].trim().toLowerCase();
                if (email && uniqueEmails.indexOf(email) === -1) {
                    uniqueEmails.push(email);
                }
            }
            return uniqueEmails;
        }

    
        var emails = "";
        if (sendTo == allContactsAndProffesionals) {
            emails = getContactEmails(primaryOnly);
            emails += getRecordLicenseEmails(primaryOnly);
        } else if (sendTo == licenseProfessionalsOnly) {
            emails = getRecordLicenseEmails(primaryOnly);
        } else if (sendTo == contactsOnly) {
            emails = getContactEmails(primaryOnly);
        }
        emails = getUnique(emails);
        return emails.join(";");

    }
    

//END getRecordEmails