"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSupplier = createSupplier;
exports.listSuppliers = listSuppliers;
exports.getSupplierById = getSupplierById;
exports.getSupplierBySlug = getSupplierBySlug;
exports.updateSupplier = updateSupplier;
exports.addBrandMember = addBrandMember;
exports.updateBrandMember = updateBrandMember;
exports.listBrandMembers = listBrandMembers;
exports.getActiveSupplierContract = getActiveSupplierContract;
const database_1 = require("../config/database");
const client_1 = require("@prisma/client");
const buildSupplierWhere = (params = {}) => {
    const { search, isActive } = params;
    const where = {};
    if (typeof isActive === 'boolean') {
        where.isActive = isActive;
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
async function createSupplier(input) {
    const existing = await database_1.prisma.supplier.findFirst({
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
    return database_1.prisma.$transaction(async (tx) => {
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
                socialLinks: input.socialLinks ? input.socialLinks : undefined,
                members: {
                    create: {
                        userId: input.userId,
                        role: client_1.BrandMemberRole.OWNER,
                        status: client_1.BrandMemberStatus.ACTIVE,
                    },
                },
            },
            include: {
                user: true,
                members: true,
            },
        });
        await tx.user.update({
            where: { id: input.userId },
            data: {
                isSupplier: true,
                role: client_1.UserRole.SUPPLIER,
            },
        });
        return supplier;
    });
}
async function listSuppliers(params) {
    return database_1.prisma.supplier.findMany({
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
async function getSupplierById(supplierId) {
    return database_1.prisma.supplier.findUnique({
        where: { id: supplierId },
        include: {
            user: true,
            members: true,
            products: true,
            loyaltyPrograms: true,
        },
    });
}
async function getSupplierBySlug(slug) {
    return database_1.prisma.supplier.findUnique({
        where: { slug },
        include: {
            user: true,
            members: true,
            products: true,
            loyaltyPrograms: true,
        },
    });
}
async function updateSupplier(input) {
    const { supplierId, ...updates } = input;
    const data = {};
    if (updates.businessName !== undefined)
        data.businessName = updates.businessName;
    if (updates.description !== undefined)
        data.description = updates.description;
    if (updates.logo !== undefined)
        data.logo = updates.logo;
    if (updates.coverImage !== undefined)
        data.coverImage = updates.coverImage;
    if (updates.website !== undefined)
        data.website = updates.website;
    if (updates.location !== undefined)
        data.location = updates.location;
    if (updates.contactEmail !== undefined)
        data.contactEmail = updates.contactEmail;
    if (updates.contactPhone !== undefined)
        data.contactPhone = updates.contactPhone;
    if (updates.socialLinks !== undefined)
        data.socialLinks = updates.socialLinks;
    if (updates.isActive !== undefined)
        data.isActive = updates.isActive;
    return database_1.prisma.supplier.update({
        where: { id: supplierId },
        data,
        include: {
            members: true,
            products: true,
        },
    });
}
async function addBrandMember(input) {
    const existingMember = await database_1.prisma.brandMember.findUnique({
        where: {
            supplierId_userId: {
                supplierId: input.supplierId,
                userId: input.userId,
            },
        },
    });
    if (existingMember) {
        if (existingMember.status === client_1.BrandMemberStatus.INACTIVE) {
            return database_1.prisma.brandMember.update({
                where: { id: existingMember.id },
                data: {
                    status: client_1.BrandMemberStatus.ACTIVE,
                    role: input.role ?? existingMember.role,
                    respondedAt: new Date(),
                },
            });
        }
        throw new Error('User is already a member of this supplier');
    }
    return database_1.prisma.brandMember.create({
        data: {
            supplierId: input.supplierId,
            userId: input.userId,
            role: input.role ?? client_1.BrandMemberRole.STAFF,
            status: client_1.BrandMemberStatus.INVITED,
        },
    });
}
async function updateBrandMember(input) {
    const { supplierId, memberId, role, status } = input;
    const member = await database_1.prisma.brandMember.findFirst({
        where: {
            id: memberId,
            supplierId,
        },
    });
    if (!member) {
        throw new Error('Brand member not found');
    }
    return database_1.prisma.brandMember.update({
        where: { id: memberId },
        data: {
            role: role ?? member.role,
            status: status ?? member.status,
            respondedAt: new Date(),
        },
    });
}
async function listBrandMembers(supplierId) {
    return database_1.prisma.brandMember.findMany({
        where: { supplierId },
        include: {
            user: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
}
async function getActiveSupplierContract(supplierId) {
    return database_1.prisma.smartContractTemplate.findFirst({
        where: { supplierId, isActive: true },
        orderBy: { createdAt: 'desc' },
    });
}
//# sourceMappingURL=supplierService.js.map