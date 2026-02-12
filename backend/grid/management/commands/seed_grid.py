from django.core.management.base import BaseCommand
from grid.models import Block


class Command(BaseCommand):
    help = "Creates a grid of blocks (e.g. 30x30)"

    def handle(self, *args, **options):
        size = 30
        created = 0
        for row in range(size):
            for col in range(size):
                _, was_created = Block.objects.get_or_create(row=row, col=col)
                if was_created:
                    created += 1
        self.stdout.write(self.style.SUCCESS(f"Created {created} new blocks. Total: {Block.objects.count()}"))