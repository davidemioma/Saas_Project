import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import prismadb from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";
import { CheckCircleIcon } from "lucide-react";
import { getStripeOAuthLink } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AgencyLaunchPadPage({
  params: { agencyId },
  searchParams: { code },
}: {
  params: { agencyId: string };
  searchParams: { code: string };
}) {
  const agencyDetails = await prismadb.agency.findUnique({
    where: { id: agencyId },
  });

  if (!agencyDetails) {
    return redirect("/");
  }

  const allDetailsExist =
    agencyDetails.address &&
    agencyDetails.agencyLogo &&
    agencyDetails.city &&
    agencyDetails.companyEmail &&
    agencyDetails.companyPhone &&
    agencyDetails.country &&
    agencyDetails.name &&
    agencyDetails.state &&
    agencyDetails.zipCode;

  const stripeOAuthLink = getStripeOAuthLink({
    accountType: "agency",
    state: `launchpad___${agencyDetails.id}`,
  });

  let connectedStripeAccount = false;

  if (code && !agencyDetails.connectAccountId) {
    try {
      const response = await stripe.oauth.token({
        grant_type: "authorization_code",
        code,
      });

      await prismadb.agency.update({
        where: {
          id: agencyId,
        },
        data: {
          connectAccountId: response.stripe_user_id,
        },
      });

      connectedStripeAccount = true;
    } catch (error) {
      toast.error("Unable to connect to stripe!");
    }
  }

  return (
    <div className="w-full max-w-[800px] mx-auto h-full flex items-center justify-center">
      <Card className="border-none">
        <CardHeader>
          <CardTitle>Lets get started!</CardTitle>

          <CardDescription>
            Follow the steps below to get your account setup.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="w-full flex items-center justify-between gap-4 p-4 border rounded-lg">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <Image
                className="rounded-md object-contain"
                src="/assets/appstore.png"
                height={80}
                width={80}
                alt="app logo"
              />

              <p className="text-sm">
                Save the website as a shortcut on your mobile device
              </p>
            </div>

            <CheckCircleIcon
              className=" text-primary p-2 flex-shrink-0"
              size={50}
            />
          </div>

          <div className="w-full flex items-center justify-between gap-4 p-4 border rounded-lg">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <Image
                className="rounded-md object-contain"
                src="/assets/stripelogo.png"
                height={80}
                width={80}
                alt="app logo"
              />

              <p className="text-sm">
                Connect your stripe account to accept payments and see your
                dashboard.
              </p>
            </div>

            {agencyDetails.connectAccountId || connectedStripeAccount ? (
              <CheckCircleIcon
                className=" text-primary p-2 flex-shrink-0"
                size={50}
              />
            ) : (
              <Link
                className="bg-primary py-2 px-4 rounded-md text-white"
                href={stripeOAuthLink}
              >
                Start
              </Link>
            )}
          </div>

          <div className="w-full flex items-center justify-between gap-4 p-4 border rounded-lg">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <Image
                className="rounded-md object-contain"
                src={agencyDetails.agencyLogo}
                height={80}
                width={80}
                alt="app logo"
              />

              <p className="text-sm">Fill in all your bussiness details.</p>
            </div>

            {allDetailsExist ? (
              <CheckCircleIcon
                className="text-primary p-2 flex-shrink-0"
                size={50}
              />
            ) : (
              <Link
                className="bg-primary py-2 px-4 rounded-md text-white"
                href={`/agency/${agencyId}/settings`}
              >
                Start
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
