{
  "Licenses/*/*/Renewal": {
    "ApplicationSubmitAfter": [
      {
        "metadata": {
          "description": "Copy data from License to Renewal",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "recordType": "Licenses/*/*/License"
        },
        "action": {
          "Renewal": true,
          "usageType": "copyFromParent",
          "CONTACTS": [
            "ALL"
          ],
          "ASI": [],
          "ASIT": [
            "ALL"
          ],
          "CONDITIONS": [
            "ALL"
          ],
          "ADDRESS": [],
          "keepExistingAPO": false,
          "RECORDDETAILS": true,
          "RECORDNAME": true,
          "PARCEL": false,
          "OWNER": false,
          "ADDITIONALINFO": false,
          "EDUCATION": false,
          "CONTEDUCATION": false,
          "EXAM": false,
          "DOCUMENT": false
        },
        "postScript": "POST_LICENSES_COPY_RECORD_DATA"
      }
    ]
  },
  "Licenses/Amendment/NA/NA": {
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Copy License Amendment Qualifier on Workflow Task Modification Review - Status Modification Request Approved",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Modification Review"
          ],
          "status": [
            "Modification Request Approved"
          ],
          "recordType": "Licenses/*/*/License"
        },
        "action": {
          "usageType": "copyToParent",
          "Renewal": false,
          "CONTACTS": [],
          "ASI": [
            "ALL"
            ],
          "ASIT": [],
          "CONDITIONS": [],
          "ADDRESS": [],
          "LICENSEDPROFESSIONALS": [],
          "ASSETS": [],
          "keepExistingAPO": false,
          "RECORDDETAILS": false,
          "RECORDNAME": false,
          "PARCEL": false,
          "OWNER": false,
          "ADDITIONALINFO": false,
          "EDUCATION": true,
          "CONTEDUCATION": true,
          "EXAM": true,
          "DOCUMENT": false
        },
        "postScript": "POST_LIC_AMEND_LP_UPDATES"
      }
    ]
  }
}