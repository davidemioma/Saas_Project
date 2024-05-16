import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getAuthUserDetails } from "@/data/queries";
import { ScrollArea } from "@/components/ui/scroll-area";
import DeleteSubAccBtn from "./_components/DeleteSubAccBtn";
import CreateSubAccBtn from "./_components/CreateSubAccBtn";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default async function AgencySubAccountsPage({
  params: { agencyId },
}: {
  params: { agencyId: string };
}) {
  const userDetails = await getAuthUserDetails();

  if (!userDetails) {
    return redirect("/");
  }

  return (
    <AlertDialog>
      <div className="flex flex-col">
        <CreateSubAccBtn
          agencyId={agencyId}
          authUser={userDetails}
          className="w-[200px] self-end m-6"
        />

        <div className="bg-transparent space-y-3 rounded-lg">
          <h1 className="font-bold">Sub Accounts</h1>

          {!!userDetails.agency?.subAccounts.length ? (
            <ScrollArea>
              {userDetails.agency?.subAccounts.map((subAccount) => (
                <div
                  key={subAccount.id}
                  className="!bg-background flex items-center justify-between h-32 p-4 my-2 text-primary border-[1px] border-border rounded-lg hover:!bg-background cursor-pointer transition-all"
                >
                  <Link
                    href={`/subaccount/${subAccount.id}`}
                    className="w-full h-full flex gap-4"
                  >
                    <div className="relative w-32">
                      <Image
                        className="bg-muted/50 p-4 rounded-md object-contain"
                        src={subAccount.subAccountLogo}
                        fill
                        alt="subaccount logo"
                      />
                    </div>

                    <div className="flex flex-col justify-between">
                      <div className="flex flex-col text-primary">
                        {subAccount.name}
                        <span className="text-muted-foreground text-xs">
                          {subAccount.address}
                        </span>
                      </div>
                    </div>
                  </Link>

                  <AlertDialogTrigger asChild>
                    <Button
                      className="w-20 text-white hover:bg-red-600 hover:text-white"
                      size="sm"
                      variant="destructive"
                      type="button"
                    >
                      Delete
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-left">
                        Are your absolutely sure
                      </AlertDialogTitle>

                      <AlertDialogDescription className="text-left">
                        This action cannot be undon. This will delete the
                        subaccount and all data related to the subaccount.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter className="flex items-center">
                      <AlertDialogCancel className="mb-2">
                        Cancel
                      </AlertDialogCancel>

                      <AlertDialogAction className="bg-destructive hover:bg-destructive">
                        <DeleteSubAccBtn subAccountId={subAccount.id} />
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </div>
              ))}
            </ScrollArea>
          ) : (
            <div className="text-muted-foreground text-center p-4">
              No Sub accounts
            </div>
          )}
        </div>
      </div>
    </AlertDialog>
  );
}
