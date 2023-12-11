from django.db.models import Count, Q, Sum
from django.db.models.functions import Coalesce
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view
from django.http import JsonResponse
from songdecks.serializers import (UserSerializer)
from django.contrib.auth.models import User
from songdecks.models import (Profile, Game)

# ----------------------------------------------------------------------

@api_view(['GET'])
def get_all_users(request):
    try:
        profile = request.user.profile
        if profile.moderator == False:
            return JsonResponse({"success": False, "response": "You do not have permission to perform this action."})
        users = User.objects.all()
        users = users.exclude(username='admin')
        info = {
            "users": UserSerializer(users, many=True).data,
            "total": users.count(),
        }
        return JsonResponse({"success": True, "response": info})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})
    
@api_view(['GET'])
def toggle_moderator(request, username):
    try:
        profile = request.user.profile
        if profile.moderator == False:
            return JsonResponse({"success": False, "response": "You do not have permisdsion to perform this action."})
        user_search = User.objects.filter(username=username)
        if user_search.count() == 0:
            return JsonResponse({"success": False, "response": "User not found."})
        user = user_search.first()
        user.profile.moderator = not user.profile.moderator
        user.profile.save()
        updated_profile_status = Profile.objects.filter(user=user).first().moderator
        return JsonResponse({"success": True, "response": f"Successfully toggled moderator status to {updated_profile_status} for {user.username}."})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})
    
@api_view(['GET'])
def reset_password(request, username):
    try:
        profile = request.user.profile
        if profile.moderator == False:
            return JsonResponse({"success": False, "response": "You do not have permission to perform this action."})
        user_search = User.objects.filter(username=username)
        if user_search.count() == 0:
            return JsonResponse({"success": False, "response": "User not found."})
        user = user_search.first()
        new_password = User.objects.make_random_password()
        user.set_password(new_password)
        user.save()
        return JsonResponse({"success": True, "response": f"Successfully reset password for {user.username} to: {new_password}"})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})
    
@api_view(['GET'])
def games_played_info(request):
    try:
        profile = request.user.profile
        if profile.moderator == False:
            return JsonResponse({"success": False, "response": "You do not have permission to perform this action."})

        now = timezone.now()
        seven_days_ago = now - timedelta(days=7)
        thirty_days_ago = now - timedelta(days=30)

        # Exclude admin and annotate with total, last 7 days and last 30 days game count
        profiles = Profile.objects.exclude(user__username='admin').annotate(
            total_game_count=Coalesce(Count('game', distinct=True), 0),
            last_7_days_game_count=Coalesce(Count('game', filter=Q(game__created_at__gte=seven_days_ago), distinct=True), 0),
            last_30_days_game_count=Coalesce(Count('game', filter=Q(game__created_at__gte=thirty_days_ago), distinct=True), 0)
        )

        moderators = profiles.filter(moderator=True)
        players = profiles.filter(moderator=False)

        data = {}
        for key, queryset in [('active_moderators', moderators), ('active_players', players)]:
            # Calculate total games, active counts and more than 3 games counts
            total_games_sum = queryset.aggregate(sum=Sum('total_game_count'))['sum']
            tried_one_game = queryset.filter(total_game_count__gt=0)
            tried_3_games = queryset.filter(total_game_count__gt=3)

            active_users_7: Profile = queryset.filter(user__last_login__gte=seven_days_ago)
            active_users_30: Profile = queryset.filter(user__last_login__gte=thirty_days_ago)

            # Annotate completed games count
            all_completed_games = Game.objects.filter(status='completed', owner__in=queryset)

            completed_games_7_days = all_completed_games.filter(created_at__gte=seven_days_ago)
            completed_games_30_days = all_completed_games.filter(created_at__gte=thirty_days_ago)

            data[key] = {
                '7 Days': {
                    'active_users': active_users_7.count(),
                    'completed_games': completed_games_7_days.count(),
                    'tried_one_game': tried_one_game.filter(user__last_login__gte=seven_days_ago).count(),
                    'tried_3_games': tried_3_games.filter(user__last_login__gte=seven_days_ago).count(),
                },
                '30 Days': {
                    'active_users': active_users_30.count(),
                    'completed_games': completed_games_30_days.count(),
                    'tried_one_game': tried_one_game.filter(user__last_login__gte=thirty_days_ago).count(),
                    'tried_3_games': tried_3_games.filter(user__last_login__gte=thirty_days_ago).count(),
                },
                'All Time': {
                    'active_users': queryset.count(),
                    'completed_games': all_completed_games.count(),
                    'total_games': total_games_sum,
                    'tried_one_game': tried_one_game.count(),
                    'tried_3_games': tried_3_games.count(),
                },
            }
        return JsonResponse({"success": True, "response": data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})