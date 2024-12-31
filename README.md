# nestjs-challenge

# WAIT! A detailed readme is in progress.
### Samples of how each endpoint is fulfilled by the app and instructions on how to run the app will be available asap.

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
   - 
3. ✅ Search products by category
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
    * ✅ See the product details
    * ✅ Buy products
    * ✅ Add products to cart
    * ✅ Like products
    * ✅ Show my order
7. ✅ The product information(included the images) should be visible for logged and not logged users
8. ✅ Stripe Integration for payment (including webhooks management)

## Mandatory Implementations
- ✅ Schema validation for environment variables
- ✅ Usage of global exception filter
- ✅ Usage of guards, pipes (validation) (assumed stuff like gql field => String counts as part of the validation.)
- ✅ Usage of custom decorators
- ✅ Configure helmet, cors, rate limit (this last one for reset password feature)

## Extra points
* Implement resolve field in graphQL queries (if apply)
* When the stock of a product reaches 3, notify the last user that liked it and not purchased the product yet with an email.
  Use a background job and make sure to include the product's image in the email.
* Send an email when the user changes the password
* Deploy on Heroku

## Notes:

Requirements to use Rest:
* ✅ Authentication endpoints (sign up, sign in, sign out, forgot, reset password)
* ✅ Stripe Integration for payment (including webhooks management)

  * I understand this implies all payment related apis are REST. This is how I developed it. (Webhook, Create payment intent, and get order payments.) This specially is the way to go because of stripe frontend library not being compatible with graphql. So for simplicity this portion I do believe the instruction is like so. 
  
- Requirements to use Graph:
* ✅ The ones not included in the block above