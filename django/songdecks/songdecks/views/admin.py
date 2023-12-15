from django.db.models import Count, Q, Sum, QuerySet
from typing import Tuple
from django.db.models.functions import Coalesce
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view
from django.http import JsonResponse
from songdecks.serializers import (UserSerializer)
from django.contrib.auth.models import User
from songdecks.models import (Profile, Game)
from songdecks.views.helpers import get_last_acceptable_date

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
        profile_querysets: Tuple[Tuple[str, QuerySet[Profile]], ...] = [
            ('active_players', players),
            ('moderators', moderators)
        ]

        for key, profile_queryset in profile_querysets:
            # Calculate total games, active counts and more than 3 games counts
            total_games_sum = profile_queryset.aggregate(sum=Sum('total_game_count'))['sum']
            tried_one_game = profile_queryset.filter(total_game_count__gt=0)
            tried_3_games = profile_queryset.filter(total_game_count__gte=3)

            active_users_7 = profile_queryset.filter(user__last_login__gte=seven_days_ago)
            active_users_30 = profile_queryset.filter(user__last_login__gte=thirty_days_ago)

            # Annotate started games count
            played_games = Game.objects.filter(round__gt=1, owner__in=profile_queryset)
            played_games_7_days = played_games.filter(created_at__gte=seven_days_ago)
            played_games_30_days = played_games.filter(created_at__gte=thirty_days_ago)

            data[key] = {
                '7 Days': {
                    'active_users': active_users_7.count(),
                    'played_games': played_games_7_days.count(),
                    'tried_one_game': tried_one_game.filter(user__last_login__gte=seven_days_ago).count(),
                    'tried_3_games': tried_3_games.filter(user__last_login__gte=seven_days_ago).count(),
                },
                '30 Days': {
                    'active_users': active_users_30.count(),
                    'played_games': played_games_30_days.count(),
                    'tried_one_game': tried_one_game.filter(user__last_login__gte=thirty_days_ago).count(),
                    'tried_3_games': tried_3_games.filter(user__last_login__gte=thirty_days_ago).count(),
                },
                'All Time': {
                    'active_users': profile_queryset.count(),
                    'played_games': played_games.count(),
                    'total_games': total_games_sum,
                    'tried_one_game': tried_one_game.count(),
                    'tried_3_games': tried_3_games.count(),
                },
            }
        return JsonResponse({"success": True, "response": data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})
    
@api_view(['GET'])
def get_player_daily_stats(request, accepted_days, is_cumulative):
    date_format = '%m-%d-%Y'
    try:
        profile = request.user.profile
        if profile.moderator == False:
            return JsonResponse({"success": False, "response": "You do not have permission to perform this action."})

        profiles = Profile.objects.exclude(user__username='admin', moderator=False)

        all_results = {}
        types = ['played_games', 'active_users', 'new_users']
        if is_cumulative == 'true':
            types.append('total_users')
        for i in range(accepted_days):
            current_date = get_last_acceptable_date(i)

            new_users_count = profiles.filter(user__date_joined__date=current_date).count()
            if is_cumulative == 'true':
                total_users_count = profiles.count(user__date_joined__date__lte=current_date)
                played_games_count = Game.objects.filter(created_at__date__lte=current_date).count()
                active_users_count = profiles.filter(user__last_login__date__lte=current_date).count()
            else:
                played_games_count = Game.objects.filter(created_at__date=current_date).count()
                active_users_count = profiles.filter(user__last_login__date=current_date).count()

            for type in types:
                if type not in all_results:
                    all_results[type] = []
                if type == 'played_games':
                    count = played_games_count
                elif type == 'active_users':
                    count = active_users_count
                elif type == 'new_users':
                    count = new_users_count
                elif type == 'total_users':
                    count = total_users_count

                result = {
                    "date": current_date.strftime(date_format),
                    "value": count,
                }
                all_results[type].append(result)

        return JsonResponse({'success': True, 'response': all_results})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})
        