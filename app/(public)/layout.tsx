// app/(public)/layout.tsx
import React from "react";
import Navbar from "../../components/navbar"; 
import Footer from "../../components/footer"; 

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20">{children}</div>
      <Footer />
    </>
  );
}