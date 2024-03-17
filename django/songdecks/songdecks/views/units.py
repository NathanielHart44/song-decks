from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from songdecks.serializers import UnitSerializer  # Ensure you have this serializer
from songdecks.models import Commander, Faction, Unit
from songdecks.views.helpers import upload_file_to_s3, valid_for_neutrals
from songdecks.settings import AWS_S3_BUCKET_NAME

# ----------------------------------------------------------------------
# Unit Content

@api_view(['GET'])
def get_units(request, faction_id=None):
    try:
        if faction_id:
            faction = Faction.objects.filter(id=faction_id).first()
            if not faction:
                return Response({"detail": "Faction not found."}, status=status.HTTP_400_BAD_REQUEST)
            if valid_for_neutrals(faction):
                neutral_faction = Faction.objects.filter(neutral=True).first()
                if neutral_faction == faction:
                    units = Unit.objects.filter(faction_id=faction_id)
                else:
                    faction_units = Unit.objects.filter(faction_id=faction_id)
                    neutral_units = Unit.objects.filter(faction_id=neutral_faction.id)
                    units = neutral_units | faction_units
            else:
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
            'status': request.data.get('status'),
            'attached_commander': request.data.get('attached_commander'),  # 'None' or 'commander_id'
            'max_in_list': request.data.get('max_in_list'),
            'unit_type': request.data.get('unit_type'),
            'img_url': request.data.get('img_url'),
            'main_url': request.data.get('main_url'),
            'is_adaptive': request.data.get('is_adaptive') == 'true',
            'faction_id': request.data.get('faction_id'),
        }

        # Validate required fields
        for key, value in info.items():
            if key == 'max_in_list':
                continue
            if key == 'attached_commander':
                continue
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

        # Create or update Unit
        if unit_id is None:
            unit = Unit.objects.create(
                name=info['name'],
                points_cost=info['points_cost'],
                status=info['status'],
                unit_type=info['unit_type'],
                img_url=info['img_url'],
                main_url=info['main_url'],
                is_adaptive=info['is_adaptive'],
                faction=faction
            )
            if info['max_in_list'] is not None:
                unit.max_in_list = info['max_in_list']
            if info['attached_commander'] is not None:
                unit.attached_commander_id = info['attached_commander']
        else:
            unit = Unit.objects.filter(id=unit_id).first()
            if not unit:
                return Response({"detail": "Unit not found."}, status=status.HTTP_404_NOT_FOUND)
            unit.name = info['name']
            unit.points_cost = info['points_cost']
            unit.status = info['status']
            if info['max_in_list'] is not None:
                unit.max_in_list = info['max_in_list']
            if info['attached_commander'] is not None:
                attached_commander = Commander.objects.filter(id=info['attached_commander']).first()
                if not attached_commander:
                    return Response({"detail": "Commander not found."}, status=status.HTTP_404_NOT_FOUND)
                unit.attached_commander = attached_commander
            unit.unit_type = info['unit_type']
            unit.img_url = info['img_url']
            unit.main_url = info['main_url']
            unit.is_adaptive = info['is_adaptive']
            unit.faction = faction
        unit.save()

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