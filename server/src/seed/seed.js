const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Opportunity = require('../models/Opportunity');
const FollowUp = require('../models/FollowUp');
const Activity = require('../models/Activity');
const AuditLog = require('../models/AuditLog');

dotenv.config({ path: __dirname + '/../../.env' });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/AcxiomCrmDb';
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB for seeding: ${mongoUri}`);

    // Clear existing collections
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Lead.deleteMany({});
    await Opportunity.deleteMany({});
    await FollowUp.deleteMany({});
    await Activity.deleteMany({});
    // Keep AuditLog empty or record seed initialization
    await AuditLog.collection.drop().catch(() => {});

    console.log('Cleared existing CRM collections.');

    // 1. Seed Users
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@acxiomcrm.com',
      password: 'Admin@12345',
      role: 'Admin',
      isActive: true
    });

    const managerUser = await User.create({
      name: 'Sarah Jenkins',
      email: 'manager@acxiomcrm.com',
      password: 'Manager@12345',
      role: 'Manager',
      isActive: true
    });

    const salesUser = await User.create({
      name: 'Alex Rivera',
      email: 'sales@acxiomcrm.com',
      password: 'Sales@12345',
      role: 'SalesExecutive',
      isActive: true
    });

    console.log('Seeded Users: Admin, Manager, SalesExecutive.');

    // 2. Seed Customers
    const customer1 = await Customer.create({
      customerCode: 'CUST-2026-0001',
      customerName: 'Acme Industrial Technologies',
      email: 'procurement@acmeind.com',
      phone: '9876543210',
      companyName: 'Acme Industries',
      address: 'Plot 42, Sector 18',
      city: 'Gurugram',
      state: 'Haryana',
      status: 'Active',
      assignedTo: salesUser._id,
      createdBy: adminUser._id
    });

    const customer2 = await Customer.create({
      customerCode: 'CUST-2026-0002',
      customerName: 'Apex Cloud Solutions',
      email: 'contact@apexcloud.io',
      phone: '9876543211',
      companyName: 'Apex Cloud Inc.',
      address: 'Tower B, Cyber Park',
      city: 'Noida',
      state: 'Uttar Pradesh',
      status: 'Active',
      assignedTo: salesUser._id,
      createdBy: salesUser._id
    });

    const customer3 = await Customer.create({
      customerCode: 'CUST-2026-0003',
      customerName: 'Global Dynamics Corp',
      email: 'info@globaldynamics.org',
      phone: '9876543212',
      companyName: 'Global Dynamics',
      address: 'Level 5, UB City',
      city: 'Bengaluru',
      state: 'Karnataka',
      status: 'Active',
      assignedTo: managerUser._id,
      createdBy: managerUser._id
    });

    console.log('Seeded 3 Customer master records.');

    // 3. Seed Leads
    const lead1 = await Lead.create({
      leadCode: 'LEAD-2026-0001',
      leadName: 'Robert Vance',
      email: 'robert@vancerefrig.com',
      phone: '9811122233',
      companyName: 'Vance Refrigeration',
      source: 'Website',
      status: 'New',
      priority: 'High',
      expectedValue: 45000,
      notes: 'Requested urgent demo of CRM reporting engine.',
      assignedTo: salesUser._id
    });

    const lead2 = await Lead.create({
      leadCode: 'LEAD-2026-0002',
      leadName: 'Elena Rostova',
      email: 'elena@rostovatech.com',
      phone: '9822233344',
      companyName: 'Rostova Tech',
      source: 'Referral',
      status: 'Contacted',
      priority: 'Medium',
      expectedValue: 75000,
      notes: 'Initial call completed. Requested custom proposal.',
      assignedTo: salesUser._id
    });

    const lead3 = await Lead.create({
      leadCode: 'LEAD-2026-0003',
      leadName: 'David Chen',
      email: 'david@chenlogistics.com',
      phone: '9833344455',
      companyName: 'Chen Logistics',
      source: 'Cold Call',
      status: 'Qualified',
      priority: 'Urgent',
      expectedValue: 120000,
      notes: 'BANT criteria verified. Ready for conversion.',
      assignedTo: salesUser._id
    });

    console.log('Seeded 3 Leads.');

    // 4. Seed Opportunities
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);

    const nextFortnight = new Date();
    nextFortnight.setDate(nextFortnight.getDate() + 15);

    const nextQuarter = new Date();
    nextQuarter.setDate(nextQuarter.getDate() + 60);

    const opp1 = await Opportunity.create({
      opportunityName: 'Enterprise Cloud Migration',
      customerId: customer1._id,
      amount: 250000,
      stage: 'Proposal',
      probability: 60,
      expectedCloseDate: nextMonth,
      status: 'Open',
      source: 'Website',
      notes: 'Commercial review pending.',
      assignedTo: salesUser._id
    });

    const opp2 = await Opportunity.create({
      opportunityName: 'ERP Integration Suite',
      customerId: customer2._id,
      amount: 180000,
      stage: 'Negotiation',
      probability: 80,
      expectedCloseDate: nextFortnight,
      status: 'Open',
      source: 'Referral',
      notes: 'Final contract terms under legal review.',
      assignedTo: salesUser._id
    });

    const opp3 = await Opportunity.create({
      opportunityName: 'Security Infrastructure Upgrade',
      customerId: customer3._id,
      amount: 320000,
      stage: 'Qualification',
      probability: 20,
      expectedCloseDate: nextQuarter,
      status: 'Open',
      source: 'Cold Call',
      notes: 'Evaluating budget approval.',
      assignedTo: managerUser._id
    });

    const opp4 = await Opportunity.create({
      opportunityName: 'Legacy System Modernization',
      customerId: customer1._id,
      amount: 150000,
      stage: 'Won',
      probability: 100,
      expectedCloseDate: new Date(),
      status: 'Won',
      source: 'Existing Client',
      notes: 'Deal closed and signed.',
      assignedTo: salesUser._id
    });

    console.log('Seeded 4 Opportunities.');

    // 5. Seed Follow-ups (Anti-backdating: dates in future)
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 3);

    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 5);

    await FollowUp.create({
      customerId: customer1._id,
      opportunityId: opp1._id,
      followUpDate: futureDate1,
      followUpType: 'Call',
      subject: 'Review proposal pricing & licensing options',
      remarks: 'Call with CTO and Procurement Head.',
      status: 'Planned',
      assignedTo: salesUser._id
    });

    await FollowUp.create({
      leadId: lead2._id,
      followUpDate: futureDate2,
      followUpType: 'Meeting',
      subject: 'Product walkthrough & architecture discussion',
      remarks: 'Present slide deck & live sandbox demo.',
      status: 'Planned',
      assignedTo: salesUser._id
    });

    console.log('Seeded Follow-Ups with future dates.');

    // 6. Seed Activities
    await Activity.create({
      activityType: 'Call',
      subject: 'Introductory Discovery Call',
      description: 'Discussed high-level requirements and team size.',
      activityDate: new Date(),
      customerId: customer1._id,
      assignedTo: salesUser._id,
      status: 'Completed'
    });

    await Activity.create({
      activityType: 'Email',
      subject: 'Sent Technical Whitepaper & Overview',
      description: 'Shared PDF documentation and architecture diagrams.',
      activityDate: new Date(),
      leadId: lead1._id,
      assignedTo: salesUser._id,
      status: 'Completed'
    });

    console.log('Seeded Activities.');

    // 7. Seed Initial Audit Logs
    await AuditLog.create({
      userId: adminUser._id,
      action: 'Create',
      entityName: 'System',
      recordId: 'INIT',
      details: 'Database initialized and seeded with baseline dataset.',
      ipAddress: '127.0.0.1'
    });

    console.log('Database seeding successfully finished!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
