from django.contrib import admin
from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from rest_framework_simplejwt import views as jwt_views
from songdecks import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('current_user/', views.current_user),
    path('register/', views.register),
    path('token_obtain/', jwt_views.TokenObtainPairView.as_view()),
    path('token_refresh/', jwt_views.TokenRefreshView.as_view()),

] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
