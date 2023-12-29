from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from songdecks.serializers import NcuSerializer
from songdecks.models import Faction, NCU
from songdecks.views.helpers import upload_file_to_s3
from songdecks.settings import AWS_S3_BUCKET_NAME

# ----------------------------------------------------------------------
# NCU Content

@api_view(['GET'])
def get_ncus(request):
    try:
        ncus = NCU.objects.all()
        serializer = NcuSerializer(ncus, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def add_edit_ncu(request, ncu_id=None):
    try:
        if not request.user.profile.moderator:
            return Response({"detail": "You do not have permission to edit NCUs."}, status=status.HTTP_403_FORBIDDEN)

        info = {
            'name': request.data.get('name'),
            'points_cost': request.data.get('points_cost'),
            'img_url': request.data.get('img_url'),
            'main_url': request.data.get('main_url'),
            'faction_id': request.data.get('faction_id'),
        }

        # Validate required fields
        for key, value in info.items():
            if value is None:
                return Response({"detail": f"Missing {key}"}, status=status.HTTP_400_BAD_REQUEST)

        # Handle image file upload
        img_file = request.data.get('img_file')
        if img_file:
            is_success, error_msg = upload_file_to_s3(img_file, AWS_S3_BUCKET_NAME, info['img_url'])
            if not is_success:
                return Response({"detail": error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Handle main file upload
        main_file = request.data.get('main_file')
        if main_file:
            is_success, error_msg = upload_file_to_s3(main_file, AWS_S3_BUCKET_NAME, info['main_url'])
            if not is_success:
                return Response({"detail": error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Check if faction exists
        faction = Faction.objects.filter(id=info['faction_id']).first()
        if not faction:
            return Response({"detail": "Faction not found."}, status=status.HTTP_400_BAD_REQUEST)

        # Create or update NCU
        if ncu_id is None:
            ncu = NCU.objects.create(
                name=info['name'],
                points_cost=info['points_cost'],
                img_url=info['img_url'],
                main_url=info['main_url'],
                faction=faction,
            )
        else:
            ncu = NCU.objects.filter(id=ncu_id).first()
            if not ncu:
                return Response({"detail": "NCU not found."}, status=status.HTTP_404_NOT_FOUND)
            ncu.name = info['name']
            ncu.points_cost = info['points_cost']
            ncu.img_url = info['img_url']
            ncu.main_url = info['main_url']
            ncu.faction = faction
            ncu.save()

        serializer = NcuSerializer(ncu)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
def delete_ncu(request, ncu_id):
    try:
        if not request.user.profile.moderator:
            return Response({"detail": "You do not have permission to delete NCUs."}, status=status.HTTP_403_FORBIDDEN)

        ncu = NCU.objects.filter(id=ncu_id).first()
        if not ncu:
            return Response({"detail": "NCU not found."}, status=status.HTTP_404_NOT_FOUND)
        
        ncu.delete()
        return Response({"detail": f"Successfully deleted: {ncu.name}"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)