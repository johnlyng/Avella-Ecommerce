CREATE TABLE "addresses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "addresses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"type" varchar(50) DEFAULT 'shipping',
	"first_name" varchar(100),
	"last_name" varchar(100),
	"address_line1" varchar(255) NOT NULL,
	"address_line2" varchar(255),
	"city" varchar(100) NOT NULL,
	"state" varchar(100),
	"postal_code" varchar(20) NOT NULL,
	"country" varchar(100) NOT NULL,
	"phone_number" varchar(20),
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_levels" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "inventory_levels_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"product_id" integer NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"reserved" integer DEFAULT 0,
	"location_id" varchar(50) DEFAULT 'default' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cart_items" DROP CONSTRAINT IF EXISTS "cart_items_cart_id_product_id_key";--> statement-breakpoint
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_slug_key";--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_slug_key";--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_sku_key";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_uuid_key";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_email_key";--> statement-breakpoint
ALTER TABLE "carts" DROP CONSTRAINT IF EXISTS "carts_cart_token_key";--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_order_number_key";--> statement-breakpoint
ALTER TABLE "cart_items" DROP CONSTRAINT IF EXISTS "cart_items_quantity_check";--> statement-breakpoint
ALTER TABLE "cart_items" DROP CONSTRAINT IF EXISTS "cart_items_price_check";--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_price_check";--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_compare_at_price_check";--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_stock_quantity_check";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_role_check";--> statement-breakpoint
ALTER TABLE "carts" DROP CONSTRAINT IF EXISTS "cart_owner_check";--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_status_check";--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_subtotal_check";--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_tax_check";--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_shipping_check";--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_total_check";--> statement-breakpoint
ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "order_items_quantity_check";--> statement-breakpoint
ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "order_items_price_check";--> statement-breakpoint
ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "order_items_total_check";--> statement-breakpoint
ALTER TABLE "cart_items" DROP CONSTRAINT IF EXISTS "cart_items_cart_id_fkey";
--> statement-breakpoint
ALTER TABLE "cart_items" DROP CONSTRAINT IF EXISTS "cart_items_product_id_fkey";
--> statement-breakpoint
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_parent_id_fkey";
--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_category_id_fkey";
--> statement-breakpoint
ALTER TABLE "carts" DROP CONSTRAINT IF EXISTS "carts_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "order_items_order_id_fkey";
--> statement-breakpoint
ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "order_items_product_id_fkey";
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_cart_items_cart_id";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_cart_items_product_id";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_categories_parent_id";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_categories_slug";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_products_category_id";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_products_is_active";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_products_sku";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_products_slug";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_users_email";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_users_uuid";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_carts_cart_token";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_carts_session_id";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_carts_user_id";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_orders_created_at";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_orders_order_number";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_orders_status";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_orders_user_id";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_order_items_order_id";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_order_items_product_id";--> statement-breakpoint
ALTER TABLE "cart_items" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "cart_items" ALTER COLUMN "id" SET MAXVALUE 2147483647;--> statement-breakpoint
ALTER TABLE "cart_items" ALTER COLUMN "cart_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "cart_items" ALTER COLUMN "cart_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cart_items" ALTER COLUMN "product_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "cart_items" ALTER COLUMN "product_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cart_items" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "cart_items" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "id" SET MAXVALUE 2147483647;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "parent_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "id" SET MAXVALUE 2147483647;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "category_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "is_active" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET MAXVALUE 2147483647;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "carts" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "carts" ALTER COLUMN "id" SET MAXVALUE 2147483647;--> statement-breakpoint
ALTER TABLE "carts" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "carts" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "carts" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "carts" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "carts" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "id" SET MAXVALUE 2147483647;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "tax" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "tax" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "shipping" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "shipping_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "id" SET MAXVALUE 2147483647;--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "order_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "order_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "product_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "product_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "product_sku" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone_number" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "city" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "postal_code" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "country" varchar(100);--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_levels" ADD CONSTRAINT "inventory_levels_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
INSERT INTO "inventory_levels" ("product_id", "quantity", "location_id") SELECT "id", "stock_quantity", 'default' FROM "products";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "stock_quantity";--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_sku_unique" UNIQUE("sku");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_uuid_unique" UNIQUE("uuid");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_cart_token_unique" UNIQUE("cart_token");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_order_number_unique" UNIQUE("order_number");