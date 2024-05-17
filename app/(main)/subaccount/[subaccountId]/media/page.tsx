import prismadb from "@/lib/prisma";
import MediaComponent from "@/components/media/MediaComponent";

export default async function MediaPage({
  params: { subaccountId },
}: {
  params: { subaccountId: string };
}) {
  const media = await prismadb.media.findMany({
    where: {
      subAccountId: subaccountId,
    },
  });

  return (
    <div>
      <MediaComponent subAccountId={subaccountId} media={media} />
    </div>
  );
}
