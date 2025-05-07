{
  "PublicWorks/Valet/Long-Term/Renewal": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Updates parent Valet record",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Renewal"
          ],
          "status": [
            "Renewed"
          ]
        },
        "preScript": "",
        "action": {
          "issuedRecordStatus": "Active",
          "issuedExpirationStatus": "Active",
          "issuedLPStatus": "A",
          "expirationType": "Expiration Date",
          "expirationPeriod": 365,
          "customExpirationFunction": "",
          "copyComponents": [
            "Custom Fields"
          ]
        },
        "postScript": ""
      }
    ]
  },
  "PublicWorks/Engineering/Sidewalk Use/Renewal": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Updates parent record",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Renewal"
          ],
          "status": [
            "Renewed"
          ]
        },
        "preScript": "",
        "action": {
          "issuedRecordStatus": "Active",
          "issuedExpirationStatus": "Active",
          "issuedLPStatus": "A",
          "expirationType": "Expiration Date",
          "expirationPeriod": 365,
          "customExpirationFunction": "",
          "copyComponents": [
            "Custom Fields"
          ]
        },
        "postScript": "POST_PERMIT_RENEWAL_ISSUANCE"
      }
    ]
  },
  "PublicWorks/Accessible Parking/NA/Renewal": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Updates parent record",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Renewal"
          ],
          "status": [
            "Renewed"
          ]
        },
        "preScript": "",
        "action": {
          "issuedRecordStatus": "Active",
          "issuedExpirationStatus": "Active",
          "issuedLPStatus": "A",
          "expirationType": "Expiration Date",
          "expirationPeriod": 365,
          "customExpirationFunction": "",
          "copyComponents": [
            "Custom Fields"
          ]
        },
        "postScript": ""
      }
    ]
  }
}