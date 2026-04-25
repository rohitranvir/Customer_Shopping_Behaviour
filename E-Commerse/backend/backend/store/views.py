from django.http import JsonResponse
# Create your views here.
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .serializers import CategorySerializer,ProductSerializer
from .models import Product,Category
@api_view(['GET'])
def get_product(request):
    product=Product.objects.all()
    serializer=ProductSerializer(product,many=True)
    return Response(serializer.data)
@api_view(['GET'])
def get_category(request):
    category=Category.objects.all()
    serializer=CategorySerializer(category,many=True)
    return Response(serializer.data)