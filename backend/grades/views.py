from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist, ValidationError as DjangoValidationError
from django.utils import timezone
from .models import GradeAssignment, ReviewRequest, QuestionGrade, Course
from .serializers import GradeAssignmentSerializer, ReviewRequestSerializer, validate_semester_format
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
            # Optimizar la consulta para el estudiante --> optimiza las busquedas en la base de datos para no hacer mas accesos
            grades = GradeAssignment.objects.filter(
                student=user
            ).select_related('course', 'instructor').prefetch_related('question_grades')
            # Puedes añadir un order_by si quieres, ej. por semestre o nombre del curso
            # .order_by('-semester', 'course__title') 
        
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

    def get_object(self, pk, user):
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
    
 
#update state of a grade
class UpdateGradeStateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk, format=None):
        grade = get_object_or_404(GradeAssignment, pk=pk)
        new_state = request.data.get('state')

        # 1. Verificar que el usuario sea un instructor y esté autorizado
        if not request.user.is_authenticated or request.user.role != 'instructor':
            return Response(
                {'error': 'Acceso denegado. Solo los instructores pueden modificar el estado de las notas.'},
                status=status.HTTP_403_FORBIDDEN
            )
    
        # 2. Validar el nuevo estado proporcionado
        valid_states = [choice[0] for choice in GradeAssignment.GradeState.choices]
        if not new_state:
            return Response(
                {'error': 'Debe proporcionar el campo "state" en el cuerpo de la solicitud (ej: {"state": "OPEN"}).'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_state not in valid_states:
            return Response(
                {'error': f"Estado '{new_state}' inválido. Los estados válidos son: {', '.join(valid_states)}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. (Opcional) Lógica de transición de estados
        current_state = grade.state
        if current_state == new_state:
            return Response(
                {'message': f'La nota ya está en estado {grade.get_state_display()}. No se realizaron cambios.'},
                status=status.HTTP_200_OK # O 304 Not Modified, aunque 200 con mensaje es común.
            )

        # 4. Actualizar y guardar el estado
        grade.state = new_state
        grade.save()

        return Response(
            {'status': f'Estado de la nota {grade.id} actualizado a {grade.get_state_display()}.'},
            status=status.HTTP_200_OK
        )



    
#------------------------------------------------------REVIEWS---------------------------------------------------
# Solicitar revisión
class RequestReviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, pk, format=None):
        grade = get_object_or_404(GradeAssignment, pk=pk)
        # 1. Verificar que el solicitante es el estudiante de la nota
        if grade.student != request.user:
            return Response({'error': 'No autorizado'}, status=403)
        # 2. Verificar que la nota está abierta
        if grade.state != GradeAssignment.GradeState.OPEN:
            return Response({'error': 'Nota no está abierta'}, status=400)
        
        # 3. VERIFICAR QUE NO EXISTE YA UNA REVIEW PARA ESTE ESTUDIANTE EN ESTE CURSO
        existing_review = ReviewRequest.objects.filter(
            grade_assignment__student=request.user,
            grade_assignment__course=grade.course
        ).first()
        
        if existing_review:
            return Response({
                'error': 'Ya has enviado una solicitud de revisión para este curso',
                'review_id': existing_review.id,
                'submitted_at': existing_review.submitted_at
            }, status=400)
        
        # 4. Crear la nueva review request
        try:
            review = ReviewRequest.objects.create(
                grade_assignment=grade,
                reason=request.data.get('reason')
            )
            serializer = ReviewRequestSerializer(review)
            return Response(serializer.data, status=201)
        except ValueError as e:
            return Response({'error': str(e)}, status=400)

# Listar solicitudes de revisión para el instructor autenticado
class ReviewRequestListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != 'instructor':
            return Response({'error': 'Acceso denegado. Solo para instructores.'}, status=status.HTTP_403_FORBIDDEN)

        # Filtrar ReviewRequests donde el instructor de la GradeAssignment asociada es el usuario actual.
        # Usar select_related y prefetch_related para optimizar las consultas a la base de datos
        # y evitar el problema N+1 al acceder a los campos anidados.
        reviews = ReviewRequest.objects.filter(
            grade_assignment__instructor=user
        ).select_related( # Para campos ForeignKey directos en ReviewRequest y GradeAssignment
            'grade_assignment__student', 
            'grade_assignment__course',
            'responded_by' # Si 'responded_by' es un ForeignKey a User
        ).order_by('-submitted_at') # Opcional: ordenar por más recientes primero

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
class RespondToReviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, format=None):
        review = get_object_or_404(ReviewRequest, pk=pk)
        grade_assignment = review.grade_assignment

        # 1. Verificar que el usuario sea un instructor
        if request.user.role != 'instructor':
            return Response(
                {'error': 'Acceso denegado. Solo los instructores pueden responder a las revisiones.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # 2. Verificar que la revisión no haya sido respondida ya
        if review.response is not None:
            return Response(
                {'error': 'Esta solicitud de revisión ya ha sido respondida.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Obtener y validar los datos de la respuesta
        response_text = request.data.get('response')
        new_grade_value_str = request.data.get('new_grade')

        if not response_text or not isinstance(response_text, str) or not response_text.strip():
            return Response(
                {'error': 'Se requiere un texto de respuesta válido.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 4. Actualizar la ReviewRequest
        review.response = response_text.strip()
        review.responded_by = request.user
        review.responded_at = timezone.now() # Asegúrate de que timezone esté importado de django.utils
        

        # 5. Actualizar la nota si se proporciona una nueva y es válida
        if new_grade_value_str is not None:
            try:
                new_grade_value = float(new_grade_value_str)
                if not (0 <= new_grade_value <= 10):
                    return Response(
                        {'error': f'El valor de la nueva nota ({new_grade_value_str}) está fuera del rango permitido (0-10).'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                grade_assignment.grade_value = new_grade_value
                # Opcional: Cambiar el estado de la GradeAssignment aquí si es necesario
                grade_assignment.state = GradeAssignment.GradeState.FINAL 
                grade_assignment.save()
            except ValueError:
                return Response(
                    {'error': f'El valor de la nueva nota "{new_grade_value_str}" no es un número válido.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        review.save() # Guardar la review después de procesar la posible nueva nota

        # 6. Serializar y devolver la ReviewRequest actualizada
        serializer = ReviewRequestSerializer(review)
        return Response(serializer.data, status=status.HTTP_200_OK)
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
            validated_semester = validate_semester_format(semester)
        except DjangoValidationError as e: # O serializers.ValidationError
            return Response({'error': e.messages if hasattr(e, 'messages') else str(e)}, status=status.HTTP_400_BAD_REQUEST)

        try:
            df = pd.read_excel(excel_file, header = 2, dtype={'Αριθμός Μητρώου': str}) #empieza a leer el archivo a partir de la tercera fila (dnd estan las columnas)
        except Exception as e:
            return Response({'error': f'Error reading Excel: {str(e)}'}, status=400)

        #----------DEBUG------------
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


        #verificamos que cada usuario y curso existen antes en la base de datos (sino error)
        
        for idx, row in df.iterrows():
            try:
                # Obtener el 'Αριθμός Μητρώου' (ahora en row['student_id'] del DataFrame)
                student_reg_id_from_excel = str(row['student_id']).strip()
                
                # Buscar al usuario por el campo 'registration_id'
                student_obj = User.objects.get(registration_id=student_reg_id_from_excel)

            except User.DoesNotExist:
                return Response({'error': f'Fila {idx+4}: El estudiante con número de matrícula "{student_reg_id_from_excel}" no existe.'}, status=400)
            
            if not (0 <= row['grade_value'] <= 10):
                return Response({'error': f'Fila {idx+4}: grade_value "{row["grade_value"]}" fuera de rango (0-10).'}, status=400)

        
            submission_type = request.data.get('submission_type', 'initial')

             # Establecer el estado según el tipo de calificación
            if submission_type == 'initial':
                grade_state = GradeAssignment.GradeState.OPEN
            elif submission_type == 'final':
                grade_state = GradeAssignment.GradeState.FINAL
            else:
                grade_state = GradeAssignment.GradeState.OPEN  # Por defecto


            grade, created = GradeAssignment.objects.update_or_create(
            student=student_obj,
            course=course,
            semester=semester,
            submission_type = submission_type,
            defaults={
                'grade_value': row['grade_value'],
                'instructor': request.user,
                'submission_type': submission_type,
                'state': grade_state, 


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
            "question_grades_plot_data": question_grades_plot_data,
            "debug_raw_grades": [ga.grade_value for ga in grade_assignments if ga.grade_value is not None]
        }, status=status.HTTP_200_OK)

#----------------------------------------Student Endpoints---------------------------------

# En grades/views.py - CORREGIR student_grades_detail
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def student_grades_detail(request, course_id):
    """Vista detallada de notas de un estudiante para un curso específico"""
    
    if request.user.role != 'student':
        return Response({'error': 'Solo estudiantes pueden acceder'}, status=403)
    
    course = get_object_or_404(Course, pk=course_id)
    
    # ✅ INCLUIR review_requests en la query
    grades = GradeAssignment.objects.filter(
        student=request.user,
        course=course
    ).prefetch_related('question_grades', 'review_requests').order_by('-timestamp')
    
    if not grades.exists():
        return Response({
            'course_name': course.title,
            'message': 'No tienes notas para este curso',
            'grades': []
        })
    
    grades_data = []
    for grade in grades:
        # Obtener notas por pregunta
        question_grades = {}
        for qg in grade.question_grades.all():
            question_grades[qg.question_number] = qg.value
        
        # ✅ INCLUIR review_requests en la respuesta
        review_requests = []
        for review in grade.review_requests.all():
            review_requests.append({
                'id': review.id,
                'reason': review.reason,
                'response': review.response,
                'submitted_at': review.submitted_at.isoformat(),
                'responded_at': review.responded_at.isoformat() if review.responded_at else None,
                'responded_by': review.responded_by.name if review.responded_by else None
            })
        
        grades_data.append({
            'id': grade.id,
            'semester': grade.semester,
            'submission_type': grade.submission_type,
            'grade_value': grade.grade_value,
            'state': grade.state,
            'timestamp': grade.timestamp.isoformat(),
            'question_grades': question_grades,
            'can_request_review': grade.state == 'OPEN',
            'review_requests': review_requests  # ✅ AÑADIR ESTE CAMPO
        })
    
    return Response({
        'course_name': course.title,
        'course_code': course.code,
        'grades': grades_data
    })