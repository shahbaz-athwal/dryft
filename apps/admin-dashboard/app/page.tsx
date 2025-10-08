"use client";

import { api } from "@repo/convex/convex/_generated/api";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { useQuery } from "convex/react";
import { RefreshCw } from "lucide-react";

const API_URL = "http://localhost:4000";

async function populateDepartments() {
  const res = await fetch(`${API_URL}/departments/populate`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error("Failed to populate departments");
  }
  return await res.json();
}

export default function Home() {
  const data = useQuery(api.departments.listDepartments, {});
  const isLoading = !data;

  const onPopulate = async () => {
    await populateDepartments();
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-semibold text-xl">Departments</h1>
        <Button
          aria-label="Populate departments"
          onClick={onPopulate}
          type="button"
        >
          <RefreshCw aria-hidden="true" className="mr-2" size={16} /> Populate
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading…</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prefix</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>rmpId</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((d) => (
                  <TableRow key={d._id}>
                    <TableCell>{d.prefix}</TableCell>
                    <TableCell>{d.name}</TableCell>
                    <TableCell>{d.rmpId ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
