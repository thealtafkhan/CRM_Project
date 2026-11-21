# PRODUCTION DEPLOYMENT GUIDE — AcxiomCRM

## 1. Production Build Preparation
To generate an optimized, release-mode publication package:

```powershell
dotnet publish src/AcxiomCrm.Web/AcxiomCrm.Web.csproj -c Release -o ./publish /p:UseAppHost=true
```

---

## 2. Production Security Checklist
- [ ] Enforce HTTPS redirection and HTTP Strict Transport Security (HSTS).
- [ ] Ensure `ASPNETCORE_ENVIRONMENT` is set to `Production`.
- [ ] Replace default database connection strings and JWT signing secrets with production environment variables.
- [ ] Confirm detailed exception pages are disabled (`app.UseExceptionHandler("/Home/Error")` active).
- [ ] Confirm anti-forgery protection and secure cookie policies are active.
