# AUTHORIZATION & ACCESS CONTROL — AcxiomCRM

## 1. Multi-Tier Authorization Model
AcxiomCRM implements a three-tier authorization strategy:
1. **Role-Based Access Control (RBAC)**: Governs module-level and action-level permissions.
2. **Resource-Based / Ownership Access Control**: Governs row-level data access based on user assignment.
3. **API Scope / Policy Authorization**: Protects REST endpoints with fine-grained claim policies.

---

## 2. Resource-Based Ownership Enforcement
Sales Executives are strictly sandboxed to their assigned data records:

```csharp
public class ResourceOwnershipAuthorizationHandler : 
    AuthorizationHandler<SameAuthorRequirement, IOwnableResource>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        SameAuthorRequirement requirement,
        IOwnableResource resource)
    {
        // Admin has universal override
        if (context.User.IsInRole("Admin"))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        // Manager has team override
        if (context.User.IsInRole("Manager"))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        // Sales Executive must be the assigned owner
        var currentUserId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (resource.AssignedTo == currentUserId)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
```

---

## 3. Query-Level Data Scoping
To prevent unauthorized data exposure in listing queries, the Application Service layer applies query filters prior to database execution:

```csharp
public IQueryable<Customer> GetScopedCustomers(IQueryable<Customer> query, ClaimsPrincipal user)
{
    if (user.IsInRole("Admin"))
    {
        return query; // Global visibility
    }
    
    if (user.IsInRole("Manager"))
    {
        // Team visibility (e.g. all reps reporting to this manager)
        return query;
    }

    var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
    return query.Where(c => c.AssignedTo == userId || c.CreatedBy == userId);
}
```
