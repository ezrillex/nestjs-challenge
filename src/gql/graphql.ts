
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
    variations: CreateVariationInput[];
}

export class CreateVariationInput {
    title: string;
    price: number;
    stock: number;
    images?: Nullable<string[]>;
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

export class Products {
    __typename?: 'Products';
    id: string;
    is_published: boolean;
    is_deleted: boolean;
    name: string;
    description: string;
    variations: ProductVariations[];
    created_by: string;
    created_at: DateTime;
    last_updated_by?: Nullable<string>;
    last_updated_at?: Nullable<string>;
}

export abstract class IQuery {
    __typename?: 'IQuery';

    abstract getProducts(GetProductsInput: GetProductsInput): Nullable<Products[]> | Promise<Nullable<Products[]>>;
}

export abstract class IMutation {
    __typename?: 'IMutation';

    abstract createProduct(CreateProductInput: CreateProductInput): Nullable<string> | Promise<Nullable<string>>;
}

export type DateTime = any;
type Nullable<T> = T | null;
