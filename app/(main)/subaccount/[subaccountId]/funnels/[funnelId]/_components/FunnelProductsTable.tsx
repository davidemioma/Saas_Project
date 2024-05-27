"use client";

import React, { useState } from "react";
import Stripe from "stripe";
import Image from "next/image";
import { toast } from "sonner";
import { FunnelProps } from "@/types";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { updateFunnelProducts } from "@/data/queries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  products: Stripe.Product[];
  funnel: FunnelProps;
};

const FunnelProductsTable = ({ products, funnel }: Props) => {
  const router = useRouter();

  const [liveProducts, setLiveProducts] = useState<
    { productId: string; recurring: boolean }[] | []
  >(JSON.parse(funnel.liveProducts || "[]"));

  const addProduct = (product: Stripe.Product) => {
    const productIdExists = liveProducts.find(
      //@ts-ignore
      (prod) => prod.productId === product.default_price.id
    );

    if (productIdExists) {
      setLiveProducts(
        liveProducts.filter(
          (prod) =>
            prod.productId !==
            //@ts-ignore
            product.default_price?.id
        )
      );
    } else {
      setLiveProducts((prev) => [
        {
          //@ts-ignore
          productId: product.default_price.id as string,
          //@ts-ignore
          recurring: !!product.default_price.recurring,
        },
        ...prev,
      ]);
    }
  };

  const { mutate: saveProducts, isPending } = useMutation({
    mutationKey: ["save-products", funnel.subAccountId, funnel.id],
    mutationFn: async () => {
      await updateFunnelProducts({
        subAccountId: funnel.subAccountId,
        funnelId: funnel.id,
        products: JSON.stringify(liveProducts),
      });
    },
    onSuccess: () => {
      toast.success("Saved product successfully!");

      router.refresh();
    },
    onError: (err) => {
      toast.error("Could not save product! Try again later.");
    },
  });

  return (
    <>
      <Table className="bg-card border border-border rounded-md">
        <TableHeader className="rounded-md">
          <TableRow>
            <TableHead>Live</TableHead>

            <TableHead>Image</TableHead>

            <TableHead>Name</TableHead>

            <TableHead>Interval</TableHead>

            <TableHead className="text-right">Price</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="font-medium truncate">
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <Input
                  type="checkbox"
                  className="w-4 h-4"
                  defaultChecked={
                    !!liveProducts?.find(
                      //@ts-ignore
                      (prod) => prod.productId === product.default_price.id
                    )
                  }
                  onChange={() => addProduct(product)}
                  disabled={isPending}
                />
              </TableCell>

              <TableCell>
                <Image
                  height={60}
                  width={60}
                  src={product.images[0]}
                  alt="product Image"
                />
              </TableCell>

              <TableCell>{product.name}</TableCell>

              <TableCell>
                {
                  //@ts-ignore
                  product.default_price?.recurring ? "Recurring" : "One Time"
                }
              </TableCell>

              <TableCell>
                {
                  //@ts-ignore
                  product.default_price?.unit_amount / 100
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button
        className="mt-4"
        onClick={() => saveProducts()}
        disabled={isPending || liveProducts.length === 0}
      >
        Save Products
      </Button>
    </>
  );
};

export default FunnelProductsTable;
