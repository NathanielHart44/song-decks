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
    played_at = models.DateTimeField(null=True, blank=True)
    discarded_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'{self.card_template.card_name} - {self.owner.user.username}'

@receiver(pre_save, sender=Game)
def update_card_template_stats(sender, instance, **kwargs):
    if instance.pk:  # Ensure the game has been previously saved
        original_instance = sender.objects.get(pk=instance.pk)

        if original_instance.status != 'completed' and instance.status == 'completed':
            # The game's status has changed to completed
            player_cards = PlayerCard.objects.filter(game=instance)

            for player_card in player_cards:
                card_template = player_card.card_template
                card_template.game_count += 1

                if player_card.status == 'in-play':
                    card_template.play_count += 1
                elif player_card.status == 'discarded':
                    card_template.discard_count += 1

                card_template.save()

@receiver(pre_save, sender=PlayerCard)
def update_user_card_stats(sender, instance, **kwargs):
    if instance.pk:
        original_instance = sender.objects.get(pk=instance.pk)

        if original_instance.status != instance.status:
            user_card_stats, created = UserCardStats.objects.get_or_create(
                user=instance.owner, card_template=instance.card_template
            )

            if instance.status == 'in-hand':
                user_card_stats.times_drawn += 1
            elif instance.status == 'discarded':
                user_card_stats.times_discarded += 1

            user_card_stats.save()

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
