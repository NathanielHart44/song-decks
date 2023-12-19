# Generated by Django 4.2 on 2023-12-19 06:11

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('songdecks', '0005_proposal_tag_task_proposalimage_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='priority',
            field=models.PositiveIntegerField(blank=True, default=None, null=True, validators=[django.core.validators.MaxValueValidator(3)]),
        ),
    ]