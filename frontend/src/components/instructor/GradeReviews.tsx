
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

const reviewRequests = [
  {
    id: "REV-001",
    studentName: "Alice Johnson",
    studentId: "S12345",
    course: "CS101",
    assignment: "Final Exam",
    currentGrade: "B+",
    requestedGrade: "A-",
    reason: "I believe question 3 was graded incorrectly. My answer matches the expected solution but was marked as partially wrong.",
    date: "2025-03-28",
  },
  {
    id: "REV-002",
    studentName: "Bob Smith",
    studentId: "S12346",
    course: "CS201",
    assignment: "Project 2",
    currentGrade: "C",
    requestedGrade: "B",
    reason: "My submission included all the required functionality but wasn't graded on the extra credit portion that I implemented.",
    date: "2025-03-29",
  },
  {
    id: "REV-003",
    studentName: "Charlie Brown",
    studentId: "S12347",
    course: "CS201",
    assignment: "Midterm",
    currentGrade: "B-",
    requestedGrade: "B",
    reason: "I believe I should receive partial credit for question 5 as my approach was correct but I had a minor calculation error.",
    date: "2025-03-30",
  },
];

const GradeReviews = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Pending Grade Review Requests</h2>
      
      {reviewRequests.map((request) => (
        <Card key={request.id} className="bg-white border border-gray-200">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <CardTitle className="text-lg">{request.studentName} ({request.studentId})</CardTitle>
                <div className="text-sm text-gray-500">
                  {request.course} - {request.assignment}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Submitted on {request.date}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Current Grade</div>
                <div className="text-lg font-medium">{request.currentGrade}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Requested Grade</div>
                <div className="text-lg font-medium text-blue-600">{request.requestedGrade}</div>
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-500">Reason for Request</div>
              <div className="text-gray-700 mt-1 p-3 bg-gray-50 rounded-md">
                {request.reason}
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <X className="h-4 w-4" /> Deny
              </Button>
              <Button className="flex items-center gap-2">
                <Check className="h-4 w-4" /> Approve
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default GradeReviews;
