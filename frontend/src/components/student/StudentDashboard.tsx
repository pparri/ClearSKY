
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EnrolledCourses from "./EnrolledCourses";
import GradesView from "./GradesView";
import AssignmentsView from "./AssignmentsView";
import StudentProfile from "./StudentProfile";

const StudentDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Student Dashboard</h1>
          <p className="text-gray-600">Manage your courses, assignments, and grades</p>
        </div>

        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses" className="space-y-6">
            <EnrolledCourses />
          </TabsContent>
          
          <TabsContent value="grades" className="space-y-6">
            <GradesView />
          </TabsContent>
          
          <TabsContent value="assignments" className="space-y-6">
            <AssignmentsView />
          </TabsContent>
          
          <TabsContent value="profile" className="space-y-6">
            <StudentProfile />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
