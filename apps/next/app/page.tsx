"use client";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const [departments, setDepartments] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const importDepartmentsMutation =
    trpc.acadiaImporter.importAllDepartments.useMutation({
      onSuccess: (data) => {
        setDepartments(data);
        setIsImporting(false);
      },
      onError: (error) => {
        console.error("Failed to import departments:", error);
        setIsImporting(false);
      },
    });

  const handleImportDepartments = () => {
    setIsImporting(true);
    importDepartmentsMutation.mutate();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
            <p className="text-muted-foreground">
              Import and view departments from Acadia University
            </p>
          </div>
          <Button onClick={handleImportDepartments} disabled={isImporting}>
            {isImporting ? "Importing..." : "Import Departments"}
          </Button>
        </div>

        {departments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {departments.map((department) => (
              <Card key={department}>
                <CardHeader>
                  <CardTitle className="text-lg">{department}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Department code: {department}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {departments.length === 0 && !isImporting && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No departments loaded. Click "Import Departments" to fetch them
              from Acadia.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
