# nestjs-challenge

### Build your tiny API store.
You can choose the target of your business, be creative!.
**Examples:** snack store, pet store, drug store.

## Technical Requirements
* ✅ PostgreSql
  * Kysely / Drizzle
  * ✅ Prisma
* ✅ NestJS
* ✅ Typescript
* ✅ Prettier
* ✅ Eslint

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
   - AUTO_ROLE (roles can be set by writing (admin/manager) at start of email)
2. Run prisma migrations.
3. npm run start:dev

## Mandatory Features
1. ✅ Authentication endpoints 
   - ✅sign up
     - Create an account with emails like: customer@gmail.com, admin@gmail.com, manager@gmail.com.
     - ![](./pictures/signup.png)
   - ✅sign in
     - Login with the 3 accounts and set the tokens of the parent folder.
     - ![](./pictures/login.png)
     - ![](./pictures/tokens.png)
   - ✅sign out
     - To logout specify the bearer token, the guard will make sure its you trying to logout. Make sure to login again if you try this.
     - ![](./pictures/logout.png)
   - ✅forgot
     - To request a reset provide an email.
     - ![](./pictures/forgot.png)
     - Next copy the token from the server console. (Sending it was extra points😅)
     - ![](./pictures/forgot_token.png)
   - ✅reset password
     - To reset provide the token we got in the previous step. With new passwords.
     - ![](./pictures/reset.png)
2. ✅ List products with pagination
   - Page 1 (specified page size of 3 and fewer fields to fit screenshot)
   - ![](./pictures/get_products_page_1.png)
   - Page 2
   - ![](./pictures/get_products_page_2.png)
3. ✅ Search products by category
    - First we want to create a category
    - ![](./pictures/create_category.png)
    - With that new id we add it to a product. 
    - ![](./pictures/add_category_to_product.png)
    - Now we can use the List product endpoint with the category as a filter to get results of only that category. 
    - ![](./pictures/filtered_category.png)
4. ✅ Add 2 kinds of users (Manager, Client)
    - This is an enum.
    - ![](./pictures/roles.png)
5. As a Manager I can:
    * ✅ Create products
      * Note how we can also create nested variation in one go. At least one is required. 
      * ![](./pictures/create_product.png)
      * As we are a Wallet Shop, we have variations, we can create more like so.
      * ![](./pictures/create_variation.png)
      * result:
      * ![](./pictures/create_variation_result.png)
    * ✅ Update products
      * Using the id we got in create we can update the fields of the product.
      * ![](./pictures/update_product.png)
      * We can use the get one product to see our changes.
      * ![](./pictures/get_one_product_a.png)
      * As we are a Wallet Shop, we have variations, we can update them like so.
      * ![](./pictures/update_variation.png)
      * result:
      * ![](./pictures/update_variation_result.png)
    * ✅ Delete products
      * We create one to delete
      * ![](./pictures/created_product_to_delete.png)
      * Delete it
      * ![](./pictures/delete_product.png)
      * check if we can get a deleted one
      * ![](./pictures/try_to_get_deleted.png)
      * Same goes for variations. 
      * ![](./pictures/create_variation_result.png)
      * Let's delete the green one.
      * ![](./pictures/delete_variation.png)
      * result
      * ![](./pictures/delete_variation_result.png)
    * ✅ Disable products 
      * As shown in update simply pass "is_published" = false to toggle it in the customer facing frontend. Managers are allowed to get disabled ones. 
      * ![](./pictures/update_product.png)
    * ✅ Show clients orders 
    * ✅ Upload images per product.
      * We need to pass the variation that we are uploading to, and the base 64. 
      * ![](./pictures/upload_image.png)
      * result
      * ![](./pictures/upload_image_result.png)
      * this is the image coming from that link!  ![image](https://res.cloudinary.com/dw4crytk2/image/upload/v1735659896/gyglautfx1wzikiwnq31.webp)
6. As a Client I can:
    * ✅ See products
      * Same as list with pagination. Clients get is_published = false products filtered from this query. 
    * ✅ See the product details
      * ![](./pictures/get_one_product_a.png)
    * ✅ Buy products
    * ✅ Add products to cart
    * ✅ Like products
    * ✅ Show my order
7. ✅ The product information(included the images) should be visible for logged and not logged users. 
   - The field is available for both, and link is not private check out the image here:  ![image](https://res.cloudinary.com/dw4crytk2/image/upload/v1735659896/gyglautfx1wzikiwnq31.webp) 
8. ✅ Stripe Integration for payment (including webhooks management)

## Mandatory Implementations
- ✅ Schema validation for environment variables
  - ![](./pictures/env_validation.png)
- ✅ Usage of global exception filter
  - On main.ts : app.useGlobalFilters(new GlobalExceptionFilter(httpAdapter));
  - Filter at: src/common/filters/global-exception.filter.ts
- ✅ Usage of guards, pipes (validation).
  - Available at: src/auth/guards/
  - Usage of pipes in parameters
  - Usage of class-validator in DTOs. 
  - In GQL mainly used @Field(()=> ClassToValidate, {nullable: true})
- ✅ Usage of custom decorators
  - Available at: src/common/decorators/
- ✅ Configure helmet, cors, rate limit (this last one for reset password feature)
  - Cors:
    - on main.ts: app.enableCors();
  - Helmet: 
    - ![](./pictures/helmet.png)
  - Rate Limit: 
    - On AuthModule: ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    - On Reset Endpoint:   
      - @Throttle({ default: { limit: 3, ttl: 60000 } })
      - @UseGuards(ThrottlerGuard)

## Extra points 😞
* ❎ Implement resolve field in graphQL queries (if apply)
* ❎ When the stock of a product reaches 3, notify the last user that liked it and not purchased the product yet with an email.
  Use a background job and make sure to include the product's image in the email.
* ❎ Send an email when the user changes the password
* ❎ Deploy on Heroku

## Notes:

Requirements to use Rest:
* ✅ Authentication endpoints (sign up, sign in, sign out, forgot, reset password)
* ✅ Stripe Integration for payment (including webhooks management)

  * I understand this implies all payment related apis are REST. This is how I developed it. (Webhook, Create payment intent, and get order payments.)
  
- Requirements to use Graph:
* ✅ The ones not included in the block above