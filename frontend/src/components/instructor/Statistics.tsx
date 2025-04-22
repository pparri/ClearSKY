
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

// Mock data for charts
const gradeDistribution = [
  { name: "A", students: 8 },
  { name: "B", students: 12 },
  { name: "C", students: 7 },
  { name: "D", students: 3 },
  { name: "F", students: 2 },
];

const assignmentScores = [
  { name: "Assignment 1", average: 85 },
  { name: "Assignment 2", average: 78 },
  { name: "Midterm", average: 72 },
  { name: "Assignment 3", average: 81 },
  { name: "Project", average: 88 },
  { name: "Final", average: 76 },
];

const COLORS = ["#4ade80", "#22c55e", "#facc15", "#f97316", "#ef4444"];

const Statistics = () => {
  const [selectedClass, setSelectedClass] = useState("CS101");
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Class Statistics</h2>
        
        <div className="w-64">
          <Select defaultValue={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CS101">CS101: Intro to Computer Science</SelectItem>
              <SelectItem value="CS201">CS201: Data Structures</SelectItem>
              <SelectItem value="CS301">CS301: Algorithms</SelectItem>
              <SelectItem value="CS401">CS401: Computer Architecture</SelectItem>
              <SelectItem value="CS501">CS501: Artificial Intelligence</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>Student grades for {selectedClass}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, students }) => `${name}: ${students}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="students"
                  >
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value) => [`${value} Students`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Assignment Scores</CardTitle>
            <CardDescription>Average scores by assignment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assignmentScores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}/100`, 'Score']} />
                  <Bar dataKey="average" name="Average Score" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Class Summary</CardTitle>
            <CardDescription>Performance metrics for {selectedClass}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm font-medium text-gray-500">Class Average</div>
                <div className="text-2xl font-bold">81.2%</div>
                <div className="text-xs text-gray-500">B average</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm font-medium text-gray-500">Highest Score</div>
                <div className="text-2xl font-bold">97%</div>
                <div className="text-xs text-gray-500">Student S12350</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm font-medium text-gray-500">Lowest Score</div>
                <div className="text-2xl font-bold">52%</div>
                <div className="text-xs text-gray-500">Student S12364</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm font-medium text-gray-500">Pass Rate</div>
                <div className="text-2xl font-bold">90.6%</div>
                <div className="text-xs text-gray-500">29/32 students</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;
