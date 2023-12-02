-- CreateTable
CREATE TABLE "Cast" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "data" JSONB,

    CONSTRAINT "Cast_pkey" PRIMARY KEY ("id")
);
