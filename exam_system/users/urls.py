from django.urls import path
from . import views

app_name = 'users'
urlpatterns = [
    # get
    path('login/', views.views.login_view, name='login'),
    path('logout/', views.views.logout_view, name='logout'),
    path('admin_dashboard/', views.admin_views.admin_dashboard, name='admin_dashboard'),
    path('user_dashboard/', views.user_views.user_dashboard, name='user_dashboard'),
    # post
    path('login_admin/', views.admin_views.login_admin, name='login_admin'),
    path('login_user/', views.user_views.login_user, name='login_user'),
]
