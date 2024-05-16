"use client";

import React from "react";
import { columns } from "./Columns";
import { TeamMemberProps } from "@/types";
import { DataTable } from "@/components/ui/data-table";

type Props = {
  data: TeamMemberProps[];
};

const TeamContent = ({ data }: Props) => {
  return <DataTable data={data} filterValue="name" columns={columns} />;
};

export default TeamContent;
