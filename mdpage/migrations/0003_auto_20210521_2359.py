# Generated by Django 3.2.3 on 2021-05-21 15:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mdpage', '0002_mditem_tags'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='mdgroup',
            options={'ordering': ['-order']},
        ),
        migrations.AddField(
            model_name='mdgroup',
            name='order',
            field=models.IntegerField(default=0),
        ),
    ]