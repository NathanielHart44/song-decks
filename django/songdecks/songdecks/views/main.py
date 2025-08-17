from songdecks.settings import (EMAIL_HOST_USER, REACT_APP_GOOGLE_CLIENT_ID,
    REACT_APP_GOOGLE_CLIENT_SECRET, REACT_APP_URI_REDIRECT)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.http import JsonResponse, HttpResponse
from rest_framework.response import Response
from songdecks.serializers import (PlayerCardSerializer, ProfileSerializer,
    UserSerializer, UserCardStatsSerializer, GameSerializer, ShortProfileSerializer,
    ChangePasswordSerializer)
from django.contrib.auth.models import User
from songdecks.models import (Profile, Faction, Commander, CardTemplate,
    Game, PlayerCard, UserCardStats)
from songdecks.views.helpers import (handle_card_updates, send_email_notification,
    update_last_login, gen_jwt_tokens_for_user, create_user_from_google, get_guest_profile)
import requests
from django.utils import timezone
from rest_framework import status
from django.db import transaction
import logging

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# ----------------------------------------------------------------------

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# ----------------------------------------------------------------------
# Game setup/general views

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    post_data = request.data
    request.user = User.objects.filter(username='admin').first()
    same_email_users = User.objects.filter(email=post_data['email'])
    if len(same_email_users) > 0:
        return Response(
            {"response": "Unable to create new account - email already in use."},
            status=status.HTTP_400_BAD_REQUEST
        )
    same_username_users = User.objects.filter(username=post_data['username'])
    if len(same_username_users) > 0:
        return Response(
            {"response": "Unable to create new account - username already in use."},
            status=status.HTTP_400_BAD_REQUEST
        )
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
        new_user.last_login = timezone.now()
        new_user.save()

        return Response(gen_jwt_tokens_for_user(new_user))
    except Exception as e:
        return Response(
            {
                "response": "Unable to create new account.",
                "detail": str(e)
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
@api_view(['POST'])
@permission_classes([AllowAny])
def get_jwt_token(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    try:
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            user = User.objects.get(email=username)

        if user.check_password(password):
            update_last_login(user)
            return Response(gen_jwt_tokens_for_user(user))
        else:
            return Response(
                {"detail": "Incorrect password for this account."},
                status=status.HTTP_401_UNAUTHORIZED
            )
    except User.DoesNotExist:
        return Response(
            {"detail": "No active account found with the given credentials."},
            status=status.HTTP_401_UNAUTHORIZED
        )
    except Exception as e:
        return Response(
            {"detail": f"An error occured. Please try again later.\nError: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    try:
        try:
            code = request.data.get('code')
        except:
            return Response(
                {"detail": "No code provided."},
                status=status.HTTP_400_BAD_REQUEST
            )
        # Exchange code for token
        token_url = 'https://oauth2.googleapis.com/token'
        token_data = {
            'code': code,
            'client_id': REACT_APP_GOOGLE_CLIENT_ID,
            'client_secret': REACT_APP_GOOGLE_CLIENT_SECRET,
            'redirect_uri': REACT_APP_URI_REDIRECT,
            'grant_type': 'authorization_code',
        }
        try:
            token_response = requests.post(token_url, data=token_data)
            token_json = token_response.json()
            if 'error' in token_json.keys():
                return Response(
                    {"detail": token_json['error'], 'uri_redirect': REACT_APP_URI_REDIRECT},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # verify ID token
            idinfo = id_token.verify_oauth2_token(token_json['id_token'], google_requests.Request(), REACT_APP_GOOGLE_CLIENT_ID)
            user_id = idinfo['sub']
            email = idinfo.get('email')
            name = idinfo.get('name')

            try:
                user = User.objects.get(email=email)
                update_last_login(user)
                return Response(gen_jwt_tokens_for_user(user))
            except User.DoesNotExist:
                user = create_user_from_google(name, email)
                return Response(gen_jwt_tokens_for_user(user))
        except Exception as e:
            return Response(
                {"detail": 'Failed on Google request: ' + str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def current_user(request):
    try:
        user = request.user
        update_last_login(user)
        serializer = ProfileSerializer(user.profile)
        return JsonResponse({"success": True, "response": serializer.data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})

@api_view(['POST'])
def update_user(request, user_id):
    try:
        if request.user.id != int(user_id) and request.user.profile.admin == False:
            return Response(
                {"detail": "You do not have permission to perform this action."},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        with transaction.atomic():
            post_data = request.data
            user_serializer = UserSerializer(user, data=post_data, partial=True)
            user_serializer.is_valid(raise_exception=True)
            user_serializer.save()

            if 'old_password' in post_data:
                password_serializer = ChangePasswordSerializer(data=post_data, context={'request': request})
                password_serializer.is_valid(raise_exception=True)
                user.set_password(post_data['new_password'])
                user.save()

            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# ----------------------------------------------------------------------
# Game Actions

@api_view(['GET'])
@permission_classes([AllowAny])
def start_game(request, faction_id, commander_id):
    try:
        # Use authenticated profile when available; otherwise use shared guest profile
        user_profile = None
        try:
            if request.user and request.user.is_authenticated:
                user_profile = Profile.objects.get(user=request.user)
        except Exception:
            user_profile = None
        if user_profile is None:
            user_profile = get_guest_profile()
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

        # Only track per-user stats for authenticated users
        if request.user and request.user.is_authenticated:
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
@permission_classes([AllowAny])
def end_round(request, game_id):
    try:
        if request.user and request.user.is_authenticated:
            game_search = Game.objects.filter(id=game_id, owner=request.user.profile)
        else:
            game_search = Game.objects.filter(id=game_id)
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
@permission_classes([AllowAny])
def end_game(request, game_id):
    try:
        if request.user and request.user.is_authenticated:
            game_search = Game.objects.filter(id=game_id, owner=request.user.profile)
        else:
            game_search = Game.objects.filter(id=game_id)
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
    
# ----------------------------------------------------------------------
# Keyword Search endpoints removed.
    
@api_view(['GET'])
def request_tester(request):
    try:
        user_profile = Profile.objects.get(user=request.user)
        user_profile.tester = not user_profile.tester
        user_profile.save()
        return Response(
            {"detail": "Successfully updated tester status."},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['GET'])
def get_all_users_short(request):
    try:
        all_profiles = Profile.objects.exclude(user__username='admin')
        serializer = ShortProfileSerializer(all_profiles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
