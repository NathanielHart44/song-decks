# Generated by Django 4.2 on 2024-01-12 22:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('songdecks', '0022_list_commander'),
    ]

    operations = [
        migrations.AddField(
            model_name='faction',
            name='can_use_neutral',
            field=models.BooleanField(default=True),
        ),
    ]