{
  "Licenses/Contractor/State/Application": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Issues a General Contractor License",
          "operators": {}
        },
        "preScript": "PRE_LICENSES_TL_LICENSE_ISSUANCE",
        "criteria": {
          "task": [
            "Registration Issuance"
          ],
          "status": [
            "Registration Completed"
          ]
        },
        "action": {
          "parentLicense": "Licenses/Contractor/State/License",
          "issuedStatus": "Active",
          "copyCustomFields": [
            "ALL"
          ],
          "copyCustomTables": [
            "ALL"
          ],
          "copyContacts": [
            "ALL"
          ],
          "expirationType": "Function",
          "customExpirationFunction": "getStateExpDate",
          "expirationPeriod": "",
          "refLPType": "",
          "applyASIASLPNumber": "",
          "contactType": "Qualifying Individual",
          "contactAddressType": "Business",
          "createLP": false,
          "licenseTable": "",
          "childLicense": "",
          "recordIdField": "State License Number"
        },
        "postScript": "POST_LICENSES_TL_LICENSE_ISSUANCE"
      }
    ]
  },
    "Licenses/Contractor/County/Application": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Issues a General Contractor License",
          "operators": {}
        },
        "preScript": "PRE_LICENSES_TL_LICENSE_ISSUANCE",
        "criteria": {
          "task": [
            "Registration Issuance"
          ],
          "status": [
            "Registration Completed"
          ]
        },
        "action": {
          "parentLicense": "Licenses/Contractor/County/License",
          "issuedStatus": "Active",
          "copyCustomFields": [
            "ALL"
          ],
          "copyCustomTables": [
            "ALL"
          ],
          "copyContacts": [
            "ALL"
          ],
          "expirationType": "Function",
          "customExpirationFunction": "getCountyExpDate",
          "expirationPeriod": "",
          "refLPType": "",
          "applyASIASLPNumber": "",
          "contactType": "Qualifying Individual",
          "contactAddressType": "Business",
          "createLP": false,
          "licenseTable": "",
          "childLicense": "",
          "recordIdField": "County License Number"
        },
        "postScript": "POST_LICENSES_TL_LICENSE_ISSUANCE"
      }
    ]
  }
}