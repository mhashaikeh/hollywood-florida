{
  "ApplicationSubmitBefore": {
    "StandardScripts": [
      "STDBASE_RECORD_VALIDATION"
    ]
  },
  "ApplicationSubmitAfter": {
    "StandardScripts": [
      "STDBASE_ENFORCEMENT_AUTOMATION",
      "STDBASE_COPY_RECORD_DATA",
      "STDBASE_INSPECTION_SCHEDULING"
    ]
  },
    "WorkflowTaskUpdateBefore": {
    "StandardScripts": [
      "STDBASE_RECORD_VALIDATION"
    ]
  },
  "WorkflowTaskUpdateAfter": {
    "StandardScripts": [
      "STDBASE_RECORD_AUTOMATION",
      "STDBASE_SEND_CONTACT_EMAILS",
      "STDBASE_LICENSE_RENEWAL_ISSUANCE"
    ]
  },
  "InspectionResultSubmitAfter": {
    "StandardScripts": [
      "STDBASE_INSPECTION_AUTOMATION",
      "STDBASE_ENFORCEMENT_AUTOMATION"
    ]
  },
  "InspectionScheduleAfter": {
    "StandardScripts": [
      "STDBASE_INSPECTION_AUTOMATION"
    ]
  },
  "V360InspectionResultSubmitAfter": {
    "StandardScripts": [
      "STDBASE_INSPECTION_AUTOMATION",
      "STDBASE_ENFORCEMENT_AUTOMATION"
    ]
  }
}