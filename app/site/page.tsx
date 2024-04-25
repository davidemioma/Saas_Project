import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { pricingCards } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <>
      <section className="relative w-full h-full flex flex-col items-center justify-center pt-5 md:pt-48 lg:pt-56">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        <p className="text-center lg:hidden">Run your agency, in one place.</p>

        <div className="relative bg-gradient-to-r from-primary to-secondary-foreground bg-clip-text text-transparent">
          <h1 className="text-7xl sm:text-9xl md:tex-[300px] font-bold text-center">
            Plural
          </h1>
        </div>

        <div className="relative flex items-center justify-center">
          <Image
            className="object-cover rounded-t-2xl border-2 border-muted"
            src="/assets/preview.png"
            width={1200}
            height={1200}
            alt="banner-image"
          />

          <div className="bg-gradient-to-t dark:from-background absolute top-[50%] bottom-0 inset-x-0 z-10" />
        </div>
      </section>

      <section className="flex flex-col justify-center items-center gap-4 sm:mt-20 md:mt-32 lg:mt-56">
        <h2 className="px-4 sm:px-0 text-3xl md:text-4xl text-center">
          Choose what fits you right
        </h2>

        <p className="px-4 sm:px-0 text-muted-foreground text-center">
          Our straightforward pricing plans are tailored to meet your needs. If
          {" you're"} not <br />
          ready to commit you can get started for free.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-6">
          {pricingCards.map((price) => (
            <Card
              key={price.title}
              className={cn(
                "w-[300px] flex flex-col justify-between",
                price.title === "Unlimited Saas" && "border-2 border-primary"
              )}
            >
              <CardHeader>
                <CardTitle
                  className={cn(
                    price.title !== "Unlimited Saas" && "text-muted-foreground"
                  )}
                >
                  {price.title}
                </CardTitle>

                <CardDescription>
                  {
                    pricingCards.find((c) => c.title === price.title)
                      ?.description
                  }
                </CardDescription>
              </CardHeader>

              <CardContent>
                <span className="text-4xl font-bold">{price.price}</span>

                <span className="text-muted-foreground">
                  <span>/ Month</span>
                </span>
              </CardContent>

              <CardFooter className="flex flex-col items-start gap-4">
                <div>
                  {pricingCards
                    .find((c) => c.title === price.title)
                    ?.features.map((feature) => (
                      <div key={feature} className="flex gap-2">
                        <Check />

                        <p>{feature}</p>
                      </div>
                    ))}
                </div>

                <Link
                  href={`/agency?plan=${price.priceId}`}
                  className={cn(
                    "w-full text-center bg-primary p-2 rounded-md",
                    price.title !== "Unlimited Saas" && "bg-muted-foreground"
                  )}
                >
                  Get Started
                </Link>
              </CardFooter>
            </Card>
          ))}

          <Card className="w-[300px] flex flex-col justify-between">
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
                className="w-full bg-muted-foreground text-center  p-2 rounded-md"
              >
                Get Started
              </Link>
            </CardFooter>
          </Card>
        </div>
      </section>
    </>
  );
}
