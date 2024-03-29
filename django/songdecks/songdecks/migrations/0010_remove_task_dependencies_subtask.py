# Generated by Django 4.2 on 2023-12-24 11:39

import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import django_prometheus.models


class Migration(migrations.Migration):

    dependencies = [
        ('songdecks', '0009_profile_admin'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='task',
            name='dependencies',
        ),
        migrations.CreateModel(
            name='SubTask',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('state', models.CharField(choices=[('not_started', 'Not Started'), ('assigned', 'Assigned'), ('in_progress', 'In Progress'), ('finished', 'Finished')], default='not_started', max_length=20)),
                ('complexity', models.PositiveIntegerField(blank=True, default=None, null=True, validators=[django.core.validators.MaxValueValidator(3)])),
                ('priority', models.PositiveIntegerField(blank=True, default=None, null=True, validators=[django.core.validators.MaxValueValidator(3)])),
                ('is_private', models.BooleanField(default=True)),
                ('notes', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('assigned_admins', models.ManyToManyField(blank=True, related_name='assigned_sub_tasks', to='songdecks.profile')),
                ('task', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='songdecks.task')),
            ],
            bases=(django_prometheus.models.ExportModelOperationsMixin('sub_task'), models.Model),
        ),
    ]
