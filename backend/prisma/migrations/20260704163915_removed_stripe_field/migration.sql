/*
  Warnings:

  - You are about to drop the column `stripeCustomerId` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_parentId_fkey";

-- DropIndex
DROP INDEX "comments_projectId_idx";

-- DropIndex
DROP INDEX "comments_targetType_targetId_idx";

-- AlterTable
ALTER TABLE "ai_generations" ALTER COLUMN "result" SET DEFAULT '{}';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "stripeCustomerId";

-- AlterTable
ALTER TABLE "versions" ALTER COLUMN "canvasState" SET DEFAULT '{}';

-- CreateIndex
CREATE INDEX "activity_logs_actorId_createdAt_idx" ON "activity_logs"("actorId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ai_generations_projectId_createdAt_idx" ON "ai_generations"("projectId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "comments_parentId_idx" ON "comments"("parentId");

-- CreateIndex
CREATE INDEX "comments_createdBy_idx" ON "comments"("createdBy");

-- CreateIndex
CREATE INDEX "comments_projectId_createdAt_idx" ON "comments"("projectId", "createdAt" ASC);

-- CreateIndex
CREATE INDEX "comments_targetType_targetId_createdAt_idx" ON "comments"("targetType", "targetId", "createdAt" ASC);

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
