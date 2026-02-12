from rest_framework import serializers
from .models import Block


class BlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Block
        fields = ["id", "row", "col", "owner_name", "color", "captured_at"]