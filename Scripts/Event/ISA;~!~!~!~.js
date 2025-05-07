try {
    var conn = aa.db.getConnection();

    // Define the mapping for INSP_GROUP
    var inspGroupMapping = {
        'BLDG_ELEC': { agency: 'BUILDING', bureau: 'ELECTRIC', division: 'NA', office: 'NA', section: 'NA', group: 'NA' },
        'BLD_FENCE': { agency: 'BUILDING', bureau: 'STRUCT', division: 'NA', office: 'NA', section: 'NA', group: 'NA' },
        'BLD_WDS': { agency: 'BUILDING', bureau: 'STRUCT', division: 'NA', office: 'NA', section: 'NA', group: 'NA' },
        'BLDG_ROOF': { agency: 'BUILDING', bureau: 'STRUCT', division: 'NA', office: 'NA', section: 'NA', group: 'NA' },
        'BLDG_DEMO': { agency: 'BUILDING', bureau: 'STRUCT', division: 'NA', office: 'NA', section: 'NA', group: 'NA' },
        'BLDG_MECH': { agency: 'BUILDING', bureau: 'MECHANIC', division: 'NA', office: 'NA', section: 'NA', group: 'NA' },
        'BLDG_PLUMING': { agency: 'BUILDING', bureau: 'PLUMBING', division: 'NA', office: 'NA', section: 'NA', group: 'NA' },
        'FIRE_GEN': { agency: 'FIRE', bureau: 'NA', division: 'NA', office: 'NA', section: 'NA', group: 'NA' },
        'PW_DRWY': { agency: 'ENGINEER', bureau: 'NA', division: 'NA', office: 'NA', section: 'NA', group: 'NA' }
    };

    // Fetch the INSP_GROUP value and current agency code for the given inspId
    var fetchQuery = "SELECT INSP_GROUP, R3_AGENCY_CODE FROM G6ACTION WHERE G6_ACT_NUM = ?";
    var fetchStmt = conn.prepareStatement(fetchQuery);
    fetchStmt.setInt(1, inspId); // Set the inspId parameter
    var fetchResult = fetchStmt.executeQuery();

    if (fetchResult.next()) {
        var inspGroup = fetchResult.getString("INSP_GROUP");
        var currentAgencyCode = fetchResult.getString("R3_AGENCY_CODE");

        var mapping = inspGroupMapping[inspGroup];

        if (mapping) {
            // Prepare the update query if R3_AGENCY_CODE is blank
            if (!currentAgencyCode) {
                var updateQuery = "UPDATE G6ACTION SET " +
                                  "R3_AGENCY_CODE = ?, " +
                                  "R3_BUREAU_CODE = ?, " +
                                  "R3_DIVISION_CODE = ?, " +
                                  "R3_OFFICE_CODE = ?, " +
                                  "R3_SECTION_CODE = ?, " +
                                  "R3_GROUP_CODE = ? " +
                                  "WHERE G6_ACT_NUM = ?";

                var updateStmt = conn.prepareStatement(updateQuery);
                updateStmt.setString(1, mapping.agency);
                updateStmt.setString(2, mapping.bureau);
                updateStmt.setString(3, mapping.division);
                updateStmt.setString(4, mapping.office);
                updateStmt.setString(5, mapping.section);
                updateStmt.setString(6, mapping.group);
                updateStmt.setInt(7, inspId);

                // Execute the update query
                var rowsUpdated = updateStmt.executeUpdate();
                aa.print("Rows updated: " + rowsUpdated);

                updateStmt.close();
            } else {
                aa.print("R3_AGENCY_CODE is already populated.");
            }
        } else {
            aa.print("No mapping found for INSP_GROUP: " + inspGroup);
        }
    }

    fetchStmt.close();
    conn.close();
} catch (err) {
    logDebug("A JavaScript Error occured: " + err.message);
}
