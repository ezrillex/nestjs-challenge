-- CreateTable
CREATE TABLE "PaymentIntents" (
    "id" UUID NOT NULL,
    "order_id" UUID,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending_creation',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stripe_event_id" TEXT,
    "stripe_payment_intent" JSONB NOT NULL,

    CONSTRAINT "PaymentIntents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncomingPaymentWebhooks" (
    "id" UUID NOT NULL,
    "order_id" UUID,
    "status" "BackgroundJobStatus" NOT NULL DEFAULT 'pending',
    "data" JSON NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP,

    CONSTRAINT "IncomingPaymentWebhooks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PaymentIntents" ADD CONSTRAINT "PaymentIntents_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomingPaymentWebhooks" ADD CONSTRAINT "IncomingPaymentWebhooks_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
