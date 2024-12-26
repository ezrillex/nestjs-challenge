
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum OrderStatus {
    pending_fulfillment = "pending_fulfillment",
    fulfillment_in_progress = "fulfillment_in_progress",
    shipped = "shipped",
    delivered = "delivered",
    delivery_cancelled = "delivery_cancelled",
    returned = "returned"
}

export enum QueueStatus {
    pending = "pending",
    in_progress = "in_progress",
    success = "success",
    failed = "failed"
}

export enum PaymentStatus {
    requires_payment_method = "requires_payment_method",
    requires_confirmation = "requires_confirmation",
    requires_action = "requires_action",
    processing = "processing",
    succeded = "succeded",
    cancelled = "cancelled"
}

export enum WebhookStatus {
    pending = "pending",
    batched_locked = "batched_locked",
    processing = "processing",
    done = "done",
    error = "error"
}

export enum ResponseCodes {
    ok = "ok",
    validation_error = "validation_error",
    condition_error = "condition_error",
    authentication_error = "authentication_error",
    permission_error = "permission_error",
    not_found_error = "not_found_error",
    server_error = "server_error",
    many_error = "many_error"
}

export enum TableEntities {
    Roles = "Roles",
    Users = "Users",
    Permits = "Permits",
    Permissions = "Permissions",
    Categories = "Categories",
    Files = "Files",
    PaymentIntents = "PaymentIntents",
    IncomingPaymentWebhooks = "IncomingPaymentWebhooks",
    PaymentIntentsAudit = "PaymentIntentsAudit",
    Products = "Products",
    ProductVariations = "ProductVariations",
    Orders = "Orders",
    OrderAudit = "OrderAudit",
    OrderDetails = "OrderDetails",
    Carts = "Carts",
    EmailQueue = "EmailQueue",
    Likes = "Likes"
}

export class CreateUserInput {
    firstName: string;
    lastName: string;
    email: Email;
    password: Hash;
    repeatPassword: Hash;
}

export class UserLoginInput {
    email: Email;
    password: Hash;
}

export class UserResetPassword {
    resetToken: Token;
    newPassword: Hash;
    repeatNewPassword: Hash;
}

export class UserHasPermissionInput {
    user?: Nullable<string>;
    permission: string;
}

export class CreateFileInput {
    name: string;
    base64: string;
}

export class CreatePaymentInput {
    order: string;
    stripeApiVersion?: Nullable<string>;
    amount?: Nullable<number>;
    currency: string;
}

export class UpdatePaymentDetailsInput {
    cardNumber: string;
    expiryDate: string;
    cvc: string;
    confirmed: boolean;
}

export class ProcessPaymentInput {
    closed?: Nullable<boolean>;
    status?: Nullable<string>;
}

export class GetProductsInput {
    first: number;
    offset: number;
    categoryFilter?: Nullable<string[]>;
    search?: Nullable<string>;
    likedOnly?: Nullable<boolean>;
    omitImages?: Nullable<boolean>;
    sort?: Nullable<string>;
}

export class CreateProductInput {
    name: string;
    details: string;
    categories: string[];
    variations: CreateProductVariationInput[];
}

export class CreateProductVariationInput {
    price: number;
    stock: number;
    title: string;
    description: string;
    images?: Nullable<string[]>;
}

export class UpdateProductInput {
    disabled?: Nullable<boolean>;
    name?: Nullable<string>;
    details?: Nullable<string>;
    categories?: Nullable<string[]>;
    price?: Nullable<number>;
    stock?: Nullable<number>;
    images?: Nullable<string[]>;
}

export class CreateOrderInput {
    itemsToBuy?: Nullable<string[]>;
    otherInfo: string;
}

export class AddToCartInput {
    client: string;
    product: string;
    variation: string;
    quantity: number;
}

export class RemoveFromCartInput {
    client: string;
    product: string;
    variation: string;
}

export class ModifyCartQuantity {
    client: string;
    product: string;
    variation: string;
    newQuantity: number;
}

export class CreateEmailJobInput {
    senderName?: Nullable<string>;
    senderEmail: Email;
    recipientName?: Nullable<string>;
    recipientEmail: Email;
    replyToEmail?: Nullable<Email>;
    subject?: Nullable<string>;
    textContent: string;
    htmlContent: string;
    attachments?: Nullable<string[]>;
}

export class GetEmailJobsInput {
    limit: number;
    status: string;
}

export class UpdateEmailJobInput {
    jobId: string;
    newStatus: string;
}

export class GetLikesInput {
    user: string;
}

export class LikeProductInput {
    product: string;
    variation: string;
    user: string;
}

export class RemoveLikeInput {
    product: string;
    variation: string;
}

export interface IBaseResponsePayload {
    code: ResponseCodes;
    description: string;
}

export interface IBaseValidatedResponsePayload {
    validationErrors?: Nullable<string[]>;
    conditionErrors?: Nullable<string[]>;
    code: ResponseCodes;
    description?: Nullable<string>;
}

export interface PaginationPayload {
    count: number;
    totalCount: number;
    currentPage: number;
    totalPages: number;
    next: boolean;
    previous: boolean;
}

export abstract class IQuery {
    __typename?: 'IQuery';

    abstract getPublicProducts(input: GetProductsInput): GetProductsPayload | Promise<GetProductsPayload>;

    abstract getPublicProduct(input: string): GetProductPayload | Promise<GetProductPayload>;

    abstract getFile(input: string): Nullable<Files> | Promise<Nullable<Files>>;

    abstract getFiles(input: string[]): Nullable<Files>[] | Promise<Nullable<Files>[]>;

    abstract getPaymentsToProcess(): Nullable<string[]> | Promise<Nullable<string[]>>;

    abstract getLastLikesLowStock(): Nullable<Likes[]> | Promise<Nullable<Likes[]>>;

    abstract getEmailJobs(input: GetEmailJobsInput): GetEmailJobsPayload | Promise<GetEmailJobsPayload>;

    abstract getLikes(input: GetLikesInput): LikesPayload | Promise<LikesPayload>;

    abstract getCartInfo(client: string): CartInfoPayload | Promise<CartInfoPayload>;

    abstract listAllOrders(first: number, offset: number): AllOrderDetailsPayload | Promise<AllOrderDetailsPayload>;

    abstract orderDetails(order: string): OrderDetailsPayload | Promise<OrderDetailsPayload>;

    abstract getAuthorizedProducts(input: GetProductsInput): GetProductsPayload | Promise<GetProductsPayload>;

    abstract getAuthorizedProduct(input: string): GetProductPayload | Promise<GetProductPayload>;

    abstract userHasPermission(input: UserHasPermissionInput): UserHasPermissionPayload | Promise<UserHasPermissionPayload>;
}

export abstract class IMutation {
    __typename?: 'IMutation';

    abstract createSystemEmailJob(input: CreateEmailJobInput): ValidatedResponsePayload | Promise<ValidatedResponsePayload>;

    abstract updateEmailJob(input: UpdateEmailJobInput): UpdateEmailJobPayload | Promise<UpdateEmailJobPayload>;

    abstract lowStockPromotionsCronJob(): BaseResponsePayload | Promise<BaseResponsePayload>;

    abstract stripePaymentWebhook(stripeWebhookJSON: string): BaseResponsePayload | Promise<BaseResponsePayload>;

    abstract lockPayment(id: string): LockPaymentPayload | Promise<LockPaymentPayload>;

    abstract processPayment(input: ProcessPaymentInput): BaseResponsePayload | Promise<BaseResponsePayload>;

    abstract likeProduct(input: LikeProductInput): BaseResponsePayload | Promise<BaseResponsePayload>;

    abstract removeLike(input?: Nullable<RemoveLikeInput>): BaseResponsePayload | Promise<BaseResponsePayload>;

    abstract createAuthorizedEmailJob(input: CreateEmailJobInput): ValidatedResponsePayload | Promise<ValidatedResponsePayload>;

    abstract addToCart(input: AddToCartInput): BaseResponsePayload | Promise<BaseResponsePayload>;

    abstract removeFromCart(input: RemoveFromCartInput): BaseResponsePayload | Promise<BaseResponsePayload>;

    abstract modifyQuantityCart(input: ModifyCartQuantity): BaseResponsePayload | Promise<BaseResponsePayload>;

    abstract createOrder(input?: Nullable<CreateOrderInput>): ValidatedResponsePayload | Promise<ValidatedResponsePayload>;

    abstract createProduct(input: CreateProductInput): ValidatedResponsePayload | Promise<ValidatedResponsePayload>;

    abstract deleteProduct(input: string): BaseResponsePayload | Promise<BaseResponsePayload>;

    abstract updateProduct(input: UpdateProductInput): ValidatedResponsePayload | Promise<ValidatedResponsePayload>;

    abstract createPayment(input: CreatePaymentInput): ValidatedResponsePayload | Promise<ValidatedResponsePayload>;

    abstract updatePaymentDetails(input: UpdatePaymentDetailsInput): ValidatedResponsePayload | Promise<ValidatedResponsePayload>;

    abstract createFile(input: CreateFileInput): BaseResponsePayload | Promise<BaseResponsePayload>;

    abstract deleteFile(input: string): BaseResponsePayload | Promise<BaseResponsePayload>;

    abstract logoutUser(token: string): ValidatedResponsePayload | Promise<ValidatedResponsePayload>;

    abstract createUser(input: CreateUserInput): ValidatedResponsePayload | Promise<ValidatedResponsePayload>;

    abstract loginUser(input?: Nullable<UserLoginInput>): LoginUserPayload | Promise<LoginUserPayload>;

    abstract forgotPassword(email: string): ValidatedResponsePayload | Promise<ValidatedResponsePayload>;

    abstract resetPassword(input: UserResetPassword): ValidatedResponsePayload | Promise<ValidatedResponsePayload>;
}

export class BaseResponsePayload {
    __typename?: 'BaseResponsePayload';
    code: ResponseCodes;
    description: string;
}

export class ValidatedResponsePayload {
    __typename?: 'ValidatedResponsePayload';
    validationErrors?: Nullable<string[]>;
    conditionErrors?: Nullable<string[]>;
    code: ResponseCodes;
    description?: Nullable<string>;
}

export class Roles {
    __typename?: 'Roles';
    id: string;
    name: string;
}

export class Users {
    __typename?: 'Users';
    firstName: string;
    lastName: string;
    id: string;
    email: Email;
    sessionToken?: Nullable<Token>;
    role: Roles;
    createdAt: Timestamp;
    lastLoginAt?: Nullable<Timestamp>;
    lastSignoutAt?: Nullable<Timestamp>;
    password: Hash;
    passwordLastUpdated: Timestamp;
    failedLoginAttempts: number;
    failedLoginAttemptsTimestamps?: Nullable<Timestamp[]>;
    passwordResetToken?: Nullable<Token>;
    passwordResetRequestsCount: number;
    passwordResetRequestsTimestamps?: Nullable<Timestamp[]>;
}

export class LoginUserPayload implements IBaseValidatedResponsePayload {
    __typename?: 'LoginUserPayload';
    code: ResponseCodes;
    validationErrors?: Nullable<string[]>;
    description?: Nullable<string>;
    conditionErrors?: Nullable<string[]>;
    token?: Nullable<Token>;
}

export class Permits {
    __typename?: 'Permits';
    id: string;
    role: Roles;
    permit: Permissions;
}

export class Permissions {
    __typename?: 'Permissions';
    id: string;
    name: string;
    appliesToTable: TableEntities;
    appliesToField?: Nullable<string>;
}

export class UserHasPermissionPayload implements IBaseResponsePayload {
    __typename?: 'UserHasPermissionPayload';
    isAllowed: boolean;
    description: string;
    code: ResponseCodes;
}

export class Categories {
    __typename?: 'Categories';
    id: string;
    name: string;
}

export class Files {
    __typename?: 'Files';
    id: string;
    name: string;
    size: number;
    url: string;
    createdAt: Timestamp;
}

export class PaymentIntents {
    __typename?: 'PaymentIntents';
    id: string;
    closed: boolean;
    paymentStatus: PaymentStatus;
    createdAt: Timestamp;
    stripeEventId: string;
    stripeApiVersion: string;
    stripePaymentIntent: JSON;
    audit: PaymentIntentsAudit[];
}

export class IncomingPaymentWebhooks {
    __typename?: 'IncomingPaymentWebhooks';
    id: string;
    status: WebhookStatus;
    data: JSON;
    createdAt: Timestamp;
    processedAt?: Nullable<Timestamp>;
}

export class PaymentIntentsAudit {
    __typename?: 'PaymentIntentsAudit';
    id: string;
    snapshotAt: Timestamp;
    closed: boolean;
    paymentStatus: PaymentStatus;
    stripeEventId: string;
    stripeApiVersion: string;
    stripePaymentIntent?: Nullable<JSON>;
}

export class LockPaymentPayload implements IBaseResponsePayload {
    __typename?: 'LockPaymentPayload';
    description: string;
    code: ResponseCodes;
    payment?: Nullable<PaymentIntents>;
}

export class Products {
    __typename?: 'Products';
    id: string;
    disabled: boolean;
    name: string;
    details: string;
    categories: Categories[];
    variations: ProductVariations[];
    createdBy: Users;
    createdAt: Timestamp;
    lastUpdatedBy?: Nullable<Users>;
    lastUpdatedAt?: Nullable<Timestamp>;
    images?: Nullable<Files[]>;
    deleted: boolean;
}

export class ProductVariations {
    __typename?: 'ProductVariations';
    id: string;
    title: string;
    price: number;
    stock: number;
    images?: Nullable<Files[]>;
    published: boolean;
    deleted: boolean;
}

export class GetProductsPayload implements IBaseValidatedResponsePayload, PaginationPayload {
    __typename?: 'GetProductsPayload';
    products?: Nullable<Products[]>;
    count: number;
    totalCount: number;
    currentPage: number;
    totalPages: number;
    next: boolean;
    previous: boolean;
    code: ResponseCodes;
    conditionErrors?: Nullable<string[]>;
    description?: Nullable<string>;
    validationErrors?: Nullable<string[]>;
}

export class GetProductPayload implements IBaseResponsePayload {
    __typename?: 'GetProductPayload';
    code: ResponseCodes;
    description: string;
    product?: Nullable<Products>;
}

export class Orders {
    __typename?: 'Orders';
    id: string;
    client?: Nullable<Users>;
    payments?: Nullable<PaymentIntents[]>;
    webhooks?: Nullable<IncomingPaymentWebhooks[]>;
    orderDetails: OrderDetails[];
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    createdAt: Timestamp;
    orderStatusHistory: OrderAudit[];
}

export class OrderAudit {
    __typename?: 'OrderAudit';
    id: string;
    order: OrderStatus;
    payment: PaymentStatus;
    changeAt: Timestamp;
}

export class OrderDetails {
    __typename?: 'OrderDetails';
    id: string;
    order: Orders;
    product: Products;
    variation: ProductVariations;
    productQuantity: number;
    pricePurchasedAt: number;
}

export class ListAllOrderdsPayload implements IBaseResponsePayload {
    __typename?: 'ListAllOrderdsPayload';
    orders?: Nullable<Orders[]>;
    description: string;
    code: ResponseCodes;
}

export class AllOrderDetailsPayload implements IBaseResponsePayload {
    __typename?: 'AllOrderDetailsPayload';
    description: string;
    code: ResponseCodes;
    orders?: Nullable<Orders[]>;
}

export class OrderDetailsPayload implements IBaseResponsePayload {
    __typename?: 'OrderDetailsPayload';
    order: Orders;
    code: ResponseCodes;
    description: string;
}

export class Carts {
    __typename?: 'Carts';
    id: string;
    client: Users;
    product: Products;
    variation: ProductVariations;
    productQuantity: number;
    createdAt: Timestamp;
}

export class CartInfoPayload implements IBaseResponsePayload {
    __typename?: 'CartInfoPayload';
    cart?: Nullable<Carts[]>;
    code: ResponseCodes;
    description: string;
}

export class EmailQueue {
    __typename?: 'EmailQueue';
    id: string;
    queueStatus: QueueStatus;
    senderName?: Nullable<string>;
    senderEmail: Email;
    recipientName?: Nullable<string>;
    recipientEmail: Email;
    replyTo?: Nullable<Email>;
    subject: string;
    textContent: string;
    htmlContent: string;
    attachments?: Nullable<Files[]>;
}

export class GetEmailJobsPayload {
    __typename?: 'GetEmailJobsPayload';
    jobs?: Nullable<string[]>;
    count: number;
}

export class UpdateEmailJobPayload implements IBaseResponsePayload {
    __typename?: 'UpdateEmailJobPayload';
    description: string;
    code: ResponseCodes;
    jobData: EmailQueue;
}

export class Likes {
    __typename?: 'Likes';
    id: string;
    client: Users;
    product: Products;
    variation: ProductVariations;
    createdAt: Timestamp;
}

export class LikesPayload {
    __typename?: 'LikesPayload';
    errors?: Nullable<string>;
    likes?: Nullable<Likes>;
}

export type Timestamp = any;
export type Email = any;
export type JSON = any;
export type Token = any;
export type Hash = any;
type Nullable<T> = T | null;
