"use client";

import { UserRole } from "@/types/next-auth";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
} from "./ui/breadcrumb";

function formatBreadcrumbText(text: string) {
  if (/^[0-9a-fA-F-]{10,}$/.test(text)) {
    return `${text.slice(0, 6)}…${text.slice(-4)}`;
  }
  return text
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function BridCarmComponent({
  userRole,
}: {
  userRole: UserRole;
}) {
  const pathName = usePathname();
  const role = userRole.toLocaleLowerCase();

  const paths = pathName.split("/").filter(Boolean);

  if (paths.length === 1 && paths[0] === "dashboard") {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              className="text-foreground hover:text-foreground/50 font-medium"
              asChild>
              <Link href={`/dashboard/${role}`}>Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  let currentPath = "";

  return (
    <Breadcrumb>
      <BreadcrumbList className="flex items-center gap-2 text-sm">
        {paths.map((pathSegment, index) => {
          currentPath += `/${pathSegment}`;
          const isLast = index === paths.length - 1;
          const isDisabled = pathSegment === "solutions";
          const alias = { workspace: "workspace", solutions: "solutions" };

          if (pathSegment === role) {
            return null;
          }

          return (
            <Fragment key={pathSegment}>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  {isLast || isDisabled ? (
                    <span
                      className={`${
                        isLast
                          ? "font-semibold text-foreground/90"
                          : "text-foreground/40 cursor-default"
                      }`}>
                      {pathSegment === "dashboard"
                        ? "Dashboard"
                        : formatBreadcrumbText(pathSegment)}
                    </span>
                  ) : (
                    <Link
                      className="capitalize text-foreground/50 hover:text-foreground/70 transition-colors"
                      href={
                        pathSegment === "dashboard"
                          ? `/dashboard/${role}`
                          : pathSegment === "workspace"
                          ? currentPath.replace("/workspace", "/assigned-tasks")
                          : currentPath
                      }>
                      {pathSegment === "dashboard"
                        ? "Dashboard"
                        : formatBreadcrumbText(pathSegment)}
                    </Link>
                  )}
                </BreadcrumbLink>
              </BreadcrumbItem>

              {!isLast && <ChevronRight className="w-4 h-4 text-gray-400" />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
