
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

const gradeData = [
  { name: 'Course A', pass: 85, fail: 15 },
  { name: 'Course B', pass: 75, fail: 25 },
  { name: 'Course C', pass: 90, fail: 10 },
  { name: 'Course D', pass: 65, fail: 35 },
  { name: 'Course E', pass: 80, fail: 20 },
];

const Features = () => {
  return (
    <section id="features" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">ClearSKY Features</h2>
          <p className="text-gray-600">
            Our comprehensive grade management system provides features for institutions, instructors, and students.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">System Overview</h3>
            <p className="text-gray-600 mb-6">
              ClearSKY provides a seamless workflow for managing grades across institutions.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm mt-0.5">1</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Excel Integration</h4>
                  <p className="text-sm text-gray-600">Upload and download grade data using Excel</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm mt-0.5">2</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Grade Review System</h4>
                  <p className="text-sm text-gray-600">Built-in workflow for grade review requests</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm mt-0.5">3</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Statistical Analysis</h4>
                  <p className="text-sm text-gray-600">Comprehensive grade statistics and reporting</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <Card className="border border-gray-200 shadow-md">
              <CardHeader>
                <CardTitle>Grade Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gradeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="pass" name="Pass" fill="#3b82f6" />
                      <Bar dataKey="fail" name="Fail" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border border-gray-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">For Students</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Access grades and submit review requests.</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span>View personal grades</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span>Submit grade review requests</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span>View course statistics</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">For Instructors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Upload grades and manage review requests.</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span>Upload grades via Excel</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span>Post final grades</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span>Respond to review requests</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">For Institutions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Register and manage users.</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span>Register institution profile</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span>Manage users</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span>Purchase credits</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Features;
