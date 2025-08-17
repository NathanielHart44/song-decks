from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from songdecks.serializers import (PlayerCardSerializer, CardTemplateSerializer)
from songdecks.models import (Faction, Commander, CardTemplate,
    Game, PlayerCard)
from songdecks.views.helpers import get_profile_game_cards, upload_file_to_s3
from songdecks.settings import AWS_S3_BUCKET_NAME

# ----------------------------------------------------------------------
# Card Actions

@api_view(['POST'])
@permission_classes([AllowAny])
def handle_card_action(request, action):
    try:
        game_id = request.data.get('game_id', None)
        card_id = request.data.get('card_id', None)
        play_notes = request.data.get('update_play_notes', None)
        card_template_id = request.data.get('card_template_id', None)
        debug = {}
        debug['original_play_notes'] = play_notes

        if request.user and request.user.is_authenticated:
            game_search = Game.objects.filter(id=game_id, owner=request.user.profile)
        else:
            game_search = Game.objects.filter(id=game_id)
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
@permission_classes([AllowAny])
def get_game_cards(request, game_id):
    try:
        if request.user and request.user.is_authenticated:
            game_search = Game.objects.filter(id=game_id, owner=request.user.profile)
        else:
            game_search = Game.objects.filter(id=game_id)
        if game_search.count() == 0:
            return JsonResponse({"success": False, "response": "Game not found."})
        game = game_search.first()
        # For anonymous users, return all cards for the game
        if request.user and request.user.is_authenticated:
            cards = get_profile_game_cards(game, request.user.profile)
        else:
            cards = PlayerCard.objects.filter(game=game)
        serializer = PlayerCardSerializer(cards, many=True)
        return JsonResponse({"success": True, "response": serializer.data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})
    
# ----------------------------------------------------------------------
# Card Content
    
@api_view(['POST'])
def add_edit_card(request, card_id=None):
    try:
        if request.user.profile.moderator == False:
            return Response(
                {"detail": "You do not have permission to delete cards."},
                status=status.HTTP_403_FORBIDDEN
            )
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
                return Response(
                    {"detail": f"Missing {key}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
        img_file = request.data.get('img_file', None)
        if img_file:
            is_success, error_msg = upload_file_to_s3(img_file, AWS_S3_BUCKET_NAME, info['img_url'])
            if not is_success:
                return Response(
                    {"detail": error_msg},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        faction_search = Faction.objects.filter(id=info['faction_id'])
        if faction_search.count() == 0:
            return Response(
                {"detail": "Faction not found."},
                status=status.HTTP_400_BAD_REQUEST
            )
        commander_search = None
        if info['commander_id'] is not None:
            commander_search = Commander.objects.filter(id=info['commander_id'])
            if commander_search.count() == 0:
                return Response(
                    {"detail": "Commander not found."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        replaces_search = None
        if info['replaces_id'] is not None:
            replaces_search = CardTemplate.objects.filter(id=info['replaces_id'])
            if replaces_search.count() == 0:
                return Response(
                    {"detail": "Replacement card not found."},
                    status=status.HTTP_400_BAD_REQUEST
                )
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
                return Response(
                    {"detail": "Card not found."},
                    status=status.HTTP_404_NOT_FOUND
                )
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
        serializer = CardTemplateSerializer(new_card)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['DELETE'])
def delete_card(request, card_id):
    try:
        if request.user.profile.moderator == False:
            return Response(
                {"detail": "You do not have permission to delete cards."},
                status=status.HTTP_403_FORBIDDEN
            )
        card_search = CardTemplate.objects.filter(id=card_id)
        if card_search.count() == 0:
            return Response(
                {"detail": "Card not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        card = card_search.first()
        card.delete()
        return Response(
            {"detail": f"Successfully deleted: {card.card_name}"},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['GET'])
@permission_classes([AllowAny])
def get_cards_of_commander(request, commander_id):
    try:
        cards = CardTemplate.objects.filter(commander__id=commander_id)
        serializer = CardTemplateSerializer(cards, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['GET'])
@permission_classes([AllowAny])
def get_cards_of_faction(request, faction_id):
    try:
        cards = CardTemplate.objects.filter(faction__id=faction_id).exclude(commander__isnull=False)
        serializer = CardTemplateSerializer(cards, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
