import { Plan } from "@prisma/client";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/data/queries";
import AgencyDetails from "@/components/forms/AgencyDetails";

export default async function Agency({
  searchParams: { plan, state, code },
}: {
  searchParams: { plan: Plan; state: string; code: string };
}) {
  const user = await currentUser();

  if (!user) return redirect("/sign-in");

  const agencyId = await verifyAndAcceptInvitation();

  const userDetail = await getAuthUserDetails();

  if (agencyId) {
    if (
      userDetail?.role === "SUBACCOUNT_GUEST" ||
      userDetail?.role === "SUBACCOUNT_USER"
    ) {
      return redirect("/subaccount");
    } else if (
      userDetail?.role === "AGENCY_ADMIN" ||
      userDetail?.role === "AGENCY_OWNER"
    ) {
      if (plan) {
        return redirect(`/agency/${agencyId}/billing?plan=${plan}`);
      }

      if (state) {
        const statePath = state.split("___")[0];

        const stateAgencyId = state.split("___")[1];

        if (!stateAgencyId) {
          return <div>Not authorized</div>;
        }

        return redirect(`/agency/${stateAgencyId}/${statePath}?code=${code}`);
      } else {
        return redirect(`/agency/${agencyId}`);
      }
    } else {
      return <div>Not authorized</div>;
    }
  }

  return (
    <div className="flex justify-center items-center mt-5">
      <div className="max-w-[850px] border p-4 rounded-xl">
        <h1 className="text-4xl mb-5">Create An Agency</h1>

        <AgencyDetails />
      </div>
    </div>
  );
}
