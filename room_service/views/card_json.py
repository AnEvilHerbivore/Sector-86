from django.shortcuts import render
from django.http import JsonResponse
from room_service.models import Card

def card_json (request):

    if request.method == 'GET':
        card = Card.objects.all().values()
        card_list = list(card)
        json_response = JsonResponse(card_list, safe=False)
        return json_response