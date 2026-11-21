# AUTHENTICATION SPECIFICATION — AcxiomCRM

## 1. Authentication Mechanisms
AcxiomCRM supports dual authentication channels:
1. **Web Portal Session Authentication**: Cookie-based authentication managed by ASP.NET Core Identity.
2. **REST API Authentication**: Stateless JSON Web Token (JWT) Bearer authentication.

---

## 2. Cookie Authentication Architecture
- **Cookie Name**: `.AcxiomCRM.Auth`
- **Security Attributes**:
  - `HttpOnly = true` (Inaccessible to client-side JavaScript, defeating session hijacking).
  - `SameSite = SameSiteMode.Lax` (Protects against CSRF while permitting top-level navigation).
  - `SecurePolicy = CookieSecurePolicy.Always` (Transmitted only over HTTPS).
  - `ExpireTimeSpan = TimeSpan.FromMinutes(60)`
  - `SlidingExpiration = true` (Renews active user sessions).

---

## 3. Login Workflow
1. User submits Username/Email and Password to `POST /Account/Login`.
2. Controller passes credentials to `SignInManager.PasswordSignInAsync`:
   - Checks if user exists. If non-existent, logs security audit and returns generic error.
   - Checks if user is locked out (`IsLockedOutAsync`). If true, returns lockout view.
   - Checks if user account is active (`user.IsActive`). If false, rejects with *"Account is deactivated."*
   - Verifies password hash.
   - If password incorrect: increments `AccessFailedCount`, audits failed attempt, and returns generic error.
   - If password correct: resets `AccessFailedCount` to 0, issues auth cookie, audits successful login, and redirects to `/Dashboard`.

---

## 4. Password Reset & Administration
- Self-service password change: Authenticated users can update their password provided they supply their current valid password.
- Administrative reset: Admins can trigger a temporary password reset for users who forget their credentials, forcing a password change on next login.
