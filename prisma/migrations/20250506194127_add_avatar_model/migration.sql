-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar_id" TEXT;

-- CreateTable
CREATE TABLE "avatars" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "avatars_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "avatars_url_key" ON "avatars"("url");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "avatars"("id") ON DELETE SET NULL ON UPDATE CASCADE;
