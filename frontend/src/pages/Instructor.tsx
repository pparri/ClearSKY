
import React from "react";
import Navbar from "@/components/Navbar";
import InstructorDashboard from "@/components/instructor/InstructorDashboard";
import Footer from "@/components/Footer";

const Instructor = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <InstructorDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default Instructor;
