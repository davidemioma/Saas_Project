import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { stripe } from "@/lib/stripe";
import { pricingCards } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Home() {
  const prices = await stripe.prices.list({
    product: process.env.NEXT_PLURA_PRODUCT_ID,
    active: true,
  });

  return (
    <>
      <section className="relative flex h-full w-full flex-col items-center justify-center pt-5 md:pt-48 lg:pt-56">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        <p className="text-center lg:hidden">Run your agency, in one place.</p>

        <div className="relative bg-gradient-to-r from-primary to-secondary-foreground bg-clip-text text-transparent">
          <h1 className="md:tex-[300px] text-center text-7xl font-bold sm:text-9xl">
            Plural
          </h1>
        </div>

        <div className="relative flex items-center justify-center">
          <Image
            className="rounded-t-2xl border-2 border-muted object-cover"
            src="/assets/preview.png"
            width={1200}
            height={1200}
            alt="banner-image"
          />

          <div className="absolute inset-x-0 bottom-0 top-[50%] z-10 bg-gradient-to-t dark:from-background" />
        </div>
      </section>

      <section className="flex flex-col items-center justify-center gap-4 sm:mt-20 md:mt-32 lg:mt-56">
        <h2 className="px-4 text-center text-3xl sm:px-0 md:text-4xl">
          Choose what fits you right
        </h2>

        <p className="px-4 text-center text-muted-foreground sm:px-0">
          Our straightforward pricing plans are tailored to meet your needs. If
          {" you're"} not <br />
          ready to commit you can get started for free.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Card className="flex w-[300px] flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-muted-foreground">
                {pricingCards[0].title}
              </CardTitle>

              <CardDescription>{pricingCards[0].description}</CardDescription>
            </CardHeader>

            <CardContent>
              <span className="text-4xl font-bold">$0</span>

              <span className="text-muted-foreground">
                <span>/ Month</span>
              </span>
            </CardContent>

            <CardFooter className="flex flex-col items-start gap-4">
              <div>
                {pricingCards
                  .find((c) => c.title === "Starter")
                  ?.features.map((feature) => (
                    <div key={feature} className="flex gap-2">
                      <Check />

                      <p>{feature}</p>
                    </div>
                  ))}
              </div>

              <Link
                href="/agency"
                className="w-full rounded-md bg-muted-foreground p-2 text-center"
              >
                Get Started
              </Link>
            </CardFooter>
          </Card>

          {prices.data.map((price) => (
            <Card
              key={price.id}
              className={cn(
                "flex w-[300px] flex-col justify-between",
                price.nickname === "Unlimited SaaS" &&
                  "border-2 border-primary",
              )}
            >
              <CardHeader>
                <CardTitle
                  className={cn(
                    price.nickname !== "Unlimited SaaS" &&
                      "text-muted-foreground",
                  )}
                >
                  {price.nickname}
                </CardTitle>

                <CardDescription>
                  {
                    pricingCards.find((c) => c.title === price.nickname)
                      ?.description
                  }
                </CardDescription>
              </CardHeader>

              <CardContent>
                <span className="text-4xl font-bold">
                  {price.unit_amount && price.unit_amount / 100}
                </span>

                <span className="text-muted-foreground">
                  <span>/ {price.recurring?.interval}</span>
                </span>
              </CardContent>

              <CardFooter className="flex flex-col items-start gap-4">
                <div>
                  {pricingCards
                    .find((c) => c.title === price.nickname)
                    ?.features.map((feature) => (
                      <div key={feature} className="flex gap-2">
                        <Check />

                        <p>{feature}</p>
                      </div>
                    ))}
                </div>

                <Link
                  href={`/agency?plan=${price.id}`}
                  className={cn(
                    "w-full rounded-md bg-primary p-2 text-center",
                    price.nickname !== "Unlimited SaaS" &&
                      "bg-muted-foreground",
                  )}
                >
                  Get Started
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
