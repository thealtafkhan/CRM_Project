# ENVIRONMENT VARIABLES & CONFIGURATION — AcxiomCRM

## 1. Required Configuration Variables
The application consumes the following configuration keys from `appsettings.json` or OS Environment Variables:

| Variable Name | Description | Default / Example Value |
|---|---|---|
| `ConnectionStrings__DefaultConnection` | Database connection string | `Server=(localdb)\mssqllocaldb;Database=AcxiomCrmDb;...` |
| `JwtSettings__SecretKey` | Cryptographic secret key for signing API JWTs | Minimum 256-bit cryptographically secure string |
| `JwtSettings__Issuer` | API JWT Issuer identifier | `https://acxiomcrm.com` |
| `JwtSettings__Audience` | API JWT Audience identifier | `https://acxiomcrm.com/api` |
| `SecurityPolicy__LockoutMaxFailedAttempts`| Max failed attempts before lockout | `5` |
| `SecurityPolicy__LockoutDurationMinutes` | Duration of account lockout in minutes | `15` |
| `Logging__LogLevel__Default` | Application logging threshold | `Information` |
