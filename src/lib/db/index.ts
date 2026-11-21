import { readDb, writeDb } from './store';
import {
  User,
  Organization,
  OrganizationMember,
  CompanyProfile,
  Buyer,
  Product,
  BaseDocument,
  Shipment,
  PaymentRecord,
  Notification,
  SupportTicket,
  Announcement,
  PlatformRevenueRecord,
  AdminAuditLog,
  PlatformActivity,
  UserRole,
} from '@/types';
import { roundToTwo, safeAdd } from '@/lib/utils';

// ================= USER REPOSITORY =================
export const userRepo = {
  async findById(id: string): Promise<User | null> {
    const db = readDb();
    return db.users.find((u) => u.id === id) || null;
  },

  async findByEmail(email: string): Promise<User | null> {
    const db = readDb();
    const cleanEmail = email.trim().toLowerCase();
    return db.users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  },

  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const db = readDb();
    const newUser: User = {
      ...user,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    writeDb(db);
    return newUser;
  },

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const db = readDb();
    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    db.users[index] = {
      ...db.users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeDb(db);
    return db.users[index];
  },

  async listAll(): Promise<User[]> {
    const db = readDb();
    return db.users;
  },
};

// ================= ORGANIZATION REPOSITORY =================
export const orgRepo = {
  async findById(id: string): Promise<Organization | null> {
    const db = readDb();
    return db.organizations.find((o) => o.id === id) || null;
  },

  async getMember(orgId: string, userId: string): Promise<OrganizationMember | null> {
    const db = readDb();
    return (
      db.organizationMembers.find(
        (m) => m.organizationId === orgId && m.userId === userId && m.status === 'active'
      ) || null
    );
  },

  async listByUser(userId: string): Promise<Organization[]> {
    const db = readDb();
    const memberOrgs = db.organizationMembers
      .filter((m) => m.userId === userId && m.status === 'active')
      .map((m) => m.organizationId);
    return db.organizations.filter((o) => memberOrgs.includes(o.id));
  },

  async create(
    data: { name: string; businessType: string; country: string; ownerId: string },
    userEmail: string,
    userName: string
  ): Promise<{ organization: Organization; profile: CompanyProfile }> {
    const db = readDb();
    const orgId = `org_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const organization: Organization = {
      id: orgId,
      name: data.name,
      slug: data.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      ownerId: data.ownerId,
      country: data.country,
      businessType: data.businessType,
      createdAt: now,
      updatedAt: now,
    };

    const member: OrganizationMember = {
      id: `mem_${Date.now()}`,
      organizationId: orgId,
      userId: data.ownerId,
      role: 'owner',
      userEmail,
      userName,
      status: 'active',
      joinedAt: now,
    };

    const profile: CompanyProfile = {
      id: `prof_${Date.now()}`,
      organizationId: orgId,
      legalName: data.name,
      tradingName: data.name,
      businessType: data.businessType,
      country: data.country,
      registeredAddress: '',
      city: '',
      primaryContactName: userName,
      primaryContactEmail: userEmail,
      primaryContactPhone: '',
      defaultCurrency: data.country === 'India' ? 'INR' : 'USD',
      preferredTemplate: 'classic-corporate',
      documentPrefixes: {
        quotation: 'QT',
        proformaInvoice: 'PI',
        commercialInvoice: 'CI',
        packingList: 'PL',
        purchaseOrder: 'PO',
        salesOrder: 'SO',
      },
      updatedAt: now,
    };

    db.organizations.push(organization);
    db.organizationMembers.push(member);
    db.companyProfiles.push(profile);
    writeDb(db);

    return { organization, profile };
  },

  async getProfile(organizationId: string): Promise<CompanyProfile | null> {
    const db = readDb();
    return db.companyProfiles.find((p) => p.organizationId === organizationId) || null;
  },

  async updateProfile(organizationId: string, updates: Partial<CompanyProfile>): Promise<CompanyProfile | null> {
    const db = readDb();
    let index = db.companyProfiles.findIndex((p) => p.organizationId === organizationId);
    const now = new Date().toISOString();

    if (index === -1) {
      // create empty if not exists
      const newProf: CompanyProfile = {
        id: `prof_${Date.now()}`,
        organizationId,
        legalName: 'Your Export Company',
        tradingName: 'Your Export Company',
        businessType: 'Export Merchant',
        country: 'India',
        registeredAddress: '',
        city: '',
        primaryContactName: '',
        primaryContactEmail: '',
        primaryContactPhone: '',
        defaultCurrency: 'USD',
        preferredTemplate: 'classic-corporate',
        updatedAt: now,
        ...updates,
      };
      db.companyProfiles.push(newProf);
      writeDb(db);
      return newProf;
    }

    db.companyProfiles[index] = {
      ...db.companyProfiles[index],
      ...updates,
      updatedAt: now,
    };
    writeDb(db);
    return db.companyProfiles[index];
  },

  async getMembers(organizationId: string): Promise<OrganizationMember[]> {
    const db = readDb();
    return db.organizationMembers.filter((m) => m.organizationId === organizationId);
  },

  async addMember(
    organizationId: string,
    member: Omit<OrganizationMember, 'id' | 'joinedAt'>
  ): Promise<OrganizationMember> {
    const db = readDb();
    const newMember: OrganizationMember = {
      ...member,
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      joinedAt: new Date().toISOString(),
    };
    db.organizationMembers.push(newMember);
    writeDb(db);
    return newMember;
  },

  async removeMember(organizationId: string, memberId: string): Promise<boolean> {
    const db = readDb();
    const initLen = db.organizationMembers.length;
    db.organizationMembers = db.organizationMembers.filter(
      (m) => !(m.organizationId === organizationId && m.id === memberId)
    );
    writeDb(db);
    return db.organizationMembers.length < initLen;
  },

  async listAll(): Promise<Organization[]> {
    const db = readDb();
    return db.organizations;
  },
};

// ================= BUYER REPOSITORY =================
export const buyerRepo = {
  async listByOrg(organizationId: string): Promise<Buyer[]> {
    const db = readDb();
    return db.buyers.filter((b) => b.organizationId === organizationId);
  },

  async findById(organizationId: string, id: string): Promise<Buyer | null> {
    const db = readDb();
    return db.buyers.find((b) => b.organizationId === organizationId && b.id === id) || null;
  },

  async create(organizationId: string, buyer: Omit<Buyer, 'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'totalOrderValue'>): Promise<Buyer> {
    const db = readDb();
    const now = new Date().toISOString();
    const newBuyer: Buyer = {
      ...buyer,
      id: `byr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId,
      totalOrderValue: 0,
      createdAt: now,
      updatedAt: now,
    };
    db.buyers.push(newBuyer);
    writeDb(db);
    return newBuyer;
  },

  async update(organizationId: string, id: string, updates: Partial<Buyer>): Promise<Buyer | null> {
    const db = readDb();
    const index = db.buyers.findIndex((b) => b.organizationId === organizationId && b.id === id);
    if (index === -1) return null;
    db.buyers[index] = {
      ...db.buyers[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeDb(db);
    return db.buyers[index];
  },

  async delete(organizationId: string, id: string): Promise<boolean> {
    const db = readDb();
    const initLen = db.buyers.length;
    db.buyers = db.buyers.filter((b) => !(b.organizationId === organizationId && b.id === id));
    writeDb(db);
    return db.buyers.length < initLen;
  },
};

// ================= PRODUCT REPOSITORY =================
export const productRepo = {
  async listByOrg(organizationId: string): Promise<Product[]> {
    const db = readDb();
    return db.products.filter((p) => p.organizationId === organizationId);
  },

  async findById(organizationId: string, id: string): Promise<Product | null> {
    const db = readDb();
    return db.products.find((p) => p.organizationId === organizationId && p.id === id) || null;
  },

  async create(organizationId: string, product: Omit<Product, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const db = readDb();
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...product,
      id: `prd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId,
      createdAt: now,
      updatedAt: now,
    };
    db.products.push(newProduct);
    writeDb(db);
    return newProduct;
  },

  async update(organizationId: string, id: string, updates: Partial<Product>): Promise<Product | null> {
    const db = readDb();
    const index = db.products.findIndex((p) => p.organizationId === organizationId && p.id === id);
    if (index === -1) return null;
    db.products[index] = {
      ...db.products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeDb(db);
    return db.products[index];
  },

  async delete(organizationId: string, id: string): Promise<boolean> {
    const db = readDb();
    const initLen = db.products.length;
    db.products = db.products.filter((p) => !(p.organizationId === organizationId && p.id === id));
    writeDb(db);
    return db.products.length < initLen;
  },

  async updateStock(organizationId: string, id: string, quantityDelta: number): Promise<Product | null> {
    const db = readDb();
    const index = db.products.findIndex((p) => p.organizationId === organizationId && p.id === id);
    if (index === -1) return null;
    const current = db.products[index].stockQuantity || 0;
    db.products[index].stockQuantity = Math.max(0, current + quantityDelta);
    db.products[index].updatedAt = new Date().toISOString();
    writeDb(db);
    return db.products[index];
  },
};

// ================= DOCUMENT REPOSITORY =================
export const documentRepo = {
  async listByOrg(organizationId: string, type?: string): Promise<BaseDocument[]> {
    const db = readDb();
    return db.documents.filter((d) => {
      const matchOrg = d.organizationId === organizationId;
      if (!matchOrg) return false;
      return type ? d.type === type : true;
    });
  },

  async findById(organizationId: string, id: string): Promise<BaseDocument | null> {
    const db = readDb();
    return db.documents.find((d) => d.organizationId === organizationId && d.id === id) || null;
  },

  async findByShareToken(token: string): Promise<BaseDocument | null> {
    const db = readDb();
    return db.documents.find((d) => d.shareToken === token) || null;
  },

  async create(organizationId: string, doc: Omit<BaseDocument, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Promise<BaseDocument> {
    const db = readDb();
    const now = new Date().toISOString();
    const newDoc: BaseDocument = {
      ...doc,
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId,
      createdAt: now,
      updatedAt: now,
    };
    db.documents.push(newDoc);
    writeDb(db);
    return newDoc;
  },

  async update(organizationId: string, id: string, updates: Partial<BaseDocument>): Promise<BaseDocument | null> {
    const db = readDb();
    const index = db.documents.findIndex((d) => d.organizationId === organizationId && d.id === id);
    if (index === -1) return null;
    db.documents[index] = {
      ...db.documents[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeDb(db);
    return db.documents[index];
  },

  async delete(organizationId: string, id: string): Promise<boolean> {
    const db = readDb();
    const initLen = db.documents.length;
    db.documents = db.documents.filter((d) => !(d.organizationId === organizationId && d.id === id));
    writeDb(db);
    return db.documents.length < initLen;
  },

  async countByOrg(organizationId: string) {
    const db = readDb();
    const docs = db.documents.filter((d) => d.organizationId === organizationId);
    return {
      total: docs.length,
      quotations: docs.filter((d) => d.type === 'quotation').length,
      proformaInvoices: docs.filter((d) => d.type === 'proforma_invoice').length,
      commercialInvoices: docs.filter((d) => d.type === 'commercial_invoice').length,
      packingLists: docs.filter((d) => d.type === 'packing_list').length,
      acceptedQuotations: docs.filter((d) => d.type === 'quotation' && d.status === 'accepted').length,
      pendingQuotations: docs.filter((d) => d.type === 'quotation' && d.status === 'sent').length,
    };
  },
};

// ================= SHIPMENT REPOSITORY =================
export const shipmentRepo = {
  async listByOrg(organizationId: string): Promise<Shipment[]> {
    const db = readDb();
    return db.shipments.filter((s) => s.organizationId === organizationId);
  },

  async findById(organizationId: string, id: string): Promise<Shipment | null> {
    const db = readDb();
    return db.shipments.find((s) => s.organizationId === organizationId && s.id === id) || null;
  },

  async create(organizationId: string, shipment: Omit<Shipment, 'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'updates'>): Promise<Shipment> {
    const db = readDb();
    const now = new Date().toISOString();
    const newShipment: Shipment = {
      ...shipment,
      id: `shp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId,
      updates: [
        {
          id: `upd_${Date.now()}`,
          date: now,
          status: shipment.status,
          location: shipment.originPort || 'Origin',
          comment: 'Shipment created in ExportFlow',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
    db.shipments.push(newShipment);
    writeDb(db);
    return newShipment;
  },

  async update(organizationId: string, id: string, updates: Partial<Shipment>): Promise<Shipment | null> {
    const db = readDb();
    const index = db.shipments.findIndex((s) => s.organizationId === organizationId && s.id === id);
    if (index === -1) return null;
    db.shipments[index] = {
      ...db.shipments[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeDb(db);
    return db.shipments[index];
  },

  async addTrackingUpdate(
    organizationId: string,
    id: string,
    update: { status: any; location: string; comment: string }
  ): Promise<Shipment | null> {
    const db = readDb();
    const index = db.shipments.findIndex((s) => s.organizationId === organizationId && s.id === id);
    if (index === -1) return null;
    const now = new Date().toISOString();
    db.shipments[index].status = update.status;
    db.shipments[index].updates.push({
      id: `upd_${Date.now()}`,
      date: now,
      ...update,
    });
    db.shipments[index].updatedAt = now;
    writeDb(db);
    return db.shipments[index];
  },
};

// ================= PAYMENT REPOSITORY =================
export const paymentRepo = {
  async listByOrg(organizationId: string): Promise<PaymentRecord[]> {
    const db = readDb();
    return db.payments.filter((p) => p.organizationId === organizationId);
  },

  async create(organizationId: string, payment: Omit<PaymentRecord, 'id' | 'organizationId' | 'createdAt'>): Promise<PaymentRecord> {
    const db = readDb();
    const newPayment: PaymentRecord = {
      ...payment,
      id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId,
      createdAt: new Date().toISOString(),
    };
    db.payments.push(newPayment);
    writeDb(db);
    return newPayment;
  },

  async update(organizationId: string, id: string, updates: Partial<PaymentRecord>): Promise<PaymentRecord | null> {
    const db = readDb();
    const index = db.payments.findIndex((p) => p.organizationId === organizationId && p.id === id);
    if (index === -1) return null;
    db.payments[index] = {
      ...db.payments[index],
      ...updates,
    };
    writeDb(db);
    return db.payments[index];
  },
};

// ================= NOTIFICATION REPOSITORY =================
export const notificationRepo = {
  async listByOrg(organizationId: string): Promise<Notification[]> {
    const db = readDb();
    return db.notifications.filter((n) => n.organizationId === organizationId).reverse();
  },

  async create(organizationId: string, notif: Omit<Notification, 'id' | 'organizationId' | 'createdAt' | 'read'>): Promise<Notification> {
    const db = readDb();
    const newNotif: Notification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId,
      read: false,
      createdAt: new Date().toISOString(),
    };
    db.notifications.push(newNotif);
    writeDb(db);
    return newNotif;
  },

  async markAsRead(organizationId: string, id: string): Promise<boolean> {
    const db = readDb();
    const index = db.notifications.findIndex((n) => n.organizationId === organizationId && n.id === id);
    if (index === -1) return false;
    db.notifications[index].read = true;
    writeDb(db);
    return true;
  },
};

// ================= SUPPORT REPOSITORY =================
export const supportRepo = {
  async listByOrg(organizationId: string): Promise<SupportTicket[]> {
    const db = readDb();
    return db.supportTickets.filter((t) => t.organizationId === organizationId);
  },

  async listAll(): Promise<SupportTicket[]> {
    const db = readDb();
    return db.supportTickets;
  },

  async findById(id: string): Promise<SupportTicket | null> {
    const db = readDb();
    return db.supportTickets.find((t) => t.id === id) || null;
  },

  async create(ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'replies'>): Promise<SupportTicket> {
    const db = readDb();
    const now = new Date().toISOString();
    const newTicket: SupportTicket = {
      ...ticket,
      id: `tkt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      replies: [],
      createdAt: now,
      updatedAt: now,
    };
    db.supportTickets.push(newTicket);
    writeDb(db);
    return newTicket;
  },

  async addReply(ticketId: string, reply: { authorName: string; authorRole: 'admin' | 'user'; message: string }): Promise<SupportTicket | null> {
    const db = readDb();
    const index = db.supportTickets.findIndex((t) => t.id === ticketId);
    if (index === -1) return null;
    const now = new Date().toISOString();
    db.supportTickets[index].replies.push({
      id: `rpl_${Date.now()}`,
      ...reply,
      createdAt: now,
    });
    db.supportTickets[index].updatedAt = now;
    writeDb(db);
    return db.supportTickets[index];
  },

  async updateStatus(ticketId: string, status: any): Promise<SupportTicket | null> {
    const db = readDb();
    const index = db.supportTickets.findIndex((t) => t.id === ticketId);
    if (index === -1) return null;
    db.supportTickets[index].status = status;
    db.supportTickets[index].updatedAt = new Date().toISOString();
    writeDb(db);
    return db.supportTickets[index];
  },
};

// ================= ANNOUNCEMENT REPOSITORY =================
export const announcementRepo = {
  async listActive(): Promise<Announcement[]> {
    const db = readDb();
    return db.announcements.filter((a) => a.active);
  },

  async listAll(): Promise<Announcement[]> {
    const db = readDb();
    return db.announcements;
  },

  async create(announcement: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> {
    const db = readDb();
    const newA: Announcement = {
      ...announcement,
      id: `anc_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    db.announcements.push(newA);
    writeDb(db);
    return newA;
  },

  async update(id: string, updates: Partial<Announcement>): Promise<Announcement | null> {
    const db = readDb();
    const index = db.announcements.findIndex((a) => a.id === id);
    if (index === -1) return null;
    db.announcements[index] = { ...db.announcements[index], ...updates };
    writeDb(db);
    return db.announcements[index];
  },
};

// ================= ADMIN & ANALYTICS REPOSITORY =================
export const adminRepo = {
  async getPlatformStats() {
    const db = readDb();
    const totalUsers = db.users.length;
    const totalCompanies = db.organizations.length;
    const totalDocuments = db.documents.length;
    const totalQuotations = db.documents.filter((d) => d.type === 'quotation').length;
    const totalPIs = db.documents.filter((d) => d.type === 'proforma_invoice').length;
    const totalCIs = db.documents.filter((d) => d.type === 'commercial_invoice').length;
    const totalProducts = db.products.length;
    const totalBuyers = db.buyers.length;
    const totalShipments = db.shipments.length;

    // Platform revenue (BENZWELL revenue)
    const benzwellRevenue = db.platformRevenue.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    // Aggregated customer sales value (tracked export value)
    const customerRecordedSales = db.documents
      .filter((d) => d.type === 'commercial_invoice' || d.type === 'proforma_invoice')
      .reduce((acc, d) => acc + (d.grandTotal || 0), 0);

    const customerPayments = db.payments.reduce((acc, p) => acc + (p.amount || 0), 0);

    return {
      totalUsers,
      totalCompanies,
      totalDocuments,
      totalQuotations,
      totalPIs,
      totalCIs,
      totalProducts,
      totalBuyers,
      totalShipments,
      benzwellRevenue,
      customerRecordedSales: roundToTwo(customerRecordedSales),
      customerPayments: roundToTwo(customerPayments),
    };
  },

  async getRevenueList(): Promise<PlatformRevenueRecord[]> {
    const db = readDb();
    return db.platformRevenue;
  },

  async addRevenueRecord(record: Omit<PlatformRevenueRecord, 'id' | 'createdAt'>): Promise<PlatformRevenueRecord> {
    const db = readDb();
    const newRev: PlatformRevenueRecord = {
      ...record,
      id: `rev_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    db.platformRevenue.push(newRev);
    writeDb(db);
    return newRev;
  },

  async logAudit(log: Omit<AdminAuditLog, 'id' | 'timestamp'>): Promise<AdminAuditLog> {
    const db = readDb();
    const newLog: AdminAuditLog = {
      ...log,
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    db.auditLogs.push(newLog);
    writeDb(db);
    return newLog;
  },

  async getAuditLogs(): Promise<AdminAuditLog[]> {
    const db = readDb();
    return db.auditLogs.slice(-100).reverse();
  },

  async logActivity(act: Omit<PlatformActivity, 'id' | 'createdAt'>): Promise<PlatformActivity> {
    const db = readDb();
    const newAct: PlatformActivity = {
      ...act,
      id: `act_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    db.platformActivity.push(newAct);
    writeDb(db);
    return newAct;
  },

  async getActivity(limit: number = 50): Promise<PlatformActivity[]> {
    const db = readDb();
    return db.platformActivity.slice(-limit).reverse();
  },
};
