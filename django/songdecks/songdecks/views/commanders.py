from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from songdecks.serializers import (CommanderSerializer)
from songdecks.models import (Faction, Commander)
from songdecks.views.helpers import upload_file_to_s3
from songdecks.settings import AWS_S3_BUCKET_NAME

# ----------------------------------------------------------------------
# Commander Content

@api_view(['GET'])
def get_commanders(request):
    try:
        commanders = Commander.objects.all()
        serializer = CommanderSerializer(commanders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def add_edit_commander(request, commander_id=None):
    try:
        if request.user.profile.moderator == False:
            return Response(
                {"detail": "You do not have permission to delete commanders."},
                status=status.HTTP_403_FORBIDDEN
            )
        info = {
            'name': request.data.get('name', None),
            'img_url': request.data.get('img_url', None),
            'faction_id': request.data.get('faction_id', None),
        }
        for key in info:
            if info[key] is None:
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
        if commander_id is None:
            commander = Commander.objects.create(
                name=info['name'],
                img_url=info['img_url'],
                faction=faction_search.first(),
            )
        else:
            commander = Commander.objects.filter(id=commander_id)
            if commander.count() == 0:
                return Response(
                    {"detail": "Commander not found."},
                    status=status.HTTP_404_NOT_FOUND
                )
            commander = commander.first()
            commander.name = info['name']
            commander.img_url = info['img_url']
            commander.faction = faction_search.first()
            commander.save()

        new_commander = Commander.objects.filter(id=commander.id).first()
        serializer = CommanderSerializer(new_commander)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['DELETE'])
def delete_commander(request, commander_id):
    try:
        if request.user.profile.moderator == False:
            return Response(
                {"detail": "You do not have permission to delete commanders."},
                status=status.HTTP_403_FORBIDDEN
            )
        commander_search = Commander.objects.filter(id=commander_id)
        if commander_search.count() == 0:
            return Response(
                {"detail": "Commander not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        commander = commander_search.first()
        commander.delete()
        return Response(
            {"detail": f"Successfully deleted: {commander.name}"},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )