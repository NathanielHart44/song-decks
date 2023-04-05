from songdecks.models import PlayerCard, UserCardStats

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