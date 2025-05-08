
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const grades = [
  {
    courseId: "CS101",
    courseName: "Introduction to Computer Science",
    assignments: [
      { name: "Assignment 1", score: 92, totalPoints: 100 },
      { name: "Assignment 2", score: 88, totalPoints: 100 },
      { name: "Midterm", score: 78, totalPoints: 100 },
      { name: "Assignment 3", score: 95, totalPoints: 100 },
    ],
    currentGrade: "A-",
  },
  {
    courseId: "CS201",
    courseName: "Data Structures",
    assignments: [
      { name: "Assignment 1", score: 85, totalPoints: 100 },
      { name: "Assignment 2", score: 90, totalPoints: 100 },
      { name: "Midterm", score: 82, totalPoints: 100 },
    ],
    currentGrade: "B+",
  },
  {
    courseId: "MATH301",
    courseName: "Linear Algebra",
    assignments: [
      { name: "Assignment 1", score: 88, totalPoints: 100 },
      { name: "Assignment 2", score: 95, totalPoints: 100 },
      { name: "Midterm", score: 91, totalPoints: 100 },
      { name: "Assignment 3", score: 93, totalPoints: 100 },
    ],
    currentGrade: "A",
  },
  {
    courseId: "PHY201",
    courseName: "Physics II",
    assignments: [
      { name: "Lab Report 1", score: 90, totalPoints: 100 },
      { name: "Lab Report 2", score: 88, totalPoints: 100 },
      { name: "Midterm", score: 84, totalPoints: 100 },
      { name: "Assignment 1", score: 91, totalPoints: 100 },
    ],
    currentGrade: "A-",
  },
];

const GradesView = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Grades</h2>
      
      {grades.map((course) => (
        <div key={course.courseId} className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">{course.courseId}: {course.courseName}</h3>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Current Grade:</span>
              <span className="font-bold text-lg">{course.currentGrade}</span>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assignment</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Total Points</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {course.assignments.map((assignment, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{assignment.name}</TableCell>
                    <TableCell className="text-right">{assignment.score}</TableCell>
                    <TableCell className="text-right">{assignment.totalPoints}</TableCell>
                    <TableCell className="text-right">
                      {Math.round((assignment.score / assignment.totalPoints) * 100)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GradesView;
