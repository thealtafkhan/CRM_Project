# MAINTENANCE & OPERATIONS GUIDE — AcxiomCRM

## 1. Routine Maintenance Tasks
- **Database Backups**: Schedule daily differential and weekly full backups of the relational database.
- **Audit Log Archival**: The `AuditLogs` table is append-only. After 12 months of live retention, execute cold partition archiving to keep operational queries sub-second.
- **Lockout Monitoring**: Periodically inspect locked accounts in the User Administration panel to assist legitimate users encountering lockout.

---

## 2. Troubleshooting & Diagnostics
- **Log Inspection**: Inspect Serilog daily application logs located at `/logs/acxiomcrm-.log`.
- **Health Checks**: Access `/health` endpoint to verify database connectivity and runtime responsiveness.
