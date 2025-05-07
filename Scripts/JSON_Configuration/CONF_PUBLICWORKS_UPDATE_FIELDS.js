{
  "PublicWorks/*/*/*": {
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": ""
        },
        "postScript": "POST_PERMIT_ISSUANCE"
      },
      {
        "metadata": {
          "description": "Update custom field Application Expiration Date upon permit issuance ",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Coordination"
          ],
          "status": [
          ]
        },
        "action": {
          "daysOut": "60",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Update custom field Application Expiration Date upon permit issuance ",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Update custom field Close Date upon Completed Final Inspection ",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Inspection"
          ],
          "status": [
            "Final Inspection Complete"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Closed Date"
        },
        "postScript": ""
      },

    ]
  }
}