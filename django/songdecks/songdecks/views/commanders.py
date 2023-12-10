from rest_framework.decorators import api_view
from django.http import JsonResponse
from songdecks.serializers import (CommanderSerializer)
from songdecks.models import (Faction, Commander)

# ----------------------------------------------------------------------
# Commander Content

@api_view(['GET'])
def get_commanders(request):
    try:
        commanders = Commander.objects.all()
        serializer = CommanderSerializer(commanders, many=True)
        return JsonResponse({"success": True, "response": serializer.data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})

@api_view(['POST'])
def add_edit_commander(request, commander_id=None):
    try:
        info = {
            'name': request.data.get('name', None),
            'img_url': request.data.get('img_url', None),
            'faction_id': request.data.get('faction_id', None),
        }
        for key in info:
            if info[key] is None:
                return JsonResponse({"success": False, "response": f"Missing {key}."})
        faction_search = Faction.objects.filter(id=info['faction_id'])
        if faction_search.count() == 0:
            return JsonResponse({"success": False, "response": "Faction not found."})
        if commander_id is None:
            commander = Commander.objects.create(
                name=info['name'],
                img_url=info['img_url'],
                faction=faction_search.first(),
            )
        else:
            commander = Commander.objects.filter(id=commander_id)
            if commander.count() == 0:
                return JsonResponse({"success": False, "response": "Commander not found."})
            commander = commander.first()
            commander.name = info['name']
            commander.img_url = info['img_url']
            commander.faction = faction_search.first()
            commander.save()

        new_commander = Commander.objects.filter(id=commander.id).first()
        message = f"Successfully created: {new_commander.name}" if commander_id is None else f"Successfully edited: {new_commander.name}"
        return JsonResponse({"success": True, "response": message, "commander": CommanderSerializer(new_commander).data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})
    
@api_view(['GET'])
def delete_commander(request, commander_id):
    try:
        commander_search = Commander.objects.filter(id=commander_id)
        if commander_search.count() == 0:
            return JsonResponse({"success": False, "response": "Commander not found."})
        commander = commander_search.first()
        commander.delete()
        return JsonResponse({"success": True, "response": "Successfully deleted commander."})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})