"use client";
import React, { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { usePathname } from "next/navigation";
import useCurrentUser from "@/hooks/useCurrentUser";
import Link from "next/link";

export default function BridCarmComponent() {
  const pathName = usePathname();
  const { user } = useCurrentUser();
  const role = user?.role?.toLowerCase();

  // Split the path into segments and filter out empty strings
  const paths = pathName.split("/").filter(Boolean);

  // If the path is just `dashboard`, show "Dashboard"
  if (paths.length === 1 && paths[0] === "dashboard") {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/dashboard/${role}`}>Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Construct the breadcrumbs
  let currentPath = "";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {paths.map((pathSegment, index) => {
          // If the segment is the user's role, skip it in the breadcrumb
          if (pathSegment === role) {
            return null;
          }

          currentPath += `/${pathSegment}`;
          const isLast = index === paths.length - 1;

          return (
            <Fragment key={pathSegment}>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  {isLast ? (
                    <span>{pathSegment}</span>
                  ) : (
                    <Link
                      className="capitalize"
                      href={
                        pathSegment === "dashboard"
                          ? `/dashboard/${role}`
                          : pathSegment === "solutions"
                          ? "#"
                          : currentPath
                      }
                      onClick={(e) => {
                        if (pathSegment === "solutions") {
                          e.preventDefault();
                        }
                      }}>
                      {pathSegment === "dashboard" ? "Dashboard" : pathSegment}
                    </Link>
                  )}
                </BreadcrumbLink>
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
