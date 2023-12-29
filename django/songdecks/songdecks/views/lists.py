from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from songdecks.serializers import ListSerializer  # Ensure you have this serializer
from songdecks.models import Profile, List, Unit, NCU, Faction, Commander
from django.shortcuts import get_object_or_404

# ----------------------------------------------------------------------
# List Content

@api_view(['GET'])
def get_lists(request):
    try:
        lists = List.objects.all()
        serializer = ListSerializer(lists, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def add_edit_list(request, list_id=None):
    try:
        profile = get_object_or_404(Profile, user=request.user)

        info = {
            'name': request.data.get('name'),
            'points_allowed': request.data.get('points_allowed'),
            'faction_id': request.data.get('faction_id'),
            'commander_id': request.data.get('commander_id'),
            'unit_ids': request.data.getlist('unit_ids'),  # List of unit IDs
            'ncu_ids': request.data.getlist('ncu_ids'),    # List of NCU IDs
            'is_draft': request.data.get('is_draft', False),
            'is_public': request.data.get('is_public', False),
            'is_valid': request.data.get('is_valid', False)
        }

        # Validate required fields
        for key, value in info.items():
            if value is None and key not in ['unit_ids', 'ncu_ids']:  # Units and NCUs are optional
                return Response({"detail": f"Missing {key}"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if faction and commander exists
        faction = get_object_or_404(Faction, id=info['faction_id'])
        commander = get_object_or_404(Commander, id=info['commander_id'])

        # Create or update List
        if list_id is None:
            list_instance = List.objects.create(
                name=info['name'],
                owner=profile,
                points_allowed=info['points_allowed'],
                faction=faction,
                commander=commander,
                is_draft=info['is_draft'],
                is_public=info['is_public'],
                is_valid=info['is_valid']
            )
        else:
            list_instance = get_object_or_404(List, id=list_id, owner=profile)
            list_instance.name = info['name']
            list_instance.points_allowed = info['points_allowed']
            list_instance.faction = faction
            list_instance.commander = commander
            list_instance.is_draft = info['is_draft']
            list_instance.is_public = info['is_public']
            list_instance.is_valid = info['is_valid']
            list_instance.save()

        # Handle units and NCUs
        if info['unit_ids']:
            units = Unit.objects.filter(id__in=info['unit_ids'])
            list_instance.units.set(units)
        if info['ncu_ids']:
            ncus = NCU.objects.filter(id__in=info['ncu_ids'])
            list_instance.ncus.set(ncus)

        serializer = ListSerializer(list_instance)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
def delete_list(request, list_id):
    try:
        profile = get_object_or_404(Profile, user=request.user)
        list_instance = get_object_or_404(List, id=list_id, owner=profile)

        list_instance.delete()
        return Response({"detail": "Successfully deleted list."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)