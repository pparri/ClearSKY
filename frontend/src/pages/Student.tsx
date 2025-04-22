
import React from "react";
import Navbar from "@/components/Navbar";
import StudentDashboard from "@/components/student/StudentDashboard";
import Footer from "@/components/Footer";

const Student = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <StudentDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default Student;
