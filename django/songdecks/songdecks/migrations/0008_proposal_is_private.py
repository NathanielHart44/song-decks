# Generated by Django 4.2 on 2023-12-20 20:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('songdecks', '0007_proposal_favorited_by_task_favorited_by'),
    ]

    operations = [
        migrations.AddField(
            model_name='proposal',
            name='is_private',
            field=models.BooleanField(default=False),
        ),
    ]
