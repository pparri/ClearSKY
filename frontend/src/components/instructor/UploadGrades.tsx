
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";

const UploadGrades = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const form = useForm({
    defaultValues: {
      class: "",
      gradeType: "",
    },
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const onSubmit = (data: any) => {
    console.log("Form data:", data);
    if (!file) {
      console.error("No file selected");
      return;
    }
    
    // Simulate upload
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setFile(null);
      form.reset();
      alert("Grades uploaded successfully!");
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Upload Grades</CardTitle>
          <CardDescription>
            Import grades from Excel spreadsheet (.xlsx, .xls or .csv)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Class</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CS101">CS101: Introduction to Computer Science</SelectItem>
                        <SelectItem value="CS201">CS201: Data Structures</SelectItem>
                        <SelectItem value="CS301">CS301: Algorithms</SelectItem>
                        <SelectItem value="CS401">CS401: Computer Architecture</SelectItem>
                        <SelectItem value="CS501">CS501: Artificial Intelligence</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gradeType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="midterm">Midterm</SelectItem>
                        <SelectItem value="final">Final Exam</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="participation">Participation</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <FormLabel htmlFor="file-upload">Upload File</FormLabel>
                <div className="border-2 border-dashed border-gray-200 rounded-md p-6 text-center">
                  {file ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileSpreadsheet className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">
                        Drag and drop your file here, or click to browse
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Excel or CSV format only
                      </p>
                    </>
                  )}
                  <Input 
                    id="file-upload" 
                    type="file" 
                    className="hidden" 
                    accept=".xlsx,.xls,.csv" 
                    onChange={handleFileChange}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    Browse Files
                  </Button>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Important:</p>
                  <p>Make sure your spreadsheet includes student IDs in the first column and grades in the second column.</p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" disabled={!file || uploading}>
                  {uploading ? "Uploading..." : "Upload Grades"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadGrades;
