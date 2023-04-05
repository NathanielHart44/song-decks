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