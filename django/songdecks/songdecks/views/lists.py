from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from songdecks.serializers import ListSerializer
from songdecks.models import (
    Profile, List, ListUnit, Unit, ListNCU, NCU, Faction, Commander, Attachment
)
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.core.exceptions import ValidationError
import logging
import json

# ----------------------------------------------------------------------

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# ----------------------------------------------------------------------
# List Content

@api_view(['GET'])
def get_lists(request, user_id=None):
    try:
        if user_id:
            lists = List.objects.filter(owner__user__id=user_id)
        else:
            lists = List.objects.all()
        serializer = ListSerializer(lists, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def add_edit_list(request, list_id=None):
    try:
        with transaction.atomic():
            profile = get_object_or_404(Profile, user=request.user)

            info = {
                'name': request.data.get('name'),
                'points_allowed': request.data.get('points_allowed'),
                'faction_id': request.data.get('faction_id'),
                'commander_id': request.data.get('commander_id'),
                'units': request.data.get('units'),            # List of units and their attachments
                'ncu_ids': request.data.get('ncu_ids', []),    # List of NCU IDs
                'is_draft': request.data.get('is_draft', False),
                'is_public': request.data.get('is_public', False),
                'is_valid': request.data.get('is_valid', False)
            }

            # Validate required fields
            for key, value in info.items():
                if key == 'units':
                    try:
                        if value:
                            info[key] = json.loads(value)
                    except:
                        continue
                if value is None and key not in ['units', 'ncu_ids']:  # Units and NCUs are optional
                    return Response({"detail": f"Missing {key}"}, status=status.HTTP_400_BAD_REQUEST)
                if key in ['is_draft', 'is_public', 'is_valid']:
                    if value == 'true':
                        info[key] = True
                    elif value == 'false':
                        info[key] = False

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
            list_instance.save()

            if info['units']:
                ListUnit.objects.filter(list=list_instance).delete()
                attached_commander = None
                for unit_info in info['units']:
                    unit_instance = get_object_or_404(Unit, id=unit_info['id'])
                    list_unit = ListUnit.objects.create(
                        list=list_instance,
                        unit=unit_instance,
                    )
                    if unit_instance.is_commander:
                        if attached_commander:
                            raise ValidationError("Multiple commanders assigned to the list.")
                        attached_commander = unit_instance
                    if unit_info['attachments']:
                        logging.info(f"Unit {unit_instance.name} has attachments.")
                        attachments = Attachment.objects.filter(id__in=unit_info['attachments'])
                        logging.info(f"Attachments: {attachments}")
                        if 'commander' in [attachment.attachment_type for attachment in attachments]:
                            if attached_commander:
                                raise ValidationError("Multiple commanders assigned to the list.")
                            attached_commander = attachments.filter(attachment_type='commander').first()
                        list_unit.attachments.set(attachments)
                    list_unit.save()
                    logging.info(f'Attachments set for {list_unit.unit.name}: {[attachment.name for attachment in list_unit.attachments.all()]}')

                if attached_commander is None:
                    raise ValidationError(f"Commander is not attached. {attached_commander}")
                
                if commander.commander_type == 'attachment':
                    commander_attachment = Attachment.objects.filter(attachment_type='commander', name=attached_commander.name).first()
                    if commander_attachment is None:
                        all_attachments = Attachment.objects.filter(attachment_type='commander')
                        all_attachments_names = [attachment.name for attachment in all_attachments]

                        raise ValidationError(f"Commander's Attachment not found. ({attached_commander.name}) - ({all_attachments_names})")
                    if attached_commander.id != commander_attachment.id:
                        raise ValidationError(f"Commander does not match the selected Commander. {attached_commander.id} != {commander_attachment.id}")

            # Handle NCUs
            if info['ncu_ids']:
                ListNCU.objects.filter(list=list_instance).delete()
                info['ncu_ids'] = json.loads(info['ncu_ids'])
                for ncu_id in info['ncu_ids']:
                    ncu_instance = get_object_or_404(NCU, id=ncu_id)
                    ListNCU.objects.create(
                        list=list_instance,
                        ncu=ncu_instance
                    )

            serializer = ListSerializer(list_instance)
            return Response(serializer.data, status=status.HTTP_200_OK)
    except ValidationError as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
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