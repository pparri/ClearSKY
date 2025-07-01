from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist, ValidationError as DjangoValidationError
from django.utils import timezone
from .models import GradeAssignment, ReviewRequest, QuestionGrade
from .serializers import GradeAssignmentSerializer, ReviewRequestSerializer, validate_semester_format
from .utils import get_course
import pandas as pd
from django.contrib.auth import get_user_model
from collections import Counter

User = get_user_model()

class GradeAssignmentListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        params = {}
        if user.role == 'instructor':
            params['instructor_id'] = user.id
        else:
            params['student_id'] = user.id
        
        grades = GradeAssignment.objects.filter(**params)
        serializer = GradeAssignmentSerializer(grades, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        if request.user.role != 'instructor':
            return Response({'error': 'Solo los instructores pueden crear calificaciones.'}, status=403)
        
        # Get course data
        course_id = request.data.get('course')
        course_data = get_course(course_id)
        if not course_data:
            return Response({'error': 'Course not found'}, status=400)
        
        # Add course details to request data
        modified_data = request.data.copy()
        modified_data['course_title'] = course_data.get('title')
        modified_data['course_code'] = course_data.get('code')
        
        serializer = GradeAssignmentSerializer(data=modified_data)
        if serializer.is_valid():
            serializer.save(instructor=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

# ... (other GradeAssignment views remain mostly the same) ...

class GradeExcelUploadView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        excel_file = request.FILES.get('file')
        course_name = request.data.get('course_name') 
        semester = request.data.get('semester')
        
        if not excel_file:
            return Response({'error': 'No file uploaded.'}, status=400)
        if not course_name or not semester:
            return Response({'error': 'Course name and semester needed.'}, status=400)
        
        # Get course from course_service
        course_data = get_course_by_title(course_name)
        if not course_data:
            return Response({'error': 'El curso no existe.'}, status=400)
        
        course_id = course_data['id']
        
        try:
            validated_semester = validate_semester_format(semester)
        except DjangoValidationError as e:
            return Response({'error': e.messages if hasattr(e, 'messages') else str(e)}, status=status.HTTP_400_BAD_REQUEST)

        try:
            df = pd.read_excel(excel_file, header=2, dtype={'Αριθμός Μητρώου': str})
        except Exception as e:
            return Response({'error': f'Error reading Excel: {str(e)}'}, status=400)

        # ... (rest of Excel processing remains similar) ...
        
        for idx, row in df.iterrows():
            try:
                student_reg_id = str(row['student_id']).strip()
                student_obj = User.objects.get(registration_id=student_reg_id)
            except User.DoesNotExist:
                return Response({'error': f'Fila {idx+4}: El estudiante con número de matrícula "{student_reg_id}" no existe.'}, status=400)
            
            if not (0 <= row['grade_value'] <= 10):
                return Response({'error': f'Fila {idx+4}: grade_value "{row["grade_value"]}" fuera de rango (0-10).'}, status=400)

            submission_type = request.data.get('submission_type', 'initial')

            grade, created = GradeAssignment.objects.update_or_create(
                student=student_obj,
                course_id=course_id,
                semester=semester,
                submission_type=submission_type,
                defaults={
                    'grade_value': row['grade_value'],
                    'instructor': request.user,
                    'submission_type': submission_type,
                    'course_title': course_data.get('title'),
                    'course_code': course_data.get('code'),
                }
            )
            
            # ... (question grades processing) ...

        return Response({'status': 'Excel procesado correctamente', 'rows': len(df)}, status=200)

class CourseGradeStatisticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_pk, semester_name):
        if request.user.role != 'instructor':
            return Response({'error': 'Acceso denegado. Solo para instructores.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get course data
        course_data = get_course(course_pk)
        if not course_data:
            return Response({'error': 'Course not found'}, status=404)
        
        # Check instructor authorization
        instructor_ids = course_data.get('instructor_ids', [])
        if request.user.id not in instructor_ids:
            return Response({'error': 'No está autorizado para ver las estadísticas de este curso.'}, status=status.HTTP_403_FORBIDDEN)

        # ... (rest of statistics logic remains similar) ...
        return Response({
            "course_title": course_data.get('title'),
            "semester": semester_name,
            # ... (other response data) ...
        }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def student_grades_detail(request, course_id):
    if request.user.role != 'student':
        return Response({'error': 'Solo estudiantes pueden acceder'}, status=403)
    
    # Get course data
    course_data = get_course(course_id)
    if not course_data:
        return Response({'error': 'Course not found'}, status=404)
    
    # ... (rest of the view remains similar) ...
    return Response({
        'course_name': course_data.get('title'),
        'course_code': course_data.get('code'),
        'grades': grades_data
    })