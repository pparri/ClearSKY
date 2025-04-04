
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Users, BarChart } from "lucide-react";

const classes = [
  {
    id: "CS101",
    name: "Introduction to Computer Science",
    students: 32,
    averageGrade: "B+",
    pendingReviews: 1,
  },
  {
    id: "CS201",
    name: "Data Structures",
    students: 28,
    averageGrade: "B",
    pendingReviews: 2,
  },
  {
    id: "CS301",
    name: "Algorithms",
    students: 24,
    averageGrade: "B-",
    pendingReviews: 0,
  },
  {
    id: "CS401",
    name: "Computer Architecture",
    students: 22,
    averageGrade: "A-",
    pendingReviews: 0,
  },
  {
    id: "CS501",
    name: "Artificial Intelligence",
    students: 21,
    averageGrade: "B+",
    pendingReviews: 0,
  },
];

const ClassList = () => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Class ID</TableHead>
            <TableHead>Class Name</TableHead>
            <TableHead>Students</TableHead>
            <TableHead>Average Grade</TableHead>
            <TableHead>Pending Reviews</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.map((course) => (
            <TableRow key={course.id}>
              <TableCell className="font-medium">{course.id}</TableCell>
              <TableCell>{course.name}</TableCell>
              <TableCell>{course.students}</TableCell>
              <TableCell>{course.averageGrade}</TableCell>
              <TableCell>
                {course.pendingReviews > 0 ? (
                  <div className="flex items-center">
                    <span className="text-orange-500 font-medium">{course.pendingReviews}</span>
                    <FileText className="h-4 w-4 text-orange-500 ml-1" />
                  </div>
                ) : (
                  <span>0</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    <Users className="h-4 w-4 mr-1" /> Students
                  </Button>
                  <Button variant="outline" size="sm">
                    <BarChart className="h-4 w-4 mr-1" /> Grades
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClassList;
