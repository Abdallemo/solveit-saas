"use client";

import LoaderSpinner from "./LoaderSpinner";

export default function LoginLoader({
  children,
  isLoading,
}: {
  children: React.ReactNode;
  isLoading: boolean;
}) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <LoaderSpinner/>
      )}
    </div>
  );
}
