from django.contrib import admin

from .models import Message, MessageReadReceipt


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    """Admin configuration for the Message model."""

    list_display = ('sender', 'room', 'short_content', 'timestamp')
    list_filter = ('room', 'timestamp')
    search_fields = ('content', 'sender__username')

    @admin.display(description='Content')
    def short_content(self, obj):
        return obj.content[:80] if obj.content else '(file)'


@admin.register(MessageReadReceipt)
class MessageReadReceiptAdmin(admin.ModelAdmin):
    """Admin configuration for the MessageReadReceipt model."""

    list_display = ('user', 'message', 'read_at')
    list_filter = ('read_at',)
