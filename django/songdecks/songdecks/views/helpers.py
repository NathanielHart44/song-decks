from songdecks.settings import (
    EMAIL_HOST_USER, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_REGION
)
import boto3
import mimetypes
from django.core.mail import send_mail
from textwrap import dedent
from songdecks.models import PlayerCard, UserCardStats, Profile
from datetime import datetime
from django.utils import timezone

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
        demo_email = "demo@test.com"
        if demo_email in recipient_list:
            recipient_list.remove(demo_email)
        email = send_mail(
            subject,
            message,
            from_email,
            recipient_list
        )
        if filename != None:
            email.attach_file(filename)
        email.send(fail_silently=False)
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