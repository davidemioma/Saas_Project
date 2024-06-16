-- CreateEnum
CREATE TYPE "Role" AS ENUM ('AGENCY_OWNER', 'AGENCY_ADMIN', 'SUBACCOUNT_USER', 'SUBACCOUNT_GUEST');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('price_1PK5xrGFaQBujn7Dy3K9Gbaj', 'price_1PK5xrGFaQBujn7DJGJHGofQ');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('ACCEPTED', 'REVOKED', 'PENDING');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('CREATE_CONTACT');

-- CreateEnum
CREATE TYPE "TriggerTypes" AS ENUM ('CONTACT_FORM');

-- CreateEnum
CREATE TYPE "Icon" AS ENUM ('settings', 'chart', 'calendar', 'check', 'chip', 'compass', 'database', 'flag', 'home', 'info', 'link', 'lock', 'messages', 'notification', 'payment', 'power', 'receipt', 'shield', 'star', 'tune', 'videorecorder', 'wallet', 'warning', 'headphone', 'send', 'pipelines', 'person', 'category', 'contact', 'clipboardIcon');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'SUBACCOUNT_USER',
    "avatarUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "agencyLogo" TEXT NOT NULL,
    "companyEmail" TEXT NOT NULL,
    "companyPhone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "goal" INTEGER NOT NULL DEFAULT 5,
    "whiteLabel" BOOLEAN NOT NULL DEFAULT true,
    "customerId" TEXT DEFAULT '',
    "connectAccountId" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubAccount" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subAccountLogo" TEXT NOT NULL,
    "companyEmail" TEXT NOT NULL,
    "companyPhone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "goal" INTEGER NOT NULL DEFAULT 5,
    "connectAccountId" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subAccountId" TEXT NOT NULL,
    "access" BOOLEAN NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "subAccountId" TEXT,
    "notification" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "subAccountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trigger" (
    "id" TEXT NOT NULL,
    "subAccountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TriggerTypes" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trigger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Automation" (
    "id" TEXT NOT NULL,
    "subAccountId" TEXT NOT NULL,
    "triggerId" TEXT,
    "name" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Automation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationInstance" (
    "id" TEXT NOT NULL,
    "automationId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Action" (
    "id" TEXT NOT NULL,
    "automationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ActionType" NOT NULL,
    "laneId" TEXT NOT NULL DEFAULT '0',
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pipeline" (
    "id" TEXT NOT NULL,
    "subAccountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pipeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lane" (
    "id" TEXT NOT NULL,
    "pipelineId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lane_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "subAccountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "assignedUserId" TEXT,
    "laneId" TEXT NOT NULL,
    "customerId" TEXT,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "subAccountId" TEXT NOT NULL,
    "type" TEXT,
    "name" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Funnel" (
    "id" TEXT NOT NULL,
    "subAccountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "subDomainName" TEXT,
    "favicon" TEXT,
    "liveProducts" TEXT DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Funnel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassName" (
    "id" TEXT NOT NULL,
    "funnelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "customData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassName_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FunnelPage" (
    "id" TEXT NOT NULL,
    "funnelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pathName" TEXT NOT NULL DEFAULT '',
    "visits" INTEGER NOT NULL DEFAULT 0,
    "content" TEXT,
    "order" INTEGER NOT NULL,
    "previewImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FunnelPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "role" "Role" NOT NULL DEFAULT 'SUBACCOUNT_USER',

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT,
    "plan" "Plan",
    "price" TEXT,
    "priceId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "currentPeriodEndDate" TIMESTAMP(3) NOT NULL,
    "subscritiptionId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AddOns" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "priceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AddOns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencySidebarOption" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT,
    "name" TEXT NOT NULL DEFAULT 'Menu',
    "link" TEXT NOT NULL DEFAULT '#',
    "icon" "Icon" NOT NULL DEFAULT 'info',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencySidebarOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubAccountSidebarOption" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT,
    "subAccountId" TEXT,
    "name" TEXT NOT NULL DEFAULT 'Menu',
    "link" TEXT NOT NULL DEFAULT '#',
    "icon" "Icon" NOT NULL DEFAULT 'info',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubAccountSidebarOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TagToTicket" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_agencyId_idx" ON "User"("agencyId");

-- CreateIndex
CREATE INDEX "SubAccount_agencyId_idx" ON "SubAccount"("agencyId");

-- CreateIndex
CREATE INDEX "Permission_email_idx" ON "Permission"("email");

-- CreateIndex
CREATE INDEX "Permission_subAccountId_idx" ON "Permission"("subAccountId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_agencyId_idx" ON "Notification"("agencyId");

-- CreateIndex
CREATE INDEX "Notification_subAccountId_idx" ON "Notification"("subAccountId");

-- CreateIndex
CREATE INDEX "Contact_subAccountId_idx" ON "Contact"("subAccountId");

-- CreateIndex
CREATE INDEX "Trigger_subAccountId_idx" ON "Trigger"("subAccountId");

-- CreateIndex
CREATE INDEX "Automation_triggerId_idx" ON "Automation"("triggerId");

-- CreateIndex
CREATE INDEX "Automation_subAccountId_idx" ON "Automation"("subAccountId");

-- CreateIndex
CREATE INDEX "AutomationInstance_automationId_idx" ON "AutomationInstance"("automationId");

-- CreateIndex
CREATE INDEX "Action_automationId_idx" ON "Action"("automationId");

-- CreateIndex
CREATE INDEX "Pipeline_subAccountId_idx" ON "Pipeline"("subAccountId");

-- CreateIndex
CREATE INDEX "Lane_pipelineId_idx" ON "Lane"("pipelineId");

-- CreateIndex
CREATE INDEX "Tag_subAccountId_idx" ON "Tag"("subAccountId");

-- CreateIndex
CREATE INDEX "Ticket_assignedUserId_idx" ON "Ticket"("assignedUserId");

-- CreateIndex
CREATE INDEX "Ticket_laneId_idx" ON "Ticket"("laneId");

-- CreateIndex
CREATE INDEX "Ticket_customerId_idx" ON "Ticket"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Media_link_key" ON "Media"("link");

-- CreateIndex
CREATE INDEX "Media_subAccountId_idx" ON "Media"("subAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Funnel_subDomainName_key" ON "Funnel"("subDomainName");

-- CreateIndex
CREATE INDEX "Funnel_subAccountId_idx" ON "Funnel"("subAccountId");

-- CreateIndex
CREATE INDEX "ClassName_funnelId_idx" ON "ClassName"("funnelId");

-- CreateIndex
CREATE INDEX "FunnelPage_funnelId_idx" ON "FunnelPage"("funnelId");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_email_key" ON "Invitation"("email");

-- CreateIndex
CREATE INDEX "Invitation_agencyId_idx" ON "Invitation"("agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_agencyId_key" ON "Subscription"("agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_subscritiptionId_key" ON "Subscription"("subscritiptionId");

-- CreateIndex
CREATE INDEX "Subscription_customerId_idx" ON "Subscription"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "AddOns_priceId_key" ON "AddOns"("priceId");

-- CreateIndex
CREATE INDEX "AddOns_agencyId_idx" ON "AddOns"("agencyId");

-- CreateIndex
CREATE INDEX "AgencySidebarOption_agencyId_idx" ON "AgencySidebarOption"("agencyId");

-- CreateIndex
CREATE INDEX "SubAccountSidebarOption_agencyId_idx" ON "SubAccountSidebarOption"("agencyId");

-- CreateIndex
CREATE INDEX "SubAccountSidebarOption_subAccountId_idx" ON "SubAccountSidebarOption"("subAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "_TagToTicket_AB_unique" ON "_TagToTicket"("A", "B");

-- CreateIndex
CREATE INDEX "_TagToTicket_B_index" ON "_TagToTicket"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubAccount" ADD CONSTRAINT "SubAccount_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trigger" ADD CONSTRAINT "Trigger_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Automation" ADD CONSTRAINT "Automation_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Automation" ADD CONSTRAINT "Automation_triggerId_fkey" FOREIGN KEY ("triggerId") REFERENCES "Trigger"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationInstance" ADD CONSTRAINT "AutomationInstance_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "Automation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "Automation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pipeline" ADD CONSTRAINT "Pipeline_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lane" ADD CONSTRAINT "Lane_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "Pipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_laneId_fkey" FOREIGN KEY ("laneId") REFERENCES "Lane"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Funnel" ADD CONSTRAINT "Funnel_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassName" ADD CONSTRAINT "ClassName_funnelId_fkey" FOREIGN KEY ("funnelId") REFERENCES "Funnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FunnelPage" ADD CONSTRAINT "FunnelPage_funnelId_fkey" FOREIGN KEY ("funnelId") REFERENCES "Funnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddOns" ADD CONSTRAINT "AddOns_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencySidebarOption" ADD CONSTRAINT "AgencySidebarOption_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubAccountSidebarOption" ADD CONSTRAINT "SubAccountSidebarOption_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubAccountSidebarOption" ADD CONSTRAINT "SubAccountSidebarOption_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToTicket" ADD CONSTRAINT "_TagToTicket_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToTicket" ADD CONSTRAINT "_TagToTicket_B_fkey" FOREIGN KEY ("B") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
