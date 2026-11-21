# REST API SPECIFICATION — AcxiomCRM

## 1. API Architecture & Standards
- **Protocol**: HTTP/1.1 and HTTP/2 over TLS (HTTPS).
- **Format**: JSON (`Content-Type: application/json`).
- **Authentication**: JWT Bearer Token / ASP.NET Core Cookie authentication.
- **DTO Decoupling**: Database entities are strictly encapsulated; only strongly-typed Data Transfer Objects (DTOs) are accepted or returned.
- **Error Standard**: RFC 7807 Problem Details for HTTP APIs (`application/problem+json`).

---

## 2. API Endpoints Catalog

### 2.1 Authentication & Token Endpoints
#### `POST /api/auth/login`
- **Description**: Authenticate user credentials and return authentication token / session cookie.
- **Access**: Public (Subject to Rate Limiting: max 5 requests / minute per IP).
- **Request Body**:
  ```json
  {
    "usernameOrEmail": "sales.rep@acxiomcrm.com",
    "password": "Password@123"
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresAt": "2026-11-21T18:30:00Z",
      "user": {
        "userId": "d290f1ee-6c54-4b01-90e6-d701748f0851",
        "userName": "sales.rep",
        "fullName": "Jane Doe",
        "email": "sales.rep@acxiomcrm.com",
        "role": "SalesExecutive"
      }
    }
    ```
  - `400 Bad Request`: Payload validation errors.
  - `401 Unauthorized`: Invalid credentials.
  - `423 Locked`: Account is locked due to repeated failed attempts.

#### `POST /api/auth/logout`
- **Description**: Invalidate authenticated token / session cookie.
- **Access**: Authenticated.
- **Responses**:
  - `200 OK`: `{"message": "Logged out successfully."}`

---

### 2.2 Customer Management Endpoints
#### `GET /api/customers`
- **Description**: List, filter, and paginate customers.
- **Access**: Authorized (Scoped to Role & Assigned Ownership).
- **Query Parameters**:
  - `search` (string): Searches across Name, Email, Phone, Company.
  - `status` (string): `Active`, `Inactive`.
  - `pageNumber` (int, default: 1).
  - `pageSize` (int, default: 10, max: 100).
  - `sortBy` (string, default: `CreatedDate`).
  - `sortOrder` (string, `asc` / `desc`).
- **Responses**:
  - `200 OK`:
    ```json
    {
      "items": [
        {
          "customerId": 101,
          "customerCode": "CUST-2026-0001",
          "customerName": "Acme Industrial Corp",
          "email": "procurement@acme.com",
          "phone": "9876543210",
          "companyName": "Acme Industries",
          "status": "Active",
          "assignedTo": "d290f1ee-6c54-4b01-90e6-d701748f0851",
          "assignedUserName": "Jane Doe",
          "createdDate": "2026-11-21T10:00:00Z"
        }
      ],
      "pageNumber": 1,
      "pageSize": 10,
      "totalCount": 45,
      "totalPages": 5
    }
    ```

#### `GET /api/customers/{id}`
- **Description**: Retrieve complete profile of a single customer.
- **Access**: Authorized.
- **Responses**:
  - `200 OK`: Full `CustomerDetailDto`.
  - `403 Forbidden`: User attempts accessing another sales rep's customer.
  - `404 Not Found`: Customer ID does not exist.

#### `POST /api/customers`
- **Description**: Create a new customer master record.
- **Access**: Authorized (Admin, Manager, SalesExecutive).
- **Request Body**:
  ```json
  {
    "customerName": "Apex Software Solutions",
    "email": "contact@apexsoftware.com",
    "phone": "9876543211",
    "companyName": "Apex Technologies",
    "address": "404 Tech Park, Sector 62",
    "city": "Noida",
    "state": "Uttar Pradesh",
    "status": "Active"
  }
  ```
- **Responses**:
  - `201 Created` with `Location: /api/customers/102`.
  - `400 Bad Request`: Validation failure (invalid phone, blank name).
  - `409 Conflict`: Duplicate Email or Phone already exists in the system.

#### `PUT /api/customers/{id}`
- **Description**: Update an existing customer.
- **Access**: Authorized (Admin, Manager, or Assigned SalesExecutive).
- **Responses**:
  - `200 OK`: Updated `CustomerDto`.
  - `400 Bad Request`: Validation failure.
  - `403 Forbidden`: Unauthorized to modify this customer.
  - `409 Conflict`: New email/phone conflicts with an existing customer.

#### `DELETE /api/customers/{id}`
- **Description**: Soft deactivate an existing customer record.
- **Access**: Authorized (Admin and Manager only; forbidden for SalesExecutive).
- **Responses**:
  - `200 OK`: `{"message": "Customer deactivated successfully."}`
  - `403 Forbidden`: Sales Executive attempting deletion.
  - `404 Not Found`: Customer ID not found.

---

### 2.3 Lead Management Endpoints
#### `GET /api/leads`
- **Description**: List, search, filter, and paginate prospective leads.
- **Access**: Authorized.
- **Query Parameters**: `search`, `status`, `source`, `priority`, `pageNumber`, `pageSize`.
- **Responses**: `200 OK` with paginated `LeadDto` collection.

#### `POST /api/leads`
- **Description**: Create and register a prospective lead.
- **Access**: Authorized.
- **Request Body**:
  ```json
  {
    "leadName": "Robert Vance",
    "email": "robert@vancerefrigeration.com",
    "phone": "9812345678",
    "companyName": "Vance Refrigeration",
    "source": "Website",
    "priority": "High",
    "expectedValue": 50000.00,
    "assignedTo": "d290f1ee-6c54-4b01-90e6-d701748f0851"
  }
  ```
- **Responses**:
  - `201 Created`.
  - `400 Bad Request`: ExpectedValue < 0 or invalid email/phone.

#### `POST /api/leads/{id}/convert`
- **Description**: Convert a qualified lead into Customer and Opportunity records.
- **Access**: Authorized.
- **Responses**:
  - `200 OK`:
    ```json
    {
      "message": "Lead converted successfully.",
      "customerId": 105,
      "opportunityId": 52
    }
    ```
  - `400 Bad Request`: Lead is not in `Qualified` state.
  - `409 Conflict`: Lead is already converted.

---

### 2.4 Opportunity Management Endpoints
#### `GET /api/opportunities`
- **Description**: Query active and historical opportunities with stage and owner filters.
- **Access**: Authorized.
- **Responses**: `200 OK` with `OpportunityDto` collection.

#### `POST /api/opportunities`
- **Description**: Create a new sales opportunity.
- **Access**: Authorized.
- **Request Body**:
  ```json
  {
    "opportunityName": "Cloud Infrastructure Migration",
    "customerId": 101,
    "amount": 150000.00,
    "stage": "Proposal",
    "probability": 60,
    "expectedCloseDate": "2026-12-31T00:00:00Z",
    "source": "Website",
    "notes": "Client requested proposal review by end of month."
  }
  ```
- **Responses**:
  - `201 Created`.
  - `400 Bad Request`:
    - `Amount <= 0`: *"Opportunity Amount must be greater than 0."*
    - `Probability > 100`: *"Probability must be between 0 and 100."*
    - `ExpectedCloseDate < Today`: *"Expected Close Date cannot be in the past."*

---

### 2.5 Follow-Up Management Endpoints
#### `GET /api/followups`
- **Description**: Query scheduled and historical follow-ups.
- **Access**: Authorized.
- **Query Parameters**: `status`, `assignedTo`, `isOverdue` (boolean).
- **Responses**: `200 OK` with `FollowUpDto` collection.

#### `POST /api/followups`
- **Description**: Schedule a future customer/lead follow-up.
- **Access**: Authorized.
- **Request Body**:
  ```json
  {
    "customerId": 101,
    "followUpDate": "2026-11-25T14:30:00Z",
    "followUpType": "Call",
    "subject": "Review proposal pricing and discounts",
    "remarks": "Follow up after board meeting.",
    "assignedTo": "d290f1ee-6c54-4b01-90e6-d701748f0851"
  }
  ```
- **Responses**:
  - `201 Created`.
  - `400 Bad Request`: `followUpDate < Today` -> *"Follow-up date cannot be earlier than today."*

---

### 2.6 Analytical Reporting Endpoints
#### `GET /api/reports/pipeline`
- **Description**: Retrieve stage-wise, owner-wise, and weighted pipeline analytics.
- **Access**: Admin / Manager (or scoped sales executive).
- **Responses**:
  - `200 OK`:
    ```json
    {
      "totalDeals": 18,
      "totalUnweightedValue": 1250000.00,
      "totalWeightedValue": 685000.00,
      "stageSummaries": [
        { "stage": "Qualification", "count": 5, "totalValue": 250000.00, "weightedValue": 50000.00 },
        { "stage": "Proposal", "count": 6, "totalValue": 450000.00, "weightedValue": 225000.00 },
        { "stage": "Negotiation", "count": 4, "totalValue": 350000.00, "weightedValue": 280000.00 },
        { "stage": "Won", "count": 3, "totalValue": 200000.00, "weightedValue": 200000.00 }
      ]
    }
    ```
