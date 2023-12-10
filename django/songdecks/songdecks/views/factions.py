from rest_framework.decorators import api_view
from django.http import JsonResponse
from songdecks.serializers import (FactionSerializer)
from songdecks.models import (Faction)

# ----------------------------------------------------------------------
# Faction Content

@api_view(['GET'])
def get_factions(request):
    try:
        factions = Faction.objects.all()
        serializer = FactionSerializer(factions, many=True)
        return JsonResponse({"success": True, "response": serializer.data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})

@api_view(['POST'])
def add_edit_faction(request, faction_id=None):
    try:
        neutral_str = request.data.get('neutral', 'false')
        converted_neutral = True if neutral_str.lower() == 'true' else False
        info = {
            'name': request.data.get('name', None),
            'img_url': request.data.get('img_url', None),
            'neutral': converted_neutral
        }
        for key in info:
            if info[key] is None:
                return JsonResponse({"success": False, "response": f"Missing {key}."})
        if faction_id is None:
            faction = Faction.objects.create(
                name=info['name'],
                img_url=info['img_url'],
                neutral=info['neutral']
            )
        else:
            faction = Faction.objects.filter(id=faction_id)
            if faction.count() == 0:
                return JsonResponse({"success": False, "response": "Faction not found."})
            faction = faction.first()
            faction.name = info['name']
            faction.img_url = info['img_url']
            faction.neutral = info['neutral']
            faction.save()

        new_faction = Faction.objects.filter(id=faction.id).first()
        message = f"Successfully created: {new_faction.name}" if faction_id is None else f"Successfully edited: {new_faction.name}"
        return JsonResponse({"success": True, "response": message, "faction": FactionSerializer(new_faction).data})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})
    
@api_view(['GET'])
def delete_faction(request, faction_id):
    try:
        faction_search = Faction.objects.filter(id=faction_id)
        if faction_search.count() == 0:
            return JsonResponse({"success": False, "response": "Faction not found."})
        faction = faction_search.first()
        faction.delete()
        return JsonResponse({"success": True, "response": "Successfully deleted faction."})
    except Exception as e:
        return JsonResponse({"success": False, "response": str(e)})