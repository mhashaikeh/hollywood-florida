{
  "Licenses/Contractor/State/Renewal": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Renews a General Contractor License",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Registration Issuance"
          ],
          "status": [
            "Registration Completed"
          ]
        },
        "preScript": "",
        "action": {
          "issuedRecordStatus": "Active",
          "issuedExpirationStatus": "Active",
          "issuedLPStatus": "A",
          "expirationType": "Function",
          "originationDate": "",
          "expirationPeriod": "",
          "customExpirationFunction": "getStateExpDate",
          "copyComponents": [
            "Custom Fields"
          ]
        },
        "postScript": "POST_LICENSES_TL_RENEWAL_ISSUANCE"
      }
    ]
  },
  "Licenses/Contractor/County/Renewal": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Renews a General Contractor License",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Registration Issuance"
          ],
          "status": [
            "Registration Completed"
          ]
        },
        "preScript": "",
        "action": {
          "issuedRecordStatus": "Active",
          "issuedExpirationStatus": "Active",
          "issuedLPStatus": "A",
          "expirationType": "Function",
          "originationDate": "",
          "expirationPeriod": "",
          "customExpirationFunction": "getCountyExpDate",
          "copyComponents": [
            "Custom Fields"
          ]
        },
        "postScript": "POST_LICENSES_TL_RENEWAL_ISSUANCE"
      }
    ]
  }
}
