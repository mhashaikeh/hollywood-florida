    //Start: Add Docs Needed Prior to Final Inspection Conditions
    var patioMaterial = AInfo['Patio Material'];
    var deckMaterial = AInfo['Deck Material'];
    var deckLocation = AInfo['Deck Located within 1 Foot of Dwelling'];
    var patioLocation = AInfo['Patio Located within 1 Foot of Dwelling'];

    if (patioMaterial  == "Concrete" || deckMaterial == "Concrete"){
        if (!appHasCondition("Permit", "Applied", "Concrete Compaction Required", null)) {
            addStdCondition("Permit", "Concrete Compaction Required");
        }
    }

    if (deckLocation  == "Yes" || patioLocation == "Yes"){
        if (!appHasCondition("Permit", "Applied", "Proof of Subterranean Termite Treatment Required", null)) {
            addStdCondition("Permit", "Proof of Subterranean Termite Treatment Required");
        }
    }
    //End: Add Docs Needed Prior to Final Inspection Conditions