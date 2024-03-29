from songdecks.settings import (
    EMAIL_HOST_PASSWORD, EMAIL_HOST_USER, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_REGION
)
import boto3
import mimetypes
import requests
import random
from django.core.mail import send_mail
from textwrap import dedent
from songdecks.models import PlayerCard, UserCardStats, Profile, User
from datetime import datetime, timedelta
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from songdecks.models import Faction
from django.db.models import Avg, F, ExpressionWrapper, fields

# ----------------------------------------------------------------------

domain = "https://asoiaf-decks.com"

# ----------------------------------------------------------------------

def handle_card_updates(game):
    in_hand_cards = PlayerCard.objects.filter(game=game, status='in-hand')
    discarded_cards = PlayerCard.objects.filter(game=game, status='discarded')

    for card in in_hand_cards:
        if not card.drawn_this_round:
            continue
        user_card_stats, created = UserCardStats.objects.get_or_create(
            user=card.owner, card_template=card.card_template
        )
        user_card_stats.times_drawn += 1
        user_card_stats.save()

        card.card_template.play_count += 1
        card.card_template.save()

        card.drawn_this_round = False
        card.save()

    for card in discarded_cards:
        if not card.discarded_this_round:
            continue
        user_card_stats, created = UserCardStats.objects.get_or_create(
            user=card.owner, card_template=card.card_template
        )
        user_card_stats.times_discarded += 1
        user_card_stats.save()

        card.card_template.discard_count += 1
        card.card_template.save()

        card.discarded_this_round = False
        card.save()

def get_profile_game_cards(game, profile):
    game_cards = PlayerCard.objects.filter(game=game, owner=profile)
    return game_cards

def send_email_notification(recipient, subject, message, filename=None):
    try:
        subject = subject
        message = dedent(f"""{message}\n\n\nTo unsubscribe from email notifications, please go to {domain}/user/account.
        """)
        from_email = EMAIL_HOST_USER
        recipient_list = recipient if isinstance(recipient, list) else [recipient]
        email = send_mail(
            subject,
            message,
            from_email,
            recipient_list,
            auth_password=EMAIL_HOST_PASSWORD,
        )
        if filename != None:
            email.attach_file(filename)
    except Exception as e:
        print(e)

def get_boto3_session():
    session = boto3.Session(
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_S3_REGION
    )
    return session

def upload_file_to_s3(file, bucket_name, file_name):
    # file_name should include the path to the file as well.
    # Example: "commanders/martell/commander_1.jpg"
    is_success, error_msg = False, None
    if 'amazonaws.com/' in file_name:
        file_name = file_name.split('amazonaws.com/')[1]
    if 'assets.asoiaf-decks.com/' in file_name:
        file_name = file_name.split('assets.asoiaf-decks.com/')[1]
    try:
        mime_type, _ = mimetypes.guess_type(file_name)
        if mime_type is None:
            mime_type = 'application/octet-stream'

        session = get_boto3_session()
        s3 = session.resource('s3')
        s3.Bucket(bucket_name).put_object(Key=file_name, Body=file, ContentType=mime_type)
        is_success = True
    except Exception as e:
        error_msg = str(e) + f" - {file_name} - {bucket_name}"
        return is_success, error_msg
    return is_success, error_msg

def get_last_acceptable_date(accepted_days):
    naive_datetime = datetime.now()
    aware_datetime = timezone.make_aware(naive_datetime)
    last_acceptable_date = aware_datetime - timezone.timedelta(days=accepted_days)
    return last_acceptable_date

def create_profile(all_users):
    created_num = 0
    checked_num = 0
    for user in all_users:
        try:
            user.profile
        except Profile.DoesNotExist:
            Profile.objects.create(user=user)
            created_num += 1
        checked_num += 1
    print(f"Checked {checked_num} users and created {created_num} profiles.")

def fetch_words_from_datamuse(word_type):
    try:
        response = requests.get(f"https://api.datamuse.com/words?rel_jjb={word_type}&max=100")
        if response.status_code == 200:
            words = [word['word'] for word in response.json()]
            if words:
                return words
    except requests.RequestException:
        pass
    return []

def generate_username():
    nouns = fetch_words_from_datamuse("noun") or ["corn", "popcorn", "grass", "apple", "tree"]
    verbs = fetch_words_from_datamuse("verb") or ["happy", "startled", "spiteful", "dancing", "jumping"]

    noun = random.choice(nouns)
    verb = random.choice(verbs)
    number = random.randint(100, 999)
    return f"G-{verb}-{noun}-{number}"

def create_user_from_google(name, email):
    first_name, last_name = (name.split(' ') + [''])[:2]
    username = generate_username()
    password = User.objects.make_random_password(length=8, allowed_chars="abcdefghjkmnpqrstuvwxyz01234567889")
    user = User.objects.create(
        first_name=first_name,
        last_name=last_name,
        username=username,
        email=email,
        is_superuser=False,
        is_staff=False
    )
    user.set_password(password)
    user.last_login = timezone.now()
    user.save()
    return user

def gen_jwt_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

def update_last_login(user):
    current_time = timezone.now()
    last_login = user.last_login

    user.last_login = current_time
    user.save(update_fields=['last_login'])

    try:
        profile = user.profile
        # Check if it's been at least 10 minutes since the last login
        if last_login and (current_time - last_login) >= timedelta(minutes=10):
            profile.session_count += 1
            profile.save(update_fields=['session_count'])
    except Profile.DoesNotExist:
        pass

def check_inappropriate_language(text):
    response = requests.get("https://www.purgomalum.com/service/containsprofanity?text=" + text)
    if response.text == "true":
        return True
    else:
        return False

def valid_for_neutrals(faction: Faction) -> bool:
    if faction is None:
        return False
    if faction.neutral:
        return True
    if not faction.neutral and faction.can_use_neutral:
        # Neutral units are not native to this faction, but this faction can use them
        return True
    if not faction.neutral and not faction.can_use_neutral:
        # Neutral units are not native to this faction, and this faction cannot use them
        return False
    return False

def calc_avg_last_login_seconds(profiles):
    """
    Calculate the average time since last login in seconds for given profiles.
    
    :param profiles: A queryset of Profile objects.
    :return: Average time since last login in seconds or None.
    """
    current_time = timezone.now()

    profiles = profiles.annotate(
        time_since_last_login=ExpressionWrapper(
            current_time - F('user__last_login'),
            output_field=fields.DurationField()
        )
    )

    average_duration = profiles.aggregate(
        avg_duration=Avg('time_since_last_login')
    )['avg_duration']

    return average_duration.total_seconds() if average_duration else None

def seconds_to_readable_time(seconds):
    """
    Convert a time duration in seconds to a readable string format (days, hours, minutes, seconds).
    
    :param seconds: Time duration in seconds.
    :return: String representing the time duration.
    """
    if seconds is not None:
        days, remainder = divmod(seconds, 86400)
        hours, remainder = divmod(remainder, 3600)
        minutes, seconds = divmod(remainder, 60)

        return f"{int(days)} days, {int(hours)} hours, {int(minutes)} minutes, {int(seconds)} seconds"
    else:
        return None

def calculate_avg_last_login(profiles):
    avg_login_seconds = calc_avg_last_login_seconds(profiles)
    avg_login_time_readable = seconds_to_readable_time(avg_login_seconds)
    return avg_login_time_readable