# Generated by Django 3.1.3 on 2020-12-20 23:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('explorer', '0020_remove_swap_stats_bch'),
    ]

    operations = [
        migrations.AddField(
            model_name='max_privacy_withdraw',
            name='per_day',
            field=models.CharField(default='0', max_length=16),
            preserve_default=False,
        ),
    ]
