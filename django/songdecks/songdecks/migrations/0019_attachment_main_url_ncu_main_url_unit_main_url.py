# Generated by Django 4.2 on 2023-12-28 21:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('songdecks', '0018_rename_image_url_attachment_img_url_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='attachment',
            name='main_url',
            field=models.URLField(default='', max_length=500),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='ncu',
            name='main_url',
            field=models.URLField(default='', max_length=500),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='unit',
            name='main_url',
            field=models.URLField(default='', max_length=500),
            preserve_default=False,
        ),
    ]
