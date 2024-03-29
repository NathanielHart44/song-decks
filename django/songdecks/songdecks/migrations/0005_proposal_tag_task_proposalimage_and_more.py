# Generated by Django 4.2 on 2023-12-14 06:20

import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('songdecks', '0004_profile_moderator'),
    ]

    operations = [
        migrations.CreateModel(
            name='Proposal',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('rejected', 'Rejected'), ('closed', 'Closed'), ('confirmed', 'Confirmed')], default='pending', max_length=10)),
                ('text', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('creator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='songdecks.profile')),
            ],
        ),
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Task',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('state', models.CharField(choices=[('not_started', 'Not Started'), ('assigned', 'Assigned'), ('in_progress', 'In Progress'), ('finished', 'Finished')], default='not_started', max_length=20)),
                ('complexity', models.PositiveIntegerField(blank=True, default=None, null=True, validators=[django.core.validators.MaxValueValidator(3)])),
                ('is_private', models.BooleanField(default=False)),
                ('notes', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('assigned_admins', models.ManyToManyField(blank=True, related_name='assigned_tasks', to='songdecks.profile')),
                ('dependencies', models.ManyToManyField(blank=True, related_name='dependent_tasks', to='songdecks.task')),
                ('tags', models.ManyToManyField(blank=True, related_name='tasks', to='songdecks.tag')),
            ],
        ),
        migrations.CreateModel(
            name='ProposalImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('img_url', models.URLField(max_length=500)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('proposal', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='songdecks.proposal')),
            ],
        ),
        migrations.AddField(
            model_name='proposal',
            name='related_images',
            field=models.ManyToManyField(blank=True, related_name='proposals', to='songdecks.proposalimage'),
        ),
        migrations.AddField(
            model_name='proposal',
            name='tags',
            field=models.ManyToManyField(blank=True, related_name='proposals', to='songdecks.tag'),
        ),
    ]
