from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from songdecks.serializers import (FactionSerializer)
from songdecks.models import (Faction)
from songdecks.views.helpers import upload_file_to_s3
from songdecks.settings import AWS_S3_BUCKET_NAME

# ----------------------------------------------------------------------
# Faction Content

@api_view(['GET'])
def get_factions(request):
    try:
        factions = Faction.objects.all()
        serializer = FactionSerializer(factions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def add_edit_faction(request, faction_id=None):
    try:
        if request.user.profile.moderator == False:
            return Response(
                {"detail": "You do not have permission to delete keywords."},
                status=status.HTTP_403_FORBIDDEN
            )
        neutral_str = request.data.get('neutral', 'false')
        converted_neutral = True if neutral_str.lower() == 'true' else False
        info = {
            'name': request.data.get('name', None),
            'img_url': request.data.get('img_url', None),
            'neutral': converted_neutral
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

        if faction_id is None:
            faction = Faction.objects.create(
                name=info['name'],
                img_url=info['img_url'],
                neutral=info['neutral']
            )
        else:
            faction = Faction.objects.filter(id=faction_id)
            if faction.count() == 0:
                return Response(
                    {"detail": "Faction not found."},
                    status=status.HTTP_404_NOT_FOUND
                )
            faction = faction.first()
            faction.name = info['name']
            faction.img_url = info['img_url']
            faction.neutral = info['neutral']
            faction.save()

        new_faction = Faction.objects.filter(id=faction.id).first()
        serializer = FactionSerializer(new_faction)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['DELETE'])
def delete_faction(request, faction_id):
    try:
        if request.user.profile.moderator == False:
            return Response(
                {"detail": "You do not have permission to delete keywords."},
                status=status.HTTP_403_FORBIDDEN
            )
        faction_search = Faction.objects.filter(id=faction_id)
        if faction_search.count() == 0:
            return Response(
                {"detail": "Faction not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        faction = faction_search.first()
        faction.delete()
        return Response(
            {"detail": f"Successfully deleted: {faction.name}"},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )