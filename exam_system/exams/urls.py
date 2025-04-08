from django.urls import path
from . import views

app_name = 'exams'
urlpatterns = [
    #get
    path('create_exam/', views.create_exam, name='create_exam'),
    path('exam_management/', views.exam_management, name='exam_management'),
    path('get_folders/', views.get_folders, name='get_folders'),
    path('get_exam/', views.get_exam, name='get_exam'),
    path('get_editor/', views.get_editor, name='get_editor'),
    #post
    path('swap_folder/', views.swap_folder, name='swap_folder'),
    path('swap_exam/', views.swap_exam, name='swap_exam'),
    path('insert_folder/', views.insert_folder, name='insert_folder'),
    path('update_folder/', views.update_folder, name='update_folder'),
    path('delete_folder/', views.delete_folder, name='delete_folder'),
    path('delete_exam/', views.delete_exam, name='delete_exam'),
    path('insert_exam/', views.insert_exam, name='insert_exam'),
    path('update_exam/', views.update_exam, name='update_exam'),
]