from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
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

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')

class StatsUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'last_login')

class ShortProfileSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField(read_only=True)
    full_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Profile
        fields = ('id', 'username', 'full_name')

    def get_username(self, obj):
        return obj.user.username
    
    def get_full_name(self, obj):
        return obj.user.first_name + " " + obj.user.last_name

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = ('id', 'user', 'tester', 'moderator', 'admin')
        depth = 2

    def validate_admin(self, value):
        request_user = self.context['request'].user
        if not request_user.profile.admin:
            raise serializers.ValidationError("Only admins can change the admin status.")
        return value

    def validate_moderator(self, value):
        request_user = self.context['request'].user
        if not request_user.profile.admin:
            raise serializers.ValidationError("Only admins can change the moderator status.")
        return value

class StatsProfileSerializer(serializers.ModelSerializer):
    user = StatsUserSerializer(read_only=True)
    total_game_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Profile
        fields = ('id', 'user', 'tester', 'moderator', 'admin', 'session_count', 'total_game_count')
        depth = 2

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not check_password(value, user.password):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def validate_new_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "New passwords must match."})
        return data
    
# ----------------------------------------------------------------------

class FactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Faction
        fields = ('id', 'name', 'img_url', 'neutral', 'can_use_neutral')
        depth = 1

class CommanderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commander
        fields = ('id', 'name', 'img_url', 'faction', 'commander_type')
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

class SubTaskSerializer(serializers.ModelSerializer):
    assigned_admins = ProfileSerializer(many=True, read_only=True)
    assigned_admin_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        write_only=True, 
        queryset=Profile.objects.all().filter(moderator=True), 
        required=False
    )

    class Meta:
        model = SubTask
        fields = '__all__'

    def validate_complexity(self, value):
        if value is not None and (value < 1 or value > 3):
            raise serializers.ValidationError("Complexity must be between 1 and 3.")
        return value
    
    def validate_priority(self, value):
        if value is not None and (value < 1 or value > 3):
            raise serializers.ValidationError("Priority must be between 1 and 3.")
        return value

    def validate(self, data):
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
            'assigned_admins': validated_data.pop('assigned_admin_ids', [])
        }

        if instance:
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            task = instance
        else:
            task = SubTask.objects.create(**validated_data)

        self._set_m2m_fields(task, m2m_fields)
        
        return task

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
    favorited_by = ProfileSerializer(many=True, read_only=True)
    favorited_by_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=Profile.objects.all(),
        required=False
    )
    subtasks = SubTaskSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ('created_at', 'subtasks')

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
            'favorited_by': validated_data.pop('favorited_by_ids', []),
            'assigned_admins': validated_data.pop('assigned_admin_ids', [])
        }

        if instance:
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            task = instance
        else:
            task = Task.objects.create(**validated_data)

        self._set_m2m_fields(task, m2m_fields)
        
        return task
    
# ----------------------------------------------------------------------
# Keyword Search serializers removed.
