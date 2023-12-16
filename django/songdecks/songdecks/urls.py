from django.contrib import admin
from django.urls import include, path
from django.conf.urls.static import static
from django.conf import settings
from rest_framework_simplejwt import views as jwt_views
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny

from songdecks.views import main as views
from songdecks.views import admin as admin_views
from songdecks.views import cards as cards_views
from songdecks.views import commanders as commanders_views
from songdecks.views import factions as factions_views
from songdecks.views import workbench as workbench_views

# ----------------------------------------------------------------------

urlpatterns = [

    path('admin/', admin.site.urls),
    path('', include('django_prometheus.urls')),
    # path('token_obtain/', jwt_views.TokenObtainPairView.as_view()),
    path('token_obtain/', views.get_jwt_token),
    path('token_refresh/', jwt_views.TokenRefreshView.as_view()),
    path('google_auth/', views.google_auth),

    path('current_user/', views.current_user),
    path('register/', permission_classes([AllowAny])(views.register)),
    path('submit_feedback/', views.submit_feedback),
    path('download_img/', views.download_img),

    # ----------------------------------------------------------------------

    path('start_game/<int:faction_id>/<int:commander_id>/', views.start_game),
    path('end_round/<int:game_id>/', views.end_round),
    path('end_game/<int:game_id>/', views.end_game),

    path('get_recent_games/', views.get_recent_games),
    path('get_player_stats/', views.get_player_stats),

    # ----------------------------------------------------------------------

    path('get_cards_of_faction/<int:faction_id>/', cards_views.get_cards_of_faction),
    path('get_cards_of_commander/<int:commander_id>/', cards_views.get_cards_of_commander),

    path('handle_card_action/<str:action>/', cards_views.handle_card_action),
    path('get_game_cards/<int:game_id>/', cards_views.get_game_cards),

    path('add_edit_card/', cards_views.add_edit_card),
    path('add_edit_card/<int:card_id>/', cards_views.add_edit_card),
    path('delete_card/<int:card_id>/', cards_views.delete_card),

    # ----------------------------------------------------------------------

    path('commanders/', commanders_views.get_commanders),

    path('add_edit_commander/', commanders_views.add_edit_commander),
    path('add_edit_commander/<int:commander_id>/', commanders_views.add_edit_commander),
    path('delete_commander/<int:commander_id>/', commanders_views.delete_commander),

    # ----------------------------------------------------------------------

    path('factions/', factions_views.get_factions),

    path('add_edit_faction/', factions_views.add_edit_faction),
    path('add_edit_faction/<int:faction_id>/', factions_views.add_edit_faction),
    path('delete_faction/<int:faction_id>/', factions_views.delete_faction),

    # ----------------------------------------------------------------------

    path('get_all_users/', admin_views.get_all_users),
    path('toggle_moderator/<str:username>/', admin_views.toggle_moderator),
    path('reset_password/<str:username>/', admin_views.reset_password),
    path('games_played_info/', admin_views.games_played_info),
    path('get_player_daily_stats/<int:accepted_days>/<str:is_cumulative>/', admin_views.get_player_daily_stats),

    # ----------------------------------------------------------------------

    path('get_all_tags/', workbench_views.get_all_tags),
    path('create_tag/', workbench_views.create_tag),
    path('update_tag/<int:tag_id>/', workbench_views.update_tag),
    path('delete_tag/<int:tag_id>/', workbench_views.delete_tag),

    path('get_all_proposals/', workbench_views.get_all_proposals),
    path('create_proposal/', workbench_views.create_proposal),
    path('get_proposal/<int:proposal_id>/', workbench_views.get_proposal),
    path('update_proposal/<int:proposal_id>/', workbench_views.update_proposal),
    path('delete_proposal/<int:proposal_id>/', workbench_views.delete_proposal),

    path('get_all_tasks/', workbench_views.get_all_tasks),
    path('create_task/', workbench_views.create_task),
    path('get_task/<int:task_id>/', workbench_views.get_task),
    path('update_task/<int:task_id>/', workbench_views.update_task),
    path('delete_task/<int:task_id>/', workbench_views.delete_task),

    # ----------------------------------------------------------------------

] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)