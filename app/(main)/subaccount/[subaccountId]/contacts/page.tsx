import prismadb from "@/lib/prisma";
import ContactsContent from "./_components/ContactsContent";

export default async function ContactsPage({
  params: { subaccountId },
}: {
  params: { subaccountId: string };
}) {
  const contacts = await prismadb.contact.findMany({
    where: {
      subAccountId: subaccountId,
    },
    include: {
      tickets: {
        select: {
          value: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return <ContactsContent subAccountId={subaccountId} contacts={contacts} />;
}
