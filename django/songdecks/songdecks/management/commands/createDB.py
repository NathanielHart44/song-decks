import json
from django.core.management.base import BaseCommand
from songdecks.models import Faction, Commander, CardTemplate

class Command(BaseCommand):
    def handle(self, *args, **options):
        with open('songdecks/songdecks/data/setup.json') as f:
            all_info = f.read()
        for faction in json.loads(all_info):
            faction_obj, created = Faction.objects.get_or_create(
                name=faction['faction'],
                img_url=faction['img_url'],
            )
            for card in faction['cards']:
                CardTemplate.objects.get_or_create(
                    card_name=card['name'],
                    img_url=card['img_url'],
                    faction=faction_obj,
                    commander=None,
                    defaults={
                        'game_count': 0,
                        'play_count': 0,
                        'discard_count': 0,
                    }
                )
            for commander in faction['commanders']:
                commander_obj, created = Commander.objects.get_or_create(
                    name=commander['name'],
                    img_url=commander['img_url'],
                    faction=faction_obj,
                )
                for card in commander['cards']:
                    CardTemplate.objects.get_or_create(
                        card_name=card['name'],
                        img_url=card['img_url'],
                        faction=faction_obj,
                        commander=commander_obj,
                        defaults={
                            'game_count': 0,
                            'play_count': 0,
                            'discard_count': 0,
                        }
                    )