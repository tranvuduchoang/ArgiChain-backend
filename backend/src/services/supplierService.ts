import { prisma } from '../config/database';
import {
  BrandMemberRole,
  BrandMemberStatus,
  Prisma,
  UserRole,
} from '@prisma/client';

export interface CreateSupplierInput {
  userId: string;
  businessName: string;
  slug: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  website?: string;
  location?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialLinks?: Record<string, unknown>;
}

export interface UpdateSupplierInput {
  supplierId: string;
  businessName?: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  website?: string;
  location?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialLinks?: Record<string, unknown>;
  isActive?: boolean;
}

export interface SupplierQueryParams {
  search?: string;
  isActive?: boolean;
  walletAddress?: string;
}

export interface AddBrandMemberInput {
  supplierId: string;
  userId: string;
  role?: BrandMemberRole;
}

export interface UpdateBrandMemberInput {
  supplierId: string;
  memberId: string;
  role?: BrandMemberRole;
  status?: BrandMemberStatus;
}

const buildSupplierWhere = (params: SupplierQueryParams = {}): Prisma.SupplierWhereInput => {
  const { search, isActive, walletAddress } = params;
  const where: Prisma.SupplierWhereInput = {};

  if (typeof isActive === 'boolean') {
    where.isActive = isActive;
  }

  if (walletAddress) {
    where.user = {
      walletAddress: walletAddress
    };
  }

  if (search) {
    where.OR = [
      { businessName: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
    ];
  }

  return where;
};

export async function createSupplier(input: CreateSupplierInput) {
  const existing = await prisma.supplier.findFirst({
    where: {
      OR: [{ userId: input.userId }, { slug: input.slug }],
    },
  });

  if (existing) {
    if (existing.userId === input.userId) {
      throw new Error('User already has a supplier profile');
    }
    throw new Error('Slug already in use');
  }

  return prisma.$transaction(async (tx) => {
    // Check if user exists, if not create one
    let user = await tx.user.findUnique({
      where: { id: input.userId }
    });

    if (!user) {
      // Create user with wallet address as ID
      user = await tx.user.create({
        data: {
          id: input.userId,
          email: `${input.userId}@wallet.local`,
          username: `user_${input.userId.slice(0, 8)}`,
          walletAddress: input.userId,
          role: UserRole.SUPPLIER,
          isSupplier: true,
          isVerified: true,
        }
      });
    } else {
      // Update existing user to supplier
      await tx.user.update({
        where: { id: input.userId },
        data: {
          isSupplier: true,
          role: UserRole.SUPPLIER,
        },
      });
    }

    const supplier = await tx.supplier.create({
      data: {
        userId: input.userId,
        businessName: input.businessName,
        slug: input.slug,
        description: input.description,
        logo: input.logo,
        coverImage: input.coverImage,
        website: input.website,
        location: input.location,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
        socialLinks: input.socialLinks ? (input.socialLinks as Prisma.JsonObject) : undefined,
        members: {
          create: {
            userId: input.userId,
            role: BrandMemberRole.OWNER,
            status: BrandMemberStatus.ACTIVE,
          },
        },
      },
      include: {
        user: true,
        members: true,
      },
    });

    return supplier;
  });
}

export async function listSuppliers(params?: SupplierQueryParams) {
  return prisma.supplier.findMany({
    where: buildSupplierWhere(params),
    include: {
      members: true,
      products: {
        take: 3,
        orderBy: { createdAt: 'desc' },
      },
      loyaltyPrograms: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getSupplierById(supplierId: string) {
  return prisma.supplier.findUnique({
    where: { id: supplierId },
    include: {
      user: true,
      members: true,
      products: true,
      loyaltyPrograms: true,
    },
  });
}

export async function getSupplierBySlug(slug: string) {
  return prisma.supplier.findUnique({
    where: { slug },
    include: {
      user: true,
      members: true,
      products: true,
      loyaltyPrograms: true,
    },
  });
}

export async function updateSupplier(input: UpdateSupplierInput) {
  const { supplierId, ...updates } = input;

  const data: Prisma.SupplierUpdateInput = {};

  if (updates.businessName !== undefined) data.businessName = updates.businessName;
  if (updates.description !== undefined) data.description = updates.description;
  if (updates.logo !== undefined) data.logo = updates.logo;
  if (updates.coverImage !== undefined) data.coverImage = updates.coverImage;
  if (updates.website !== undefined) data.website = updates.website;
  if (updates.location !== undefined) data.location = updates.location;
  if (updates.contactEmail !== undefined) data.contactEmail = updates.contactEmail;
  if (updates.contactPhone !== undefined) data.contactPhone = updates.contactPhone;
  if (updates.socialLinks !== undefined) data.socialLinks = updates.socialLinks as Prisma.JsonObject;
  if (updates.isActive !== undefined) data.isActive = updates.isActive;

  return prisma.supplier.update({
    where: { id: supplierId },
    data,
    include: {
      members: true,
      products: true,
    },
  });
}

export async function addBrandMember(input: AddBrandMemberInput) {
  const existingMember = await prisma.brandMember.findUnique({
    where: {
      supplierId_userId: {
        supplierId: input.supplierId,
        userId: input.userId,
      },
    },
  });

  if (existingMember) {
    if (existingMember.status === BrandMemberStatus.INACTIVE) {
      return prisma.brandMember.update({
        where: { id: existingMember.id },
        data: {
          status: BrandMemberStatus.ACTIVE,
          role: input.role ?? existingMember.role,
          respondedAt: new Date(),
        },
      });
    }
    throw new Error('User is already a member of this supplier');
  }

  return prisma.brandMember.create({
    data: {
      supplierId: input.supplierId,
      userId: input.userId,
      role: input.role ?? BrandMemberRole.STAFF,
      status: BrandMemberStatus.INVITED,
    },
  });
}

export async function updateBrandMember(input: UpdateBrandMemberInput) {
  const { supplierId, memberId, role, status } = input;

  const member = await prisma.brandMember.findFirst({
    where: {
      id: memberId,
      supplierId,
    },
  });

  if (!member) {
    throw new Error('Brand member not found');
  }

  return prisma.brandMember.update({
    where: { id: memberId },
    data: {
      role: role ?? member.role,
      status: status ?? member.status,
      respondedAt: new Date(),
    },
  });
}

export async function listBrandMembers(supplierId: string) {
  return prisma.brandMember.findMany({
    where: { supplierId },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getActiveSupplierContract(supplierId: string) {
  return prisma.smartContractTemplate.findFirst({
    where: { supplierId, isActive: true },
    orderBy: { createdAt: 'desc' },
  });
}

