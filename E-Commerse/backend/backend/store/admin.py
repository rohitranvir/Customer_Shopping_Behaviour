from django.contrib import admin

# Register your models here.
from .models import Category,Product,Userprofile,Orders,OrderItem
admin.site.register(Category)
admin.site.register(Product)
admin.site.register(Userprofile)
admin.site.register(Orders)
admin.site.register(OrderItem)