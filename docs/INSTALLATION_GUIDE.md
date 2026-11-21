# INSTALLATION & LOCAL DEVELOPMENT GUIDE — AcxiomCRM

## 1. Prerequisites
- **.NET SDK**: .NET 8.0 or 9.0 SDK installed (`dotnet --version`).
- **Database Engine**: Microsoft SQL Server / LocalDB or SQLite (built-in).
- **IDE**: Visual Studio 2022 / VS Code with C# Dev Kit.
- **Version Control**: Git.

---

## 2. Step-by-Step Setup
1. **Clone / Open Workspace**:
   ```powershell
   cd d:\Projects\CRM
   ```

2. **Restore Dependencies**:
   ```powershell
   dotnet restore
   ```

3. **Configure Connection String**:
   Review `src/AcxiomCrm.Web/appsettings.json` or configure local environment:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=AcxiomCrmDb;Trusted_Connection=True;MultipleActiveResultSets=true"
   }
   ```

4. **Apply Database Migrations & Seed Initial Data**:
   ```powershell
   dotnet ef database update --project src/AcxiomCrm.Infrastructure --startup-project src/AcxiomCrm.Web
   ```

5. **Run Application**:
   ```powershell
   dotnet run --project src/AcxiomCrm.Web
   ```
   Open browser at: `https://localhost:5001` or `http://localhost:5000`.

---

## 3. Default Seed Credentials
| Role | Username / Email | Default Password |
|---|---|---|
| **Administrator** | `admin@acxiomcrm.com` | `Admin@12345` |
| **Sales Manager** | `manager@acxiomcrm.com` | `Manager@12345` |
| **Sales Executive** | `sales@acxiomcrm.com` | `Sales@12345` |
