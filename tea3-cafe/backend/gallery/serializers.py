from rest_framework import serializers
from .models import GalleryImage

class GalleryImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None
        
    class Meta:
        model = GalleryImage
        fields = '__all__'
