# Generated by Django 4.2 on 2023-04-05 02:37

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='CardTemplate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('card_name', models.CharField(max_length=100)),
                ('img_url', models.URLField(max_length=500)),
                ('game_count', models.PositiveIntegerField()),
                ('play_count', models.PositiveIntegerField()),
                ('discard_count', models.PositiveIntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='Commander',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('img_url', models.URLField(max_length=500)),
            ],
        ),
        migrations.CreateModel(
            name='Faction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('img_url', models.URLField(max_length=500)),
            ],
        ),
        migrations.CreateModel(
            name='Game',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('in-progress', 'In Progress'), ('completed', 'Completed'), ('abandoned', 'Abandoned')], max_length=15)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('commander', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='songdecks.commander')),
                ('faction', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='songdecks.faction')),
            ],
        ),
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='PlayerCard',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('in-deck', 'In Deck'), ('in-hand', 'In Hand'), ('in-play', 'In Play'), ('discarded', 'Discarded')], max_length=15)),
                ('play_notes', models.TextField(blank=True, null=True)),
                ('played_at', models.DateTimeField(blank=True, null=True)),
                ('discarded_at', models.DateTimeField(blank=True, null=True)),
                ('card_template', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='songdecks.cardtemplate')),
                ('game', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='songdecks.game')),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='songdecks.profile')),
            ],
        ),
        migrations.AddField(
            model_name='game',
            name='owner',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='songdecks.profile'),
        ),
        migrations.AddField(
            model_name='commander',
            name='faction',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='songdecks.faction'),
        ),
        migrations.AddField(
            model_name='cardtemplate',
            name='commander',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='songdecks.commander'),
        ),
        migrations.AddField(
            model_name='cardtemplate',
            name='faction',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='songdecks.faction'),
        ),
        migrations.CreateModel(
            name='UserCardStats',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('times_included', models.PositiveIntegerField(default=0)),
                ('times_drawn', models.PositiveIntegerField(default=0)),
                ('times_discarded', models.PositiveIntegerField(default=0)),
                ('card_template', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='songdecks.cardtemplate')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='songdecks.profile')),
            ],
            options={
                'unique_together': {('user', 'card_template')},
            },
        ),
    ]
