
from django.shortcuts import render, HttpResponseRedirect
from django.template import RequestContext


def index(request):

    if request.user.is_authenticated:
        template_name = 'index.html'
        return render(request, template_name)
    else:
        return HttpResponseRedirect('login')
        