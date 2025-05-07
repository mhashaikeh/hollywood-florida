/**Getting the Deep Link for ACA */
function getURL(capId) {
    var idOne = capId.getID1();
    var idTwo = capId.getID2();
    var idThree = capId.getID3();
    var url = lookup("Environment", "ACA_BASE");
    if (appMatch("Building/*/*/*")) {
        moduleName = "Building";
    }
    if (appMatch("Licenses/*/*/*")) {
        moduleName = "Licenses";
    }
    if (appMatch("Fire/*/*/*")) {
        moduleName = "Fire";
    }
    if (appMatch("Planning/*/*/*")) {
        moduleName = "Planning";
    }
    if (appMatch("PublicWorks/*/*/*")) {
        moduleName = "PublicWorks";
    }
    var urlWithCap = url + "Module=" + moduleName + "&TabName=" + moduleName + "&capID1=" + idOne + "&capID2=" + idTwo + "&capID3=" + idThree;
    return urlWithCap;
}