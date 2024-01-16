from django.contrib import admin
from songdecks.models import (Profile, Game, Faction, Commander,
    CardTemplate, PlayerCard, UserCardStats, Tag, Proposal, ProposalImage,
    Task, SubTask, KeywordPair, KeywordType, List, Unit, NCU, Attachment)

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

class TagAdmin(admin.ModelAdmin):
    list_display = [f.name for f in Tag._meta.fields]

class ProposalAdmin(admin.ModelAdmin):
    list_display = [f.name for f in Proposal._meta.fields]

class ProposalImageAdmin(admin.ModelAdmin):
    list_display = [f.name for f in ProposalImage._meta.fields]

class TaskAdmin(admin.ModelAdmin):
    list_display = [f.name for f in Task._meta.fields]

class SubTaskAdmin(admin.ModelAdmin):
    list_display = [f.name for f in SubTask._meta.fields]

class KeywordPairAdmin(admin.ModelAdmin):
    list_display = [f.name for f in KeywordPair._meta.fields]

class KeywordTypeAdmin(admin.ModelAdmin):
    list_display = [f.name for f in KeywordType._meta.fields]

class ListAdmin(admin.ModelAdmin):
    list_display = [f.name for f in List._meta.fields]

class UnitAdmin(admin.ModelAdmin):
    list_display = [f.name for f in Unit._meta.fields]

class NCUAdmin(admin.ModelAdmin):
    list_display = [f.name for f in NCU._meta.fields]

class AttachmentAdmin(admin.ModelAdmin):
    list_display = [f.name for f in Attachment._meta.fields]

admin.site.register(Profile, ProfileAdmin)
admin.site.register(Game, GameAdmin)
admin.site.register(Faction, FactionAdmin)
admin.site.register(Commander, CommanderAdmin)
admin.site.register(CardTemplate, CardTemplateAdmin)
admin.site.register(PlayerCard, PlayerCardAdmin)
admin.site.register(UserCardStats, UserCardStatsAdmin)
admin.site.register(Tag, TagAdmin)
admin.site.register(Proposal, ProposalAdmin)
admin.site.register(ProposalImage, ProposalImageAdmin)
admin.site.register(Task, TaskAdmin)
admin.site.register(SubTask, SubTaskAdmin)
admin.site.register(KeywordPair, KeywordPairAdmin)
admin.site.register(KeywordType, KeywordTypeAdmin)
admin.site.register(List, ListAdmin)
admin.site.register(Unit, UnitAdmin)
admin.site.register(NCU, NCUAdmin)
admin.site.register(Attachment, AttachmentAdmin)