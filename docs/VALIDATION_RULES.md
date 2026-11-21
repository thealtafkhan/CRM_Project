# VALIDATION RULES SPECIFICATION — AcxiomCRM

## 1. Validation Architecture
Validation is implemented across three discrete boundaries:
1. **Client-Side Validation**: Immediate, non-blocking UI feedback powered by HTML5 data attributes and jQuery Unobtrusive Validation.
2. **Server-Side Model Validation**: Enforced via ASP.NET Core `ModelState` and Data Annotations / FluentValidation prior to executing controller logic.
3. **Domain Business Invariant Validation**: Enforced inside domain entities and application services to protect database integrity.

---

## 2. Business Validation Rules Catalog

| Entity | Field / Rule | Validation Constraint | Error Message |
|---|---|---|---|
| **Customer** | CustomerName | Required, Max length 150 chars | *"Customer Name is required and cannot exceed 150 characters."* |
| **Customer** | Email | Required, Valid Email regex pattern, Unique in DB | *"A valid, unique email address is required."* |
| **Customer** | Phone | Required, Valid phone format (10-15 digits), Unique in DB | *"A valid, unique phone number is required."* |
| **Customer** | Duplicate Check | Name + Company combination must be unique | *"A customer with this name and company already exists."* |
| **Lead** | LeadName | Required, Max length 150 chars | *"Lead Name is required."* |
| **Lead** | Email | Required, Valid email pattern | *"Enter a valid email address."* |
| **Lead** | Phone | Required, Valid phone pattern | *"Enter a valid phone number."* |
| **Lead** | ExpectedValue | Numeric, Must be >= 0 | *"Expected value cannot be negative."* |
| **Lead** | Status Workflow | Transitions must follow defined state progression | *"Invalid status transition from {Current} to {Target}."* |
| **Opportunity**| OpportunityName| Required, Max length 200 chars | *"Opportunity Name is required."* |
| **Opportunity**| Amount | Numeric, Must be > 0 for active opportunities | *"Opportunity Amount must be greater than 0."* |
| **Opportunity**| Probability | Integer between 0 and 100 inclusive | *"Probability must be between 0 and 100."* |
| **Opportunity**| ExpectedCloseDate| Date >= `DateTime.UtcNow.Date` for active deals | *"Expected Close Date cannot be in the past."* |
| **Follow-Up** | FollowUpDate | Date >= `DateTime.UtcNow.Date` for new/planned | *"Follow-up date cannot be earlier than today."* |
| **Follow-Up** | Subject | Required, Max length 200 chars | *"Follow-up Subject is required."* |
| **Follow-Up** | AssignedTo | Required, Must be a valid active user | *"Assigned user is required."* |
| **Activity** | ActivityDate | Required, Valid timestamp | *"Activity date is required."* |
| **Activity** | Subject | Required, Max length 200 chars | *"Activity Subject is required."* |
