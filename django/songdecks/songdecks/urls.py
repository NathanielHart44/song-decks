from django.contrib import admin
from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from rest_framework_simplejwt import views as jwt_views
from songdecks.views import main as views
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny

urlpatterns = [

    path('admin/', admin.site.urls),
    path('current_user/', views.current_user),
    path('register/', permission_classes([AllowAny])(views.register)),


    # ----------------------------------------------------------------------

    path('token_obtain/', jwt_views.TokenObtainPairView.as_view()),
    path('token_refresh/', jwt_views.TokenRefreshView.as_view()),

    # ----------------------------------------------------------------------

    path('factions/', views.get_factions),
    path('commanders/', views.get_commanders),
    path('get_cards_of_faction/<int:faction_id>/', views.get_cards_of_faction),
    path('get_cards_of_commander/<int:commander_id>/', views.get_cards_of_commander),

    # ----------------------------------------------------------------------

    path('handle_card_action/<str:action>/', views.handle_card_action),
    path('get_game_cards/<int:game_id>/', views.get_game_cards),

    # ----------------------------------------------------------------------

    path('start_game/<int:faction_id>/<int:commander_id>/', views.start_game),
    path('end_round/<int:game_id>/', views.end_round),
    path('end_game/<int:game_id>/', views.end_game),

    # ----------------------------------------------------------------------

    path('get_recent_games/', views.get_recent_games),
    path('get_player_stats/', views.get_player_stats),

    # ----------------------------------------------------------------------

    # path('add_faction/', views.add_faction),
    # path('add_commander/', views.add_commander),
    path('add_edit_card/', views.add_edit_card),
    path('add_edit_card/<int:card_id>/', views.add_edit_card),

] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
