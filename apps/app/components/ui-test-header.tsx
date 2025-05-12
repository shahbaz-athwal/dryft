"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import { ModeToggle } from "./theme-toggle";

export function UITestHeader() {
  const navItems = [
    { name: "Buttons", path: "/ui-test#buttons" },
    { name: "Cards", path: "/ui-test#cards" },
    { name: "Inputs", path: "/ui-test#inputs" },
    { name: "Alerts", path: "/ui-test#alerts" },
  ];

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">UI Test</span>
          </Link>
        </div>
        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              Back to Home
            </Button>
          </Link>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
