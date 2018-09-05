from django import forms
from room_service.models import Room

class RoomForm(forms.ModelForm):
    # password = forms.CharField(widget=forms.PasswordInput())

    class Meta:
        model = Room
        fields = ('name',)