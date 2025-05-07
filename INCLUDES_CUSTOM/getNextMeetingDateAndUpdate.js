// Function to get the next meeting date and update the counter
function getNextMeetingDateAndUpdate() {
    var stdChoice = "PAC_MEETING_DATES";
    var currentDate = aa.date.getCurrentDate(); // Accela current date
    // Create current date object (Accela months are 1-based, JavaScript expects 0-based)
    var currentDateObj = new Date(currentDate.getYear(), currentDate.getMonth() - 1, currentDate.getDayOfMonth());
    var nextDate = null;
    var result = null;

    logDebug("Current date: " + currentDateObj.toLocaleDateString("en-US"));

    // Get the standard choice array
    var stdChoiceArray = getStandardChoiceArrayLocal(stdChoice);

    if (stdChoiceArray && stdChoiceArray.length > 0) {
        logDebug("Processing " + stdChoiceArray.length + " items in " + stdChoice);

        // Log all items and find the next date
        for (var i = 0; i < stdChoiceArray.length; i++) {
            var item = stdChoiceArray[i];
            var dateStr = (item["value"] || "").trim();
            var descStr = (item["valueDesc"] || "").trim();
            var activeStatus = item["active"] || "Unknown";

            logDebug("Item " + i + ": value=" + dateStr + ", valueDesc=" + descStr + ", active=" + activeStatus);

            if (activeStatus != 'A') {
                logDebug("Skipping inactive item: " + dateStr);
                continue;
            }

            // Validate date format
            if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
                logDebug("Invalid date format for value: " + dateStr);
                continue;
            }

            var itemDate = new Date(dateStr); // Parse MM/DD/YYYY
            if (isNaN(itemDate.getTime())) {
                logDebug("Invalid date parsed for value: " + dateStr);
                continue;
            }

            logDebug("Parsed date: " + itemDate.toLocaleDateString("en-US") + ", Compared to current date: " + currentDateObj.toLocaleDateString("en-US"));

            if (itemDate >= currentDateObj) {
                nextDate = item;
                logDebug("Selected next date: " + dateStr);
                break; // Found the first valid date on or after today
            } else {
                logDebug("Date " + dateStr + " is before current date, skipping");
            }
        }

        if (nextDate) {
            logDebug("Next meeting date found: " + nextDate["value"] + ", Description: " + nextDate["valueDesc"]);

            // Parse current counter from valueDesc
            var counter = 0;
            var descMatch = nextDate["valueDesc"].match(/(\d+)/); // Extract number (e.g., "Meeting Count: 1" or "1")
            if (descMatch) {
                counter = parseInt(descMatch[0], 10);
                logDebug("Parsed counter: " + counter);
            } else {
                logDebug("No counter found in valueDesc: " + nextDate["valueDesc"] + ", initializing to 0");
            }

            // Increment counter
            counter += 1;
            var newDesc = "Meeting Count: " + counter;

            // Update the standard choice value
            try {
                var bizDomainResult = aa.bizDomain.getBizDomainByValue(stdChoice, nextDate["value"].trim());
                if (bizDomainResult.getSuccess()) {
                    var bizDomain = bizDomainResult.getOutput();
                    if (bizDomain) {
                        bizDomain.setDescription(newDesc);
                        if (counter >= 7) {
                            bizDomain.setAuditStatus("I");
                            logDebug("Counter reached 7, inactivating standard choice value: " + nextDate["value"]);
                        } else {
                            bizDomain.setAuditStatus("A");
                        }

                        var updateResult = aa.bizDomain.editBizDomain(bizDomain.getBizDomain());
                        if (updateResult.getSuccess()) {
                            logDebug("Successfully updated standard choice value: " + nextDate["value"] + ", New Description: " + newDesc + ", Status: " + bizDomain.getAuditStatus());
                            result = {
                                date: nextDate["value"],
                                counter: counter,
                                status: bizDomain.getAuditStatus()
                            };
                        } else {
                            logDebug("**ERROR: Failed to update standard choice value: " + updateResult.getErrorMessage());
                        }
                    } else {
                        logDebug("**ERROR: Standard choice value not found: " + nextDate["value"]);
                    }
                } else {
                    logDebug("**ERROR: Failed to retrieve standard choice value: " + bizDomainResult.getErrorMessage());
                }
            } catch (err) {
                logDebug("**ERROR: Exception updating standard choice: " + err.message);
            }
        } else {
            logDebug("No active meeting date found on or after current date: " + currentDateObj.toLocaleDateString("en-US"));
        }
    } else {
        logDebug("No items found in standard choice: " + stdChoice);
    }

    return result; // Returns { date: "MM/DD/YYYY", counter: number, status: "A" or "I" } or null
}