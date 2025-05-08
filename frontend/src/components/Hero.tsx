
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <div className="py-16 md:py-24 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Welcome to <span className="text-blue-600">ClearSKY</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl">
            A comprehensive grade management system for institutions, instructors, and students
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h3 className="font-semibold text-lg mb-3">For Students</h3>
              <p className="text-gray-600 text-sm">View grades and submit review requests</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h3 className="font-semibold text-lg mb-3">For Instructors</h3>
              <p className="text-gray-600 text-sm">Post grades and manage reviews</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h3 className="font-semibold text-lg mb-3">For Institutions</h3>
              <p className="text-gray-600 text-sm">Register and manage users</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
