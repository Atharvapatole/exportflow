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
  AiProviderConfig,
  AiUsageLog,
  QuotationRevision,
  RazorpayConfig,
  RazorpayWebhookEvent,
  RazorpayPaymentLog,
  OrganizationWallet,
  OrganizationSubscription,
  ContactInquiry,
  DocumentAllowance,
  PlatformAdmin,
} from '@/types';
import { roundToTwo, safeAdd } from '@/lib/utils';
import { createAdminClient } from '@/lib/supabase/admin';

// ================= USER REPOSITORY =================
export const userRepo = {
  async findById(id: string): Promise<User | null> {
    const db = readDb();
    const local = db.users.find((u) => u.id === id);
    if (local) return local;

    // Check Supabase public.profiles
    try {
      const adminClient = createAdminClient();
      if (adminClient) {
        const { data: prof } = await adminClient.from('profiles').select('*').eq('id', id).single();
        if (prof) {
          const user: User = {
            id: prof.id,
            email: prof.email,
            name: prof.name || prof.email.split('@')[0],
            role: prof.role || 'owner',
            status: prof.status || 'active',
            currentOrgId: prof.current_org_id || undefined,
            createdAt: prof.created_at || new Date().toISOString(),
            updatedAt: prof.updated_at || new Date().toISOString(),
          };
          if (!db.users.some((u) => u.id === user.id)) {
            db.users.push(user);
            writeDb(db);
          }
          return user;
        }
      }
    } catch {}

    return null;
  },

  async findByEmail(email: string): Promise<User | null> {
    const db = readDb();
    const cleanEmail = email.trim().toLowerCase();
    const local = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (local) return local;

    // Check Supabase public.profiles
    try {
      const adminClient = createAdminClient();
      if (adminClient) {
        const { data: prof } = await adminClient.from('profiles').select('*').ilike('email', cleanEmail).single();
        if (prof) {
          const user: User = {
            id: prof.id,
            email: prof.email,
            name: prof.name || prof.email.split('@')[0],
            role: prof.role || 'owner',
            status: prof.status || 'active',
            currentOrgId: prof.current_org_id || undefined,
            createdAt: prof.created_at || new Date().toISOString(),
            updatedAt: prof.updated_at || new Date().toISOString(),
          };
          if (!db.users.some((u) => u.id === user.id)) {
            db.users.push(user);
            writeDb(db);
          }
          return user;
        }
      }
    } catch {}

    return null;
  },

  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<User> {
    const db = readDb();
    const newUser: User = {
      ...user,
      id: user.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
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
    if (index === -1) {
      // If user not in local store, fetch it first
      const found = await userRepo.findById(id);
      if (!found) return null;
      return userRepo.update(id, updates);
    }
    db.users[index] = {
      ...db.users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeDb(db);

    // Sync to Supabase profile if currentOrgId changed
    if (updates.currentOrgId) {
      try {
        const adminClient = createAdminClient();
        if (adminClient) {
          await adminClient.from('profiles').update({ current_org_id: updates.currentOrgId }).eq('id', id);
        }
      } catch {}
    }

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
    const local = db.organizations.find((o) => o.id === id);
    if (local) return local;

    // Check Supabase public.organizations
    try {
      const adminClient = createAdminClient();
      if (adminClient) {
        const { data: orgRow } = await adminClient.from('organizations').select('*').eq('id', id).single();
        if (orgRow) {
          const org: Organization = {
            id: orgRow.id,
            name: orgRow.name,
            slug: orgRow.slug || orgRow.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            ownerId: orgRow.owner_id,
            country: orgRow.country || 'India',
            businessType: orgRow.business_type || 'Manufacturer & Exporter',
            createdAt: orgRow.created_at || new Date().toISOString(),
            updatedAt: orgRow.updated_at || new Date().toISOString(),
          };
          if (!db.organizations.some((o) => o.id === org.id)) {
            db.organizations.push(org);
            writeDb(db);
          }
          return org;
        }
      }
    } catch {}

    return null;
  },

  async getMember(orgId: string, userId: string): Promise<OrganizationMember | null> {
    const db = readDb();
    const local = db.organizationMembers.find(
      (m) => m.organizationId === orgId && m.userId === userId && m.status === 'active'
    );
    if (local) return local;

    // Check Supabase public.organization_members
    try {
      const adminClient = createAdminClient();
      if (adminClient) {
        const { data: memRow } = await adminClient
          .from('organization_members')
          .select('*')
          .eq('organization_id', orgId)
          .eq('user_id', userId)
          .single();

        if (memRow) {
          const user = await userRepo.findById(userId);
          const member: OrganizationMember = {
            id: memRow.id,
            organizationId: memRow.organization_id,
            userId: memRow.user_id,
            role: memRow.role || 'owner',
            userEmail: user?.email || '',
            userName: user?.name || '',
            status: memRow.status || 'active',
            joinedAt: memRow.joined_at || new Date().toISOString(),
          };
          if (!db.organizationMembers.some((m) => m.id === member.id)) {
            db.organizationMembers.push(member);
            writeDb(db);
          }
          return member;
        }

        // Check if user is the owner of the organization
        const { data: orgRow } = await adminClient.from('organizations').select('*').eq('id', orgId).single();
        if (orgRow && orgRow.owner_id === userId) {
          const user = await userRepo.findById(userId);
          const member: OrganizationMember = {
            id: `mem_${orgId}_${userId}`,
            organizationId: orgId,
            userId: userId,
            role: 'owner',
            userEmail: user?.email || '',
            userName: user?.name || '',
            status: 'active',
            joinedAt: orgRow.created_at || new Date().toISOString(),
          };
          if (!db.organizationMembers.some((m) => m.id === member.id)) {
            db.organizationMembers.push(member);
            writeDb(db);
          }
          return member;
        }
      }
    } catch {}

    return null;
  },

  async listByUser(userId: string): Promise<Organization[]> {
    const db = readDb();
    const memberOrgs = db.organizationMembers
      .filter((m) => m.userId === userId && m.status === 'active')
      .map((m) => m.organizationId);
    const localOrgs = db.organizations.filter((o) => memberOrgs.includes(o.id) || o.ownerId === userId);
    if (localOrgs.length > 0) return localOrgs;

    // Check Supabase
    try {
      const adminClient = createAdminClient();
      if (adminClient) {
        const { data: ownedOrgs } = await adminClient.from('organizations').select('*').eq('owner_id', userId);
        if (ownedOrgs && ownedOrgs.length > 0) {
          const orgs: Organization[] = ownedOrgs.map((orgRow) => ({
            id: orgRow.id,
            name: orgRow.name,
            slug: orgRow.slug || orgRow.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            ownerId: orgRow.owner_id,
            country: orgRow.country || 'India',
            businessType: orgRow.business_type || 'Manufacturer & Exporter',
            createdAt: orgRow.created_at || new Date().toISOString(),
            updatedAt: orgRow.updated_at || new Date().toISOString(),
          }));
          for (const o of orgs) {
            if (!db.organizations.some((x) => x.id === o.id)) db.organizations.push(o);
          }
          writeDb(db);
          return orgs;
        }
      }
    } catch {}

    return [];
  },

  async create(
    data: { name: string; businessType: string; country: string; ownerId: string; id?: string },
    userEmail: string,
    userName: string
  ): Promise<{ organization: Organization; profile: CompanyProfile }> {
    const db = readDb();
    const orgId = data.id || `org_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
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

  async findByIdGlobal(id: string): Promise<BaseDocument | null> {
    const db = readDb();
    return db.documents.find((d) => d.id === id) || null;
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

// ================= AI CONFIGURATION & USAGE REPOSITORY =================
export const aiRepo = {
  async getConfig(): Promise<AiProviderConfig> {
    const db = readDb();
    if (!db.aiProviderConfig) {
      db.aiProviderConfig = {
        id: '00000000-0000-0000-0000-000000000001',
        isEnabled: true,
        primaryProvider: 'groq',
        groqApiKey: process.env.GROQ_API_KEY || '',
        groqModel: 'llama-3.3-70b-versatile',
        backupProvider: 'gemini',
        geminiApiKey: process.env.GEMINI_API_KEY || '',
        geminiModel: 'gemini-2.0-flash',
        requestTimeout: 30000,
        maxRetries: 2,
        maxInputLength: 6000,
        dailyLimit: 1000,
        status: 'healthy',
        updatedAt: new Date().toISOString(),
      };
      writeDb(db);
    }
    return db.aiProviderConfig;
  },

  async updateConfig(updates: Partial<AiProviderConfig>): Promise<AiProviderConfig> {
    const db = readDb();
    const current = await this.getConfig();
    db.aiProviderConfig = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeDb(db);
    return db.aiProviderConfig;
  },

  async logUsage(log: Omit<AiUsageLog, 'id' | 'createdAt'>): Promise<AiUsageLog> {
    const db = readDb();
    if (!db.aiUsageLogs) db.aiUsageLogs = [];
    const newLog: AiUsageLog = {
      ...log,
      id: `ai_log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    db.aiUsageLogs.push(newLog);
    writeDb(db);
    return newLog;
  },

  async listUsageLogs(organizationId?: string, limit: number = 50): Promise<AiUsageLog[]> {
    const db = readDb();
    if (!db.aiUsageLogs) return [];
    let list = db.aiUsageLogs;
    if (organizationId) {
      list = list.filter((l) => l.organizationId === organizationId);
    }
    return list.slice(-limit).reverse();
  },
};

// ================= QUOTATION REVISION REPOSITORY =================
export const revisionRepo = {
  async createRevision(
    quotationId: string,
    organizationId: string,
    docSnapshot: BaseDocument,
    changeSummary: string = 'Updated quotation revision',
    createdBy?: string
  ): Promise<QuotationRevision> {
    const db = readDb();
    if (!db.quotationRevisions) db.quotationRevisions = [];

    const existing = db.quotationRevisions.filter((r) => r.quotationId === quotationId);
    const nextRevNum = existing.length + 1;

    const revision: QuotationRevision = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      quotationId,
      organizationId,
      revisionNumber: nextRevNum,
      documentSnapshot: JSON.parse(JSON.stringify(docSnapshot)),
      changeSummary,
      createdBy,
      createdAt: new Date().toISOString(),
    };

    db.quotationRevisions.push(revision);
    writeDb(db);
    return revision;
  },

  async listByQuotation(quotationId: string): Promise<QuotationRevision[]> {
    const db = readDb();
    if (!db.quotationRevisions) return [];
    return db.quotationRevisions
      .filter((r) => r.quotationId === quotationId)
      .sort((a, b) => b.revisionNumber - a.revisionNumber);
  },

  async getLatestRevision(quotationId: string): Promise<QuotationRevision | null> {
    const list = await this.listByQuotation(quotationId);
    return list[0] || null;
  },
};

// ================= RAZORPAY CONFIG & PAYMENT REPOSITORY =================
export const razorpayRepo = {
  async getConfig(): Promise<RazorpayConfig> {
    const db = readDb();
    if (!db.razorpayConfig) {
      db.razorpayConfig = {
        id: '00000000-0000-0000-0000-000000000002',
        isEnabled: false,
        mode: 'test',
        testKeyId: '',
        testKeySecret: '',
        testWebhookSecret: '',
        liveKeyId: '',
        liveKeySecret: '',
        liveWebhookSecret: '',
        merchantDisplayName: 'ExportFlow by BENZWELL',
        merchantSupportEmail: 'info@benzwell.in',
        status: 'unconfigured',
        lastConfigUpdate: new Date().toISOString(),
        webhookStatus: 'unverified',
        failedWebhookCount: 0,
      };
      writeDb(db);
    }
    return db.razorpayConfig;
  },

  async updateConfig(updates: Partial<RazorpayConfig>): Promise<RazorpayConfig> {
    const db = readDb();
    const current = await this.getConfig();
    db.razorpayConfig = {
      ...current,
      ...updates,
      lastConfigUpdate: new Date().toISOString(),
    };
    writeDb(db);
    return db.razorpayConfig;
  },

  async logWebhookEvent(event: Omit<RazorpayWebhookEvent, 'receivedAt'>): Promise<RazorpayWebhookEvent> {
    const db = readDb();
    if (!db.razorpayWebhookEvents) db.razorpayWebhookEvents = [];
    const entry: RazorpayWebhookEvent = {
      ...event,
      receivedAt: new Date().toISOString(),
    };
    // Keep max 200 events
    db.razorpayWebhookEvents.push(entry);
    if (db.razorpayWebhookEvents.length > 200) {
      db.razorpayWebhookEvents = db.razorpayWebhookEvents.slice(-200);
    }
    writeDb(db);
    return entry;
  },

  isWebhookEventProcessed(eventId: string): boolean {
    const db = readDb();
    if (!db.razorpayWebhookEvents) return false;
    return db.razorpayWebhookEvents.some((e) => e.id === eventId && e.status === 'processed');
  },

  listWebhookEvents(limit: number = 30): RazorpayWebhookEvent[] {
    const db = readDb();
    if (!db.razorpayWebhookEvents) return [];
    return [...db.razorpayWebhookEvents].reverse().slice(0, limit);
  },

  async createPaymentLog(log: Omit<RazorpayPaymentLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<RazorpayPaymentLog> {
    const db = readDb();
    if (!db.razorpayPaymentLogs) db.razorpayPaymentLogs = [];
    const newLog: RazorpayPaymentLog = {
      ...log,
      id: `rzp_log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.razorpayPaymentLogs.push(newLog);
    writeDb(db);
    return newLog;
  },

  async updatePaymentLog(orderId: string, updates: Partial<RazorpayPaymentLog>): Promise<RazorpayPaymentLog | null> {
    const db = readDb();
    if (!db.razorpayPaymentLogs) return null;
    const index = db.razorpayPaymentLogs.findIndex((p) => p.orderId === orderId);
    if (index === -1) return null;
    db.razorpayPaymentLogs[index] = {
      ...db.razorpayPaymentLogs[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeDb(db);
    return db.razorpayPaymentLogs[index];
  },

  getPaymentLogByOrderId(orderId: string): RazorpayPaymentLog | null {
    const db = readDb();
    if (!db.razorpayPaymentLogs) return null;
    return db.razorpayPaymentLogs.find((p) => p.orderId === orderId) || null;
  },

  listPaymentLogs(organizationId?: string, limit: number = 50): RazorpayPaymentLog[] {
    const db = readDb();
    if (!db.razorpayPaymentLogs) return [];
    let list = db.razorpayPaymentLogs;
    if (organizationId) {
      list = list.filter((p) => p.organizationId === organizationId);
    }
    return [...list].reverse().slice(0, limit);
  },
};

// ================= DOCUMENT CREDIT WALLET REPOSITORY =================
export const walletRepo = {
  async getOrCreateWallet(organizationId: string): Promise<OrganizationWallet> {
    const db = readDb();
    if (!db.organizationWallets) db.organizationWallets = [];
    let wallet = db.organizationWallets.find((w) => w.organizationId === organizationId);
    if (!wallet) {
      wallet = {
        id: `wlt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        organizationId,
        // Free initial allowance: 1 quotation
        lifetimeCredits: {
          quotations: 1,
          proformaInvoices: 0,
          commercialInvoices: 0,
          packingLists: 0,
        },
        subscriptionCredits: {
          quotations: 0,
          proformaInvoices: 0,
          commercialInvoices: 0,
          packingLists: 0,
        },
        usedCounts: {
          quotations: 0,
          proformaInvoices: 0,
          commercialInvoices: 0,
          packingLists: 0,
        },
        updatedAt: new Date().toISOString(),
      };
      db.organizationWallets.push(wallet);
      writeDb(db);
    }
    return wallet;
  },

  async addCredits(
    organizationId: string,
    credits: Partial<DocumentAllowance>,
    source: 'lifetime' | 'subscription'
  ): Promise<OrganizationWallet> {
    const db = readDb();
    const wallet = await this.getOrCreateWallet(organizationId);
    const index = db.organizationWallets.findIndex((w) => w.organizationId === organizationId);

    const targetCredits = source === 'lifetime' ? wallet.lifetimeCredits : wallet.subscriptionCredits;

    if (credits.quotations) targetCredits.quotations += credits.quotations;
    if (credits.proformaInvoices) targetCredits.proformaInvoices += credits.proformaInvoices;
    if (credits.commercialInvoices) targetCredits.commercialInvoices += credits.commercialInvoices;
    if (credits.packingLists) targetCredits.packingLists += credits.packingLists;

    wallet.updatedAt = new Date().toISOString();
    db.organizationWallets[index] = wallet;
    writeDb(db);
    return wallet;
  },

  async hasAvailableCredit(
    organizationId: string,
    docType: 'quotations' | 'proformaInvoices' | 'commercialInvoices' | 'packingLists'
  ): Promise<boolean> {
    const wallet = await this.getOrCreateWallet(organizationId);
    const available = wallet.lifetimeCredits[docType] + wallet.subscriptionCredits[docType];
    return available > 0;
  },

  async useCredit(
    organizationId: string,
    docType: 'quotations' | 'proformaInvoices' | 'commercialInvoices' | 'packingLists'
  ): Promise<boolean> {
    const db = readDb();
    const wallet = await this.getOrCreateWallet(organizationId);
    const index = db.organizationWallets.findIndex((w) => w.organizationId === organizationId);

    // Consume subscription credits first (per cycle), then lifetime credits
    if (wallet.subscriptionCredits[docType] > 0) {
      wallet.subscriptionCredits[docType] -= 1;
      wallet.usedCounts[docType] += 1;
    } else if (wallet.lifetimeCredits[docType] > 0) {
      wallet.lifetimeCredits[docType] -= 1;
      wallet.usedCounts[docType] += 1;
    } else {
      return false; // No credit available
    }

    wallet.updatedAt = new Date().toISOString();
    db.organizationWallets[index] = wallet;
    writeDb(db);
    return true;
  },
};

// ================= SUBSCRIPTION & TRIAL REPOSITORY =================
export const subscriptionRepo = {
  async getOrCreateSubscription(organizationId: string): Promise<OrganizationSubscription> {
    const db = readDb();
    if (!db.organizationSubscriptions) db.organizationSubscriptions = [];
    let sub = db.organizationSubscriptions.find((s) => s.organizationId === organizationId);
    if (!sub) {
      sub = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        organizationId,
        planId: 'free',
        status: 'active',
        hasUsedTrial: false,
        updatedAt: new Date().toISOString(),
      };
      db.organizationSubscriptions.push(sub);
      writeDb(db);
    }

    // Check if trial has expired and auto-revert to free
    if (sub.status === 'trial' && sub.trialEndDate) {
      if (new Date() > new Date(sub.trialEndDate)) {
        sub.status = 'expired';
        sub.planId = 'free';
        sub.updatedAt = new Date().toISOString();
        const index = db.organizationSubscriptions.findIndex((s) => s.organizationId === organizationId);
        db.organizationSubscriptions[index] = sub;
        writeDb(db);
      }
    }

    return sub;
  },

  async activateTrial(organizationId: string): Promise<{ success: boolean; subscription?: OrganizationSubscription; message?: string }> {
    const db = readDb();
    const sub = await this.getOrCreateSubscription(organizationId);

    if (sub.hasUsedTrial) {
      return { success: false, message: 'Your organization has already redeemed the 3-day Growth trial.' };
    }

    const index = db.organizationSubscriptions.findIndex((s) => s.organizationId === organizationId);
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // Exactly 3 days

    sub.planId = 'growth';
    sub.status = 'trial';
    sub.trialStartDate = now.toISOString();
    sub.trialEndDate = trialEnd.toISOString();
    sub.hasUsedTrial = true;
    sub.updatedAt = now.toISOString();

    db.organizationSubscriptions[index] = sub;
    writeDb(db);

    // Also grant Growth plan subscription credits for the trial period
    await walletRepo.addCredits(
      organizationId,
      {
        quotations: 30,
        proformaInvoices: 20,
        commercialInvoices: 20,
        packingLists: 20,
      },
      'subscription'
    );

    return { success: true, subscription: sub, message: '3-Day Growth Trial activated successfully.' };
  },

  async getTrialStatus(organizationId: string): Promise<{
    isTrialActive: boolean;
    remainingMs: number;
    remainingHours: number;
    trialEndDate?: string;
    hasUsedTrial: boolean;
  }> {
    const sub = await this.getOrCreateSubscription(organizationId);
    if (sub.status !== 'trial' || !sub.trialEndDate) {
      return { isTrialActive: false, remainingMs: 0, remainingHours: 0, hasUsedTrial: sub.hasUsedTrial };
    }

    const remainingMs = Math.max(0, new Date(sub.trialEndDate).getTime() - Date.now());
    const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
    return {
      isTrialActive: remainingMs > 0,
      remainingMs,
      remainingHours,
      trialEndDate: sub.trialEndDate,
      hasUsedTrial: sub.hasUsedTrial,
    };
  },

  async activatePlan(
    organizationId: string,
    planId: 'starter' | 'growth' | 'business',
    billingCycle: 'monthly' | 'annual',
    razorpaySubscriptionId?: string
  ): Promise<OrganizationSubscription> {
    const db = readDb();
    const sub = await this.getOrCreateSubscription(organizationId);
    const index = db.organizationSubscriptions.findIndex((s) => s.organizationId === organizationId);

    const now = new Date();
    const periodDays = billingCycle === 'annual' ? 365 : 30;
    const periodEnd = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000);

    sub.planId = planId;
    sub.status = 'active';
    sub.billingCycle = billingCycle;
    sub.currentPeriodStart = now.toISOString();
    sub.currentPeriodEnd = periodEnd.toISOString();
    if (razorpaySubscriptionId) sub.razorpaySubscriptionId = razorpaySubscriptionId;
    sub.updatedAt = now.toISOString();

    db.organizationSubscriptions[index] = sub;
    writeDb(db);
    return sub;
  },
};

// ================= CONTACT INQUIRY REPOSITORY =================
export const contactRepo = {
  async createInquiry(
    inquiry: Omit<ContactInquiry, 'id' | 'inquiryNumber' | 'createdAt' | 'updatedAt'>
  ): Promise<ContactInquiry> {
    const db = readDb();
    if (!db.contactInquiries) db.contactInquiries = [];
    const count = db.contactInquiries.length + 1;
    const inquiryNumber = `INQ-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;
    const newInquiry: ContactInquiry = {
      ...inquiry,
      id: `inq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      inquiryNumber,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.contactInquiries.push(newInquiry);
    writeDb(db);
    return newInquiry;
  },

  async listInquiries(status?: string, category?: string, limit: number = 50): Promise<ContactInquiry[]> {
    const db = readDb();
    if (!db.contactInquiries) return [];
    let list = db.contactInquiries;
    if (status && status !== 'all') {
      list = list.filter((i) => i.status === status);
    }
    if (category && category !== 'all') {
      list = list.filter((i) => i.category === category);
    }
    return [...list].reverse().slice(0, limit);
  },

  async getInquiryById(id: string): Promise<ContactInquiry | null> {
    const db = readDb();
    if (!db.contactInquiries) return null;
    return db.contactInquiries.find((i) => i.id === id) || null;
  },

  async updateInquiryStatus(
    id: string,
    status: ContactInquiry['status'],
    adminNotes?: string
  ): Promise<ContactInquiry | null> {
    const db = readDb();
    if (!db.contactInquiries) return null;
    const index = db.contactInquiries.findIndex((i) => i.id === id);
    if (index === -1) return null;
    db.contactInquiries[index].status = status;
    if (adminNotes !== undefined) db.contactInquiries[index].adminNotes = adminNotes;
    db.contactInquiries[index].updatedAt = new Date().toISOString();
    writeDb(db);
    return db.contactInquiries[index];
  },
};

// ================= PLATFORM ADMIN REPOSITORY =================
export const platformAdminRepo = {
  async findByAuthUserId(authUserId: string): Promise<PlatformAdmin | null> {
    if (!authUserId) return null;

    // 1. Check Supabase platform_admins table if available
    try {
      const supabase = createAdminClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('platform_admins')
          .select('*')
          .eq('auth_user_id', authUserId)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            authUserId: data.auth_user_id,
            email: data.email,
            role: data.role as 'SUPER_ADMIN' | 'PLATFORM_ADMIN',
            isActive: data.is_active,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            createdBy: data.created_by,
          };
        }
      }
    } catch (e) {
      console.warn('[PLATFORM_ADMIN_REPO] Supabase table lookup notice:', e);
    }

    // 2. Check local store fallback
    const db = readDb();
    if (!db.platformAdmins) return null;
    const admin = db.platformAdmins.find((a: any) => a.authUserId === authUserId);
    return admin || null;
  },

  async findByEmail(email: string): Promise<PlatformAdmin | null> {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check Supabase
    try {
      const supabase = createAdminClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('platform_admins')
          .select('*')
          .ilike('email', cleanEmail)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            authUserId: data.auth_user_id,
            email: data.email,
            role: data.role as 'SUPER_ADMIN' | 'PLATFORM_ADMIN',
            isActive: data.is_active,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            createdBy: data.created_by,
          };
        }
      }
    } catch (e) {
      console.warn('[PLATFORM_ADMIN_REPO] Supabase email lookup notice:', e);
    }

    // 2. Check local store fallback
    const db = readDb();
    if (!db.platformAdmins) return null;
    return db.platformAdmins.find((a: any) => a.email.toLowerCase() === cleanEmail) || null;
  },

  async listAll(): Promise<PlatformAdmin[]> {
    try {
      const supabase = createAdminClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('platform_admins')
          .select('*')
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            authUserId: d.auth_user_id,
            email: d.email,
            role: d.role as 'SUPER_ADMIN' | 'PLATFORM_ADMIN',
            isActive: d.is_active,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
            createdBy: d.created_by,
          }));
        }
      }
    } catch {}

    const db = readDb();
    return db.platformAdmins || [];
  },

  async upsertAdmin(admin: {
    authUserId: string;
    email: string;
    role?: 'SUPER_ADMIN' | 'PLATFORM_ADMIN';
    isActive?: boolean;
    createdBy?: string;
  }): Promise<PlatformAdmin> {
    const cleanEmail = admin.email.trim().toLowerCase();
    const role = admin.role || 'SUPER_ADMIN';
    const isActive = admin.isActive !== false;
    const createdBy = admin.createdBy || 'system_bootstrap';
    const now = new Date().toISOString();

    let createdId = `pa_${Date.now()}`;

    // 1. Try Upsert in Supabase
    try {
      const supabase = createAdminClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('platform_admins')
          .upsert(
            {
              auth_user_id: admin.authUserId,
              email: cleanEmail,
              role,
              is_active: isActive,
              created_by: createdBy,
              updated_at: now,
            },
            { onConflict: 'auth_user_id' }
          )
          .select()
          .maybeSingle();

        if (!error && data) {
          createdId = data.id;
        }

        // Also synchronize Supabase profiles table
        await supabase
          .from('profiles')
          .upsert(
            {
              id: admin.authUserId,
              email: cleanEmail,
              name: 'Super Admin (BENZWELL)',
              role: 'super_admin',
              status: isActive ? 'active' : 'suspended',
              updated_at: now,
            },
            { onConflict: 'id' }
          );

        // Also synchronize Supabase auth metadata
        await supabase.auth.admin.updateUserById(admin.authUserId, {
          user_metadata: {
            role: 'super_admin',
            name: 'Super Admin (BENZWELL)',
          },
        });
      }
    } catch (e) {
      console.warn('[PLATFORM_ADMIN_REPO] Supabase upsert notice:', e);
    }

    // 2. Always persist in local store cache
    const db = readDb();
    if (!db.platformAdmins) db.platformAdmins = [];
    const existingIndex = db.platformAdmins.findIndex(
      (a: any) => a.authUserId === admin.authUserId || a.email.toLowerCase() === cleanEmail
    );

    const record: PlatformAdmin = {
      id: existingIndex !== -1 ? db.platformAdmins[existingIndex].id : createdId,
      authUserId: admin.authUserId,
      email: cleanEmail,
      role,
      isActive,
      createdAt: existingIndex !== -1 ? db.platformAdmins[existingIndex].createdAt : now,
      updatedAt: now,
      createdBy,
    };

    if (existingIndex !== -1) {
      db.platformAdmins[existingIndex] = record;
    } else {
      db.platformAdmins.push(record);
    }
    writeDb(db);

    return record;
  },

  async deactivate(authUserId: string): Promise<boolean> {
    try {
      const supabase = createAdminClient();
      if (supabase) {
        await supabase
          .from('platform_admins')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('auth_user_id', authUserId);

        await supabase
          .from('profiles')
          .update({ status: 'suspended', updated_at: new Date().toISOString() })
          .eq('id', authUserId);
      }
    } catch {}

    const db = readDb();
    if (!db.platformAdmins) return false;
    const index = db.platformAdmins.findIndex((a: any) => a.authUserId === authUserId);
    if (index !== -1) {
      db.platformAdmins[index].isActive = false;
      db.platformAdmins[index].updatedAt = new Date().toISOString();
      writeDb(db);
      return true;
    }
    return false;
  },

  async activate(authUserId: string): Promise<boolean> {
    try {
      const supabase = createAdminClient();
      if (supabase) {
        await supabase
          .from('platform_admins')
          .update({ is_active: true, updated_at: new Date().toISOString() })
          .eq('auth_user_id', authUserId);

        await supabase
          .from('profiles')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('id', authUserId);
      }
    } catch {}

    const db = readDb();
    if (!db.platformAdmins) return false;
    const index = db.platformAdmins.findIndex((a: any) => a.authUserId === authUserId);
    if (index !== -1) {
      db.platformAdmins[index].isActive = true;
      db.platformAdmins[index].updatedAt = new Date().toISOString();
      writeDb(db);
      return true;
    }
    return false;
  },
};

