
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Edit2, Mail, Phone, User } from "lucide-react";

const StudentProfile = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Student Profile</CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <User className="h-16 w-16 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold">Alex Johnson</h3>
              <p className="text-gray-600">Student ID: ST12345678</p>
              <p className="text-gray-600">Computer Science</p>
              
              <div className="w-full mt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <span>alex.johnson@university.edu</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-600" />
                  <span>+1 (555) 123-4567</span>
                </div>
              </div>
              
              <Button className="mt-6 w-full">
                <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Academic Information</CardTitle>
            <CardDescription>Your academic details and program information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="program">Program</Label>
                <Input id="program" value="Bachelor of Science" readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="major">Major</Label>
                <Input id="major" value="Computer Science" readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="enrollmentYear">Enrollment Year</Label>
                <Input id="enrollmentYear" value="2023" readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedGraduation">Expected Graduation</Label>
                <Input id="expectedGraduation" value="2027" readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="advisor">Academic Advisor</Label>
                <Input id="advisor" value="Dr. Emily Chen" readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Academic Status</Label>
                <Input id="status" value="Good Standing" readOnly />
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Academic Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-50">
                  <CardContent className="p-4 text-center">
                    <p className="text-gray-600 text-sm">Current GPA</p>
                    <p className="text-2xl font-bold">3.85</p>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50">
                  <CardContent className="p-4 text-center">
                    <p className="text-gray-600 text-sm">Credits Completed</p>
                    <p className="text-2xl font-bold">45</p>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50">
                  <CardContent className="p-4 text-center">
                    <p className="text-gray-600 text-sm">Credits Remaining</p>
                    <p className="text-2xl font-bold">75</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentProfile;
