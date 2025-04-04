
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, FileText } from "lucide-react";

const courses = [
  {
    id: "CS101",
    name: "Introduction to Computer Science",
    instructor: "Dr. Alan Turing",
    progress: 75,
    nextAssignment: "Algorithm Analysis",
    dueDate: "2025-04-10",
  },
  {
    id: "CS201",
    name: "Data Structures",
    instructor: "Prof. Ada Lovelace",
    progress: 60,
    nextAssignment: "Binary Trees Implementation",
    dueDate: "2025-04-08",
  },
  {
    id: "MATH301",
    name: "Linear Algebra",
    instructor: "Dr. Grace Hopper",
    progress: 90,
    nextAssignment: "Matrix Transformations",
    dueDate: "2025-04-15",
  },
  {
    id: "PHY201",
    name: "Physics II",
    instructor: "Prof. Richard Feynman",
    progress: 85,
    nextAssignment: "Wave Mechanics Lab Report",
    dueDate: "2025-04-12",
  },
];

const EnrolledCourses = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Enrolled Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <CardHeader className="bg-blue-50 border-b">
              <CardTitle>{course.name}</CardTitle>
              <CardDescription>{course.id} • {course.instructor}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Course Progress</span>
                  <span className="font-medium">{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 mb-4 text-sm">
                <FileText className="h-4 w-4 mt-0.5 text-blue-600" />
                <div>
                  <p className="font-medium">Next Assignment:</p>
                  <p>{course.nextAssignment}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 mb-4 text-sm">
                <Calendar className="h-4 w-4 mt-0.5 text-blue-600" />
                <div>
                  <p className="font-medium">Due Date:</p>
                  <p>{new Date(course.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" className="w-full">
                  <BookOpen className="h-4 w-4 mr-2" /> Materials
                </Button>
                <Button size="sm" className="w-full">
                  <FileText className="h-4 w-4 mr-2" /> Assignments
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EnrolledCourses;
