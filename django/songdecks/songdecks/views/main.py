from songdecks.settings import EMAIL_HOST_USER
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.http import JsonResponse, HttpResponse
from rest_framework.response import Response
from songdecks.serializers import (PlayerCardSerializer,
    UserSerializer, UserCardStatsSerializer, GameSerializer)
from django.contrib.auth.models import User
from songdecks.models import (Profile, Faction, Commander, CardTemplate,
    Game, PlayerCard, UserCardStats)
from songdecks.views.helpers import handle_card_updates, send_email_notification
import requests
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from rest_framework import status

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
    
@api_view(['POST'])
@permission_classes([AllowAny])
def get_jwt_token(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    try:
        user = User.objects.get(username=username)

        if user.check_password(password):
            # Update last_login
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])

            # Create token
            refresh = RefreshToken.for_user(user)

            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        else:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    except User.DoesNotExist:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def current_user(request):
    try:
        serializer = UserSerializer(request.user)
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
    
@api_view(['POST'])
def download_img(request):
    img_url = request.data.get('img_url', None)
    if img_url is None:
        return JsonResponse({"success": False, "response": "No image URL provided."})
    try:
        try:
            response = requests.get(img_url, stream=True)
        except Exception as e:
            return JsonResponse({"success": False, "response": "Image could not be retrieved."})

        if response.status_code != 200:
            return JsonResponse({"success": False, "response": "Image could not be retrieved."})
        
        content_type = response.headers.get('content-type')
        if content_type is None:
            return JsonResponse({"success": False, "response": "Unable to determine the content type of the image."})
        
        if 'image' not in content_type:
            return JsonResponse({"success": False, "response": f"URL does not point to an image. Type is: {content_type}"})
        
        return HttpResponse(response.content, content_type=content_type)
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})