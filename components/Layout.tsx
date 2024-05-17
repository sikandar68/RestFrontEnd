import React, { ReactNode } from "react";
import Sidebar from "./Sidebar";
import NavBar from "./header/NavBar";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen justify-start">
      <NavBar />
  <div className="flex flex-row flex-1">
    <Sidebar />
    <div className="flex-1 overflow-x-auto">{children}</div>
  </div>
</div>
  );
};

export default Layout;
