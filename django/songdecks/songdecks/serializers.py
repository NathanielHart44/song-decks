from rest_framework import serializers
from django.contrib.auth.models import User
from songdecks.models import Profile, Faction, Commander, CardTemplate, Game, PlayerCard, UserCardStats

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('id', 'user')
        depth = 2

class FactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Faction
        fields = ('id', 'name', 'img_url')
        depth = 1

class CommanderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commander
        fields = ('id', 'name', 'img_url', 'faction')
        depth = 1

class CardTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CardTemplate
        fields = ('id', 'card_name', 'img_url', 'faction', 'commander', 'game_count', 'play_count', 'discard_count')
        depth = 1

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ('id', 'owner', 'faction', 'commander', 'status', 'created_at', 'updated_at')
        depth = 1

class PlayerCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlayerCard
        fields = ('id', 'game', 'card_template', 'owner', 'status', 'play_notes', 'drawn_this_round', 'discarded_this_round')
        depth = 1

class UserCardStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCardStats
        fields=('id', 'user', 'card_template', 'times_included', 'times_drawn', 'times_discarded')
        depth = 1