from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from .models import GradeAssignment, ReviewRequest, QuestionGrade, Course
from .serializers import GradeAssignmentSerializer, ReviewRequestSerializer
import pandas as pd
from django.contrib.auth import get_user_model
from collections import Counter



User = get_user_model()

#------------------------------------------------------GRADES---------------------------------------------------
# Listar o crear calificaciones
class GradeAssignmentListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'instructor':  # asumimos instructor
            grades = GradeAssignment.objects.filter(instructor=user)
        else:
            grades = GradeAssignment.objects.filter(student=user)
        serializer = GradeAssignmentSerializer(grades, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        if request.user.role != 'instructor': #controla que solo los instructores puedan crear calificaciones
            return Response({'error': 'Solo los instructores pueden crear calificaciones.'}, status=403)
        serializer = GradeAssignmentSerializer(data=request.data)
        if serializer.is_valid():   #hace las validaciones definidas en el serializer --> controla que los datos sean correctos
            serializer.save(instructor=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

# Ver, actualizar o borrar una calificación
class GradeAssignmentDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated] #para pder acceder a la vista, el usuario debe estar autenticado

    def get_object(self, pk):
        return get_object_or_404(GradeAssignment, pk=pk)

    def get(self, request, pk): # coge una instance de la calificación si existe, sino devuelve un error 404
        grade = self.get_object(pk)
        serializer = GradeAssignmentSerializer(grade)
        return Response(serializer.data)

    def put(self, request, pk): # actualiza la calificación
        grade = self.get_object(pk) #primero lee la calificación existente mediante la clave primaria
        serializer = GradeAssignmentSerializer(grade, data=request.data) #luego la actualiza con los datos que vienen en el request
        if serializer.is_valid(): #si los datos son correctos se guardan
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        grade = self.get_object(pk)
        grade.delete()
        return Response(status=204)

# Finalizar nota
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def finalize_grade(request, pk):
    grade = get_object_or_404(GradeAssignment, pk=pk)
    if grade.instructor != request.user:
        return Response({'error': 'No autorizado'}, status=403)
    if grade.state != GradeAssignment.GradeState.OPEN:
        return Response({'error': 'No se puede finalizar'}, status=400)
    grade.state = GradeAssignment.GradeState.FINAL
    grade.save()
    return Response({'status': 'Nota finalizada'})
#------------------------------------------------------REVIEWS---------------------------------------------------
# Solicitar revisión
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def request_review(request, pk):
    grade = get_object_or_404(GradeAssignment, pk=pk)
    if grade.student != request.user:
        return Response({'error': 'No autorizado'}, status=403)
    if grade.state != GradeAssignment.GradeState.OPEN:
        return Response({'error': 'Nota no está abierta'}, status=400)
    review = ReviewRequest.objects.create(
        grade_assignment=grade,
        reason=request.data.get('reason')
    )
    serializer = ReviewRequestSerializer(review)
    return Response(serializer.data, status=201)

# Listar solicitudes de revisión
class ReviewRequestListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        reviews = ReviewRequest.objects.filter(grade_assignment__instructor=request.user)
        serializer = ReviewRequestSerializer(reviews, many=True)
        return Response(serializer.data)

# Ver detalle
class ReviewRequestDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        review = get_object_or_404(ReviewRequest, pk=pk)
        serializer = ReviewRequestSerializer(review)
        return Response(serializer.data)

# Responder solicitud
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def respond_to_review(request, pk):
    review = get_object_or_404(ReviewRequest, pk=pk)
    grade = review.grade_assignment
    if grade.instructor != request.user:
        return Response({'error': 'No autorizado'}, status=403)

    review.response = request.data.get('response')
    review.responded_by = request.user
    review.responded_at = timezone.now()
    review.save()

    if 'new_grade' in request.data:
        grade.grade_value = request.data['new_grade']
        grade.save()

    return Response({'status': 'Revisión respondida'})

#----------------------------------------------------------------------------------------------------------------------

#EXCEL UPLOAD

class GradeExcelUploadView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        excel_file = request.FILES.get('file')
        course_name = request.data.get('course_name') 
        semester = request.data.get('semester')
        #num_grades = int(request.data.get('num_grades', 0))
        excel_filename = excel_file.name.lower()

        if not excel_file:
            return Response({'error': 'No file uploaded.'}, status=400)
        if not course_name or not semester:
            return Response({'error': 'Course name and semester needed.'}, status=400)
        try:
            course = Course.objects.get(title=course_name)  #buscamos el curso por su nombre
        except Course.DoesNotExist:
            return Response({'error': 'El curso no existe.'}, status=400)

        try:
            df = pd.read_excel(excel_file, header = 2, dtype={'Αριθμός Μητρώου': str}) #empieza a leer el archivo a partir de la tercera fila (dnd estan las columnas)
        except Exception as e:
            return Response({'error': f'Error reading Excel: {str(e)}'}, status=400)


        # Renombrar columnas griegas a nombres esperados
        print("Columnas originales:", df.columns.tolist()) #debug para imprimir las columnas originales

        df = df.rename(columns={
            'Αριθμός Μητρώου': 'student_id',
            'Βαθμολογία': 'grade_value',
        })

        print("Columnas tras renombrar:", df.columns.tolist())
        # Validar columnas requeridas
        required_columns = {'student_id', 'grade_value'}
        if not required_columns.issubset(df.columns):
            return Response({'error': f'El Excel debe tener las columnas: {required_columns}'}, status=400)

        question_columns = [col for col in df.columns if col.startswith('Q') and len(col) == 3]  # Q01, Q02, ...

        for idx, row in df.iterrows():
            #verificamos que cada usuario y curso existen antes en la base de datos (sino error)
            try:
                # Obtener el 'Αριθμός Μητρώου' (ahora en row['student_id'] del DataFrame)
                student_reg_id_from_excel = str(row['student_id']).strip()
                # Si el ID tiene 7 dígitos, agregar un 0 al inicio
                #if len(student_reg_id_from_excel) == 7 and student_reg_id_from_excel.isdigit():
                    #student_reg_id_from_excel = "0" + student_reg_id_from_excel
                
                # Buscar al usuario por el campo 'registration_id'
                student_obj = User.objects.get(registration_id=student_reg_id_from_excel)

            except User.DoesNotExist:
                return Response({'error': f'Fila {idx+4}: El estudiante con número de matrícula "{student_reg_id_from_excel}" no existe.'}, status=400)
            
            if not (0 <= row['grade_value'] <= 10):
                return Response({'error': f'Fila {idx+4}: grade_value "{row["grade_value"]}" fuera de rango (0-10).'}, status=400)

            grade, created = GradeAssignment.objects.update_or_create(
            student=student_obj,
            course=course,
            semester=semester,
            defaults={
                'grade_value': row['grade_value'],
                'instructor': request.user,
                }
            )
            if "basic" not in excel_filename:
                for q_col in question_columns:
                    # Asegurarse de que la columna de pregunta existe en la fila actual del DataFrame
                    if q_col in row and not pd.isnull(row[q_col]):
                        try:
                            question_grade_value = float(row[q_col]) # Intentar convertir a float
                            if not (0 <= question_grade_value <= 10): #preguntas tienen que estar entre 0 y 10
                                return Response({'error': f'Fila {idx+4}, {q_col}: valor "{row[q_col]}" fuera de rango (0-10).'}, status=400)
                            
                            QuestionGrade.objects.update_or_create(
                                grade_assignment=grade,
                                question_number=q_col,
                                value=question_grade_value # Usar el valor convertido
                            )
                        except ValueError:
                            return Response({'error': f'Fila {idx+4}, {q_col}: valor "{row[q_col]}" no es un número válido.'}, status=400)

        return Response({'status': 'Excel procesado correctamente', 'rows': len(df)}, status=200)


#GENERATE PLOTS

class CourseGradeStatisticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_pk, semester_name):
        # Verificar si el usuario es un instructor
        if request.user.role != 'instructor':
            return Response({'error': 'Acceso denegado. Solo para instructores.'}, status=status.HTTP_403_FORBIDDEN)

        # Obtener el curso
        course = get_object_or_404(Course, pk=course_pk)

        # Verificar si el instructor está asociado a este curso
        if not course.instructors.filter(pk=request.user.pk).exists():
            return Response({'error': 'No está autorizado para ver las estadísticas de este curso.'}, status=status.HTTP_403_FORBIDDEN)

        # Obtener todas las asignaciones de calificaciones para este curso y semestre
        # Prefetch question_grades para optimizar
        grade_assignments = GradeAssignment.objects.filter(
            course=course,
            semester=semester_name
        ).prefetch_related('question_grades')

        if not grade_assignments.exists():
            return Response({
                "course_title": course.title,
                "semester": semester_name,
                "message": "No se encontraron calificaciones para este curso y semestre.",
                "general_grades_plot_data": {"labels": [], "values": []},
                "question_grades_plot_data": {}
            }, status=status.HTTP_200_OK)

        # 1. Preparar datos para el plot de notas generales
        general_grades_values = [ga.grade_value for ga in grade_assignments if ga.grade_value is not None]
        if general_grades_values:
            # Contar frecuencia de cada nota (redondeada al entero más cercano para simplicidad del histograma)
            general_grades_counts = Counter(int(round(g)) for g in general_grades_values)
            # Asegurar que todas las posibles notas de 0 a 10 estén presentes en labels si se desea un eje completo
            # Esto es opcional y depende de cómo el frontend maneje los datos
            # labels_general = sorted(general_grades_counts.keys())
            # values_general = [general_grades_counts[k] for k in labels_general]
            labels_general = list(range(11)) # 0 a 10
            values_general = [general_grades_counts.get(i, 0) for i in labels_general]

            general_plot_data = {
                "labels": labels_general,
                "values": values_general,
                "raw_data": general_grades_values # Opcional: enviar datos crudos también
            }
        else:
            general_plot_data = {"labels": [], "values": [], "raw_data": []}


        # 2. Preparar datos para los plots de notas por pregunta
        question_grades_plot_data = {}
        
        # Obtener todos los números de pregunta únicos para estos assignments
        # Esto evita iterar innecesariamente si algunas preguntas no tienen notas
        distinct_question_numbers = sorted(list(
            QuestionGrade.objects.filter(grade_assignment__in=grade_assignments)
            .values_list('question_number', flat=True)
            .distinct()
        ))

        for q_num in distinct_question_numbers:
            q_grades_values = []
            for ga in grade_assignments:
                for qg in ga.question_grades.all(): # .all() aquí usa los datos prefetched
                    if qg.question_number == q_num and qg.value is not None:
                        q_grades_values.append(qg.value)
            
            if q_grades_values:
                q_grades_counts = Counter(int(round(g)) for g in q_grades_values)
                # labels_q = sorted(q_grades_counts.keys())
                # values_q = [q_grades_counts[k] for k in labels_q]
                labels_q = list(range(11)) # 0 a 10
                values_q = [q_grades_counts.get(i, 0) for i in labels_q]

                question_grades_plot_data[q_num] = {
                    "labels": labels_q,
                    "values": values_q,
                    "raw_data": q_grades_values # Opcional
                }
            else:
                # Si una pregunta (ej. Q05) no tiene notas en ningún assignment,
                # puedes omitirla o enviarla con datos vacíos.
                question_grades_plot_data[q_num] = {"labels": [], "values": [], "raw_data": []}


        return Response({
            "course_title": course.title,
            "semester": semester_name,
            "student_count": grade_assignments.values('student').distinct().count(),
            "general_grades_plot_data": general_plot_data,
            "question_grades_plot_data": question_grades_plot_data
        }, status=status.HTTP_200_OK)


