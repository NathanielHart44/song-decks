from songdecks.settings import EMAIL_HOST_USER
from django.db.models import Count, Q, Sum
from django.db.models.functions import Coalesce
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.http import JsonResponse
from songdecks.serializers import (
    FactionSerializer, CommanderSerializer,
    PlayerCardSerializer, UserSerializer, UserCardStatsSerializer,
    GameSerializer, CardTemplateSerializer)
from django.contrib.auth.models import User
from songdecks.models import (Profile, Faction, Commander, CardTemplate,
    Game, PlayerCard, UserCardStats)
from songdecks.views.helpers import handle_card_updates, get_profile_game_cards, send_email_notification

# ----------------------------------------------------------------------
# Game setup/general views

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    post_data = request.data
    request.user = User.objects.filter(username='admin').first()
    same_email_users = User.objects.filter(email=post_data['email'])
    if len(same_email_users) > 0:
        return JsonResponse({"success": False, "response": "That email is already in use."})
    same_username_users = User.objects.filter(username=post_data['username'])
    if len(same_username_users) > 0:
        return JsonResponse({"success": False, "response": "That username is already in use."})
    try:
        new_user = User.objects.create(
            username=post_data['username'],
            first_name=post_data['firstName'],
            last_name=post_data['lastName'],
            email=post_data['email'],
            is_superuser=False,
            is_staff=False
        )
        new_user.set_password(post_data['password'])
        new_user.save()
        serializer = UserSerializer(User.objects.filter(id=new_user.id).first())
        return JsonResponse({"success": True, "response": "Successfully created account!", "user": serializer.data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})
    
@api_view(['GET'])
def current_user(request):
    try:
        serializer = UserSerializer(request.user)
        return JsonResponse({"success": True, "response": serializer.data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})
    
@api_view(['GET'])
def get_factions(request):
    try:
        factions = Faction.objects.all()
        serializer = FactionSerializer(factions, many=True)
        return JsonResponse({"success": True, "response": serializer.data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})
    
@api_view(['GET'])
def get_commanders(request):
    try:
        commanders = Commander.objects.all()
        serializer = CommanderSerializer(commanders, many=True)
        return JsonResponse({"success": True, "response": serializer.data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})

@api_view(['GET'])
def get_cards_of_commander(request, commander_id):
    try:
        cards = CardTemplate.objects.filter(commander__id=commander_id)
        serializer = CardTemplateSerializer(cards, many=True)
        return JsonResponse({"success": True, "response": serializer.data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})
    
@api_view(['GET'])
def get_cards_of_faction(request, faction_id):
    try:
        cards = CardTemplate.objects.filter(faction__id=faction_id).exclude(commander__isnull=False)
        serializer = CardTemplateSerializer(cards, many=True)
        return JsonResponse({"success": True, "response": serializer.data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})

# ----------------------------------------------------------------------
# Card Actions

@api_view(['POST'])
def handle_card_action(request, action):
    try:
        game_id = request.data.get('game_id', None)
        card_id = request.data.get('card_id', None)
        play_notes = request.data.get('update_play_notes', None)
        card_template_id = request.data.get('card_template_id', None)
        debug = {}
        debug['original_play_notes'] = play_notes

        game_search = Game.objects.filter(id=game_id, owner=request.user.profile)
        if game_search.count() == 0:
            return JsonResponse({"success": False, "response": f"Game not found. {game_id}"})
        game = game_search.first()
        if game.status != 'in-progress':
            return JsonResponse({"success": False, "response": "Game not alterable."})
        
        if action == 'draw':
            deck_cards = PlayerCard.objects.filter(game=game, status='in-deck')
            if deck_cards.count() == 0:
                return JsonResponse({"success": False, "response": "No cards left in deck."})
            selected_card = deck_cards.order_by('?').first()
            selected_card.status = 'in-hand'
            selected_card.drawn_this_round = True
            selected_card.save()
        elif action == 'place_in_hand' and card_id == -1 and card_template_id:
            card_template = CardTemplate.objects.filter(id=card_template_id).first()
            if not card_template:
                return JsonResponse({"success": False, "response": "Card template not found."})
            card = PlayerCard.objects.filter(game=game, card_template=card_template, status='in-deck').first()
            if not card:
                return JsonResponse({"success": False, "response": "Unable to draw this card."})
            card.status = 'in-hand'
            card.drawn_this_round = True
            card.save()
        else:
            card = PlayerCard.objects.filter(id=card_id, game=game)
            if card.count() == 0:
                return JsonResponse({"success": False, "response": "Card not found."})
            card = card.first()

            if action == 'place_in_deck':
                card.status = 'in-deck'
                card.save()
            elif action == 'place_in_hand':
                card.status = 'in-hand'
                card.save()
            elif action == 'discard':
                if card.status not in ['in-hand', 'in-play']:
                    return JsonResponse({"success": False, "response": f"Card not valid to discard. - {card.status}"})
                card.status = 'discarded'
                card.discarded_this_round = True
                card.save()
            elif action == 'play':
                if card.status != 'in-hand':
                    return JsonResponse({"success": False, "response": f"Card not in hand. - {card.status}"})
                card.status = 'in-play'
                card.save()
            elif action == 'update_play_notes':
                if card.status != 'in-play':
                    return JsonResponse({"success": False, "response": f"Card not in play. - {card.status}"})
                debug['made_it_to_update_play_notes'] = True
                card.play_notes = play_notes
                card.save()
                updated_card = PlayerCard.objects.filter(id=card_id, game=game).first()
                debug['updated_card_play_notes'] = updated_card.play_notes
            else:
                return JsonResponse({"success": False, "response": "Invalid action."})

        new_cards = get_profile_game_cards(game, request.user.profile)
        serializer = PlayerCardSerializer(new_cards, many=True)
        response = {
            "success": True,
            "response": serializer.data,
            "debug": debug
        }
        if action == 'draw':
            response["new_card"] = PlayerCardSerializer(selected_card).data
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})

@api_view(['GET'])
def get_game_cards(request, game_id):
    try:
        game_search = Game.objects.filter(id=game_id, owner=request.user.profile)
        if game_search.count() == 0:
            return JsonResponse({"success": False, "response": "Game not found."})
        game = game_search.first()

        cards = get_profile_game_cards(game, request.user.profile)
        serializer = PlayerCardSerializer(cards, many=True)
        return JsonResponse({"success": True, "response": serializer.data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})

# ----------------------------------------------------------------------
# Game Actions

@api_view(['GET'])
def start_game(request, faction_id, commander_id):
    try:
        user_profile = Profile.objects.get(user=request.user)
        new_game = Game.objects.create(
            owner=user_profile,
            faction=Faction.objects.get(id=faction_id),
            commander=Commander.objects.get(id=commander_id),
            status='in-progress'
        )
        commander_card_templates = CardTemplate.objects.filter(commander=commander_id)
        faction_card_templates = CardTemplate.objects.filter(faction=faction_id).exclude(commander__isnull=False)
        combined_card_templates = commander_card_templates | faction_card_templates

        for card_template in commander_card_templates:
            if card_template.replaces:
                combined_card_templates = combined_card_templates.exclude(id=card_template.replaces.id)

        all_cards = []

        for card_template in combined_card_templates:
            for i in range(2):
                all_cards.append(PlayerCard.objects.create(
                    game=new_game,
                    card_template=card_template,
                    owner=user_profile,
                    status='in-deck'
                ))

        for card in all_cards:
            user_card_stats, created = UserCardStats.objects.get_or_create(
                user=user_profile,
                card_template=card.card_template
            )
            user_card_stats.times_included += 1
            user_card_stats.save()

        serializer = PlayerCardSerializer(all_cards, many=True)

        return JsonResponse({"success": True, "response": serializer.data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})

@api_view(['GET'])
def end_round(request, game_id):
    try:
        game_search = Game.objects.filter(id=game_id, owner=request.user.profile)
        if game_search.count() == 0:
            return JsonResponse({"success": False, "response": "Game not found."})
        game = game_search.first()
        if game.status != 'in-progress':
            return JsonResponse({"success": False, "response": "Game not alterable."})
        handle_card_updates(game)

        game.round += 1
        game.save()

        updated_cards = PlayerCard.objects.filter(game=game)
        serializer = PlayerCardSerializer(updated_cards, many=True)
        return JsonResponse({"success": True, "response": serializer.data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})
    
@api_view(['GET'])
def end_game(request, game_id):
    try:
        game_search = Game.objects.filter(id=game_id, owner=request.user.profile)
        if game_search.count() == 0:
            return JsonResponse({"success": False, "response": "Game not found."})
        game = game_search.first()
        if game.status != 'in-progress':
            return JsonResponse({"success": False, "response": "Game not alterable."})

        handle_card_updates(game)

        game.status = 'completed'
        game.save()
        return JsonResponse({"success": True, "response": "Successfully ended game."})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})
    
@api_view(['GET'])
def get_recent_games(request):
    try:
        games = Game.objects.filter(owner=request.user.profile).order_by('-id')
        serializer = GameSerializer(games, many=True)
        return JsonResponse({"success": True, "response": serializer.data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})
    
@api_view(['GET'])
def get_player_stats(request):
    try:
        user_profile = Profile.objects.get(user=request.user)
        user_card_stats = UserCardStats.objects.filter(user=user_profile)
        user_card_stats = user_card_stats.order_by('-times_included', '-times_drawn')
        serializer = UserCardStatsSerializer(user_card_stats, many=True)
        return JsonResponse({"success": True, "response": serializer.data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})

# ----------------------------------------------------------------------
# Card Content
    
@api_view(['POST'])
def add_edit_card(request, card_id=None):
    try:
        info = {
            'card_name': request.data.get('card_name', None),
            'img_url': request.data.get('img_url', None),
            'faction_id': request.data.get('faction_id', None),
            'commander_id': request.data.get('commander_id', None),
            'replaces_id': request.data.get('replaces_id', None),
        }
        for key in info:
            if key == 'commander_id':
                continue
            elif not info['replaces_id'] and key == 'replaces_id':
                continue
            elif info[key] is None:
                return JsonResponse({"success": False, "response": f"Missing {key}."})
        faction_search = Faction.objects.filter(id=info['faction_id'])
        if faction_search.count() == 0:
            return JsonResponse({"success": False, "response": "Faction not found."})
        commander_search = None
        if info['commander_id'] is not None:
            commander_search = Commander.objects.filter(id=info['commander_id'])
            if commander_search.count() == 0:
                return JsonResponse({"success": False, "response": "Commander not found."})
        replaces_search = None
        if info['replaces_id'] is not None:
            replaces_search = CardTemplate.objects.filter(id=info['replaces_id'])
            if replaces_search.count() == 0:
                return JsonResponse({"success": False, "response": "Replacement card not found."})
        if card_id is None:
            main_card = CardTemplate.objects.create(
                card_name=info['card_name'],
                img_url=info['img_url'],
                faction=faction_search.first(),
                commander=commander_search.first() if commander_search is not None else None,
                replaces=replaces_search.first() if replaces_search is not None else None,
                game_count=0,
                play_count=0,
                discard_count=0
            )
        else:
            main_card = CardTemplate.objects.filter(id=card_id)
            if main_card.count() == 0:
                return JsonResponse({"success": False, "response": "Card not found."})
            card = main_card.first()
            card.card_name = info['card_name']
            card.img_url = info['img_url']
            card.faction = faction_search.first()
            if commander_search:
                card.commander = commander_search.first()
            if replaces_search:
                card.replaces = replaces_search.first()
            card.save()
            main_card = main_card.first()

        new_card = CardTemplate.objects.filter(id=main_card.id).first()
        message = f"Successfully created: {new_card.card_name}" if card_id is None else f"Successfully edited: {new_card.card_name}"
        return JsonResponse({"success": True, "response": message, "card": CardTemplateSerializer(new_card).data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})
    
@api_view(['GET'])
def delete_card(request, card_id):
    try:
        card_search = CardTemplate.objects.filter(id=card_id)
        if card_search.count() == 0:
            return JsonResponse({"success": False, "response": "Card not found."})
        card = card_search.first()
        card.delete()
        return JsonResponse({"success": True, "response": "Successfully deleted card."})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})

# ----------------------------------------------------------------------
# Faction Content

@api_view(['POST'])
def add_edit_faction(request, faction_id=None):
    try:
        neutral_str = request.data.get('neutral', 'false')
        converted_neutral = True if neutral_str.lower() == 'true' else False
        info = {
            'name': request.data.get('name', None),
            'img_url': request.data.get('img_url', None),
            'neutral': converted_neutral
        }
        for key in info:
            if info[key] is None:
                return JsonResponse({"success": False, "response": f"Missing {key}."})
        if faction_id is None:
            faction = Faction.objects.create(
                name=info['name'],
                img_url=info['img_url'],
                neutral=info['neutral']
            )
        else:
            faction = Faction.objects.filter(id=faction_id)
            if faction.count() == 0:
                return JsonResponse({"success": False, "response": "Faction not found."})
            faction = faction.first()
            faction.name = info['name']
            faction.img_url = info['img_url']
            faction.neutral = info['neutral']
            faction.save()

        new_faction = Faction.objects.filter(id=faction.id).first()
        message = f"Successfully created: {new_faction.name}" if faction_id is None else f"Successfully edited: {new_faction.name}"
        return JsonResponse({"success": True, "response": message, "faction": FactionSerializer(new_faction).data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})
    
@api_view(['GET'])
def delete_faction(request, faction_id):
    try:
        faction_search = Faction.objects.filter(id=faction_id)
        if faction_search.count() == 0:
            return JsonResponse({"success": False, "response": "Faction not found."})
        faction = faction_search.first()
        faction.delete()
        return JsonResponse({"success": True, "response": "Successfully deleted faction."})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})
    
# ----------------------------------------------------------------------
# Commander Content

@api_view(['POST'])
def add_edit_commander(request, commander_id=None):
    try:
        info = {
            'name': request.data.get('name', None),
            'img_url': request.data.get('img_url', None),
            'faction_id': request.data.get('faction_id', None),
        }
        for key in info:
            if info[key] is None:
                return JsonResponse({"success": False, "response": f"Missing {key}."})
        faction_search = Faction.objects.filter(id=info['faction_id'])
        if faction_search.count() == 0:
            return JsonResponse({"success": False, "response": "Faction not found."})
        if commander_id is None:
            commander = Commander.objects.create(
                name=info['name'],
                img_url=info['img_url'],
                faction=faction_search.first(),
            )
        else:
            commander = Commander.objects.filter(id=commander_id)
            if commander.count() == 0:
                return JsonResponse({"success": False, "response": "Commander not found."})
            commander = commander.first()
            commander.name = info['name']
            commander.img_url = info['img_url']
            commander.faction = faction_search.first()
            commander.save()

        new_commander = Commander.objects.filter(id=commander.id).first()
        message = f"Successfully created: {new_commander.name}" if commander_id is None else f"Successfully edited: {new_commander.name}"
        return JsonResponse({"success": True, "response": message, "commander": CommanderSerializer(new_commander).data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})
    
@api_view(['GET'])
def delete_commander(request, commander_id):
    try:
        commander_search = Commander.objects.filter(id=commander_id)
        if commander_search.count() == 0:
            return JsonResponse({"success": False, "response": "Commander not found."})
        commander = commander_search.first()
        commander.delete()
        return JsonResponse({"success": True, "response": "Successfully deleted commander."})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})
    
# ----------------------------------------------------------------------
# Moderator

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
            total_games = queryset.aggregate(sum=Sum('total_game_count'))['sum']
            total_active = queryset.filter(total_game_count__gt=0).count()
            more_than_three_games = queryset.filter(total_game_count__gt=3).count()

            # Annotate completed games count
            completed_games_count = Game.objects.filter(status='completed', owner__in=queryset).count()

            data[key] = {
                'total_games': total_games,
                'total_count': total_active,
                'more_than_three_games': more_than_three_games,
                'games_last_seven_days': queryset.filter(last_7_days_game_count__gt=0).count(),
                'games_last_thirty_days': queryset.filter(last_30_days_game_count__gt=0).count(),
                'completed_games': completed_games_count
            }
        return JsonResponse({"success": True, "response": data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})
    
@api_view(['POST'])
def submit_feedback(request):
    try:
        reply_str = request.data.get('reply', 'false')
        requested_reply = True if reply_str.lower() == 'true' else False
        message = request.data.get('feedback', None)
        if message is None:
            return JsonResponse({"success": False, "response": "No feedback provided."})
        send_email_notification(
            recipient=EMAIL_HOST_USER,
            subject=f"{request.user.username} - ({request.user.first_name} {request.user.last_name}) - (Reply? {'Y' if requested_reply else 'N'}{'' if not requested_reply else f' - {request.user.email}'})",
            message=message
        )
        return JsonResponse({"success": True, "response": "Successfully submitted feedback."})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})