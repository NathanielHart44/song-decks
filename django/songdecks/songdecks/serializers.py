from rest_framework import serializers
from django.contrib.auth.models import User
from songdecks.models import *
from songdecks.views.helpers import check_inappropriate_language
import logging
from django.db import transaction
import logging

logger = logging.getLogger(__name__)

# ----------------------------------------------------------------------

logging.basicConfig(level=logging.INFO)

# ----------------------------------------------------------------------

class UserSerializer(serializers.ModelSerializer):
    moderator = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'profile', 'moderator')

    def get_moderator(self, obj):
        try:
            return obj.profile.moderator
        except Profile.DoesNotExist or AttributeError:
            return False

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = ('id', 'user')
        depth = 2

class FactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Faction
        fields = ('id', 'name', 'img_url', 'neutral')
        depth = 1

class CommanderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commander
        fields = ('id', 'name', 'img_url', 'faction')
        depth = 1

class CardTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CardTemplate
        fields = ('id', 'card_name', 'img_url', 'faction', 'commander', 'game_count', 'play_count', 'discard_count', 'replaces')
        depth = 1

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ('id', 'owner', 'faction', 'commander', 'status', 'created_at', 'updated_at', 'round')
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

class TagSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    use_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Tag
        fields = ('id', 'name', 'use_count', 'created_at')

    def __init__(self, *args, **kwargs):
        super(TagSerializer, self).__init__(*args, **kwargs)
        if 'context' in kwargs:
            if kwargs['context']['request'].method in ['POST']:
                self.fields.pop('created_at', None)

    def validate_name(self, value):
        # Check if a tag with the same name exists, excluding the current instance.
        if Tag.objects.filter(name=value).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError("A tag with this name already exists.")
        return value

    def get_use_count(self, obj):
        try:
            return obj.tasks.count()
        except AttributeError:
            return -1

class ProposalSerializer(serializers.ModelSerializer):
    creator = ProfileSerializer(read_only=True)

    class Meta:
        model = Proposal
        fields = '__all__'
        read_only_fields = ('created_at', 'creator')

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['creator'] = user.profile
        return super(ProposalSerializer, self).create(validated_data)

    def validate_text(self, value):
        min_length = 10
        if len(value) < min_length:
            raise serializers.ValidationError(f"The text must be at least {min_length} characters long.")

        contains_inappropriate_language = check_inappropriate_language(value)
        if contains_inappropriate_language:
            raise serializers.ValidationError("The text contains inappropriate language.")

        return value

    def validate_status(self, value):
        if value not in ['pending', 'rejected', 'closed', 'confirmed']:
            raise serializers.ValidationError("The status must be one of the following: 'pending', 'rejected', 'closed', 'confirmed'.")
        return value

class ProposalImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProposalImage
        fields = '__all__'

class TaskSerializer(serializers.ModelSerializer):
    assigned_admins = ProfileSerializer(many=True, read_only=True)
    assigned_admin_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        write_only=True, 
        queryset=Profile.objects.all().filter(moderator=True), 
        required=False
    )
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=Tag.objects.all(),
        required=False
    )
    dependencies_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=Task.objects.all(),
        required=False
    )

    class Meta:
        model = Task
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super(TaskSerializer, self).__init__(*args, **kwargs)
        self.limit_fields_for_non_moderators(kwargs)

    def limit_fields_for_non_moderators(self, kwargs):
        request = kwargs.get('context', {}).get('request', None)
        if request and not request.user.profile.moderator:
            allowed_fields = ('id', 'title', 'description', 'state', 'created_at', 'tags')
            for field_name in list(self.fields):
                if field_name not in allowed_fields:
                    self.fields.pop(field_name)

    def validate_complexity(self, value):
        if value is not None and (value < 1 or value > 3):
            raise serializers.ValidationError("Complexity must be between 1 and 3.")
        return value
    
    def validate_priority(self, value):
        if value is not None and (value < 1 or value > 3):
            raise serializers.ValidationError("Priority must be between 1 and 3.")
        return value

    def validate(self, data):
        # Check for circular dependencies
        if 'dependencies_ids' in data:
            dependencies = Task.objects.filter(pk__in=data['dependencies_ids'])
            for dependency in dependencies:
                if self.instance and self.instance.check_for_circular_dependency(self.instance, dependency):
                    raise serializers.ValidationError("Circular dependency detected.")
        return data

    @transaction.atomic
    def create(self, validated_data):
        return self._save_task(validated_data)

    @transaction.atomic
    def update(self, instance, validated_data):
        return self._save_task(validated_data, instance)

    def _set_m2m_fields(self, task, m2m_field_data):
        for field_name, objs in m2m_field_data.items():
            if objs is not None:
                getattr(task, field_name).set(objs)

    def _save_task(self, validated_data, instance=None):
        m2m_fields = {
            'tags': validated_data.pop('tag_ids', []),
            'dependencies': validated_data.pop('dependencies_ids', []),
            'assigned_admins': validated_data.pop('assigned_admin_ids', [])
        }
        validated_data.pop('dependencies', [])

        if instance:
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            task = instance
        else:
            task = Task.objects.create(**validated_data)

        self._set_m2m_fields(task, m2m_fields)
        
        return task