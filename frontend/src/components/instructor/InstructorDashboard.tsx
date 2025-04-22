
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ClassList from "@/components/instructor/ClassList";
import GradeReviews from "@/components/instructor/GradeReviews";
import UploadGrades from "@/components/instructor/UploadGrades";
import Statistics from "@/components/instructor/Statistics";
import { Download, Upload, Users, FileText } from "lucide-react";

const InstructorDashboard = () => {
  return (
    <div className="py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your classes, grades, and review requests</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-2xl font-bold">5</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-2xl font-bold">127</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Review Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-orange-500 mr-2" />
                <span className="text-2xl font-bold">3</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Grading Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Spring 2025</div>
              <div className="text-xs text-gray-500">Current Term</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-8">
          <Button className="flex items-center gap-2">
            <Upload className="h-4 w-4" /> Upload Grades
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Export Data
          </Button>
        </div>
        
        <Tabs defaultValue="classes">
          <TabsList className="mb-4">
            <TabsTrigger value="classes">My Classes</TabsTrigger>
            <TabsTrigger value="upload">Upload Grades</TabsTrigger>
            <TabsTrigger value="reviews">Grade Reviews</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="classes">
            <ClassList />
          </TabsContent>
          
          <TabsContent value="upload">
            <UploadGrades />
          </TabsContent>
          
          <TabsContent value="reviews">
            <GradeReviews />
          </TabsContent>
          
          <TabsContent value="statistics">
            <Statistics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InstructorDashboard;
