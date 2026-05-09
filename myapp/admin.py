from django.contrib import admin
from .models import UserProfile

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'age', 'goal')   
    list_filter = ('role',)                           
    search_fields = ('user__username',)               