from django.db.models import Q
from songdecks.views.helpers import handle_card_updates
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.http import JsonResponse
from songdecks.serializers import (ProfileSerializer,
    FactionSerializer, CommanderSerializer,
    CardTemplateSerializer, GameSerializer, PlayerCardSerializer,
    UserCardStatsSerializer, UserSerializer)
from django.contrib.auth.models import User
from songdecks.models import (Profile, Faction, Commander, CardTemplate,
    Game, PlayerCard, UserCardStats)

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
def get_commanders_of_faction(request, faction_id):
    try:
        commanders = Commander.objects.filter(faction=faction_id)
        serializer = CommanderSerializer(commanders, many=True)
        return JsonResponse({"success": True, "response": serializer.data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})

# ----------------------------------------------------------------------
# Card Actions

@api_view(['GET'])
def draw_card(request, game_id):
    try:
        game = Game.objects.get(id=game_id, owner=request.user)
        if game.status != 'in-progress' or len(game) == 0:
            return JsonResponse({"success": False, "response": "Game not alterable or not found."})
        deck_cards = PlayerCard.objects.filter(game=game, status='in-deck')
        if len(deck_cards) == 0:
            return JsonResponse({"success": False, "response": "No cards left in deck."})
        selected_card = deck_cards.order_by('?').first()
        selected_card.status = 'in-hand'
        selected_card.drawn_this_round = True
        selected_card.save()
        serializer = PlayerCardSerializer(selected_card)
        return JsonResponse({"success": True, "response": serializer.data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})

@api_view(['GET'])
def place_card_in_deck(request, game_id, card_id):
    try:
        game = Game.objects.get(id=game_id, owner=request.user)
        if game.status != 'in-progress' or len(game) == 0:
            return JsonResponse({"success": False, "response": "Game not alterable or not found."})
        card = PlayerCard.objects.get(id=card_id, game=game, status__in=['in-hand', 'discarded'])
        if len(card) == 0:
            return JsonResponse({"success": False, "response": "Card not found."})
        card.status = 'in-deck'
        card.save()
        serializer = PlayerCardSerializer(card)
        return JsonResponse({"success": True, "response": serializer.data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})

@api_view(['GET'])
def discard_card(request, game_id, card_id):
    try:
        game = Game.objects.get(id=game_id, owner=request.user)
        if game.status != 'in-progress' or len(game) == 0:
            return JsonResponse({"success": False, "response": "Game not alterable or not found."})
        card = PlayerCard.objects.get(id=card_id, game=game, status='in-hand')
        if len(card) == 0:
            return JsonResponse({"success": False, "response": "Card not found."})
        card.status = 'discarded'
        card.discarded_this_round = True
        card.save()
        serializer = PlayerCardSerializer(card)
        return JsonResponse({"success": True, "response": serializer.data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})
    
@api_view(['GET'])
def play_card(request, game_id, card_id):
    try:
        game = Game.objects.get(id=game_id, owner=request.user)
        if game.status != 'in-progress' or len(game) == 0:
            return JsonResponse({"success": False, "response": "Game not alterable or not found."})
        card = PlayerCard.objects.get(id=card_id, game=game, status='in-hand')
        if len(card) == 0:
            return JsonResponse({"success": False, "response": "Card not found."})
        card.status = 'in-play'
        card.save()
        serializer = PlayerCardSerializer(card)
        return JsonResponse({"success": True, "response": serializer.data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})
    
@api_view(['POST'])
def update_play_notes(request, game_id, card_id):
    try:
        game = Game.objects.get(id=game_id, owner=request.user)
        if game.status != 'in-progress' or len(game) == 0:
            return JsonResponse({"success": False, "response": "Game not alterable or not found."})
        card = PlayerCard.objects.get(id=card_id, game=game, status='in-play')
        if len(card) == 0:
            return JsonResponse({"success": False, "response": "Card not found."})
        card.play_notes = request.data.get('play_notes', None)
        card.save()
        serializer = PlayerCardSerializer(card)
        return JsonResponse({"success": True, "response": serializer.data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})

@api_view(['GET'])
def get_game_cards(request, game_id):
    try:
        game = Game.objects.get(id=game_id, owner=request.user)
        if len(game) == 0:
            return JsonResponse({"success": False, "response": "Game not found."})
        cards = PlayerCard.objects.filter(game=game)
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

@api_view(['POST'])
def end_round(request, game_id):
    try:
        game = Game.objects.get(id=game_id, owner=request.user)
        if game.status != 'in-progress' or len(game) == 0:
            return JsonResponse({"success": False, "response": "Game not alterable or not found."})
        
        handle_card_updates(game)

        game.round += 1
        game.save()

        updated_cards = PlayerCard.objects.filter(game=game)
        serializer = PlayerCardSerializer(updated_cards, many=True)
        return JsonResponse({"success": True, "response": serializer.data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})
    
@api_view(['POST'])
def end_game(request, game_id):
    try:
        game = Game.objects.get(id=game_id, owner=request.user)
        if game.status != 'in-progress' or len(game) == 0:
            return JsonResponse({"success": False, "response": "Game not alterable or not found."})

        handle_card_updates(game)

        game.status = 'completed'
        game.round += 1
        game.save()
        return JsonResponse({"success": True, "response": "Successfully ended game."})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})