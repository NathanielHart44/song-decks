# Generated by Django 4.2 on 2023-12-24 11:55

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('songdecks', '0010_remove_task_dependencies_subtask'),
    ]

    operations = [
        migrations.AlterField(
            model_name='subtask',
            name='task',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='subtasks', to='songdecks.task'),
        ),
    ]