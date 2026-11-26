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
  ChaClient,
  CustomsJob,
  CustomsJobDocument,
  CustomsDocumentChecklist,
  EsanchitRecord,
  CustomsQuery,
  SignatureAsset,
  DocumentAuditEvent,
  DocumentEmailEvent,
  ApiKey,
  ApiUsageLog,
  CustomTemplate,
  OrganizationTeamMember,
  AiDocumentReview,
  ChaDocument,
  ChaDocumentType,
} from '@/types';
import crypto from 'crypto';
import { roundToTwo, safeAdd } from '@/lib/utils';
import { createAdminClient } from '@/lib/supabase/admin';
import { encryptSecret, decryptSecret } from '@/lib/crypto';

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
    if (local) {
      if (
        !local.orgType &&
        (local.name?.toLowerCase().includes('custom') ||
          local.businessType?.toLowerCase().includes('customs') ||
          local.businessType?.toLowerCase().includes('cha'))
      ) {
        local.orgType = 'cha';
        writeDb(db);
      }
      return local;
    }

    // Check Supabase public.organizations
    try {
      const adminClient = createAdminClient();
      if (adminClient) {
        const { data: orgRow } = await adminClient.from('organizations').select('*').eq('id', id).single();
        if (orgRow) {
          const isCha =
            orgRow.org_type === 'cha' ||
            orgRow.business_type?.toLowerCase().includes('customs') ||
            orgRow.business_type?.toLowerCase().includes('cha') ||
            orgRow.name?.toLowerCase().includes('custom');

          const org: Organization = {
            id: orgRow.id,
            name: orgRow.name,
            slug: orgRow.slug || orgRow.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            ownerId: orgRow.owner_id,
            country: orgRow.country || 'India',
            businessType: orgRow.business_type || (isCha ? 'Customs House Agent (CHA)' : 'Manufacturer & Exporter'),
            orgType: orgRow.org_type || (isCha ? 'cha' : 'exporter'),
            chaLicenseNumber: orgRow.cha_license_number,
            chaLicenseAuthority: orgRow.cha_license_authority,
            chaLicenseStatus: orgRow.cha_license_status || (isCha ? 'unverified' : undefined),
            address: orgRow.address,
            phone: orgRow.phone,
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
          const orgs: Organization[] = ownedOrgs.map((orgRow) => {
            const isCha =
              orgRow.org_type === 'cha' ||
              orgRow.business_type?.toLowerCase().includes('customs') ||
              orgRow.business_type?.toLowerCase().includes('cha') ||
              orgRow.name?.toLowerCase().includes('custom');

            return {
              id: orgRow.id,
              name: orgRow.name,
              slug: orgRow.slug || orgRow.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
              ownerId: orgRow.owner_id,
              country: orgRow.country || 'India',
              businessType: orgRow.business_type || (isCha ? 'Customs House Agent (CHA)' : 'Manufacturer & Exporter'),
              orgType: orgRow.org_type || (isCha ? 'cha' : 'exporter'),
              chaLicenseNumber: orgRow.cha_license_number,
              chaLicenseAuthority: orgRow.cha_license_authority,
              chaLicenseStatus: orgRow.cha_license_status || (isCha ? 'unverified' : undefined),
              address: orgRow.address,
              phone: orgRow.phone,
              createdAt: orgRow.created_at || new Date().toISOString(),
              updatedAt: orgRow.updated_at || new Date().toISOString(),
            };
          });
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
    data: {
      name: string;
      businessType: string;
      country: string;
      ownerId: string;
      id?: string;
      orgType?: 'exporter' | 'cha';
      chaLicenseNumber?: string;
      chaLicenseAuthority?: string;
      chaLicenseStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
      address?: string;
      phone?: string;
    },
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
      orgType: data.orgType,
      chaLicenseNumber: data.chaLicenseNumber,
      chaLicenseAuthority: data.chaLicenseAuthority,
      chaLicenseStatus: data.chaLicenseStatus,
      address: data.address,
      phone: data.phone,
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

  async update(id: string, updates: Partial<Organization>): Promise<Organization | null> {
    const db = readDb();
    const index = db.organizations.findIndex((o) => o.id === id);
    if (index === -1) return null;

    db.organizations[index] = {
      ...db.organizations[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeDb(db);

    try {
      const adminClient = createAdminClient();
      if (adminClient) {
        const payload: any = { updated_at: new Date().toISOString() };
        if (updates.name) payload.name = updates.name;
        if (updates.chaLicenseStatus) payload.cha_license_status = updates.chaLicenseStatus;
        if (updates.chaLicenseNumber) payload.cha_license_number = updates.chaLicenseNumber;
        if (updates.chaLicenseAuthority) payload.cha_license_authority = updates.chaLicenseAuthority;
        await adminClient.from('organizations').update(payload).eq('id', id);
      }
    } catch {}

    return db.organizations[index];
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

    // 1. Check Supabase razorpay_configurations table first
    try {
      const adminClient = createAdminClient();
      if (adminClient) {
        const { data: row, error } = await adminClient
          .from('razorpay_configurations')
          .select('*')
          .eq('id', '00000000-0000-0000-0000-000000000002')
          .single();

        if (row && !error) {
          const config: RazorpayConfig = {
            id: row.id,
            isEnabled: row.is_enabled ?? false,
            mode: (row.mode as 'test' | 'live') || 'test',
            testKeyId: row.test_key_id || '',
            testKeySecret: decryptSecret(row.test_key_secret || ''),
            testWebhookSecret: decryptSecret(row.test_webhook_secret || ''),
            liveKeyId: row.live_key_id || '',
            liveKeySecret: decryptSecret(row.live_key_secret || ''),
            liveWebhookSecret: decryptSecret(row.live_webhook_secret || ''),
            merchantDisplayName: row.merchant_display_name || 'ExportFlow by BENZWELL',
            merchantSupportEmail: row.merchant_support_email || 'info@benzwell.in',
            status: (row.status as any) || 'unconfigured',
            lastSuccessfulConnection: row.last_successful_connection || undefined,
            lastConfigUpdate: row.last_config_update || new Date().toISOString(),
            webhookStatus: (row.webhook_status as any) || 'unverified',
            lastReceivedWebhook: row.last_received_webhook || undefined,
            lastSuccessfulWebhook: row.last_successful_webhook || undefined,
            failedWebhookCount: row.failed_webhook_count || 0,
          };
          db.razorpayConfig = config;
          writeDb(db);
          return config;
        }
      }
    } catch (err: any) {
      console.warn('[RAZORPAY REPO] Supabase getConfig warning:', err.message);
    }

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

    // Preserve existing secrets if update is omitted or contains masked bullets
    const safeUpdates: Partial<RazorpayConfig> = { ...updates };
    if (!safeUpdates.testKeySecret || safeUpdates.testKeySecret.includes('••••')) {
      safeUpdates.testKeySecret = current.testKeySecret;
    }
    if (!safeUpdates.testWebhookSecret || safeUpdates.testWebhookSecret.includes('••••')) {
      safeUpdates.testWebhookSecret = current.testWebhookSecret;
    }
    if (!safeUpdates.liveKeySecret || safeUpdates.liveKeySecret.includes('••••')) {
      safeUpdates.liveKeySecret = current.liveKeySecret;
    }
    if (!safeUpdates.liveWebhookSecret || safeUpdates.liveWebhookSecret.includes('••••')) {
      safeUpdates.liveWebhookSecret = current.liveWebhookSecret;
    }

    const updatedConfig: RazorpayConfig = {
      ...current,
      ...safeUpdates,
      lastConfigUpdate: new Date().toISOString(),
    };

    // 1. Save to Supabase with server-side encryption for secrets
    try {
      const adminClient = createAdminClient();
      if (adminClient) {
        await adminClient.from('razorpay_configurations').upsert({
          id: '00000000-0000-0000-0000-000000000002',
          is_enabled: updatedConfig.isEnabled,
          mode: updatedConfig.mode,
          test_key_id: updatedConfig.testKeyId,
          test_key_secret: encryptSecret(updatedConfig.testKeySecret || ''),
          test_webhook_secret: encryptSecret(updatedConfig.testWebhookSecret || ''),
          live_key_id: updatedConfig.liveKeyId,
          live_key_secret: encryptSecret(updatedConfig.liveKeySecret || ''),
          live_webhook_secret: encryptSecret(updatedConfig.liveWebhookSecret || ''),
          merchant_display_name: updatedConfig.merchantDisplayName,
          merchant_support_email: updatedConfig.merchantSupportEmail,
          status: updatedConfig.status,
          last_successful_connection: updatedConfig.lastSuccessfulConnection || null,
          last_config_update: updatedConfig.lastConfigUpdate,
          webhook_status: updatedConfig.webhookStatus,
          last_received_webhook: updatedConfig.lastReceivedWebhook || null,
          last_successful_webhook: updatedConfig.lastSuccessfulWebhook || null,
          failed_webhook_count: updatedConfig.failedWebhookCount,
        });
      }
    } catch (err: any) {
      console.error('[RAZORPAY REPO] Supabase updateConfig error:', err.message);
    }

    db.razorpayConfig = updatedConfig;
    writeDb(db);
    return updatedConfig;
  },

  async logWebhookEvent(event: Omit<RazorpayWebhookEvent, 'receivedAt'>): Promise<RazorpayWebhookEvent> {
    const db = readDb();
    if (!db.razorpayWebhookEvents) db.razorpayWebhookEvents = [];
    const entry: RazorpayWebhookEvent = {
      ...event,
      receivedAt: new Date().toISOString(),
    };

    // Save to Supabase
    try {
      const adminClient = createAdminClient();
      if (adminClient) {
        await adminClient.from('razorpay_webhook_events').upsert({
          id: entry.id,
          event_type: entry.eventType,
          payload: entry.payload,
          signature: entry.signature,
          status: entry.status,
          error_message: entry.errorMessage || null,
          received_at: entry.receivedAt,
        });
      }
    } catch {}

    // Keep max 200 events locally
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

    // Save to Supabase
    try {
      const adminClient = createAdminClient();
      if (adminClient) {
        await adminClient.from('razorpay_payment_logs').insert({
          organization_id: log.organizationId,
          user_id: log.userId,
          order_id: log.orderId,
          payment_id: log.paymentId || null,
          amount: log.amount,
          currency: log.currency,
          status: log.status,
          item_type: log.itemType,
          item_id: log.itemId,
          description: log.description || null,
          credits_added: log.creditsAdded || null,
          error_details: log.errorDetails || null,
        });
      }
    } catch {}

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

    // Sync to Supabase
    try {
      const adminClient = createAdminClient();
      if (adminClient) {
        const patch: any = { updated_at: new Date().toISOString() };
        if (updates.status) patch.status = updates.status;
        if (updates.paymentId) patch.payment_id = updates.paymentId;
        if (updates.errorDetails) patch.error_details = updates.errorDetails;
        await adminClient.from('razorpay_payment_logs').update(patch).eq('order_id', orderId);
      }
    } catch {}

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
        // Free initial allowance: 1 quotation + 10 free AI messages
        lifetimeCredits: {
          quotations: 1,
          proformaInvoices: 0,
          commercialInvoices: 0,
          packingLists: 0,
          aiMessages: 10,
        },
        subscriptionCredits: {
          quotations: 0,
          proformaInvoices: 0,
          commercialInvoices: 0,
          packingLists: 0,
          aiMessages: 0,
        },
        usedCounts: {
          quotations: 0,
          proformaInvoices: 0,
          commercialInvoices: 0,
          packingLists: 0,
          aiMessages: 0,
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
    if (credits.aiMessages) {
      targetCredits.aiMessages = (targetCredits.aiMessages || 0) + credits.aiMessages;
    }

    wallet.updatedAt = new Date().toISOString();
    db.organizationWallets[index] = wallet;
    writeDb(db);
    return wallet;
  },

  async hasAiCredit(organizationId: string): Promise<boolean> {
    const wallet = await this.getOrCreateWallet(organizationId);
    const life = wallet.lifetimeCredits.aiMessages || 0;
    const sub = wallet.subscriptionCredits.aiMessages || 0;
    return life + sub > 0;
  },

  async getAiCreditBalance(organizationId: string): Promise<{ aiMessages: number; balanceCredits: number; canUseAi: boolean }> {
    const wallet = await this.getOrCreateWallet(organizationId);
    const life = wallet.lifetimeCredits.aiMessages || 0;
    const sub = wallet.subscriptionCredits.aiMessages || 0;
    const total = Math.max(0, life + sub);
    return {
      aiMessages: sub,
      balanceCredits: life,
      canUseAi: total > 0,
    };
  },

  async useAiCredit(organizationId: string): Promise<boolean> {
    const db = readDb();
    const wallet = await this.getOrCreateWallet(organizationId);
    const index = db.organizationWallets.findIndex((w) => w.organizationId === organizationId);

    if ((wallet.subscriptionCredits.aiMessages || 0) > 0) {
      wallet.subscriptionCredits.aiMessages = (wallet.subscriptionCredits.aiMessages || 0) - 1;
      wallet.usedCounts.aiMessages = (wallet.usedCounts.aiMessages || 0) + 1;
    } else if ((wallet.lifetimeCredits.aiMessages || 0) > 0) {
      wallet.lifetimeCredits.aiMessages = (wallet.lifetimeCredits.aiMessages || 0) - 1;
      wallet.usedCounts.aiMessages = (wallet.usedCounts.aiMessages || 0) + 1;
    } else {
      return false;
    }

    wallet.updatedAt = new Date().toISOString();
    db.organizationWallets[index] = wallet;
    writeDb(db);
    return true;
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
  async findByOrg(organizationId: string): Promise<OrganizationSubscription | null> {
    return this.getOrCreateSubscription(organizationId);
  },

  async getOrCreateSubscription(organizationId: string): Promise<OrganizationSubscription> {
    const db = readDb();
    if (!db.organizationSubscriptions) db.organizationSubscriptions = [];
    let sub = db.organizationSubscriptions.find((s) => s.organizationId === organizationId);
    if (!sub) {
      const now = new Date().toISOString();
      const newSub: OrganizationSubscription = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        organizationId,
        planId: 'free',
        status: 'active',
        hasUsedTrial: false,
        createdAt: now,
        updatedAt: now,
      };
      db.organizationSubscriptions.push(newSub);
      writeDb(db);
      return newSub;
    }

    // Check if trial has expired and auto-revert to free
    if (sub.status === 'trial' && sub.trialEndDate) {
      if (new Date() > new Date(sub.trialEndDate)) {
        sub.status = 'expired';
        sub.planId = 'free';
        sub.updatedAt = new Date().toISOString();
        const index = db.organizationSubscriptions.findIndex((s) => s.organizationId === organizationId);
        if (index !== -1) {
          db.organizationSubscriptions[index] = sub;
          writeDb(db);
        }
      }
    }

    return sub;
  },

  async activateTrial(organizationId: string): Promise<{ success: boolean; subscription?: OrganizationSubscription; message?: string }> {
    const db = readDb();
    const sub = await this.getOrCreateSubscription(organizationId);

    if (sub.hasUsedTrial) {
      return { success: false, message: 'Your organization has already redeemed the 3-day Free Trial.' };
    }

    const org = await orgRepo.findById(organizationId);
    const isCha =
      org?.orgType === 'cha' ||
      org?.businessType?.toLowerCase().includes('customs') ||
      org?.businessType?.toLowerCase().includes('cha') ||
      org?.name?.toLowerCase().includes('custom');

    const index = db.organizationSubscriptions.findIndex((s) => s.organizationId === organizationId);
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // Exactly 3 days

    sub.planId = isCha ? 'cha_professional' : 'professional';
    sub.status = 'trial';
    sub.trialStartDate = now.toISOString();
    sub.trialEndDate = trialEnd.toISOString();
    sub.hasUsedTrial = true;
    sub.updatedAt = now.toISOString();

    if (index >= 0) {
      db.organizationSubscriptions[index] = sub;
    } else {
      db.organizationSubscriptions.push(sub);
    }
    writeDb(db);

    // Grant credits for the trial period
    if (isCha) {
      await walletRepo.addCredits(
        organizationId,
        {
          quotations: 200,
          proformaInvoices: 150,
          commercialInvoices: 150,
          packingLists: 150,
          aiMessages: 500,
        },
        'subscription'
      );
    } else {
      await walletRepo.addCredits(
        organizationId,
        {
          quotations: 50,
          proformaInvoices: 30,
          commercialInvoices: 30,
          packingLists: 30,
          aiMessages: 200,
        },
        'subscription'
      );
    }

    return {
      success: true,
      subscription: sub,
      message: isCha
        ? '3-Day CHA Professional Trial activated successfully!'
        : '3-Day Professional Trial activated successfully!',
    };
  },

  async updateSubscriptionByAdmin(
    organizationId: string,
    updates: {
      planId: string;
      status?: 'active' | 'trial' | 'expired' | 'cancelled';
      billingCycle?: 'monthly' | 'annual';
      customLimits?: any;
      grantCredits?: Partial<DocumentAllowance>;
      extendTrialDays?: number;
    }
  ): Promise<OrganizationSubscription> {
    const db = readDb();
    const sub = await this.getOrCreateSubscription(organizationId);
    const index = db.organizationSubscriptions.findIndex((s) => s.organizationId === organizationId);
    const now = new Date();

    sub.planId = updates.planId as any;
    if (updates.status) sub.status = updates.status;
    if (updates.billingCycle) sub.billingCycle = updates.billingCycle;
    if (updates.customLimits) sub.customLimits = updates.customLimits;

    if (updates.extendTrialDays && updates.extendTrialDays > 0) {
      const baseDate = sub.trialEndDate && new Date(sub.trialEndDate) > now ? new Date(sub.trialEndDate) : now;
      sub.trialEndDate = new Date(baseDate.getTime() + updates.extendTrialDays * 24 * 60 * 60 * 1000).toISOString();
      sub.status = 'trial';
    }

    sub.updatedAt = now.toISOString();
    db.organizationSubscriptions[index] = sub;
    writeDb(db);

    if (updates.grantCredits) {
      await walletRepo.addCredits(organizationId, updates.grantCredits, 'subscription');
    }

    return sub;
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

// ================= CHA CLIENT REPOSITORY =================
export const chaClientRepo = {
  async listByOrg(orgId: string): Promise<ChaClient[]> {
    const db = readDb();
    try {
      const supabase = createAdminClient();
      if (supabase) {
        const { data } = await supabase.from('cha_clients').select('*').eq('cha_org_id', orgId).order('company_name');
        if (data && data.length > 0) {
          const mapped: ChaClient[] = data.map((d: any) => ({
            id: d.id,
            chaOrgId: d.cha_org_id,
            clientOrgId: d.client_org_id,
            companyName: d.company_name,
            iecNumber: d.iec_number,
            gstin: d.gstin,
            pan: d.pan,
            contactPerson: d.contact_person,
            email: d.email,
            phone: d.phone,
            address: d.address,
            city: d.city,
            state: d.state,
            pincode: d.pincode,
            country: d.country,
            kycStatus: d.kyc_status,
            kycDocuments: d.kyc_documents,
            creditTerms: d.credit_terms,
            notes: d.notes,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          }));
          return mapped;
        }
      }
    } catch {}
    return (db.chaClients || []).filter((c) => c.chaOrgId === orgId);
  },

  async findById(id: string): Promise<ChaClient | null> {
    const db = readDb();
    const local = (db.chaClients || []).find((c) => c.id === id);
    if (local) return local;
    try {
      const supabase = createAdminClient();
      if (supabase) {
        const { data } = await supabase.from('cha_clients').select('*').eq('id', id).single();
        if (data) {
          return {
            id: data.id,
            chaOrgId: data.cha_org_id,
            clientOrgId: data.client_org_id,
            companyName: data.company_name,
            iecNumber: data.iec_number,
            gstin: data.gstin,
            pan: data.pan,
            contactPerson: data.contact_person,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            country: data.country,
            kycStatus: data.kyc_status,
            kycDocuments: data.kyc_documents,
            creditTerms: data.credit_terms,
            notes: data.notes,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
      }
    } catch {}
    return null;
  },

  async create(data: Omit<ChaClient, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChaClient> {
    const now = new Date().toISOString();
    const client: ChaClient = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    try {
      const supabase = createAdminClient();
      if (supabase) {
        await supabase.from('cha_clients').insert({
          id: client.id,
          cha_org_id: client.chaOrgId,
          client_org_id: client.clientOrgId,
          company_name: client.companyName,
          iec_number: client.iecNumber,
          gstin: client.gstin,
          pan: client.pan,
          contact_person: client.contactPerson,
          email: client.email,
          phone: client.phone,
          address: client.address,
          city: client.city,
          state: client.state,
          pincode: client.pincode,
          country: client.country,
          kyc_status: client.kycStatus,
          kyc_documents: client.kycDocuments,
          credit_terms: client.creditTerms,
          notes: client.notes,
          created_at: client.createdAt,
          updated_at: client.updatedAt,
        });
      }
    } catch {}

    const db = readDb();
    if (!db.chaClients) db.chaClients = [];
    db.chaClients.push(client);
    writeDb(db);
    return client;
  },

  async update(id: string, updates: Partial<ChaClient>): Promise<ChaClient | null> {
    const now = new Date().toISOString();
    const db = readDb();
    if (!db.chaClients) db.chaClients = [];
    const index = db.chaClients.findIndex((c) => c.id === id);
    if (index === -1) return null;

    db.chaClients[index] = {
      ...db.chaClients[index],
      ...updates,
      updatedAt: now,
    };
    writeDb(db);

    try {
      const supabase = createAdminClient();
      if (supabase) {
        const payload: any = { updated_at: now };
        if (updates.companyName !== undefined) payload.company_name = updates.companyName;
        if (updates.iecNumber !== undefined) payload.iec_number = updates.iecNumber;
        if (updates.gstin !== undefined) payload.gstin = updates.gstin;
        if (updates.pan !== undefined) payload.pan = updates.pan;
        if (updates.contactPerson !== undefined) payload.contact_person = updates.contactPerson;
        if (updates.email !== undefined) payload.email = updates.email;
        if (updates.phone !== undefined) payload.phone = updates.phone;
        if (updates.address !== undefined) payload.address = updates.address;
        if (updates.kycStatus !== undefined) payload.kyc_status = updates.kycStatus;
        if (updates.notes !== undefined) payload.notes = updates.notes;
        await supabase.from('cha_clients').update(payload).eq('id', id);
      }
    } catch {}

    return db.chaClients[index];
  },

  async delete(id: string): Promise<boolean> {
    const db = readDb();
    if (!db.chaClients) return false;
    const initialLen = db.chaClients.length;
    db.chaClients = db.chaClients.filter((c) => c.id !== id);
    writeDb(db);

    try {
      const supabase = createAdminClient();
      if (supabase) {
        await supabase.from('cha_clients').delete().eq('id', id);
      }
    } catch {}

    return db.chaClients.length < initialLen;
  },
};

// ================= CUSTOMS JOB REPOSITORY =================
export const customsJobRepo = {
  async getNextJobNumber(orgId: string, jobType: string): Promise<string> {
    const prefix = jobType === 'import' ? 'IMP' : jobType === 'export' ? 'EXP' : 'JOB';
    const year = new Date().getFullYear();
    const db = readDb();
    const count = (db.customsJobs || []).filter((j) => j.chaOrgId === orgId).length + 1;
    return `${prefix}-${year}-${String(count).padStart(4, '0')}`;
  },

  async listByOrg(orgId: string, filter?: { jobType?: string; status?: string; clientId?: string }): Promise<CustomsJob[]> {
    const db = readDb();
    try {
      const supabase = createAdminClient();
      if (supabase) {
        let q = supabase.from('customs_jobs').select('*').eq('cha_org_id', orgId);
        if (filter?.jobType) q = q.eq('job_type', filter.jobType);
        if (filter?.status) q = q.eq('status', filter.status);
        if (filter?.clientId) q = q.eq('client_id', filter.clientId);
        const { data } = await q.order('created_at', { ascending: false });
        if (data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            chaOrgId: d.cha_org_id,
            clientId: d.client_id,
            clientName: d.client_name,
            jobNumber: d.job_number,
            jobType: d.job_type,
            status: d.status,
            customsStation: d.customs_station,
            customsHouseCode: d.customs_house_code,
            billOfEntryNumber: d.bill_of_entry_number,
            billOfEntryDate: d.bill_of_entry_date,
            shippingBillNumber: d.shipping_bill_number,
            shippingBillDate: d.shipping_bill_date,
            irnNumber: d.irn_number,
            drnNumber: d.drn_number,
            leoNumber: d.leo_number,
            leoDate: d.leo_date,
            oocNumber: d.ooc_number,
            oocDate: d.ooc_date,
            igmNumber: d.igm_number,
            igmDate: d.igm_date,
            blAwbNumber: d.bl_awb_number,
            blAwbDate: d.bl_awb_date,
            containerNumbers: d.container_numbers || [],
            invoiceNumber: d.invoice_number,
            invoiceValue: d.invoice_value,
            currency: d.currency || 'USD',
            totalPackages: d.total_packages,
            grossWeightKg: d.gross_weight_kg,
            portOfLoading: d.port_of_loading,
            portOfDischarge: d.port_of_discharge,
            goodsDescription: d.goods_description,
            hsCodes: d.hs_codes || [],
            assignedTo: d.assigned_to,
            estimatedDutyInr: d.estimated_duty_inr,
            actualDutyPaidInr: d.actual_duty_paid_inr,
            chaChargesInr: d.cha_charges_inr,
            notes: d.notes,
            checklistCompletionRate: d.checklist_completion_rate || 0,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          }));
        }
      }
    } catch {}

    let list = (db.customsJobs || []).filter((j) => j.chaOrgId === orgId);
    if (filter?.jobType) list = list.filter((j) => j.jobType === filter.jobType);
    if (filter?.status) list = list.filter((j) => j.status === filter.status);
    if (filter?.clientId) list = list.filter((j) => j.clientId === filter.clientId);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async findById(id: string): Promise<CustomsJob | null> {
    const db = readDb();
    const local = (db.customsJobs || []).find((j) => j.id === id);
    if (local) return local;

    try {
      const supabase = createAdminClient();
      if (supabase) {
        const { data } = await supabase.from('customs_jobs').select('*').eq('id', id).single();
        if (data) {
          return {
            id: data.id,
            chaOrgId: data.cha_org_id,
            clientId: data.client_id,
            clientName: data.client_name,
            jobNumber: data.job_number,
            jobType: data.job_type,
            status: data.status,
            customsStation: data.customs_station,
            customsHouseCode: data.customs_house_code,
            billOfEntryNumber: data.bill_of_entry_number,
            billOfEntryDate: data.bill_of_entry_date,
            shippingBillNumber: data.shipping_bill_number,
            shippingBillDate: data.shipping_bill_date,
            irnNumber: data.irn_number,
            drnNumber: data.drn_number,
            leoNumber: data.leo_number,
            leoDate: data.leo_date,
            oocNumber: data.ooc_number,
            oocDate: data.ooc_date,
            igmNumber: data.igm_number,
            igmDate: data.igm_date,
            blAwbNumber: data.bl_awb_number,
            blAwbDate: data.bl_awb_date,
            containerNumbers: data.container_numbers || [],
            invoiceNumber: data.invoice_number,
            invoiceValue: data.invoice_value,
            currency: data.currency || 'USD',
            totalPackages: data.total_packages,
            grossWeightKg: data.gross_weight_kg,
            portOfLoading: data.port_of_loading,
            portOfDischarge: data.port_of_discharge,
            goodsDescription: data.goods_description,
            hsCodes: data.hs_codes || [],
            assignedTo: data.assigned_to,
            estimatedDutyInr: data.estimated_duty_inr,
            actualDutyPaidInr: data.actual_duty_paid_inr,
            chaChargesInr: data.cha_charges_inr,
            notes: data.notes,
            checklistCompletionRate: data.checklist_completion_rate || 0,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
      }
    } catch {}
    return null;
  },

  async create(data: Omit<CustomsJob, 'id' | 'createdAt' | 'updatedAt' | 'jobNumber'> & { jobNumber?: string }): Promise<CustomsJob> {
    const now = new Date().toISOString();
    const jobNumber = data.jobNumber || (await this.getNextJobNumber(data.chaOrgId, data.jobType));
    const job: CustomsJob = {
      ...data,
      id: crypto.randomUUID(),
      jobNumber,
      checklistCompletionRate: 0,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const supabase = createAdminClient();
      if (supabase) {
        await supabase.from('customs_jobs').insert({
          id: job.id,
          cha_org_id: job.chaOrgId,
          client_id: job.clientId,
          client_name: job.clientName,
          job_number: job.jobNumber,
          job_type: job.jobType,
          status: job.status,
          customs_station: job.customsStation,
          customs_house_code: job.customsHouseCode,
          bill_of_entry_number: job.billOfEntryNumber,
          bill_of_entry_date: job.billOfEntryDate,
          shipping_bill_number: job.shippingBillNumber,
          shipping_bill_date: job.shippingBillDate,
          irn_number: job.irnNumber,
          drn_number: job.drnNumber,
          leo_number: job.leoNumber,
          leo_date: job.leoDate,
          ooc_number: job.oocNumber,
          ooc_date: job.oocDate,
          igm_number: job.igmNumber,
          igm_date: job.igmDate,
          bl_awb_number: job.blAwbNumber,
          bl_awb_date: job.blAwbDate,
          container_numbers: job.containerNumbers,
          invoice_number: job.invoiceNumber,
          invoice_value: job.invoiceValue,
          currency: job.currency,
          total_packages: job.totalPackages,
          gross_weight_kg: job.grossWeightKg,
          port_of_loading: job.portOfLoading,
          port_of_discharge: job.portOfDischarge,
          goods_description: job.goodsDescription,
          hs_codes: job.hsCodes,
          assigned_to: job.assignedTo,
          estimated_duty_inr: job.estimatedDutyInr,
          actual_duty_paid_inr: job.actualDutyPaidInr,
          cha_charges_inr: job.chaChargesInr,
          notes: job.notes,
          checklist_completion_rate: 0,
          created_at: job.createdAt,
          updated_at: job.updatedAt,
        });
      }
    } catch {}

    const db = readDb();
    if (!db.customsJobs) db.customsJobs = [];
    db.customsJobs.push(job);
    writeDb(db);

    // Also auto-initialize default checklist for this job type
    await customsChecklistRepo.initializeChecklistForJobType(job.id, job.jobType);

    return job;
  },

  async update(id: string, updates: Partial<CustomsJob>): Promise<CustomsJob | null> {
    const now = new Date().toISOString();
    const db = readDb();
    if (!db.customsJobs) db.customsJobs = [];
    const index = db.customsJobs.findIndex((j) => j.id === id);
    if (index === -1) return null;

    db.customsJobs[index] = {
      ...db.customsJobs[index],
      ...updates,
      updatedAt: now,
    };
    writeDb(db);

    try {
      const supabase = createAdminClient();
      if (supabase) {
        const payload: any = { updated_at: now };
        if (updates.status !== undefined) payload.status = updates.status;
        if (updates.billOfEntryNumber !== undefined) payload.bill_of_entry_number = updates.billOfEntryNumber;
        if (updates.billOfEntryDate !== undefined) payload.bill_of_entry_date = updates.billOfEntryDate;
        if (updates.shippingBillNumber !== undefined) payload.shipping_bill_number = updates.shippingBillNumber;
        if (updates.shippingBillDate !== undefined) payload.shipping_bill_date = updates.shippingBillDate;
        if (updates.irnNumber !== undefined) payload.irn_number = updates.irnNumber;
        if (updates.drnNumber !== undefined) payload.drn_number = updates.drnNumber;
        if (updates.leoNumber !== undefined) payload.leo_number = updates.leoNumber;
        if (updates.leoDate !== undefined) payload.leo_date = updates.leoDate;
        if (updates.oocNumber !== undefined) payload.ooc_number = updates.oocNumber;
        if (updates.oocDate !== undefined) payload.ooc_date = updates.oocDate;
        if (updates.igmNumber !== undefined) payload.igm_number = updates.igmNumber;
        if (updates.blAwbNumber !== undefined) payload.bl_awb_number = updates.blAwbNumber;
        if (updates.checklistCompletionRate !== undefined) payload.checklist_completion_rate = updates.checklistCompletionRate;
        if (updates.notes !== undefined) payload.notes = updates.notes;
        await supabase.from('customs_jobs').update(payload).eq('id', id);
      }
    } catch {}

    return db.customsJobs[index];
  },
};

// ================= CUSTOMS CHECKLIST REPOSITORY =================
export const customsChecklistRepo = {
  async listByJob(jobId: string): Promise<CustomsDocumentChecklist[]> {
    const db = readDb();
    return (db.customsDocumentChecklists || [])
      .filter((c) => c.jobId === jobId)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  },

  async initializeChecklistForJobType(jobId: string, jobType: string): Promise<CustomsDocumentChecklist[]> {
    const db = readDb();
    const existing = (db.customsDocumentChecklists || []).filter((c) => c.jobId === jobId);
    if (existing.length > 0) return existing;

    const defaultItems =
      jobType === 'import'
        ? [
            { name: 'Commercial Invoice', required: true, desc: 'Supplier signed invoice with terms & HS codes' },
            { name: 'Packing List', required: true, desc: 'Package breakdown, gross & net weight' },
            { name: 'Bill of Lading / Airway Bill', required: true, desc: 'Original / Express BL / AWB' },
            { name: 'GATT Valuation Declaration', required: true, desc: 'Rule 10 valuation disclosure' },
            { name: 'Certificate of Origin (COO)', required: false, desc: 'Preferential tariff benefit if applicable (e.g. FTA)' },
            { name: 'Import License / Authorization', required: false, desc: 'DGFT license or notification compliance if restricted' },
            { name: 'e-SANCHIT Document Upload', required: true, desc: 'Supporting docs uploaded on ICEGATE with IRN generated' },
            { name: 'Duty Payment Challan', required: false, desc: 'ICEGATE ECL or customs duty receipt' },
            { name: 'Out of Charge (OOC) Copy', required: false, desc: 'Customs final clearance receipt' },
          ]
        : [
            { name: 'Commercial Invoice', required: true, desc: 'Export commercial invoice with LUT reference' },
            { name: 'Packing List', required: true, desc: 'Detailed packing list with mark & numbers' },
            { name: 'Shipping Instructions (SI)', required: true, desc: 'Instructions to shipping line for BL release' },
            { name: 'LUT / Bond Reference', required: true, desc: 'GST Letter of Undertaking for zero-rated export' },
            { name: 'Certificate of Origin', required: false, desc: 'Chamber of Commerce / EPC issued COO' },
            { name: 'e-SANCHIT Upload', required: true, desc: 'Mandatory e-SANCHIT IRN record' },
            { name: 'Let Export Order (LEO) Copy', required: false, desc: 'Customs Officer stamped clearance order' },
          ];

    const now = new Date().toISOString();
    const newItems: CustomsDocumentChecklist[] = defaultItems.map((item, index) => ({
      id: crypto.randomUUID(),
      jobId,
      documentName: item.name,
      documentType: item.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      isRequired: item.required,
      isReceived: false,
      isVerified: false,
      isEsanchitUploaded: false,
      notes: item.desc,
      orderIndex: index + 1,
      createdAt: now,
      updatedAt: now,
    }));

    if (!db.customsDocumentChecklists) db.customsDocumentChecklists = [];
    db.customsDocumentChecklists.push(...newItems);
    writeDb(db);

    return newItems;
  },

  async updateItem(id: string, updates: Partial<CustomsDocumentChecklist>): Promise<CustomsDocumentChecklist | null> {
    const now = new Date().toISOString();
    const db = readDb();
    if (!db.customsDocumentChecklists) db.customsDocumentChecklists = [];
    const index = db.customsDocumentChecklists.findIndex((i) => i.id === id);
    if (index === -1) return null;

    db.customsDocumentChecklists[index] = {
      ...db.customsDocumentChecklists[index],
      ...updates,
      updatedAt: now,
    };

    // Calculate completion rate for parent job
    const jobId = db.customsDocumentChecklists[index].jobId;
    const jobItems = db.customsDocumentChecklists.filter((i) => i.jobId === jobId && i.isRequired);
    const completed = jobItems.filter((i) => i.isReceived && i.isVerified).length;
    const rate = jobItems.length > 0 ? Math.round((completed / jobItems.length) * 100) : 0;

    writeDb(db);
    await customsJobRepo.update(jobId, { checklistCompletionRate: rate });

    return db.customsDocumentChecklists[index];
  },
};

// ================= E-SANCHIT REPOSITORY =================
export const esanchitRepo = {
  async listByJob(jobId: string): Promise<EsanchitRecord[]> {
    const db = readDb();
    return (db.esanchitRecords || []).filter((r) => r.jobId === jobId);
  },

  async listByOrg(orgId: string): Promise<EsanchitRecord[]> {
    const db = readDb();
    return (db.esanchitRecords || []).filter((r) => r.chaOrgId === orgId);
  },

  async findById(id: string): Promise<EsanchitRecord | null> {
    const db = readDb();
    return (db.esanchitRecords || []).find((r) => r.id === id) || null;
  },

  async create(data: Omit<EsanchitRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<EsanchitRecord> {
    const now = new Date().toISOString();
    const record: EsanchitRecord = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    const db = readDb();
    if (!db.esanchitRecords) db.esanchitRecords = [];
    db.esanchitRecords.push(record);
    writeDb(db);

    try {
      const supabase = createAdminClient();
      if (supabase) {
        await supabase.from('esanchit_document_records').insert({
          id: record.id,
          job_id: record.jobId,
          cha_org_id: record.chaOrgId,
          document_code: record.documentCode,
          document_name: record.documentName,
          document_reference: record.documentReference,
          irn_number: record.irnNumber,
          drn_number: record.drnNumber,
          upload_status: record.uploadStatus,
          icegate_user_id: record.icegateUserId,
          file_name: record.fileName,
          file_url: record.fileUrl,
          file_size_bytes: record.fileSizeBytes,
          uploaded_at: record.uploadedAt,
          notes: record.notes,
        });
      }
    } catch {}

    return record;
  },

  async update(id: string, updates: Partial<EsanchitRecord>): Promise<EsanchitRecord | null> {
    const now = new Date().toISOString();
    const db = readDb();
    if (!db.esanchitRecords) db.esanchitRecords = [];
    const index = db.esanchitRecords.findIndex((r) => r.id === id);
    if (index === -1) return null;

    db.esanchitRecords[index] = {
      ...db.esanchitRecords[index],
      ...updates,
      updatedAt: now,
    };
    writeDb(db);
    return db.esanchitRecords[index];
  },
};

// ================= CUSTOMS QUERY REPOSITORY =================
export const customsQueryRepo = {
  async listByJob(jobId: string): Promise<CustomsQuery[]> {
    const db = readDb();
    return (db.customsQueries || []).filter((q) => q.jobId === jobId);
  },

  async create(data: Omit<CustomsQuery, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomsQuery> {
    const now = new Date().toISOString();
    const query: CustomsQuery = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    const db = readDb();
    if (!db.customsQueries) db.customsQueries = [];
    db.customsQueries.push(query);
    writeDb(db);
    return query;
  },

  async reply(id: string, replyText: string, responderId: string): Promise<CustomsQuery | null> {
    const now = new Date().toISOString();
    const db = readDb();
    if (!db.customsQueries) db.customsQueries = [];
    const index = db.customsQueries.findIndex((q) => q.id === id);
    if (index === -1) return null;

    db.customsQueries[index] = {
      ...db.customsQueries[index],
      chaReply: replyText,
      replyDate: now,
      status: 'replied',
      updatedAt: now,
    };
    writeDb(db);
    return db.customsQueries[index];
  },

  async resolve(id: string): Promise<CustomsQuery | null> {
    const now = new Date().toISOString();
    const db = readDb();
    if (!db.customsQueries) db.customsQueries = [];
    const index = db.customsQueries.findIndex((q) => q.id === id);
    if (index === -1) return null;

    db.customsQueries[index] = {
      ...db.customsQueries[index],
      status: 'resolved',
      updatedAt: now,
    };
    writeDb(db);
    return db.customsQueries[index];
  },
};

// ================= SIGNATURE & STAMP REPOSITORY =================
export const signatureRepo = {
  async listByOrg(orgId: string): Promise<SignatureAsset[]> {
    const db = readDb();
    return (db.signatureAssets || []).filter((s) => s.orgId === orgId);
  },

  async getActiveSignature(orgId: string, signatoryName?: string): Promise<SignatureAsset | null> {
    const db = readDb();
    const list = (db.signatureAssets || []).filter((s) => s.orgId === orgId && s.isActive);
    if (signatoryName) {
      const match = list.find((s) => s.signatoryName.toLowerCase() === signatoryName.toLowerCase());
      if (match) return match;
    }
    return list.find((s) => s.assetType === 'signature') || list[0] || null;
  },

  async create(data: Omit<SignatureAsset, 'id' | 'createdAt' | 'updatedAt'>): Promise<SignatureAsset> {
    const now = new Date().toISOString();
    const asset: SignatureAsset = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    const db = readDb();
    if (!db.signatureAssets) db.signatureAssets = [];
    db.signatureAssets.push(asset);
    writeDb(db);

    try {
      const supabase = createAdminClient();
      if (supabase) {
        await supabase.from('signature_assets').insert({
          id: asset.id,
          org_id: asset.orgId,
          user_id: asset.userId,
          signatory_name: asset.signatoryName,
          designation: asset.designation,
          asset_type: asset.assetType,
          original_image_url: asset.originalImageUrl,
          processed_png_url: asset.processedPngUrl,
          is_active: asset.isActive,
          crop_settings: asset.cropSettings,
        });
      }
    } catch {}

    return asset;
  },

  async update(id: string, updates: Partial<SignatureAsset>): Promise<SignatureAsset | null> {
    const now = new Date().toISOString();
    const db = readDb();
    if (!db.signatureAssets) db.signatureAssets = [];
    const index = db.signatureAssets.findIndex((s) => s.id === id);
    if (index === -1) return null;

    db.signatureAssets[index] = {
      ...db.signatureAssets[index],
      ...updates,
      updatedAt: now,
    };
    writeDb(db);
    return db.signatureAssets[index];
  },

  async delete(id: string): Promise<boolean> {
    const db = readDb();
    if (!db.signatureAssets) return false;
    const initialLen = db.signatureAssets.length;
    db.signatureAssets = db.signatureAssets.filter((s) => s.id !== id);
    writeDb(db);
    return db.signatureAssets.length < initialLen;
  },
};

// ================= AUDIT LOG REPOSITORY =================
export const auditRepo = {
  async logDocumentEvent(event: Omit<DocumentAuditEvent, 'id' | 'timestamp'>): Promise<DocumentAuditEvent> {
    const now = new Date().toISOString();
    const record: DocumentAuditEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: now,
    };
    const db = readDb();
    if (!db.documentAuditEvents) db.documentAuditEvents = [];
    db.documentAuditEvents.unshift(record);
    if (db.documentAuditEvents.length > 5000) db.documentAuditEvents.pop();
    writeDb(db);

    try {
      const supabase = createAdminClient();
      if (supabase) {
        await supabase.from('document_audit_events').insert({
          id: record.id,
          document_id: record.documentId,
          org_id: record.orgId,
          actor_id: record.actorId,
          actor_email: record.actorEmail,
          actor_name: record.actorName,
          action: record.action,
          details: record.details,
          ip_address: record.ipAddress,
          timestamp: record.timestamp,
        });
      }
    } catch {}

    return record;
  },

  async listByDocument(documentId: string): Promise<DocumentAuditEvent[]> {
    const db = readDb();
    return (db.documentAuditEvents || []).filter((e) => e.documentId === documentId);
  },

  async listByOrg(orgId: string, limit = 50): Promise<DocumentAuditEvent[]> {
    const db = readDb();
    return (db.documentAuditEvents || [])
      .filter((e) => e.orgId === orgId)
      .slice(0, limit);
  },
};

// ================= API KEY REPOSITORY =================
export const apiKeyRepo = {
  async listByOrg(orgId: string): Promise<ApiKey[]> {
    const db = readDb();
    return (db.apiKeys || []).filter((k) => k.orgId === orgId);
  },

  async createKey(orgId: string, name: string, permissions: string[], createdBy: string): Promise<{ apiKey: ApiKey; rawKey: string }> {
    const rawKey = `ef_${crypto.randomBytes(24).toString('hex')}`;
    const keyPrefix = rawKey.substring(0, 8);
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const now = new Date().toISOString();

    const apiKey: ApiKey = {
      id: crypto.randomUUID(),
      orgId,
      name,
      keyPrefix,
      keyHash,
      permissions,
      isActive: true,
      totalRequests: 0,
      createdAt: now,
      updatedAt: now,
    };

    const db = readDb();
    if (!db.apiKeys) db.apiKeys = [];
    db.apiKeys.push(apiKey);
    writeDb(db);

    return { apiKey, rawKey };
  },

  async verifyKey(rawKey: string): Promise<{ valid: boolean; apiKey?: ApiKey }> {
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const db = readDb();
    const key = (db.apiKeys || []).find((k) => k.keyHash === keyHash && k.isActive);
    if (!key) return { valid: false };

    // Update last used & request count
    key.lastUsedAt = new Date().toISOString();
    key.totalRequests = (key.totalRequests || 0) + 1;
    writeDb(db);

    return { valid: true, apiKey: key };
  },

  async revokeKey(id: string): Promise<boolean> {
    const db = readDb();
    if (!db.apiKeys) return false;
    const key = db.apiKeys.find((k) => k.id === id);
    if (!key) return false;
    key.isActive = false;
    key.updatedAt = new Date().toISOString();
    writeDb(db);
    return true;
  },

  async logUsage(log: Omit<ApiUsageLog, 'id' | 'timestamp'>): Promise<void> {
    const record: ApiUsageLog = {
      ...log,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    const db = readDb();
    if (!db.apiUsageLogs) db.apiUsageLogs = [];
    db.apiUsageLogs.unshift(record);
    if (db.apiUsageLogs.length > 2000) db.apiUsageLogs.pop();
    writeDb(db);
  },
};

// ================= TEAM REPOSITORY =================
export const teamRepo = {
  async listByOrg(orgId: string): Promise<OrganizationTeamMember[]> {
    const db = readDb();
    return (db.organizationTeamMembers || []).filter((m) => m.orgId === orgId);
  },

  async inviteMember(data: Omit<OrganizationTeamMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<OrganizationTeamMember> {
    const now = new Date().toISOString();
    const member: OrganizationTeamMember = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    const db = readDb();
    if (!db.organizationTeamMembers) db.organizationTeamMembers = [];
    db.organizationTeamMembers.push(member);
    writeDb(db);
    return member;
  },

  async updateRole(id: string, role: OrganizationTeamMember['role'], permissions?: string[]): Promise<boolean> {
    const db = readDb();
    if (!db.organizationTeamMembers) return false;
    const member = db.organizationTeamMembers.find((m) => m.id === id);
    if (!member) return false;
    member.role = role;
    if (permissions) member.permissions = permissions;
    member.updatedAt = new Date().toISOString();
    writeDb(db);
    return true;
  },

  async removeMember(id: string): Promise<boolean> {
    const db = readDb();
    if (!db.organizationTeamMembers) return false;
    const initLen = db.organizationTeamMembers.length;
    db.organizationTeamMembers = db.organizationTeamMembers.filter((m) => m.id !== id);
    writeDb(db);
    return db.organizationTeamMembers.length < initLen;
  },
};

// ================= CUSTOM TEMPLATE REPOSITORY =================
export const customTemplateRepo = {
  async listByOrg(orgId: string): Promise<CustomTemplate[]> {
    const db = readDb();
    return (db.customTemplates || []).filter((t) => t.orgId === orgId);
  },

  async create(data: Omit<CustomTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomTemplate> {
    const now = new Date().toISOString();
    const template: CustomTemplate = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    const db = readDb();
    if (!db.customTemplates) db.customTemplates = [];
    db.customTemplates.push(template);
    writeDb(db);
    return template;
  },

  async update(id: string, updates: Partial<CustomTemplate>): Promise<CustomTemplate | null> {
    const now = new Date().toISOString();
    const db = readDb();
    if (!db.customTemplates) db.customTemplates = [];
    const index = db.customTemplates.findIndex((t) => t.id === id);
    if (index === -1) return null;
    db.customTemplates[index] = { ...db.customTemplates[index], ...updates, updatedAt: now };
    writeDb(db);
    return db.customTemplates[index];
  },

  async delete(id: string): Promise<boolean> {
    const db = readDb();
    if (!db.customTemplates) return false;
    const initLen = db.customTemplates.length;
    db.customTemplates = db.customTemplates.filter((t) => t.id !== id);
    writeDb(db);
    return db.customTemplates.length < initLen;
  },
};

// ================= AI REVIEW REPOSITORY =================
export const aiReviewRepo = {
  async saveReview(data: Omit<AiDocumentReview, 'id' | 'createdAt'>): Promise<AiDocumentReview> {
    const review: AiDocumentReview = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const db = readDb();
    if (!db.aiDocumentReviews) db.aiDocumentReviews = [];
    db.aiDocumentReviews.unshift(review);
    writeDb(db);
    return review;
  },

  async getReview(id: string): Promise<AiDocumentReview | null> {
    const db = readDb();
    return (db.aiDocumentReviews || []).find((r) => r.id === id) || null;
  },

  async listByDocument(documentId: string): Promise<AiDocumentReview[]> {
    const db = readDb();
    return (db.aiDocumentReviews || []).filter((r) => r.documentId === documentId);
  },
};

// ================= CHA DOCUMENT REPOSITORY =================
export const chaDocRepo = {
  async listByOrg(orgId: string, clientId?: string): Promise<ChaDocument[]> {
    const db = readDb();
    const list = (db.chaDocuments || []).filter((d) => d.chaOrgId === orgId);
    if (clientId) {
      return list.filter((d) => d.clientId === clientId);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async findById(id: string): Promise<ChaDocument | null> {
    const db = readDb();
    return (db.chaDocuments || []).find((d) => d.id === id) || null;
  },

  async getLatestForClient(clientId: string): Promise<ChaDocument | null> {
    const db = readDb();
    const docs = (db.chaDocuments || [])
      .filter((d) => d.clientId === clientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return docs[0] || null;
  },

  async countForClient(clientId: string): Promise<number> {
    const db = readDb();
    return (db.chaDocuments || []).filter((d) => d.clientId === clientId).length;
  },

  async getNextDocNumber(orgId: string, type: ChaDocumentType): Promise<string> {
    const prefixMap: Record<ChaDocumentType, string> = {
      boe_worksheet: 'BOE-WS',
      shipping_bill_checklist: 'SB-CHK',
      gatt_declaration: 'GATT-DEC',
      cha_authorization: 'CHA-AUTH',
      customs_query_reply: 'QR-REP',
      delivery_order_memo: 'DO-MEMO',
      cha_duty_debit_note: 'DN-DUTY',
      customs_kyc_form: 'KYC-VER',
    };
    const prefix = prefixMap[type] || 'CHA-DOC';
    const year = new Date().getFullYear();
    const db = readDb();
    const count = (db.chaDocuments || []).filter((d) => d.chaOrgId === orgId && d.type === type).length + 1;
    return `${prefix}/${year}/${String(count).padStart(4, '0')}`;
  },

  async create(data: Omit<ChaDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChaDocument> {
    const now = new Date().toISOString();
    const doc: ChaDocument = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    const db = readDb();
    if (!db.chaDocuments) db.chaDocuments = [];
    db.chaDocuments.unshift(doc);
    writeDb(db);
    return doc;
  },

  async update(id: string, updates: Partial<ChaDocument>): Promise<ChaDocument | null> {
    const now = new Date().toISOString();
    const db = readDb();
    if (!db.chaDocuments) db.chaDocuments = [];
    const index = db.chaDocuments.findIndex((d) => d.id === id);
    if (index === -1) return null;
    db.chaDocuments[index] = {
      ...db.chaDocuments[index],
      ...updates,
      updatedAt: now,
    };
    writeDb(db);
    return db.chaDocuments[index];
  },

  async delete(id: string): Promise<boolean> {
    const db = readDb();
    if (!db.chaDocuments) return false;
    const initialLen = db.chaDocuments.length;
    db.chaDocuments = db.chaDocuments.filter((d) => d.id !== id);
    writeDb(db);
    return db.chaDocuments.length < initialLen;
  },
};



