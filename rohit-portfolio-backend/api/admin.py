"""Django admin registration for portfolio models."""
from django.contrib import admin
from .models import Project, Skill, Experience, Certification, Message, SiteSettings


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'featured', 'visible', 'order')
    list_filter = ('category', 'featured', 'visible')
    search_fields = ('title', 'description')
    list_editable = ('featured', 'visible', 'order')
    ordering = ('order', '-created_at')


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'icon', 'order')
    list_filter = ('category',)
    search_fields = ('name',)
    list_editable = ('order',)


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ('role', 'company', 'duration', 'exp_type', 'order')
    list_filter = ('exp_type',)
    list_editable = ('order',)


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ('name', 'issuer', 'date', 'order')
    list_editable = ('order',)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'timestamp', 'read')
    list_filter = ('read',)
    list_editable = ('read',)
    readonly_fields = ('timestamp',)


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'updated_at')
    readonly_fields = ('updated_at',)

    def has_add_permission(self, request):
        # Only one instance allowed
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
