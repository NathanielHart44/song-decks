from songdecks.settings import EMAIL_HOST_USER
from django.core.mail import send_mail
from textwrap import dedent
from songdecks.models import PlayerCard, UserCardStats

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