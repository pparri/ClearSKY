
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, FileCheck, FileText, Upload } from "lucide-react";

const assignments = [
  {
    id: 1,
    courseId: "CS101",
    courseName: "Introduction to Computer Science",
    name: "Algorithm Analysis",
    dueDate: "2025-04-10",
    status: "pending",
    description: "Analyze the time and space complexity of the provided algorithms.",
  },
  {
    id: 2,
    courseId: "CS201",
    courseName: "Data Structures",
    name: "Binary Trees Implementation",
    dueDate: "2025-04-08",
    status: "pending",
    description: "Implement a binary search tree with insertion, deletion, and traversal operations.",
  },
  {
    id: 3,
    courseId: "MATH301",
    courseName: "Linear Algebra",
    name: "Matrix Transformations",
    dueDate: "2025-04-15",
    status: "pending",
    description: "Complete exercises on matrix transformations and their geometric interpretations.",
  },
  {
    id: 4,
    courseId: "CS101",
    courseName: "Introduction to Computer Science",
    name: "Sorting Algorithms",
    dueDate: "2025-04-01",
    status: "completed",
    description: "Implement three different sorting algorithms and compare their performance.",
    grade: "95/100"
  },
  {
    id: 5,
    courseId: "PHY201",
    courseName: "Physics II",
    name: "Wave Mechanics Lab Report",
    dueDate: "2025-04-12",
    status: "pending",
    description: "Write up the results from the wave mechanics laboratory experiment.",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'late':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const AssignmentsView = () => {
  // Group assignments by status
  const pendingAssignments = assignments.filter(a => a.status === "pending");
  const completedAssignments = assignments.filter(a => a.status === "completed");

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Assignments</h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Pending Assignments</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingAssignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{assignment.name}</CardTitle>
                  <Badge className={getStatusColor(assignment.status)}>
                    {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">{assignment.courseId}: {assignment.courseName}</div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm mb-4">{assignment.description}</p>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                  </div>
                  {assignment.status === "pending" && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span>{Math.ceil((new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex gap-2 w-full">
                  <Button variant="outline" size="sm" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" /> View Details
                  </Button>
                  <Button size="sm" className="flex-1">
                    <Upload className="h-4 w-4 mr-2" /> Submit Work
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Completed Assignments</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {completedAssignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{assignment.name}</CardTitle>
                  <Badge className={getStatusColor(assignment.status)}>
                    {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">{assignment.courseId}: {assignment.courseName}</div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm mb-4">{assignment.description}</p>
                <div className="flex justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>Submitted: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileCheck className="h-4 w-4 text-green-600" />
                    <span>Grade: {assignment.grade}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  <FileText className="h-4 w-4 mr-2" /> View Feedback
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssignmentsView;
