from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Block
from .serializers import BlockSerializer
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from datetime import timedelta
from django.db.models import Count


@api_view(["GET"])
def block_list(request):
    blocks = Block.objects.all().order_by("row", "col")
    serializer = BlockSerializer(blocks, many=True)
    return Response(serializer.data)


@api_view(["POST"])
def block_capture(request, block_id):
    try:
        block = Block.objects.get(pk=block_id)
    except Block.DoesNotExist:
        return Response({"error": "Block not found"}, status=status.HTTP_404_NOT_FOUND)

    owner_name = request.data.get("owner_name") or "Anonymous"
    color = request.data.get("color") or "#6b7280"
    if block.captured_at:
        if timezone.now() - block.captured_at < timedelta(seconds=10):
            return Response(
                {"error": "Block is locked. Try again in a few seconds.", "locked": True},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )
    block.owner_name = owner_name
    block.color = color
    block.captured_at = timezone.now()
    block.save()
    channel_layer = get_channel_layer()
    block_data = BlockSerializer(block).data
    async_to_sync(channel_layer.group_send)(
        "room_grid_updates",
        {"type": "block_captured", "block": block_data},
    )

    serializer = BlockSerializer(block)
    return Response(serializer.data)

@api_view(["GET"])
def leaderboard(request):
    rows = (
        Block.objects.filter(owner_name__isnull=False)
        .exclude(owner_name="")
        .values("owner_name")
        .annotate(count=Count("id"))
        .order_by("-count")[:15]
    )
    return Response(list(rows))