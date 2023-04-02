from rest_framework.response import Response

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from songdecks.serializers import UserSerializer
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password

@api_view(['GET'])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    post_data = request.data
    request.user = User.objects.filter(username='admin').first()
    same_email_users = User.objects.filter(email=post_data['email'])
    if len(same_email_users) > 0:
        return Response("EMAIL")
    same_username_users = User.objects.filter(username=post_data['username'])
    if len(same_username_users) > 0:
        return Response("USERNAME")
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
        return Response(serializer.data)
    except Exception as e:
        return Response(e)