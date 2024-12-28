# nestjs-challenge

### Build your tiny API store.
You can choose the target of your business, be creative!.
**Examples:** snack store, pet store, drug store.

## Technical Requirements
* DONE PostgreSql
  * Kysely / Drizzle
  * DONE Prisma
* DONE NestJS
* DONE Typescript
* DONE Prettier
* DONE Eslint

## Mandatory Features
1. DONE Authentication endpoints (sign up, sign in, sign out, forgot, reset password)
2. DONE List products with pagination
3. DONE Search products by category
4. DONE Add 2 kinds of users (Manager, Client)
5. As a Manager I can:
    * DONE Create products
    * DONE Update products
    * DONE Delete products
    * DONE Disable products // By updating the field is_published
    * Show clients orders 
    * DONE Upload images per product.
6. As a Client I can:
    * DONE See products
    * DONE See the product details
    * Buy products
    * Add products to cart
    * Like products
    * Show my order
7. DONE The product information(included the images) should be visible for logged and not logged users
8. Stripe Integration for payment (including webhooks management)

## Mandatory Implementations
- DONE Schema validation for environment variables
- Usage of global exception filter
- DONE Usage of guards, pipes (validation) (assumed stuff like gql field => String counts as part of the validation.)
- DONE Usage of custom decorators
- Configure helmet, cors, rate limit (this last one for reset password feature)

## Extra points
* Implement resolve field in graphQL queries (if apply)
* When the stock of a product reaches 3, notify the last user that liked it and not purchased the product yet with an email.
  Use a background job and make sure to include the product's image in the email.
* Send an email when the user changes the password
* Deploy on Heroku

## Notes:

Requirements to use Rest:
* Authentication endpoints (sign up, sign in, sign out, forgot, reset password)
* Stripe Integration for payment (including webhooks management)

Requirements to use Graph:
* The ones not included in the block above