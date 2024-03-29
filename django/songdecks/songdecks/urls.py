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
from songdecks.views import attachments as attachments_views
from songdecks.views import ncus as ncus_views
from songdecks.views import units as units_views
from songdecks.views import lists as lists_views
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
    path('update_user/<int:user_id>/', views.update_user),
    path('register/', permission_classes([AllowAny])(views.register)),
    path('submit_feedback/', views.submit_feedback),
    path('request_tester/', views.request_tester),
    path('download_img/', views.download_img),
    path('get_all_users_short/', views.get_all_users_short),

    path('get_keyword_pairs/', views.get_keyword_pairs),
    path('create_keyword_pair/', views.create_keyword_pair),
    path('edit_keyword_pair/<int:keyword_pair_id>/', views.edit_keyword_pair),
    path('delete_keyword_pair/<int:keyword_pair_id>/', views.delete_keyword_pair),

    path('get_keyword_types/', views.get_keyword_types),
    path('create_keyword_type/', views.create_keyword_type),
    path('edit_keyword_type/<int:keyword_id>/', views.edit_keyword_type),
    path('delete_keyword_type/<int:keyword_id>/', views.delete_keyword_type),

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
    path('commanders/<int:faction_id>/', commanders_views.get_commanders),

    path('add_edit_commander/', commanders_views.add_edit_commander),
    path('add_edit_commander/<int:commander_id>/', commanders_views.add_edit_commander),
    path('delete_commander/<int:commander_id>/', commanders_views.delete_commander),

    # ----------------------------------------------------------------------

    path('factions/', factions_views.get_factions),

    path('add_edit_faction/', factions_views.add_edit_faction),
    path('add_edit_faction/<int:faction_id>/', factions_views.add_edit_faction),
    path('delete_faction/<int:faction_id>/', factions_views.delete_faction),

    # ----------------------------------------------------------------------

    path('attachments/', attachments_views.get_attachments),
    path('attachments/<int:faction_id>/', attachments_views.get_attachments),

    path('add_edit_attachment/', attachments_views.add_edit_attachment),
    path('add_edit_attachment/<int:attachment_id>/', attachments_views.add_edit_attachment),
    path('delete_attachment/<int:attachment_id>/', attachments_views.delete_attachment),

    # ----------------------------------------------------------------------

    path('ncus/', ncus_views.get_ncus),
    path('ncus/<int:faction_id>/', ncus_views.get_ncus),

    path('add_edit_ncu/', ncus_views.add_edit_ncu),
    path('add_edit_ncu/<int:ncu_id>/', ncus_views.add_edit_ncu),
    path('delete_ncu/<int:ncu_id>/', ncus_views.delete_ncu),

    # ----------------------------------------------------------------------

    path('units/', units_views.get_units),
    path('units/<int:faction_id>/', units_views.get_units),

    path('add_edit_unit/', units_views.add_edit_unit),
    path('add_edit_unit/<int:unit_id>/', units_views.add_edit_unit),
    path('delete_unit/<int:unit_id>/', units_views.delete_unit),

    # ----------------------------------------------------------------------

    path('lists/', lists_views.get_lists),
    path('lists/<int:user_id>/', lists_views.get_lists),

    path('add_edit_list/', lists_views.add_edit_list),
    path('add_edit_list/<int:list_id>/', lists_views.add_edit_list),
    path('delete_list/<int:list_id>/', lists_views.delete_list),

    path('share_list/<int:list_id>/<str:username>/', lists_views.share_list),
    path('handle_shared_list/<int:list_id>/<str:action>/', lists_views.handle_shared_list),
    
    # ----------------------------------------------------------------------
    
    path('get_all_users/', admin_views.get_all_users),
    path('get_all_testers/', admin_views.get_all_testers),
    path('get_all_moderators/', workbench_views.get_all_moderators),
    path('get_all_admins/', admin_views.get_all_admins),
    path('get_top_users/<int:count>/', admin_views.get_top_users),

    path('toggle_tester/<str:username>/', admin_views.toggle_tester),
    path('toggle_moderator/<str:username>/', admin_views.toggle_moderator),
    path('toggle_admin/<str:username>/', admin_views.toggle_admin),

    path('reset_password/<str:username>/', admin_views.reset_password),
    path('games_played_info/', admin_views.games_played_info),
    path('get_player_daily_stats/<int:accepted_days>/<str:is_cumulative>/', admin_views.get_player_daily_stats),
    path('get_list_daily_stats/<int:accepted_days>/<str:is_cumulative>/', admin_views.get_list_daily_stats),

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
    path('handle_favorite_proposal/<int:proposal_id>/', workbench_views.handle_favorite_proposal),

    path('get_all_tasks/', workbench_views.get_all_tasks),
    path('create_task/', workbench_views.create_task),
    path('get_task/<int:task_id>/', workbench_views.get_task),
    path('update_task/<int:task_id>/', workbench_views.update_task),
    path('delete_task/<int:task_id>/', workbench_views.delete_task),
    path('handle_favorite_task/<int:task_id>/', workbench_views.handle_favorite_task),

    path('create_subtask/', workbench_views.create_subtask),
    path('update_subtask/<int:subtask_id>/', workbench_views.update_subtask),
    path('delete_subtask/<int:subtask_id>/', workbench_views.delete_subtask),

    # ----------------------------------------------------------------------

] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)