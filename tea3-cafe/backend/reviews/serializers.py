from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    
    def get_avatar_url(self, obj):
        if obj.avatar:
            return obj.avatar.url
        return None

    class Meta:
        model = Review
        fields = '__all__'
