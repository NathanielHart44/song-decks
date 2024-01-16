from django.db import models
from django.contrib.auth.models import User
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.db.models import signals
from django.core.validators import MaxValueValidator
from django.db import transaction
from django.core.exceptions import ValidationError
from django_prometheus.models import ExportModelOperationsMixin

# ----------------------------------------------------------------------

class Profile(ExportModelOperationsMixin('profile'), models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=False)
    moderator = models.BooleanField(default=False)
    admin = models.BooleanField(default=False)

    def __str__(self) -> str:
        return self.user.first_name + ' ' + self.user.last_name

    def get_owned_lists(self):
        return self.owned_lists.all()

    def get_active_lists(self):
        return self.owned_lists.filter(is_draft=False)

    def get_draft_lists(self):
        return self.owned_lists.filter(is_draft=True)

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

@receiver(signals.post_delete, sender=Profile)
def delete_user(sender, instance=None, **kwargs):
    try:
        instance.user
    except User.DoesNotExist:
        pass
    else:
        instance.user.delete()

# ----------------------------------------------------------------------

class Faction(ExportModelOperationsMixin('faction'), models.Model):
    name = models.CharField(max_length=100)
    img_url = models.URLField(max_length=500)
    neutral = models.BooleanField(default=False)
    can_use_neutral = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Commander(ExportModelOperationsMixin('commander'), models.Model):
    COMMANDER_TYPE_CHOICES = [
        ('unit', 'Unit'),
        ('attachment', 'Attachment'),
    ]
    name = models.CharField(max_length=100)
    img_url = models.URLField(max_length=500)
    faction = models.ForeignKey(Faction, on_delete=models.CASCADE)
    commander_type = models.CharField(max_length=20, choices=COMMANDER_TYPE_CHOICES, default='attachment')

    def __str__(self):
        return self.name

# ----------------------------------------------------------------------
# List Builder

class NCU(ExportModelOperationsMixin('ncu'), models.Model):
    name = models.CharField(max_length=100)
    faction = models.ForeignKey(Faction, on_delete=models.CASCADE)
    points_cost = models.PositiveIntegerField()
    img_url = models.URLField(max_length=500)
    main_url = models.URLField(max_length=500)

    def __str__(self):
        return f'{self.name} - {self.faction.name}'

class Attachment(ExportModelOperationsMixin('attachment'), models.Model):
    UNIT_TYPE_CHOICES = [
        ('infantry', 'Infantry'),
        ('cavalry', 'Cavalry'),
        ('monster', 'Monster'),
        ('war_machine', 'War Machine'),
    ]
    ATTACHMENT_TYPE_CHOICES = [
        ('generic', 'Generic'),
        ('character', 'Character'),
        ('commander', 'Commander'),
    ]

    name = models.CharField(max_length=100)
    faction = models.ForeignKey(Faction, on_delete=models.CASCADE)
    points_cost = models.PositiveIntegerField()
    img_url = models.URLField(max_length=500)
    main_url = models.URLField(max_length=500)
    type = models.CharField(max_length=20, choices=UNIT_TYPE_CHOICES)
    attachment_type = models.CharField(max_length=20, choices=ATTACHMENT_TYPE_CHOICES, default='generic')

    def __str__(self):
        return f'{self.name} - {self.faction.name}'

class Unit(ExportModelOperationsMixin('unit'), models.Model):
    UNIT_TYPE_CHOICES = [
        ('infantry', 'Infantry'),
        ('cavalry', 'Cavalry'),
        ('monster', 'Monster'),
        ('war_machine', 'War Machine'),
    ]

    UNIT_STATUS_CHOICES = [
        ('commander', 'Commander'),
        ('commander_unit', 'Commander Unit'),
        ('generic', 'Generic'),
    ]

    name = models.CharField(max_length=100)
    faction = models.ForeignKey(Faction, on_delete=models.CASCADE)
    points_cost = models.PositiveIntegerField()
    unit_type = models.CharField(max_length=20, choices=UNIT_TYPE_CHOICES)
    img_url = models.URLField(max_length=500)
    main_url = models.URLField(max_length=500)
    status = models.CharField(max_length=20, choices=UNIT_STATUS_CHOICES, default='generic')
    attached_commander = models.ForeignKey(Commander, null=True, blank=True, on_delete=models.SET_NULL)
    max_in_list = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        return f'{self.name} - {self.unit_type} - {self.faction.name}'

class ListUnit(models.Model):
    list = models.ForeignKey('List', on_delete=models.CASCADE, related_name='unit_list')
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE)
    attachments = models.ManyToManyField(Attachment, blank=True)
    commander = models.ForeignKey(Commander, null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return f'{self.unit.name} in list: {self.list.id}'
    
class ListNCU(models.Model):
    list = models.ForeignKey('List', on_delete=models.CASCADE, related_name='ncu_list')
    ncu = models.ForeignKey(NCU, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.ncu.name} in list: {self.list.id}'
    
class List(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey('Profile', on_delete=models.CASCADE, related_name='owned_lists')
    points_allowed = models.PositiveIntegerField()
    faction = models.ForeignKey(Faction, on_delete=models.CASCADE)
    commander = models.ForeignKey(Commander, on_delete=models.CASCADE)
    units = models.ManyToManyField(ListUnit, blank=True, related_name='list_units')
    ncus = models.ManyToManyField(ListNCU, blank=True, related_name='list_ncus')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_draft = models.BooleanField(default=False)
    is_public = models.BooleanField(default=False)
    is_valid = models.BooleanField(default=False)
    shared_from = models.ForeignKey('Profile', null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return f'{self.faction.name} - {self.name}'

# ----------------------------------------------------------------------

class Game(ExportModelOperationsMixin('game'), models.Model):
    owner = models.ForeignKey(Profile, on_delete=models.CASCADE)
    faction = models.ForeignKey(Faction, on_delete=models.CASCADE)
    commander = models.ForeignKey(Commander, on_delete=models.CASCADE)
    owner_list = models.ForeignKey(List, blank=True, null=True, on_delete=models.SET_NULL)
    status = models.CharField(max_length=15, choices=[('in-progress', 'In Progress'), ('completed', 'Completed'), ('abandoned', 'Abandoned')])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    round = models.PositiveIntegerField(null=False, blank=False, default=1)

    def __str__(self):
        return f'{self.owner.user.username} - {self.commander.name}'
    
class CardTemplate(ExportModelOperationsMixin('card_template'), models.Model):
    card_name = models.CharField(max_length=100)
    img_url = models.URLField(max_length=500)
    faction = models.ForeignKey(Faction, null=True, blank=True, on_delete=models.CASCADE)
    commander = models.ForeignKey(Commander, null=True, blank=True, on_delete=models.CASCADE)
    game_count = models.PositiveIntegerField()
    play_count = models.PositiveIntegerField()
    discard_count = models.PositiveIntegerField()
    replaces = models.ForeignKey('self', null=True, blank=True, on_delete=models.DO_NOTHING)

    def __str__(self):
        return self.card_name

class PlayerCard(ExportModelOperationsMixin('player_card'), models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    card_template = models.ForeignKey(CardTemplate, on_delete=models.CASCADE)
    owner = models.ForeignKey(Profile, on_delete=models.CASCADE)
    status = models.CharField(max_length=15, choices=[('in-deck', 'In Deck'), ('in-hand', 'In Hand'), ('in-play', 'In Play'), ('discarded', 'Discarded')])
    play_notes = models.TextField(null=True, blank=True)
    drawn_this_round = models.BooleanField(default=False)
    discarded_this_round = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.card_template.card_name} - {self.owner.user.username}'

class UserCardStats(ExportModelOperationsMixin('user_card_stats'), models.Model):
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    card_template = models.ForeignKey(CardTemplate, on_delete=models.CASCADE)
    times_included = models.PositiveIntegerField(default=0)
    times_drawn = models.PositiveIntegerField(default=0)
    times_discarded = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('user', 'card_template')

    def __str__(self):
        return f'{self.card_template.card_name} - {self.user.user.username}'

# ----------------------------------------------------------------------
# Workbench

class Tag(ExportModelOperationsMixin('tag'), models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class ProposalImage(ExportModelOperationsMixin('proposal_image'), models.Model):
    proposal = models.ForeignKey('Proposal', on_delete=models.CASCADE)
    img_url = models.URLField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.proposal.id} - {self.img_url}'
    
class Proposal(ExportModelOperationsMixin('proposal'), models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('rejected', 'Rejected'),
        ('closed', 'Closed'),
        ('confirmed', 'Confirmed'),
    ]

    creator = models.ForeignKey(Profile, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    is_private = models.BooleanField(default=False)
    text = models.TextField()
    favorited_by = models.ManyToManyField(Profile, related_name='favorited_proposals', blank=True)
    related_images = models.ManyToManyField(ProposalImage, related_name='proposals', blank=True)
    tags = models.ManyToManyField(Tag, related_name='proposals', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Task(ExportModelOperationsMixin('task'), models.Model):
    STATE_CHOICES = [
        ('not_started', 'Not Started'),
        ('assigned', 'Assigned'),
        ('in_progress', 'In Progress'),
        ('finished', 'Finished'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    state = models.CharField(max_length=20, choices=STATE_CHOICES, default='not_started')
    complexity = models.PositiveIntegerField(
        validators=[MaxValueValidator(3)],
        null=True,
        blank=True,
        default=None
    )
    priority = models.PositiveIntegerField(
        validators=[MaxValueValidator(3)],
        null=True,
        blank=True,
        default=None
    )
    is_private = models.BooleanField(default=False)
    notes = models.TextField(null=True, blank=True)
    tags = models.ManyToManyField(Tag, related_name='tasks', blank=True)
    assigned_admins = models.ManyToManyField(Profile, related_name='assigned_tasks', blank=True)
    favorited_by = models.ManyToManyField(Profile, related_name='favorited_tasks', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class SubTask(ExportModelOperationsMixin('sub_task'), models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='subtasks')
    title = models.CharField(max_length=200)
    description = models.TextField()
    state = models.CharField(max_length=20, choices=Task.STATE_CHOICES, default='not_started')
    complexity = models.PositiveIntegerField(
        validators=[MaxValueValidator(3)],
        null=True,
        blank=True,
        default=None
    )
    priority = models.PositiveIntegerField(
        validators=[MaxValueValidator(3)],
        null=True,
        blank=True,
        default=None
    )
    is_private = models.BooleanField(default=True)
    notes = models.TextField(null=True, blank=True)
    assigned_admins = models.ManyToManyField(Profile, related_name='assigned_sub_tasks', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

# ----------------------------------------------------------------------
# Keyword Search

class KeywordType(ExportModelOperationsMixin('keyword_type'), models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()

    def __str__(self):
        return f'{self.name}'

class KeywordPair(ExportModelOperationsMixin('keyword_pair'), models.Model):
    keyword = models.CharField(max_length=100, unique=True)
    keyword_types = models.ManyToManyField(KeywordType, blank=True, related_name='keyword_pairs')
    description = models.TextField()

    def __str__(self):
        return f'{self.keyword}'