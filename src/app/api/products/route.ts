import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentContext } from '@/lib/auth';
import { productRepo, adminRepo } from '@/lib/db';

const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().default(''),
  specifications: z.string().optional(),
  hsCode: z.string().min(2, 'HS/HSN code is required'),
  countryOfOrigin: z.string().default('India'),
  unit: z.string().default('PCS'),
  defaultCurrency: z.string().default('USD'),
  purchaseCost: z.number().nonnegative().default(0),
  sellingPrice: z.number().nonnegative().default(0),
  moq: z.number().int().positive().default(1),
  packagingDetails: z.string().optional(),
  netWeight: z.number().nonnegative().default(0),
  grossWeight: z.number().nonnegative().default(0),
  cbm: z.number().nonnegative().default(0),
  stockQuantity: z.number().int().nonnegative().default(0),
  lowStockThreshold: z.number().int().nonnegative().default(10),
  imageUrl: z.string().optional(),
  status: z.enum(['active', 'archived']).default('active'),
});

export async function GET() {
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const products = await productRepo.listByOrg(ctx.organization.id);
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.organization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const result = productSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: (result.error as any).issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const product = await productRepo.create(ctx.organization.id, result.data);

    await adminRepo.logActivity({
      userId: ctx.user.id,
      userName: ctx.user.name,
      organizationId: ctx.organization.id,
      action: 'PRODUCT_CREATED',
      entity: 'PRODUCT',
      entityId: product.id,
      details: `Added new product: ${product.name} (SKU: ${product.sku}, HS: ${product.hsCode})`,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
