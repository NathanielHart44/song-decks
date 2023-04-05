from django.contrib import admin
from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from rest_framework_simplejwt import views as jwt_views
from songdecks.views import main as views

urlpatterns = [

    path('admin/', admin.site.urls),
    path('current_user/', views.current_user),
    path('register/', views.register),
    path('token_obtain/', jwt_views.TokenObtainPairView.as_view()),
    path('token_refresh/', jwt_views.TokenRefreshView.as_view()),

    # ----------------------------------------------------------------------

    path('factions/', views.get_factions),
    path('commanders/', views.get_commanders),
    path('get_commanders_of_faction/<int:faction_id>/', views.get_commanders_of_faction),

    # ----------------------------------------------------------------------

    path('draw_card/<int:game_id>/', views.draw_card),
    path('place_card_in_deck/<int:game_id>/<int:card_id>/', views.place_card_in_deck),
    path('discard_card/<int:game_id>/<int:card_id>/', views.discard_card),
    path('play_card/<int:game_id>/<int:card_id>/', views.play_card),
    path('update_play_notes/<int:game_id>/<int:card_id>/', views.update_play_notes),
    path('get_game_cards/<int:game_id>/', views.get_game_cards),

    # ----------------------------------------------------------------------

    path('start_game/<int:faction_id>/<int:commander_id>/', views.start_game),
    path('end_round/<int:game_id>/', views.end_round),
    path('end_game/<int:game_id>/', views.end_game),

] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
