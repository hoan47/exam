from django.urls import path
from . import views

app_name = 'exam'
urlpatterns = [
    #get
    path('exam_management/', views.admin_folder_views.exam_management, name='exam_management'),
    path('create_exam/', views.admin_exam_views.create_exam, name='create_exam'),
    path('get_folders/', views.admin_folder_views.get_folders, name='get_folders'),
    path('get_editor/', views.admin_exam_views.get_editor, name='get_editor'),
    path('get_warehouse/', views.student_folder_views.get_warehouse, name='get_warehouse'),
    path('practice_mode/', views.student_exam_views.practice_mode, name='practice_mode'),
    path('test_mode/', views.student_exam_views.test_mode, name='test_mode'),
    #post
    path('swap_folder/', views.admin_folder_views.swap_folder, name='swap_folder'),
    path('swap_exam/', views.admin_exam_views.swap_exam, name='swap_exam'),
    path('insert_folder/', views.admin_folder_views.insert_folder, name='insert_folder'),
    path('update_folder/', views.admin_folder_views.update_folder, name='update_folder'),
    path('delete_folder/', views.admin_folder_views.delete_folder, name='delete_folder'),
    path('delete_exam/', views.admin_exam_views.delete_exam, name='delete_exam'),
    path('insert_exam/', views.admin_exam_views.insert_exam, name='insert_exam'),
    path('update_exam/', views.admin_exam_views.update_exam, name='update_exam'),
    path('warehouse/', views.student_folder_views.warehouse, name='warehouse'),
    path('exam_detail/', views.student_exam_views.exam_detail, name='exam_detail'),
    path('history/', views.student_history_views.history, name='history'),
]