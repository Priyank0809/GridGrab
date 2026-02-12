from django.urls import path
from . import views

urlpatterns = [
    path("", views.block_list),
    path("<int:block_id>/capture/", views.block_capture),
    path("leaderboard/", views.leaderboard),
]