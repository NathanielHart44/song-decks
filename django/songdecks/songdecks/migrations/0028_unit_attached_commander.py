# Generated by Django 4.2 on 2024-01-14 19:06

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('songdecks', '0027_remove_unit_is_commander_unit_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='unit',
            name='attached_commander',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='songdecks.commander'),
        ),
    ]
