
from django.shortcuts import render
from django.template import RequestContext
from room_service.models import Room
from django.contrib.auth.decorators import login_required


@login_required
def room_join_view(request):
    template_name = 'room_join.html'
    rooms = Room.objects.all()
    return render(request, template_name, {'rooms': rooms})