from django.contrib import admin
from .models import Profile, Game, Faction, Commander, CardTemplate, PlayerCard, UserCardStats

class ProfileAdmin(admin.ModelAdmin):
    list_display = [f.name for f in Profile._meta.fields]

class GameAdmin(admin.ModelAdmin):
    list_display = [f.name for f in Game._meta.fields]

class FactionAdmin(admin.ModelAdmin):
    list_display = [f.name for f in Faction._meta.fields]

class CommanderAdmin(admin.ModelAdmin):
    list_display = [f.name for f in Commander._meta.fields]

class CardTemplateAdmin(admin.ModelAdmin):
    list_display = [f.name for f in CardTemplate._meta.fields]

class PlayerCardAdmin(admin.ModelAdmin):
    list_display = [f.name for f in PlayerCard._meta.fields]

class UserCardStatsAdmin(admin.ModelAdmin):
    list_display = [f.name for f in UserCardStats._meta.fields]

admin.site.register(Profile, ProfileAdmin)
admin.site.register(Game, GameAdmin)
admin.site.register(Faction, FactionAdmin)
admin.site.register(Commander, CommanderAdmin)
admin.site.register(CardTemplate, CardTemplateAdmin)
admin.site.register(PlayerCard, PlayerCardAdmin)
admin.site.register(UserCardStats, UserCardStatsAdmin)