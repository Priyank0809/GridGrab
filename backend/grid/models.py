from django.db import models


class Block(models.Model):
    row = models.IntegerField()
    col = models.IntegerField()
    owner_name = models.CharField(max_length=100, null=True, blank=True)
    color = models.CharField(max_length=7, default="#6b7280", blank=True)
    captured_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = [["row", "col"]]

    def __str__(self):
        return f"Block ({self.row}, {self.col})"

# Create your models here.
