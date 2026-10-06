ALTER TABLE "rooms" ADD COLUMN IF NOT EXISTS "room_type" text DEFAULT 'standard' NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "room_beds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"room_id" uuid NOT NULL,
	"name" text NOT NULL,
	"rent_price" integer NOT NULL,
	"status" text DEFAULT 'vacant' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "room_beds" ADD CONSTRAINT "room_beds_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "room_beds" ADD CONSTRAINT "room_beds_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "birth_date" date;
--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "gender" text;
--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "hometown" text;
--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "workplace" text;
--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "license_plate" text;
--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "id_card_front_url" text;
--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "id_card_back_url" text;
--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "notes" text;
--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN IF NOT EXISTS "bed_id" uuid;
--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN IF NOT EXISTS "contract_number" text;
--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN IF NOT EXISTS "deposit_status" text DEFAULT 'paid' NOT NULL;
--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN IF NOT EXISTS "billing_cycle" integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN IF NOT EXISTS "terms" text;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contracts" ADD CONSTRAINT "contracts_bed_id_room_beds_id_fk" FOREIGN KEY ("bed_id") REFERENCES "public"."room_beds"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "electric_pricing_type" text DEFAULT 'fixed' NOT NULL;
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "water_pricing_type" text DEFAULT 'meter' NOT NULL;
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "water_price_per_person" integer DEFAULT 100000 NOT NULL;
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "bank_name" text;
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "bank_account" text;
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "bank_owner" text;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "room_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"room_id" uuid NOT NULL,
	"name" text NOT NULL,
	"category" text DEFAULT 'furniture' NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"condition" text DEFAULT 'good' NOT NULL,
	"serial_number" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "room_assets" ADD CONSTRAINT "room_assets_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "room_assets" ADD CONSTRAINT "room_assets_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "asset_handovers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"contract_id" uuid NOT NULL,
	"room_id" uuid NOT NULL,
	"type" text DEFAULT 'checkin' NOT NULL,
	"handover_date" date NOT NULL,
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"photos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"notes" text,
	"signed_by_tenant" text DEFAULT 'no' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "asset_handovers" ADD CONSTRAINT "asset_handovers_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "asset_handovers" ADD CONSTRAINT "asset_handovers_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "asset_handovers" ADD CONSTRAINT "asset_handovers_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "property_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"name" text NOT NULL,
	"charge_type" text DEFAULT 'fixed_room' NOT NULL,
	"unit_price" integer NOT NULL,
	"description" text,
	"is_active" text DEFAULT 'yes' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "property_services" ADD CONSTRAINT "property_services_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contract_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"contract_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"custom_price" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contract_services" ADD CONSTRAINT "contract_services_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contract_services" ADD CONSTRAINT "contract_services_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contract_services" ADD CONSTRAINT "contract_services_service_id_property_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."property_services"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "meter_readings" ADD COLUMN IF NOT EXISTS "electric_photo" text;
--> statement-breakpoint
ALTER TABLE "meter_readings" ADD COLUMN IF NOT EXISTS "water_photo" text;
--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD COLUMN IF NOT EXISTS "cost" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD COLUMN IF NOT EXISTS "completed_at" timestamp;
