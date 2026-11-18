import * as runtime from "@prisma/client/runtime/client";
export const PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
export const PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
export const PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
export const PrismaClientInitializationError = runtime.PrismaClientInitializationError;
export const PrismaClientValidationError = runtime.PrismaClientValidationError;
export const sql = runtime.sqltag;
export const empty = runtime.empty;
export const join = runtime.join;
export const raw = runtime.raw;
export const Sql = runtime.Sql;
export const Decimal = runtime.Decimal;
export const getExtensionContext = runtime.Extensions.getExtensionContext;
export const prismaVersion = {
    client: "7.10.1",
    engine: "d1b3f377ca835d73fd50954a5e22128b9ebdd6b8"
};
export const NullTypes = {
    DbNull: runtime.NullTypes.DbNull,
    JsonNull: runtime.NullTypes.JsonNull,
    AnyNull: runtime.NullTypes.AnyNull,
};
export const DbNull = runtime.DbNull;
export const JsonNull = runtime.JsonNull;
export const AnyNull = runtime.AnyNull;
export const ModelName = {
    User: 'User',
    Role: 'Role',
    Permission: 'Permission',
    UserRole: 'UserRole',
    RolePermission: 'RolePermission',
    AuthSession: 'AuthSession',
    NewsCategory: 'NewsCategory',
    NewsArticle: 'NewsArticle',
    AuditLog: 'AuditLog'
};
export const TransactionIsolationLevel = runtime.makeStrictEnum({
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
});
export const UserScalarFieldEnum = {
    id: 'id',
    email: 'email',
    username: 'username',
    passwordHash: 'passwordHash',
    firstName: 'firstName',
    lastName: 'lastName',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
export const RoleScalarFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
export const PermissionScalarFieldEnum = {
    id: 'id',
    code: 'code',
    description: 'description'
};
export const UserRoleScalarFieldEnum = {
    userId: 'userId',
    roleId: 'roleId'
};
export const RolePermissionScalarFieldEnum = {
    roleId: 'roleId',
    permissionId: 'permissionId'
};
export const AuthSessionScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    refreshTokenHash: 'refreshTokenHash',
    expiresAt: 'expiresAt',
    revokedAt: 'revokedAt',
    createdAt: 'createdAt'
};
export const NewsCategoryScalarFieldEnum = {
    id: 'id',
    name: 'name',
    slug: 'slug',
    description: 'description',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
export const NewsArticleScalarFieldEnum = {
    id: 'id',
    title: 'title',
    slug: 'slug',
    summary: 'summary',
    content: 'content',
    imageUrl: 'imageUrl',
    status: 'status',
    authorId: 'authorId',
    categoryId: 'categoryId',
    publishedAt: 'publishedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
export const AuditLogScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    action: 'action',
    entityType: 'entityType',
    entityId: 'entityId',
    details: 'details',
    ipAddress: 'ipAddress',
    createdAt: 'createdAt'
};
export const SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
export const NullableJsonNullValueInput = {
    DbNull: DbNull,
    JsonNull: JsonNull
};
export const NullsOrder = {
    first: 'first',
    last: 'last'
};
export const UserOrderByRelevanceFieldEnum = {
    id: 'id',
    email: 'email',
    username: 'username',
    passwordHash: 'passwordHash',
    firstName: 'firstName',
    lastName: 'lastName'
};
export const RoleOrderByRelevanceFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description'
};
export const PermissionOrderByRelevanceFieldEnum = {
    id: 'id',
    code: 'code',
    description: 'description'
};
export const UserRoleOrderByRelevanceFieldEnum = {
    userId: 'userId',
    roleId: 'roleId'
};
export const RolePermissionOrderByRelevanceFieldEnum = {
    roleId: 'roleId',
    permissionId: 'permissionId'
};
export const AuthSessionOrderByRelevanceFieldEnum = {
    id: 'id',
    userId: 'userId',
    refreshTokenHash: 'refreshTokenHash'
};
export const NewsCategoryOrderByRelevanceFieldEnum = {
    id: 'id',
    name: 'name',
    slug: 'slug',
    description: 'description'
};
export const NewsArticleOrderByRelevanceFieldEnum = {
    id: 'id',
    title: 'title',
    slug: 'slug',
    summary: 'summary',
    content: 'content',
    imageUrl: 'imageUrl',
    authorId: 'authorId',
    categoryId: 'categoryId'
};
export const JsonNullValueFilter = {
    DbNull: DbNull,
    JsonNull: JsonNull,
    AnyNull: AnyNull
};
export const QueryMode = {
    default: 'default',
    insensitive: 'insensitive'
};
export const AuditLogOrderByRelevanceFieldEnum = {
    id: 'id',
    userId: 'userId',
    action: 'action',
    entityType: 'entityType',
    entityId: 'entityId',
    ipAddress: 'ipAddress'
};
export const defineExtension = runtime.Extensions.defineExtension;
//# sourceMappingURL=prismaNamespace.js.map