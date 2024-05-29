"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FunnelProps } from "@/types";
import { FunnelPage } from "@prisma/client";
import { useRouter } from "next/navigation";
import FunnelPageCard from "./FunnelPageCard";
import { Button } from "@/components/ui/button";
import CreateFunnelPage from "./CreateFunnelPage";
import { useMutation } from "@tanstack/react-query";
import { updateFunnelPagesOrder } from "@/data/queries";
import { ScrollArea } from "@/components/ui/scroll-area";
import CustomModal from "@/components/modals/CustomModal";
import { Check, ExternalLink, LucideEdit } from "lucide-react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import FunnelPagePlaceholder from "@/components/icons/funnel-page-placeholder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  subaccountId: string;
  funnel: FunnelProps;
};

const FunnelSteps = ({ subaccountId, funnel }: Props) => {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [funnelPagesState, setFunnelPagesState] = useState<FunnelPage[]>(
    funnel.funnelPages
  );

  const [clickedFunnelPage, setClickedFunnelPage] = useState<
    FunnelPage | undefined
  >(funnel.funnelPages[0]);

  useEffect(() => {
    setFunnelPagesState(funnel.funnelPages);
  }, [funnel]);

  function reorder<T>(list: T[], startIndex: number, endIndex: number) {
    const result = Array.from(list);

    const [removed] = result.splice(startIndex, 1);

    result.splice(endIndex, 0, removed);

    return result;
  }

  const { mutate: upsertFunnelPages, isPending } = useMutation({
    mutationKey: ["update-funnel-pages", funnel.id],
    mutationFn: async () => {
      await updateFunnelPagesOrder({
        subAccountId: subaccountId,
        funnelId: funnel.id,
        funnelPages: funnelPagesState,
      });
    },
    onSuccess: () => {
      toast.success("Updated funnel pages successfully!");

      router.refresh();
    },
    onError: (err) => {
      toast.error("Could not update funnel pages! Try again later.");
    },
  });

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    const funnelPages = reorder(
      funnelPagesState,
      source.index,
      destination.index
    ).map((item, index) => ({ ...item, order: index }));

    setFunnelPagesState(funnelPages);

    //Update backend
    upsertFunnelPages();
  };

  return (
    <>
      {open && (
        <CustomModal
          open={open}
          onOpenChange={() => setOpen(false)}
          title=" Create or Update a Funnel Page"
          subheading="Funnel Pages allow you to create step by step processes for customers to follow"
        >
          <CreateFunnelPage
            subaccountId={subaccountId}
            funnelId={funnel.id}
            onClose={() => setOpen(false)}
            funnelLength={funnel.funnelPages.length}
          />
        </CustomModal>
      )}

      <div className="flex flex-col lg:flex-row border pb-20">
        <aside className="flex-[0.3] bg-background p-6">
          <ScrollArea className="h-full">
            <Button
              className="w-full mb-4"
              onClick={() => setOpen(true)}
              disabled={isPending}
            >
              Create New Steps
            </Button>

            <div className="flex gap-4 mb-4 items-center">
              <Check />
              Funnel Steps
            </div>

            {funnelPagesState.length > 0 ? (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable
                  key="funnels"
                  droppableId="funnels"
                  direction="vertical"
                >
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {funnelPagesState.map((funnelPage, index) => (
                        <div
                          className="relative"
                          key={funnelPage.id}
                          onClick={() => setClickedFunnelPage(funnelPage)}
                        >
                          <FunnelPageCard
                            key={funnelPage.id}
                            index={index}
                            isActive={clickedFunnelPage?.id === funnelPage.id}
                            funnelPage={funnelPage}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            ) : (
              <div className="py-6 text-center text-muted-foreground">
                No pages
              </div>
            )}
          </ScrollArea>
        </aside>

        <aside className="bg-muted flex-[0.7] p-4">
          {funnel.funnelPages.length > 0 ? (
            <Card className="w-full h-full">
              <CardHeader>
                <p className="text-sm text-muted-foreground">Page name</p>

                <CardTitle>{clickedFunnelPage?.name}</CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col gap-5">
                <div className="w-full sm:w-80 border-2 rounded-lg overflow-clip">
                  <Link
                    href={`/subaccount/${subaccountId}/funnels/${funnel.id}/editor/${clickedFunnelPage?.id}`}
                    className="relative group"
                  >
                    <div className="w-full cursor-pointer group-hover:opacity-30 ">
                      <FunnelPagePlaceholder />
                    </div>

                    <LucideEdit
                      size={50}
                      className="!text-muted-foreground absolute top-1/2 left-1/2 opacity-0 transofrm -translate-x-1/2 -translate-y-1/2 group-hover:opacity-100 transition-all duration-100"
                    />
                  </Link>

                  <Link
                    href={`${process.env.NEXT_PUBLIC_SCHEME}${funnel.subDomainName}.${process.env.NEXT_PUBLIC_DOMAIN}/${clickedFunnelPage?.pathName}`}
                    target="_blank"
                    className="group flex items-center justify-start p-2 gap-2 hover:text-primary transition-colors duration-200"
                  >
                    <ExternalLink size={15} />

                    <div className="w-64 overflow-hidden overflow-ellipsis ">
                      {process.env.NEXT_PUBLIC_SCHEME}
                      {funnel.subDomainName}.{process.env.NEXT_PUBLIC_DOMAIN}/
                      {clickedFunnelPage?.pathName}
                    </div>
                  </Link>
                </div>

                <CreateFunnelPage
                  subaccountId={subaccountId}
                  funnelId={funnel.id}
                  defaultData={clickedFunnelPage}
                  funnelLength={funnel.funnelPages.length}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="h-[600px] flex items-center justify-center text-muted-foreground">
              Create a page to view page settings.
            </div>
          )}
        </aside>
      </div>
    </>
  );
};

export default FunnelSteps;
