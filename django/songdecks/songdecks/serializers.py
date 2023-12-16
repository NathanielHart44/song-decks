from rest_framework import serializers
from django.contrib.auth.models import User
from songdecks.models import *
from songdecks.views.helpers import check_inappropriate_language

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
    class Meta:
        model = Tag
        fields = ['name', 'created_at']

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

class ProposalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proposal
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super(ProposalSerializer, self).__init__(*args, **kwargs)
        request = kwargs.get('context', {}).get('request', None)
        if request and request.method in ['POST', 'PUT', 'PATCH']:
            self.fields['created_at'].read_only = True
            self.fields['creator'].read_only = True

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
    class Meta:
        model = Task
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super(TaskSerializer, self).__init__(*args, **kwargs)
        if 'context' in kwargs and 'request' in kwargs['context']:
            request = kwargs['context']['request']
            if not request.user.profile.moderator:
                # Limit fields for non-moderators
                allowed_fields = ('id', 'title', 'description', 'state', 'created_at', 'tags')
                for field_name in list(self.fields):
                    if field_name not in allowed_fields:
                        self.fields.pop(field_name)

    def validate_complexity(self, value):
        if value is not None and (value < 1 or value > 3):
            raise serializers.ValidationError("Complexity must be between 1 and 3.")
        return value

    def validate(self, data):
        # Check for circular dependencies
        if 'dependencies' in data:
            task_to_check = self.instance if self.instance else Task()  # Use existing instance or new one
            for dependency in data['dependencies']:
                if task_to_check.check_for_circular_dependency(task_to_check, dependency):
                    raise serializers.ValidationError("Circular dependency detected.")
        return data
    
    def create(self, validated_data):
        tag_ids = validated_data.pop('tag_ids', [])
        dependency_ids = validated_data.pop('depends_on', [])
        task = Task.objects.create(**validated_data)

        # Handle tags
        for tag_id in tag_ids:
            tag = Tag.objects.get(pk=tag_id)
            task.tags.add(tag)

        # Handle dependencies
        for dependency_id in dependency_ids:
            dependency = Task.objects.get(pk=dependency_id)
            task.dependencies.add(dependency)

        return task