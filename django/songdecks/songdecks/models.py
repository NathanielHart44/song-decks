from django.db import models
from django.contrib.auth.models import User
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.db.models import signals
from django.core.validators import MaxValueValidator

# ----------------------------------------------------------------------

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=False)
    moderator = models.BooleanField(default=False)

    def __str__(self) -> str:
        return self.user.first_name + ' ' + self.user.last_name

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

class Faction(models.Model):
    name = models.CharField(max_length=100)
    img_url = models.URLField(max_length=500)
    neutral = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    
class Commander(models.Model):
    name = models.CharField(max_length=100)
    img_url = models.URLField(max_length=500)
    faction = models.ForeignKey(Faction, on_delete=models.CASCADE)

    def __str__(self):
        return self.name
    
class CardTemplate(models.Model):
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
    
class Game(models.Model):
    owner = models.ForeignKey(Profile, on_delete=models.CASCADE)
    faction = models.ForeignKey(Faction, on_delete=models.CASCADE)
    commander = models.ForeignKey(Commander, on_delete=models.CASCADE)
    status = models.CharField(max_length=15, choices=[('in-progress', 'In Progress'), ('completed', 'Completed'), ('abandoned', 'Abandoned')])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    round = models.PositiveIntegerField(null=False, blank=False, default=1)

    def __str__(self):
        return f'{self.owner.user.username} - {self.commander.name}'

class PlayerCard(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    card_template = models.ForeignKey(CardTemplate, on_delete=models.CASCADE)
    owner = models.ForeignKey(Profile, on_delete=models.CASCADE)
    status = models.CharField(max_length=15, choices=[('in-deck', 'In Deck'), ('in-hand', 'In Hand'), ('in-play', 'In Play'), ('discarded', 'Discarded')])
    play_notes = models.TextField(null=True, blank=True)
    drawn_this_round = models.BooleanField(default=False)
    discarded_this_round = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.card_template.card_name} - {self.owner.user.username}'

class UserCardStats(models.Model):
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
    
class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
class ProposalImage(models.Model):
    proposal = models.ForeignKey('Proposal', on_delete=models.CASCADE)
    img_url = models.URLField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.proposal.id} - {self.img_url}'

class Proposal(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('rejected', 'Rejected'),
        ('closed', 'Closed'),
        ('confirmed', 'Confirmed'),
    ]

    creator = models.ForeignKey(Profile, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    text = models.TextField()
    related_images = models.ManyToManyField(ProposalImage, related_name='proposals', blank=True)
    tags = models.ManyToManyField(Tag, related_name='proposals', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Task(models.Model):
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
    is_private = models.BooleanField(default=False)
    notes = models.TextField(null=True, blank=True)
    tags = models.ManyToManyField(Tag, related_name='tasks', blank=True)
    assigned_admins = models.ManyToManyField(Profile, related_name='assigned_tasks', blank=True)
    dependencies = models.ManyToManyField('self', symmetrical=False, related_name='dependent_tasks', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def check_for_circular_dependency(self, task_to_check, task_being_checked):
        """
        Recursively checks for circular dependency.
        """
        if task_to_check == task_being_checked:
            return True
        for dependency in task_being_checked.dependencies.all():
            if self.check_for_circular_dependency(task_to_check, dependency):
                return True
        return False

    def save(self, *args, **kwargs):
        """
        Override the save method to validate task dependencies.
        """
        # Check for circular dependencies
        for dependency in self.dependencies.all():
            if self.check_for_circular_dependency(self, dependency):
                raise ValueError("Circular dependency detected")

        super(Task, self).save(*args, **kwargs)