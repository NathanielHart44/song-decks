# Generated by Django 4.2 on 2023-12-26 02:47

from django.db import migrations, models
import django_prometheus.models


class Migration(migrations.Migration):

    dependencies = [
        ('songdecks', '0011_alter_subtask_task'),
    ]

    operations = [
        migrations.CreateModel(
            name='KeywordPair',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('keyword', models.CharField(max_length=100)),
                ('description', models.TextField()),
            ],
            bases=(django_prometheus.models.ExportModelOperationsMixin('keyword_pair'), models.Model),
        ),
    ]