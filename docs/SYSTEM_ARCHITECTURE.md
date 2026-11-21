# SYSTEM ARCHITECTURE (MERN) — AcxiomCRM

## 1. Architectural Philosophy
AcxiomCRM follows a decoupled **MERN (MongoDB, Express, React, Node.js)** layered architecture ensuring modularity, security, and independent client-server evolvability:

```
+-------------------------------------------------------------------+
|                        PRESENTATION LAYER                         |
|  - React 18 SPA (Vite, Bootstrap 5, Chart.js, React Router)       |
|  - Role-Based Protected Routes (<AdminRoute />, <ManagerRoute />) |
|  - Client-side Form Validation (React Hook Form + Yup)            |
+-------------------------------------------------------------------+
                                  |
                           HTTPS REST APIs
                                  |
                                  v
+-------------------------------------------------------------------+
|                        APPLICATION LAYER                          |
|  - Express.js Controllers (Customer, Lead, Opportunity, Auth)     |
|  - Application Services (Business workflows, Lead Conversion)     |
|  - Input Validation Middleware (Joi / express-validator)         |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                     DOMAIN / BUSINESS LAYER                       |
|  - Core CRM Rules (Amount > 0, Probability 0-100, Date >= Today)   |
|  - Weighted Pipeline Calculation: (Amount * Prob) / 100           |
|  - Lead State Transition Finite State Machine                     |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                     DATA ACCESS & PERSISTENCE                     |
|  - Mongoose ODM Models & Schemas                                  |
|  - Append-Only Audit Interceptor Plugin                           |
|  - MongoDB Collections with Unique Indexes & Transactions         |
+-------------------------------------------------------------------+
                                  |
   =================================================================
   CROSS-CUTTING CONCERNS:
   - JWT Auth & HTTP-Only Secure Cookies
   - Role-Based Authorization Middleware (isAdmin, isManager, isOwner)
   - Helmet & CORS Security Headers
   - Winston Structured Logging (Zero Secret Leakage)
   - Centralized RFC 7807 Error Handling Middleware
   =================================================================
```
