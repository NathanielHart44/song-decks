from songdecks.settings import (EMAIL_HOST_USER, REACT_APP_GOOGLE_CLIENT_ID,
    REACT_APP_GOOGLE_CLIENT_SECRET, REACT_APP_URI_REDIRECT)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.http import JsonResponse, HttpResponse
from rest_framework.response import Response
from songdecks.serializers import (PlayerCardSerializer,
    UserSerializer, UserCardStatsSerializer, GameSerializer,
    ChangePasswordSerializer, KeywordPairSerializer)
from django.contrib.auth.models import User
from songdecks.models import (Profile, Faction, Commander, CardTemplate,
    Game, PlayerCard, UserCardStats, KeywordPair)
from songdecks.views.helpers import (handle_card_updates, send_email_notification,
    update_last_login, gen_jwt_tokens_for_user, create_user_from_google)
import requests
from django.utils import timezone
from rest_framework import status
from django.db import transaction

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

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
        serializer = UserSerializer(user)
        return JsonResponse({"success": True, "response": serializer.data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})

@api_view(['POST'])
def update_user(request, user_id):
    try:
        if request.user.id != int(user_id) or request.user.profile.admin == False:
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
    
# ----------------------------------------------------------------------
# Keyword Search
    
@api_view(['GET'])
def get_keyword_pairs(request):
    try:
        keyword_pairs = KeywordPair.objects.all()
        serializer = KeywordPairSerializer(keyword_pairs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def create_keyword_pair(request):
    try:
        if request.user.profile.moderator == False:
            return Response(
                {"detail": "You do not have permission to create keywords."},
                status=status.HTTP_403_FORBIDDEN
            )
        post_data = request.data
        serializer = KeywordPairSerializer(data=post_data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['POST'])
def edit_keyword_pair(request, keyword_pair_id):
    try:
        if request.user.profile.moderator == False:
            return Response(
                {"detail": "You do not have permission to edit keywords."},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            keyword_pair = KeywordPair.objects.get(id=keyword_pair_id)
        except KeywordPair.DoesNotExist:
            return Response(
                {"detail": "Keyword pair not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        post_data = request.data
        serializer = KeywordPairSerializer(keyword_pair, data=post_data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
# delete keyword pair
@api_view(['DELETE'])
def delete_keyword_pair(request, keyword_pair_id):
    try:
        if request.user.profile.moderator == False:
            return Response(
                {"detail": "You do not have permission to delete keywords."},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            keyword_pair = KeywordPair.objects.get(id=keyword_pair_id)
        except KeywordPair.DoesNotExist:
            return Response(
                {"detail": "Keyword pair not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        keyword_pair.delete()
        return Response(
            {"detail": "Keyword pair deleted."},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )