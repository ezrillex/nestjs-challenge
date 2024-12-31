# nestjs-challenge

# A detailed readme (with pictures) is in progress.
### Samples of how each endpoint is fulfilled by the app will be available asap, to check current state see folder-restructure branch.

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

## Requirements to Run
1. The following constants on the .env file. A sample file is included.
   - DATABASE_URL
   - JWTCONSTANT
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET
   - STRIPE_SHAREABLE_KEY
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SIGNING_SECRET
2. Run prisma migrations.

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
    * DONE Show clients orders 
    * DONE Upload images per product.
6. As a Client I can:
    * DONE See products
    * DONE See the product details
    * DONE Buy products
    * DONE Add products to cart
    * DONE Like products
    * DONE Show my order
7. DONE The product information(included the images) should be visible for logged and not logged users
8. DONE Stripe Integration for payment (including webhooks management)

## Mandatory Implementations
- DONE Schema validation for environment variables
- DONE Usage of global exception filter
- DONE Usage of guards, pipes (validation) (assumed stuff like gql field => String counts as part of the validation.)
- DONE Usage of custom decorators
- DONE Configure helmet, cors, rate limit (this last one for reset password feature)

## Extra points
* Implement resolve field in graphQL queries (if apply)
* When the stock of a product reaches 3, notify the last user that liked it and not purchased the product yet with an email.
  Use a background job and make sure to include the product's image in the email.
* Send an email when the user changes the password
* Deploy on Heroku

## Notes:

Requirements to use Rest:
* DONE Authentication endpoints (sign up, sign in, sign out, forgot, reset password)
* DONE Stripe Integration for payment (including webhooks management)

  * I understand this implies all payment related apis are REST. This is how I developed it. (Webhook, Create payment intent, and get order payments.) This specially is the way to go because of stripe frontend library not being compatible with graphql. So for simplicity this portion I do believe the instruction is like so. 
  
- Requirements to use Graph:
* The ones not included in the block above
