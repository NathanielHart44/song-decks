def create_faction_and_commander():
    faction = Faction(
        name="Baratheon",
        img_url="https://asoiaf-stats.com/Images/General/Baratheon.png",
    )
    faction.save()
    commander = Commander(
        name="Stannis Baratheon - The One True King",
        img_url="https://asoiaf-stats.com/Images/2021/20605p.jpg",
        faction=faction,
    )
    commander.save()

class CardTemplate(models.Model):
    card_name = models.CharField(max_length=100)
    img_url = models.URLField(max_length=500)
    faction = models.ForeignKey(Faction, null=True, blank=True, on_delete=models.CASCADE)
    commander = models.ForeignKey(Commander, null=True, blank=True, on_delete=models.CASCADE)
    game_count = models.PositiveIntegerField()
    play_count = models.PositiveIntegerField()
    discard_count = models.PositiveIntegerField()

stannis_cards = [
    {
        "name": "In R'hllor's Name",
        "img_url": "https://asoiaf-stats.com/Images/2021/40626.jpg",
        "faction": Faction.objects.get(name="Baratheon"),
        "commander": Commander.objects.get(name="Stannis Baratheon - The One True King")
    },
    {
        "name": "Test Of Faith",
        "img_url": "https://asoiaf-stats.com/Images/2021/40627.jpg",
        "faction": Faction.objects.get(name="Baratheon"),
        "commander": Commander.objects.get(name="Stannis Baratheon - The One True King")
    },
    {
        "name": "Azor Ahai!",
        "img_url": "https://asoiaf-stats.com/Images/2021/40628.jpg",
        "faction": Faction.objects.get(name="Baratheon"),
        "commander": Commander.objects.get(name="Stannis Baratheon - The One True King")
    },
]

baratheon_cards = [
    {
        "name": "Baratheon Justice",
        "img_url": "https://asoiaf-stats.com/Images/2021/40601.jpg",
        "faction": Faction.objects.get(name="Baratheon"),
        "commander": None
    },
    {
        "name": "Stag's Wit",
        "img_url": "https://asoiaf-stats.com/Images/2021/40602.jpg",
        "faction": Faction.objects.get(name="Baratheon"),
        "commander": None
    },
    {
        "name": "Ours Is The Fury!",
        "img_url": "https://asoiaf-stats.com/Images/2021/40603.jpg",
        "faction": Faction.objects.get(name="Baratheon"),
        "commander": None
    },
    {
        "name": "Sustained Assault",
        "img_url": "https://asoiaf-stats.com/Images/2021/40604.jpg",
        "faction": Faction.objects.get(name="Baratheon"),
        "commander": None
    },
    {
        "name": "Baratheon Conviction",
        "img_url": "https://asoiaf-stats.com/Images/2021/40605.jpg",
        "faction": Faction.objects.get(name="Baratheon"),
        "commander": None
    },
    {
        "name": "Final Strike",
        "img_url": "https://asoiaf-stats.com/Images/2021/40606.jpg",
        "faction": Faction.objects.get(name="Baratheon"),
        "commander": None
    },
    {
        "name": "Oath Of Duty",
        "img_url": "https://asoiaf-stats.com/Images/2021/40601.jpg",
        "faction": Faction.objects.get(name="Baratheon"),
        "commander": None
    },    
]

for card in baratheon_cards:
    if not CardTemplate.objects.filter(card_name=card["name"]).exists():
        create_card_template(
            name=card["name"],
            img_url=card["img_url"],
            faction=card["faction"],
            commander=card["commander"],
        )

def create_card_template(name, img_url, faction, commander):
    card_template = CardTemplate(
        card_name=name,
        img_url=img_url,
        faction=faction,
        commander=commander,
        game_count=0,
        play_count=0,
        discard_count=0,
    )
    card_template.save()

templates = CardTemplate.objects.all()