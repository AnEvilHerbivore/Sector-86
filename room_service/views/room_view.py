from django.shortcuts import render, HttpResponseRedirect
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from room_service.models import Room


@login_required
def room_view(request, room):

     if request.method == 'GET':
        template_name = 'room.html'
        current_room = Room.objects.get(pk=room)

        return render(request, template_name, {'current_room': current_room})