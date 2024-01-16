# Generated by Django 4.2 on 2023-12-28 16:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('songdecks', '0016_attachment_unit_ncu_list_game_owner_list'),
    ]

    operations = [
        migrations.AlterField(
            model_name='list',
            name='ncus',
            field=models.ManyToManyField(blank=True, to='songdecks.ncu'),
        ),
        migrations.AlterField(
            model_name='list',
            name='units',
            field=models.ManyToManyField(blank=True, to='songdecks.unit'),
        ),
        migrations.AlterField(
            model_name='unit',
            name='attachments',
            field=models.ManyToManyField(blank=True, to='songdecks.attachment'),
        ),
    ]
