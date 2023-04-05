from rest_framework.response import Response

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.http import JsonResponse
from songdecks.serializers import UserSerializer
from django.contrib.auth.models import User
from songdecks.models import Profile, Faction, Commander, CardTemplate, Game, PlayerCard, UserCardStats
from django.contrib.auth.hashers import make_password

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
        new_user.password = make_password((post_data['password']))
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