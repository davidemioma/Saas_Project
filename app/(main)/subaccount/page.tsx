import { redirect } from "next/navigation";
import Unauthorised from "@/components/Unauthorised";
import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/data/queries";

type Props = {
  searchParams: { state: string; code: string };
};

export default async function SubAccountOnboardingPage({
  searchParams: { state, code },
}: Props) {
  const agencyId = await verifyAndAcceptInvitation();

  if (!agencyId) {
    return <Unauthorised />;
  }

  const user = await getAuthUserDetails();

  if (!user) {
    return redirect("/sign-in");
  }

  //Get first sub account invite user has access to
  const getFirstSubaccountWithAccess = user.permissions.find(
    (permission) => permission.access === true
  );

  //If there is a state
  if (state) {
    const statePath = state.split("___")[0];

    const stateSubaccountId = state.split("___")[1];

    if (!stateSubaccountId) return <Unauthorised />;

    return redirect(
      `/subaccount/${stateSubaccountId}/${statePath}?code=${code}`
    );
  }

  if (getFirstSubaccountWithAccess) {
    return redirect(`/subaccount/${getFirstSubaccountWithAccess.subAccountId}`);
  }

  return <Unauthorised />;
}
