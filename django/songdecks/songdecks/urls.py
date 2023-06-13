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
    path('submit_feedback/', views.submit_feedback),

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

    path('add_edit_card/', views.add_edit_card),
    path('add_edit_card/<int:card_id>/', views.add_edit_card),
    path('delete_card/<int:card_id>/', views.delete_card),

    # ----------------------------------------------------------------------

    path('add_edit_commander/', views.add_edit_commander),
    path('add_edit_commander/<int:commander_id>/', views.add_edit_commander),
    path('delete_commander/<int:commander_id>/', views.delete_commander),

    # ----------------------------------------------------------------------

    path('add_edit_faction/', views.add_edit_faction),
    path('add_edit_faction/<int:faction_id>/', views.add_edit_faction),
    path('delete_faction/<int:faction_id>/', views.delete_faction),

    # ----------------------------------------------------------------------

    path('get_all_users/', views.get_all_users),
    path('toggle_moderator/<str:username>/', views.toggle_moderator),
    path('reset_password/<str:username>/', views.reset_password),
    path('games_played_info/', views.games_played_info),

    # ----------------------------------------------------------------------

] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
