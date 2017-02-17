from django.contrib.auth.models import User

from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied
class IsOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

#class IsFriendsWithOwner(BasePermission):
#    def has_object_permission(self, request, view, obj):
#        return obj.user == request.user

def is_owner_or_friend(request, requested_user):
    from_user = request.user
    to_user = User.objects.get(username=requested_user)
    if from_user.username == to_user.username:
        return True
    else:
        if (from_user.userprofile in to_user.userprofile.friends.all()):
            return True
        else:
            raise PermissionDenied
