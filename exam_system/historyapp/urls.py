from django.urls import path
from . import views

app_name = 'history'
urlpatterns = [
    #post
    path('insert_history_exam/', views.history_exam_views.insert_history_exam, name='insert_history_exam'),
]