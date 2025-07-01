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
        # Última submission inicial
        initial_grade = GradeAssignment.objects.filter(
            course=course, submission_type='initial'
        ).order_by('-timestamp').first()
        # Última submission final
        final_grade = GradeAssignment.objects.filter(
            course=course, submission_type='final'
        ).order_by('-timestamp').first()

        data.append({
            'id': course.id,  
            'name': course.title,
            'period': initial_grade.semester if initial_grade else (final_grade.semester if final_grade else None),
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
    """Vista para que estudiantes vean sus cursos (basado en sus notas)"""
    
    if request.user.role != 'student':
        return Response({'error': 'Solo estudiantes pueden acceder'}, status=403)
    
    from grades.models import GradeAssignment, ReviewRequest
    
    # ✅ USAR select_related y prefetch_related para optimizar
    student_grades = GradeAssignment.objects.filter(
        student=request.user
    ).select_related('course').prefetch_related('review_requests')
    
    # Agrupar por curso
    courses_dict = {}
    for grade in student_grades:
        course_id = grade.course.id
        if course_id not in courses_dict:
            courses_dict[course_id] = {
                'id': course_id,
                'title': grade.course.title,
                'code': grade.course.code or '',
                'semesters': set(),
                'initial_date': None,
                'final_date': None,
                'latest_semester': None,
                'latest_state': 'CLOSED',
                'has_reviews': False  # ✅ NUEVO CAMPO
            }
        
        # Actualizar información del curso
        courses_dict[course_id]['semesters'].add(grade.semester)
        
        if not courses_dict[course_id]['latest_semester'] or grade.semester > courses_dict[course_id]['latest_semester']:
            courses_dict[course_id]['latest_semester'] = grade.semester
            courses_dict[course_id]['latest_state'] = grade.state

        if grade.submission_type == 'initial':
            if not courses_dict[course_id]['initial_date'] or grade.timestamp > courses_dict[course_id]['initial_date']:
                courses_dict[course_id]['initial_date'] = grade.timestamp
                
        elif grade.submission_type == 'final':
            if not courses_dict[course_id]['final_date'] or grade.timestamp > courses_dict[course_id]['final_date']:
                courses_dict[course_id]['final_date'] = grade.timestamp
    
    # ✅ VERIFICAR REVIEWS PARA CADA CURSO DE FORMA MÁS EFICIENTE
    courses_data = []
    for course_data in courses_dict.values():
        course_id = course_data['id']
        latest_state = course_data['latest_state']
        
        # Verificar si existe alguna review para este curso del estudiante
        has_review_request = ReviewRequest.objects.filter(
            grade_assignment__student=request.user,
            grade_assignment__course_id=course_id
        ).exists()
        
        courses_data.append({
            'id': course_id,
            'name': f"{course_data['code']} - {course_data['title']}" if course_data['code'] else course_data['title'],
            'period': course_data['latest_semester'],
            'initialDate': course_data['initial_date'].isoformat() if course_data['initial_date'] else None,
            'finalDate': course_data['final_date'].isoformat() if course_data['final_date'] else None,
            'gradeState': latest_state,
            'canRequestReview': latest_state == 'OPEN' and not has_review_request,
            'hasRequestedReview': has_review_request  # ✅ INFORMACIÓN CORRECTA
        })
    
    return Response(courses_data)