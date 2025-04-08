import pandas as pd

def process_grade_xlsx(file_path):
    try:
        # 1. Read file
        df = pd.read_excel(file_path)
        #2. Validate Structure
        required_columns = ['student_id', 'course_id', 'grade_value']
        if not all(col in df.columns for col in required_columns):
            raise ValueError("El archivo no tiene la estructura esperada")
        
        # Transform data (REQ007)
        grades = []
        for _, row in df.iterrows():
            grades.append({
                'student_id': row['student_id'],
                'course_id': row['course_id'],
                'value': row['grade_value'],
                'status': 'OPEN'  # Initial state
            })
        return grades
    except Exception as e:
        raise Exception(f"Error al procesar Excel: {str(e)}")