# CODING STANDARDS & BEST PRACTICES — AcxiomCRM

## 1. C# & .NET Standards
- **Naming Conventions**:
  - PascalCase for Class, Interface, Method, Property, and Enum names (`CustomerService`, `ICustomerRepository`).
  - camelCase with underscore prefix for private fields (`_customerRepository`, `_logger`).
  - camelCase for local variables and parameters (`customerId`, `opportunityAmount`).
  - UPPERCASE for constants (`MAX_LOGIN_ATTEMPTS`).
- **Async/Await Everywhere**: All I/O operations (database access, file operations) must be asynchronously implemented using `async Task<T>` and `await` with proper cancellation tokens.
- **Nullable Reference Types**: Codebase compiles with `<Nullable>enable</Nullable>`. No unchecked null dereferences allowed.

---

## 2. Architectural Rules
- Controllers must remain thin, delegating all domain logic to Application Services.
- Repositories must return `IQueryable` / `IEnumerable` models; raw SQL querying is strictly restricted to designated migration scripts.
- Every state mutation must trigger an audit event.
