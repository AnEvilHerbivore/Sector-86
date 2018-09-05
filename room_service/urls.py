from django.conf.urls import url
from room_service import views

app_name = "room_service"
urlpatterns = [
    url(r'^$', views.index, name='index'),
    url('login', views.login_user, name='login'),
    url(r'^logout$', views.user_logout, name='logout'),
    url(r'^register$', views.register, name='register'),
    url(r'^room/create$', views.room_create, name='room_create'),
    url(r'^room/(?P<room>[0-9]+)$', views.room_view, name='room_view'),
    url(r'^card', views.card_json, name='card')
]
