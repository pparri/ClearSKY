from django.shortcuts import render

# course/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Course
from .serializers import CourseSerializer
from grades.models import GradeAssignment
from django.db.models import Max


#--------------------------------------------------ENDPOINTS FOR TEACHERS ----------------------------------------------------------------
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
        course = Course.objects.get(id=course_id)
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
        course = Course.objects.get(id=course_id)
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
        course = Course.objects.get(id=course_id)
        course.delete()
        return Response({'message': 'Course deleted successfully'}, status=204)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)
    
@api_view(['GET'])
def course_statistics(request):
    courses = Course.objects.all()
    data = []
    for course in courses:
        # Obtener todos los semestres con notas para este curso
        semesters = GradeAssignment.objects.filter(course=course).values_list('semester', flat=True).distinct()
        for semester in semesters:
            # Última submission inicial para este semestre
            initial_grade = GradeAssignment.objects.filter(
                course=course, semester=semester, submission_type='initial'
            ).order_by('-timestamp').first()
            # Última submission final para este semestre
            final_grade = GradeAssignment.objects.filter(
                course=course, semester=semester, submission_type='final'
            ).order_by('-timestamp').first()

            data.append({
                'id': course.id,
                'name': course.title,
                'period': semester,
                'initialDate': initial_grade.timestamp.isoformat() if initial_grade else None,
                'finalDate': final_grade.timestamp.isoformat() if final_grade else None,
                'initialSemester': initial_grade.semester if initial_grade else None,
                'finalSemester': final_grade.semester if final_grade else None,
            })
    return Response(data)


#------------------------------------STUDENT ENDPOINTS-------------------------------------------------------

# En course/views.py - CORREGIR el método student_courses
@api_view(['GET'])
def student_courses(request):
    if request.user.role != 'student':
        return Response({'error': 'Solo estudiantes pueden acceder'}, status=403)

    from grades.models import GradeAssignment, ReviewRequest

    student_grades = GradeAssignment.objects.filter(
        student=request.user
    ).select_related('course').prefetch_related('review_requests')

    # Agrupar por curso+semestre
    courses_semesters = {}
    for grade in student_grades:
        key = (grade.course.id, grade.semester)
        if key not in courses_semesters:
            courses_semesters[key] = {
                'id': grade.course.id,
                'name': f"{grade.course.code} - {grade.course.title}" if grade.course.code else grade.course.title,
                'period': grade.semester,
                'semesters': [],  # No necesario aquí, pero puedes incluir todos los semestres si quieres
                'initialDate': None,
                'finalDate': None,
                'gradeState': grade.state,
                'canRequestReview': False,
                'hasRequestedReview': False
            }
        # Actualizar fechas
        if grade.submission_type == 'initial':
            if not courses_semesters[key]['initialDate'] or grade.timestamp > courses_semesters[key]['initialDate']:
                courses_semesters[key]['initialDate'] = grade.timestamp
        elif grade.submission_type == 'final':
            if not courses_semesters[key]['finalDate'] or grade.timestamp > courses_semesters[key]['finalDate']:
                courses_semesters[key]['finalDate'] = grade.timestamp

        # Revisar reviews
        has_review_request = ReviewRequest.objects.filter(
            grade_assignment__student=request.user,
            grade_assignment__course_id=grade.course.id,
            grade_assignment__semester=grade.semester
        ).exists()
        courses_semesters[key]['hasRequestedReview'] = has_review_request
        courses_semesters[key]['canRequestReview'] = grade.state == 'OPEN' and not has_review_request

    # Convertir fechas a string
    result = []
    for entry in courses_semesters.values():
        entry['initialDate'] = entry['initialDate'].isoformat() if entry['initialDate'] else None
        entry['finalDate'] = entry['finalDate'].isoformat() if entry['finalDate'] else None
        result.append(entry)

    return Response(result)