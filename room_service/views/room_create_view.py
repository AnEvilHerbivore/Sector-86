from django.shortcuts import render

from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.shortcuts import render
from django.template import RequestContext

from room_service.models import Room
from room_service.forms import RoomForm

@login_required
def room_create(request):

    if request.method == 'GET':
        room_form = RoomForm()
        template_name = 'room_create.html'
        return render(request, template_name, {'room_form': room_form})

    elif request.method == 'POST':
        form_data = request.POST

        r = Room(
            name = form_data['name'],
            user = User.objects.get(pk=form_data['user'])
        )
        r.save()
        return HttpResponseRedirect(f'/room/{r.id}')