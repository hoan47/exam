from django.urls import path
from . import views

app_name = 'exams'
urlpatterns = [
    #get
    path('exam_management/', views.folder_views.exam_management, name='exam_management'),
    path('create_exam/', views.exam_views.create_exam, name='create_exam'),
    path('get_folders/', views.folder_views.get_folders, name='get_folders'),
    path('get_exam/', views.exam_views.get_exam, name='get_exam'),
    path('get_editor/', views.exam_views.get_editor, name='get_editor'),
    #post
    path('swap_folder/', views.folder_views.swap_folder, name='swap_folder'),
    path('swap_exam/', views.exam_views.swap_exam, name='swap_exam'),
    path('insert_folder/', views.folder_views.insert_folder, name='insert_folder'),
    path('update_folder/', views.folder_views.update_folder, name='update_folder'),
    path('delete_folder/', views.folder_views.delete_folder, name='delete_folder'),
    path('delete_exam/', views.exam_views.delete_exam, name='delete_exam'),
    path('insert_exam/', views.exam_views.insert_exam, name='insert_exam'),
    path('update_exam/', views.exam_views.update_exam, name='update_exam'),
]