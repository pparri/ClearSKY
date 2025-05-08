from django.shortcuts import render

# course/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Course
from .serializers import CourseSerializer

@api_view(['POST'])
def create_course(request):
    serializer = CourseSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_course(request, course_id):
    try:
        course = Course.objects.get(course_id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

    from .serializers import CourseSerializer
    serializer = CourseSerializer(course)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def list_courses(request):
    from .serializers import CourseSerializer
    from .models import Course

    courses = Course.objects.all()
    serializer = CourseSerializer(courses, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
def update_course(request, course_id):
    from .models import Course
    from .serializers import CourseSerializer

    try:
        course = Course.objects.get(course_id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)

    serializer = CourseSerializer(course, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=200)
    return Response(serializer.errors, status=400)

@api_view(['DELETE'])
def delete_course(request, course_id):
    from .models import Course

    try:
        course = Course.objects.get(course_id=course_id)
        course.delete()
        return Response({'message': 'Course deleted successfully'}, status=204)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)

@api_view(['POST'])
def create_review_request(request, course_id):
    serializer = ReviewRequestSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
def list_review_requests(request, course_id):
    reviews = ReviewRequest.objects.filter(grade__course__course_id=course_id)
    serializer = ReviewRequestSerializer(reviews, many=True)
    return Response(serializer.data, status=200)

@api_view(['PUT'])
def update_review_request(request, course_id, review_id):
    try:
        review = ReviewRequest.objects.get(id=review_id, grade__course__course_id=course_id)
    except ReviewRequest.DoesNotExist:
        return Response({'error': 'ReviewRequest not found'}, status=404)

    serializer = ReviewRequestSerializer(review, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

@api_view(['DELETE'])
def delete_review_request(request, course_id, review_id):
    try:
        review = ReviewRequest.objects.get(id=review_id, grade__course__course_id=course_id)
    except ReviewRequest.DoesNotExist:
        return Response({'error': 'ReviewRequest not found'}, status=404)

    review.delete()
    return Response({'message': 'ReviewRequest deleted'}, status=204)
