# ERROR HANDLING SPECIFICATION — AcxiomCRM

## 1. Error Handling Philosophy
AcxiomCRM implements a centralized, fault-tolerant error management strategy. The system guarantees that:
- Raw stack traces, database exceptions, and SQL queries are NEVER exposed to client browsers or API consumers.
- All unexpected exceptions are caught, logged with correlation IDs, and transformed into user-friendly responses.

---

## 2. MVC Exception Handling
- **Environment Differentiation**:
  - In `Development`: Detailed developer exception page (`app.UseDeveloperExceptionPage()`) enabled for rapid debugging.
  - In `Production`: Global exception handler middleware (`app.UseExceptionHandler("/Home/Error")`) redirects to a polished, branded error view displaying a unique `CorrelationId`.
- **HTTP Status Code Pages**:
  - `app.UseStatusCodePagesWithReExecute("/Home/Error/{0}")` gracefully handles 404 Not Found and 403 Forbidden scenarios.

---

## 3. REST API Error Handling (RFC 7807)
All API controllers inherit or utilize the `ApiExceptionFilter` which serializes exceptions into RFC 7807 Problem Details:

```json
{
  "type": "https://acxiomcrm.com/errors/validation-error",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "detail": "Opportunity Amount must be greater than 0.",
  "instance": "/api/opportunities",
  "traceId": "00-5847e098485-b9087-00"
}
```
