# PROJECT STRUCTURE & DIRECTORY LAYOUT (MERN) — AcxiomCRM

```
d:\Projects\CRM\
│
├── docs/                                # Complete Architecture & Governance Documentation
│   ├── README.md
│   ├── REQUIREMENTS.md
│   ├── TECH_STACK.md
│   └── ... (37 specification files)
│
├── server/                              # Node.js + Express.js Backend API
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                    # MongoDB Mongoose connection
│   │   │   └── config.js                # Environment variables & constants
│   │   ├── models/
│   │   │   ├── User.js                  # User schema with lockout, bcrypt, roles
│   │   │   ├── Role.js                  # Role definitions
│   │   │   ├── Customer.js              # Customer schema with email/phone uniqueness
│   │   │   ├── Lead.js                  # Lead schema with status workflows
│   │   │   ├── Opportunity.js           # Opportunity with Amount > 0, close date >= today
│   │   │   ├── FollowUp.js              # Follow-up with anti-backdating check
│   │   │   ├── Activity.js              # Call, Meeting, Email, Task schema
│   │   │   └── AuditLog.js              # Append-only audit trail schema
│   │   ├── middlewares/
│   │   │   ├── auth.js                  # JWT verification & cookie parsing
│   │   │   ├── rbac.js                  # Role & ownership authorization
│   │   │   ├── validate.js              # Joi / express-validator middleware
│   │   │   ├── audit.js                 # Audit logging interceptor
│   │   │   └── errorHandler.js          # Centralized error handler (RFC 7807)
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── customerController.js
│   │   │   ├── leadController.js
│   │   │   ├── opportunityController.js
│   │   │   ├── followUpController.js
│   │   │   ├── activityController.js
│   │   │   ├── userController.js
│   │   │   ├── auditController.js
│   │   │   └── reportController.js
│   │   ├── services/
│   │   │   ├── leadConversionService.js # Atomic lead -> customer + opp conversion
│   │   │   └── pipelineService.js       # Weighted pipeline calculations
│   │   ├── seed/
│   │   │   └── seed.js                  # Database seeder (Roles, Admin, Samples)
│   │   ├── server.js                    # Express app entrypoint
│   │   └── package.json
│   └── .env.example
│
├── client/                              # React.js + Vite Frontend Application
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axiosClient.js           # Axios instance with interceptors
│   │   │   └── authApi.js, etc.
│   │   ├── components/
│   │   │   ├── common/                  # Navbar, Sidebar, Footer, Alerts, Modals
│   │   │   ├── guards/                  # ProtectedRoute, RoleGuard
│   │   │   └── dashboard/               # MetricCards, ChartWidgets
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx          # User state, login, logout, roles
│   │   ├── pages/
│   │   │   ├── auth/Login.jsx
│   │   │   ├── dashboard/Dashboard.jsx
│   │   │   ├── customers/
│   │   │   ├── leads/
│   │   │   ├── opportunities/
│   │   │   ├── followups/
│   │   │   ├── activities/
│   │   │   ├── users/
│   │   │   ├── audit/
│   │   │   └── reports/
│   │   ├── styles/
│   │   ├── App.jsx                      # Routing table
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```
