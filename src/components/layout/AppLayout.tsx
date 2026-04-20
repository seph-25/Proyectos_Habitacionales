import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface Props {
  title: string;
  children: ReactNode;
}

export const AppLayout = ({ title, children }: Props) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar title={title} />
      <main className="ml-60 pt-16">
        <div className="animate-fade-in p-12">{children}</div>
      </main>
    </div>
  );
};
