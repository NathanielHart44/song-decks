import json
from django.core.management.base import BaseCommand
from songdecks.models import Profile, User

class Command(BaseCommand):
    def handle(self, *args, **options):
        all_users = User.objects.all()
        for user in all_users:
            if user.username == 'doomha' or user.username == 'Doomha':
                user.profile.moderator = True
                user.save()
                print("Changed Moderator status: ", user.username, "to: ", user.profile.moderator)