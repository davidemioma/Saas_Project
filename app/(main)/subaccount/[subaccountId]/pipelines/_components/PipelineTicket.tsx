"use client";

import React, { Dispatch, SetStateAction } from "react";
import { TicketProps } from "@/types";

type Props = {
  index: number;
  ticket: TicketProps;
  subaccountId: string;
  allTickets: TicketProps[];
  setAllTickets: Dispatch<SetStateAction<TicketProps[]>>;
};

const PipelineTicket = ({
  index,
  ticket,
  subaccountId,
  allTickets,
  setAllTickets,
}: Props) => {
  return <div>{ticket.name}</div>;
};

export default PipelineTicket;
