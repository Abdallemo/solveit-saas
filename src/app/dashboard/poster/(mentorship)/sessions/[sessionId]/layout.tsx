import { ReactNode } from "react";

export default function SessionLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <>
      {modal}
      {children}
      
    </>
  );
}
