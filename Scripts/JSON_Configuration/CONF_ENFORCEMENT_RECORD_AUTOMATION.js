{
    "Enforcement/Case/*/*": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Invoice all Fees at Collections",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Hearing"
          ],
          "status": [
            "Adjudication Only",
            "Repeat Final Order - Fine",
            "No Further SM Action"
          ]
        },
        "action": {
          "invoiceFees": "true"
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Schedule Stipulated Agreement Follow-Up Inspection",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Hearing"
          ],
          "status": [
            "Stipulated Agreement"
          ]
        },
        "action": {},
        "postScript": "POST_ENFORCEMENT_SCHEDULE_HEARING_INSPECTIONS"
      },
      {
        "metadata": {
          "description": "Apply Ext Granted Fees",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Hearing"
          ],
          "status": [
            "Extension Granted"
          ]
        },
        "action": {},
        "postScript": "POST_ENFORCEMENT_EXTENSION_GRANTED"
      },
      {
        "metadata": {
          "description": "Populate Lien Custom Fields",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Collections"
          ],
          "status": [
            "Lien by Special Magistrate", 
            "Lien by Treasury",
            "Lien Released"
          ]
        },
        "action": {},
        "postScript": "POST_ENFORCEMENT_COLLECTIONS"
      },
      {
        "metadata": {
            "description": "Remove parcel condition when violation closed",
            "operators": {}
        },
        "preScript": "",
        "criteria": {
            "task": [],
            "status": [
              "Violation Abated by WO",
              "Violation Corrected by Owner",
              "Violation Corrected by ES",
              "Dangerous Dog Registered",
              "Violation Abated by NMIP"
            ]
        },
        "action": {},
        "postScript": "POST_ENFORCEMENT_CASE_CLOSED"
            }
    ]
  }
}