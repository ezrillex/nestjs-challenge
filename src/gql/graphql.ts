
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class GetProductsInput {
    first?: Nullable<number>;
    offset?: Nullable<number>;
    categoryFilter?: Nullable<string[]>;
    search?: Nullable<string>;
    likedOnly?: Nullable<boolean>;
    omitImages?: Nullable<boolean>;
    sort?: Nullable<string>;
}

export class CreateProductInput {
    name: string;
    description: string;
    categories?: Nullable<string[]>;
    variations: CreateVariationInput[];
}

export class CreateVariationInput {
    title: string;
    price: number;
    stock: number;
}

export class UpdateProductInput {
    id: string;
    name?: Nullable<string>;
    description?: Nullable<string>;
    categories?: Nullable<string[]>;
    is_published?: Nullable<boolean>;
}

export class UpdateProductVariationInput {
    id: string;
    title?: Nullable<string>;
    price?: Nullable<number>;
    stock?: Nullable<number>;
}

export class CreateProductVariationInput {
    product_id: string;
    title: string;
    price: number;
    stock: number;
}

export class CreateCategoryInput {
    name: string;
}

export class Images {
    __typename?: 'Images';
    id: string;
    url: string;
    created_at: string;
    product_variation_id?: Nullable<string>;
}

export class ProductVariations {
    __typename?: 'ProductVariations';
    id: string;
    title: string;
    price: number;
    stock: number;
    images?: Nullable<Images[]>;
}

export class Categories {
    __typename?: 'Categories';
    id: string;
    name: string;
    products: Products[];
}

export class Products {
    __typename?: 'Products';
    id: string;
    is_published: boolean;
    is_deleted: boolean;
    name: string;
    description: string;
    likes: ProductVariations[];
    variations: ProductVariations[];
    categories: Categories[];
    created_by: string;
    created_at: DateTime;
    last_updated_by?: Nullable<string>;
    last_updated_at?: Nullable<string>;
}

export class Users {
    __typename?: 'Users';
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    likes_products: LikesOfProducts[];
}

export class LikesOfProducts {
    __typename?: 'LikesOfProducts';
    id: string;
    liked_by: Users;
    likes_product_variation: ProductVariations;
}

export class CartItems {
    __typename?: 'CartItems';
    id: string;
    cart_owner: Users;
    product_variation: ProductVariations;
    quantity: number;
}

export class OrderItems {
    __typename?: 'OrderItems';
    id: string;
    product_variation: ProductVariations;
    quantity: number;
    price_purchased_at: number;
}

export class Orders {
    __typename?: 'Orders';
    id: string;
    user: Users;
    paymentStatus: string;
    orderStatus: string;
    order_items: OrderItems[];
}

export abstract class IQuery {
    __typename?: 'IQuery';

    abstract getProducts(GetProductsInput: GetProductsInput): Nullable<Products[]> | Promise<Nullable<Products[]>>;

    abstract getProductById(id: string): Nullable<Products> | Promise<Nullable<Products>>;

    abstract getLikes(): Nullable<LikesOfProducts[]> | Promise<Nullable<LikesOfProducts[]>>;

    abstract getCartItems(): Nullable<CartItems[]> | Promise<Nullable<CartItems[]>>;

    abstract getOrders(): Nullable<Orders[]> | Promise<Nullable<Orders[]>>;

    abstract getOrder(order_id: string): Nullable<Orders> | Promise<Nullable<Orders>>;

    abstract getClientOrders(client_id?: Nullable<string>): Nullable<Orders[]> | Promise<Nullable<Orders[]>>;
}

export abstract class IMutation {
    __typename?: 'IMutation';

    abstract createProduct(CreateProductInput: CreateProductInput): Nullable<string> | Promise<Nullable<string>>;

    abstract updateProduct(UpdateProductInput: UpdateProductInput): Nullable<string> | Promise<Nullable<string>>;

    abstract updateProductVariation(UpdateProductVariationInput: UpdateProductVariationInput): Nullable<string> | Promise<Nullable<string>>;

    abstract createProductVariation(CreateProductVariationInput: CreateProductVariationInput): Nullable<string> | Promise<Nullable<string>>;

    abstract deleteProductVariation(variation_id: string): Nullable<string> | Promise<Nullable<string>>;

    abstract deleteProduct(product_id: string): Nullable<string> | Promise<Nullable<string>>;

    abstract createCategory(CreateCategoryInput: CreateCategoryInput): Nullable<string> | Promise<Nullable<string>>;

    abstract deleteCategory(id: string): Nullable<string> | Promise<Nullable<string>>;

    abstract likeProduct(variation_id: string): Nullable<string> | Promise<Nullable<string>>;

    abstract removeLikeProduct(like_id: string): Nullable<string> | Promise<Nullable<string>>;

    abstract addToCart(variation_id: string, quantity: number): Nullable<string> | Promise<Nullable<string>>;

    abstract removeFromCart(cart_item_id: string): Nullable<string> | Promise<Nullable<string>>;

    abstract createOrder(): Nullable<string> | Promise<Nullable<string>>;
}

export type DateTime = any;
type Nullable<T> = T | null;
