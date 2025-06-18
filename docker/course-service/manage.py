#!/usr/bin/env python
import os
import sys

def main():
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'course_project.settings')
try:
from django.core.management import execute_from_command_line
except ImportError as exc:
raise ImportError("Django not installed.") from exc
execute_from_command_line(sys.argv)

if name == 'main':
main()
