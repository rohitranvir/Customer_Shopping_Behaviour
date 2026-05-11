from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Product,Category
from .serializers import Productserializer,Categoryserializer
@api_view(['GET'])
def get_products(request):
    products= Product.objects.all()
    serializer=Productserializer(products,many=True)
    return Response(serializer.data)
@api_view(['GET'])
def get_categories(request):
    category= Category.objects.all()
    serializer=Categoryserializer(category,many=True)
    return Response(serializer.data)