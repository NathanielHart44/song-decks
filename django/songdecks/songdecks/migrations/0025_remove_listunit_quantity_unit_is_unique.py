# Generated by Django 4.2 on 2024-01-14 17:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('songdecks', '0024_remove_unit_attachments'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='listunit',
            name='quantity',
        ),
        migrations.AddField(
            model_name='unit',
            name='is_unique',
            field=models.BooleanField(default=False),
        ),
    ]