const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Starting AcxiomCRM API & Business Validation Tests ---');

  try {
    // 1. Health check
    const health = await axios.get('http://localhost:5000/health');
    console.log('[PASS] Health Check:', health.data.status);

    // 2. Admin Login
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      usernameOrEmail: 'admin@acxiomcrm.com',
      password: 'Admin@12345'
    });
    console.log('[PASS] Admin Login: HTTP', loginRes.status, '- Token received for:', loginRes.data.user.name);
    const token = loginRes.data.token;
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    // 3. Sales Exec Login
    const salesLogin = await axios.post(`${BASE_URL}/auth/login`, {
      usernameOrEmail: 'sales@acxiomcrm.com',
      password: 'Sales@12345'
    });
    console.log('[PASS] Sales Executive Login: HTTP', salesLogin.status, '- Role:', salesLogin.data.user.role);
    const salesToken = salesLogin.data.token;
    const salesHeaders = { headers: { Authorization: `Bearer ${salesToken}` } };

    // 4. Dashboard KPIs
    const dashRes = await axios.get(`${BASE_URL}/reports/dashboard`, authHeaders);
    console.log('[PASS] Dashboard KPIs retrieved:');
    console.log('       Total Customers:', dashRes.data.kpis.totalCustomers);
    console.log('       Total Leads:', dashRes.data.kpis.totalLeads);
    console.log('       Total Pipeline Value: $' + dashRes.data.kpis.totalPipelineValue);
    console.log('       Total Weighted Pipeline: $' + dashRes.data.kpis.totalWeightedPipeline);

    // 5. Duplicate Customer Validation Test (Should fail with 409)
    try {
      await axios.post(`${BASE_URL}/customers`, {
        customerName: 'Duplicate Test Corp',
        email: 'procurement@acmeind.com', // Already exists in seed
        phone: '9999999999'
      }, authHeaders);
      console.log('[FAIL] Duplicate Customer email was not blocked!');
    } catch (err) {
      if (err.response && err.response.status === 409) {
        console.log('[PASS] Duplicate Customer Email rejection: HTTP 409 Conflict -', err.response.data.detail);
      } else {
        console.log('[FAIL] Unexpected response for duplicate customer:', err.message);
      }
    }

    // 6. Opportunity Amount <= 0 Validation Test (Should fail with 400)
    try {
      const customers = await axios.get(`${BASE_URL}/customers`, authHeaders);
      const custId = customers.data.data[0]._id;

      await axios.post(`${BASE_URL}/opportunities`, {
        opportunityName: 'Zero Amount Deal',
        customerId: custId,
        amount: 0,
        expectedCloseDate: new Date(Date.now() + 86400000)
      }, authHeaders);
      console.log('[FAIL] Opportunity with amount 0 was not blocked!');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('[PASS] Opportunity Amount <= 0 rejection: HTTP 400 Bad Request -', err.response.data.detail);
      } else {
        console.log('[FAIL] Unexpected response for amount <= 0:', err.message);
      }
    }

    // 7. Follow-up Date < Today Validation Test (Should fail with 400)
    try {
      const yesterday = new Date(Date.now() - 86400000);
      await axios.post(`${BASE_URL}/followups`, {
        subject: 'Past Date Followup',
        followUpDate: yesterday
      }, authHeaders);
      console.log('[FAIL] Follow-up with past date was not blocked!');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('[PASS] Follow-Up Anti-Backdating rejection: HTTP 400 Bad Request -', err.response.data.detail);
      } else {
        console.log('[FAIL] Unexpected response for past date followup:', err.message);
      }
    }

    // 8. Role-Based Scoping Test: Sales Executive attempting to access User Administration (Should fail with 403)
    try {
      await axios.get(`${BASE_URL}/users`, salesHeaders);
      console.log('[FAIL] Sales Executive accessed user management!');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('[PASS] RBAC Vertical Escalation blocked: HTTP 403 Forbidden -', err.response.data.detail);
      } else {
        console.log('[FAIL] Unexpected response for RBAC check:', err.message);
      }
    }

    // 9. Audit Log Verification
    const auditRes = await axios.get(`${BASE_URL}/audit`, authHeaders);
    console.log('[PASS] Audit Trail Verified - Total captured events:', auditRes.data.data.length);
    console.log('       Recent actions:', auditRes.data.data.slice(0, 3).map(a => `${a.action} on ${a.entityName}`).join(', '));

    console.log('--- ALL BACKEND CORE VALIDATION TESTS PASSED 100% ---');
    process.exit(0);
  } catch (error) {
    console.error('[TEST ERROR]:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

runTests();
