# DATABASE SCHEMA SPECIFICATION (MongoDB Mongoose) — AcxiomCRM

## 1. MongoDB Collections Overview
The AcxiomCRM data model leverages MongoDB collections with strict Mongoose schema validation, indexes, and referential integrity:

1. `users`: Stores user credentials, hashed passwords (bcrypt), assigned role (`Admin`, `Manager`, `SalesExecutive`), `failedLoginCount`, `lockoutEnd`, and `isActive`.
2. `customers`: Stores customer accounts (`customerCode`, `customerName`, `email`, `phone`, `companyName`, `address`, `city`, `state`, `status`, `assignedTo`, `createdBy`). Unique indexes on `email` and `phone`.
3. `leads`: Prospective clients (`leadCode`, `leadName`, `email`, `phone`, `companyName`, `source`, `status`, `priority`, `expectedValue`, `assignedTo`).
4. `opportunities`: Deals in progress (`opportunityName`, `customerId`, `leadId`, `amount`, `stage`, `probability`, `expectedCloseDate`, `status`, `assignedTo`). Validations: `amount > 0`, `0 <= probability <= 100`, `expectedCloseDate >= today`.
5. `followups`: Touchpoints (`customerId`, `leadId`, `followUpDate`, `followUpType`, `subject`, `remarks`, `status`, `assignedTo`). Validation: `followUpDate >= today` for new/planned.
6. `activities`: Interaction log (`activityType`, `subject`, `description`, `activityDate`, `customerId`, `leadId`, `assignedTo`, `status`).
7. `auditlogs`: Append-only security and data change log (`userId`, `action`, `entityName`, `recordId`, `oldValue`, `newValue`, `createdAt`, `ipAddress`).
