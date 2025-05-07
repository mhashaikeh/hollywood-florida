function getContactsCompanyName(contactType) {
    var itemCap = capId
    if (arguments.length > 1) {
        itemCap = arguments[1]; // use cap ID specified in args
    }

    var orgName = "";
    var capContactResult = aa.people.getCapContactByCapID(itemCap);
    if (capContactResult.getSuccess()) {
        var contacts = capContactResult.getOutput();
        for (yy in contacts) {
            if (contactType.equals(contacts[yy].getCapContactModel().getPeople().getContactType())) {
                if (contacts[yy].getPeople().getBusinessName() != null) {
                    orgName = "" + contacts[yy].getPeople().getBusinessName();
                }
            }
        }
    }
    return orgName;
}