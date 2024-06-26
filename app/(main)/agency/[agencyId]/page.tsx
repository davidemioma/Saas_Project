import Link from "next/link";
import { format } from "date-fns";
import prismadb from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { AreaChart } from "@tremor/react";
import { redirect } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import CircleProgress from "@/components/CircleProgress";
import {
  ClipboardIcon,
  Contact2,
  DollarSign,
  Goal,
  ShoppingCart,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AgencyUserPage({
  params: { agencyId },
  searchParams: { code },
}: {
  params: { agencyId: string };
  searchParams: { code: string };
}) {
  let currency = "USD";

  let sessions;

  let totalClosedSessions;

  let totalPendingSessions;

  let net = 0;

  let potentialIncome = 0;

  let closingRate = 0;

  const currentYear = new Date().getFullYear();

  const startDate = new Date(`${currentYear}-01-01T00:00:00Z`).getTime() / 1000;

  const endDate = new Date(`${currentYear}-12-31T23:59:59Z`).getTime() / 1000;

  const agency = await prismadb.agency.findUnique({
    where: {
      id: agencyId,
    },
    select: {
      id: true,
      connectAccountId: true,
      subAccounts: {
        select: {
          id: true,
        },
      },
      goal: true,
    },
  });

  if (!agency) {
    return redirect("/sign-in");
  }

  if (agency.connectAccountId) {
    const stripeAcc = await stripe.accounts.retrieve({
      stripeAccount: agency.connectAccountId,
    });

    currency = stripeAcc.default_currency?.toUpperCase() || "USD";

    const checkoutSessions = await stripe.checkout.sessions.list(
      {
        created: { gte: startDate, lte: endDate },
        limit: 100,
      },
      { stripeAccount: agency.connectAccountId },
    );

    sessions = checkoutSessions.data;

    totalClosedSessions = checkoutSessions.data
      .filter((session) => session.status === "complete")
      .map((session) => ({
        ...session,
        created: format(session.created, "MM/dd/yyyy").toString(),
        amount_total: session.amount_total ? session.amount_total / 100 : 0,
      }));

    totalPendingSessions = checkoutSessions.data
      .filter((session) => session.status === "open")
      .map((session) => ({
        ...session,
        created: format(session.created, "MM/dd/yyyy").toString(),
        amount_total: session.amount_total ? session.amount_total / 100 : 0,
      }));

    net = +totalClosedSessions
      .reduce((total, session) => total + (session.amount_total || 0), 0)
      .toFixed(2);

    potentialIncome = +totalPendingSessions
      .reduce((total, session) => total + (session.amount_total || 0), 0)
      .toFixed(2);

    closingRate = +(
      (totalClosedSessions.length / checkoutSessions.data.length) *
      100
    ).toFixed(2);
  }

  return (
    <div className="relative h-full w-full">
      <h1 className="text-4xl">Dashboard</h1>

      <Separator className="my-6" />

      {!agency.connectAccountId && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Connect Your Stripe</CardTitle>

            <CardDescription>
              You need to connect your stripe account to see metrics
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Link
              href={`/agency/${agency.id}/launchpad`}
              className="flex w-fit items-center gap-2 rounded-md bg-secondary p-2"
            >
              <ClipboardIcon />
              Launch Pad
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-8 pb-6">
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          <Card className="relative">
            <CardHeader>
              <CardTitle>Income</CardTitle>

              <CardDescription className="text-2xl md:text-4xl">
                {net ? `${currency} ${net.toFixed(2)}` : `$0.00`}
              </CardDescription>

              <small className="text-xs text-muted-foreground">
                For the year {currentYear}
              </small>
            </CardHeader>

            <CardContent className="text-sm text-muted-foreground">
              Total revenue generated as reflected in your stripe dashboard.
            </CardContent>

            <DollarSign className="absolute right-4 top-4 text-muted-foreground" />
          </Card>

          <Card className="relative">
            <CardHeader>
              <CardTitle>Potential Income</CardTitle>

              <CardDescription className="text-2xl md:text-4xl">
                {potentialIncome
                  ? `${currency} ${potentialIncome.toFixed(2)}`
                  : `$0.00`}
              </CardDescription>

              <small className="text-xs text-muted-foreground">
                For the year {currentYear}
              </small>
            </CardHeader>

            <CardContent className="text-sm text-muted-foreground">
              This is how much you can close.
            </CardContent>

            <DollarSign className="absolute right-4 top-4 text-muted-foreground" />
          </Card>

          <Card className="relative">
            <CardHeader>
              <CardTitle>Active Clients</CardTitle>

              <CardDescription className="text-2xl md:text-4xl">
                {agency.subAccounts.length || 0}
              </CardDescription>
            </CardHeader>

            <CardContent className="text-sm text-muted-foreground">
              Reflects the number of sub accounts you own and manage.
            </CardContent>

            <Contact2 className="absolute right-4 top-4 text-muted-foreground" />
          </Card>

          <Card className="relative">
            <CardHeader>
              <CardTitle>Agency Goal</CardTitle>

              <CardDescription className="mt-2">
                Reflects the number of sub accounts you want to own and manage.
              </CardDescription>
            </CardHeader>

            <CardFooter>
              <div className="flex w-full flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Current: {agency?.subAccounts?.length || 0}
                  </span>

                  <span className="text-sm text-muted-foreground">
                    Goal: {agency?.goal}
                  </span>
                </div>

                <Progress
                  value={(agency.subAccounts.length / agency.goal) * 100}
                />
              </div>
            </CardFooter>

            <Goal className="absolute right-4 top-4 text-muted-foreground" />
          </Card>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>

            <CardContent>
              <AreaChart
                className="stroke-primary text-sm"
                data={[
                  ...(totalClosedSessions || []),
                  ...(totalPendingSessions || []),
                ]}
                index="created"
                categories={["amount_total"]}
                colors={["primary"]}
                yAxisWidth={30}
                showAnimation={true}
              />
            </CardContent>
          </Card>

          <Card className="w-full max-w-[400px]">
            <CardHeader>
              <CardTitle>Conversions</CardTitle>
            </CardHeader>

            <CardContent>
              <CircleProgress
                value={closingRate}
                description={
                  <>
                    {sessions && (
                      <div className="my-2 flex flex-col">
                        Abandoned
                        <div className="flex gap-2">
                          <ShoppingCart className="h-5 w-5 text-rose-700" />
                          {sessions.length}
                        </div>
                      </div>
                    )}

                    {totalClosedSessions && (
                      <div className="flex flex-col">
                        Won Carts
                        <div className="flex gap-2">
                          <ShoppingCart className="h-5 w-5 text-emerald-700" />
                          {totalClosedSessions.length}
                        </div>
                      </div>
                    )}
                  </>
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
