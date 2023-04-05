from django.db import models
from django.contrib.auth.models import User
from django.dispatch import receiver
from django.db.models.signals import post_save, pre_save
from django.db.models import signals

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=False)

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

    def __str__(self):
        return self.card_name
    
class Game(models.Model):
    owner = models.ForeignKey(Profile, on_delete=models.CASCADE)
    faction = models.ForeignKey(Faction, on_delete=models.CASCADE)
    commander = models.ForeignKey(Commander, on_delete=models.CASCADE)
    status = models.CharField(max_length=15, choices=[('in-progress', 'In Progress'), ('completed', 'Completed'), ('abandoned', 'Abandoned')])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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
