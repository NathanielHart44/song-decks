from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from songdecks.serializers import UnitSerializer  # Ensure you have this serializer
from songdecks.models import Faction, Unit, Attachment
from songdecks.views.helpers import upload_file_to_s3
from songdecks.settings import AWS_S3_BUCKET_NAME

# ----------------------------------------------------------------------
# Unit Content

@api_view(['GET'])
def get_units(request, faction_id=None):
    try:
        if faction_id:
            units = Unit.objects.filter(faction_id=faction_id)
        else:
            units = Unit.objects.all()
        serializer = UnitSerializer(units, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def add_edit_unit(request, unit_id=None):
    try:
        if not request.user.profile.moderator:
            return Response({"detail": "You do not have permission to edit units."}, status=status.HTTP_403_FORBIDDEN)

        info = {
            'name': request.data.get('name'),
            'points_cost': request.data.get('points_cost'),
            'is_commander': request.data.get('is_commander'),
            'unit_type': request.data.get('unit_type'),
            'img_url': request.data.get('img_url'),
            'main_url': request.data.get('main_url'),
            'faction_id': request.data.get('faction_id'),
            'attachment_ids': request.data.get('attachment_ids')  # List of attachment IDs
        }

        # Validate required fields
        for key, value in info.items():
            if value is None and key != 'attachment_ids':  # attachments are optional
                return Response({"detail": f"Missing {key}"}, status=status.HTTP_400_BAD_REQUEST)
            if key == 'is_commander':
                info[key] = True if value == 'true' else False

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

        # Create or update Unit
        if unit_id is None:
            unit = Unit.objects.create(
                name=info['name'],
                points_cost=info['points_cost'],
                is_commander=info['is_commander'],
                unit_type=info['unit_type'],
                img_url=info['img_url'],
                main_url=info['main_url'],
                faction=faction
            )
        else:
            unit = Unit.objects.filter(id=unit_id).first()
            if not unit:
                return Response({"detail": "Unit not found."}, status=status.HTTP_404_NOT_FOUND)
            unit.name = info['name']
            unit.points_cost = info['points_cost']
            unit.is_commander = info['is_commander']
            unit.unit_type = info['unit_type']
            unit.img_url = info['img_url']
            unit.main_url = info['main_url']
            unit.faction = faction
            unit.save()

        # Handle attachments
        if 'attachment_ids' in info and isinstance(info['attachment_ids'], list):
            attachments = Attachment.objects.filter(id__in=info['attachment_ids'])
            unit.attachments.set(attachments)

        serializer = UnitSerializer(unit)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
def delete_unit(request, unit_id):
    try:
        if not request.user.profile.moderator:
            return Response({"detail": "You do not have permission to delete units."}, status=status.HTTP_403_FORBIDDEN)

        unit = Unit.objects.filter(id=unit_id).first()
        if not unit:
            return Response({"detail": "Unit not found."}, status=status.HTTP_404_NOT_FOUND)
        
        unit.delete()
        return Response({"detail": f"Successfully deleted: {unit.name}"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)