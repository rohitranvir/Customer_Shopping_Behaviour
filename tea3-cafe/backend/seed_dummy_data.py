import os
import django
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tea3.settings')
django.setup()

from menu.models import MenuItem
from offers.models import Offer
from reviews.models import Review
from gallery.models import GalleryImage

print("Clearing old data...")
MenuItem.objects.all().delete()
Offer.objects.all().delete()
Review.objects.all().delete()
GalleryImage.objects.all().delete()

print("Seeding Menu Items...")
menu_items = [
    # TEAS
    {'name': 'Masala Chai', 'category': 'tea', 'price': 120, 'description': 'Spiced Indian tea, made fresh daily with whole spices', 'is_popular': True},
    {'name': 'Matcha Latte', 'category': 'tea', 'price': 210, 'description': 'Ceremonial grade matcha with creamy oat milk', 'is_popular': True},
    {'name': 'Earl Grey', 'category': 'tea', 'price': 150, 'description': 'Bergamot-infused premium black tea', 'is_popular': False},
    {'name': 'Chamomile Honey', 'category': 'tea', 'price': 160, 'description': 'Calming floral blend with raw organic honey', 'is_popular': False},
    {'name': 'Kashmiri Kahwa', 'category': 'tea', 'price': 180, 'description': 'Saffron, almonds, and green tea blend', 'is_popular': False},
    # COFFEE
    {'name': 'Signature Espresso', 'category': 'coffee', 'price': 180, 'description': 'Bold, rich single-origin shot', 'is_popular': False},
    {'name': 'Hazelnut Latte', 'category': 'coffee', 'price': 220, 'description': 'Creamy latte with roasted hazelnut syrup', 'is_popular': True},
    {'name': 'Cold Brew', 'category': 'coffee', 'price': 200, 'description': '18-hour steeped, smooth and strong', 'is_popular': False},
    {'name': 'Flat White', 'category': 'coffee', 'price': 190, 'description': 'Velvety microfoam over double ristretto', 'is_popular': False},
    {'name': 'Cappuccino', 'category': 'coffee', 'price': 170, 'description': 'Classic Italian with perfect foam ratio', 'is_popular': False},
    # SNACKS
    {'name': 'Truffle Croissant', 'category': 'snacks', 'price': 240, 'description': 'Buttery croissant with black truffle butter', 'is_popular': True},
    {'name': 'Avocado Toast', 'category': 'snacks', 'price': 280, 'description': 'Sourdough, smashed avo, chili flakes', 'is_popular': False},
    {'name': 'Bruschetta', 'category': 'snacks', 'price': 220, 'description': 'Tomato, basil, garlic on toasted bread', 'is_popular': False},
    {'name': 'Cheese Sandwich', 'category': 'snacks', 'price': 200, 'description': 'Triple cheese, toasted golden brown', 'is_popular': False},
    {'name': 'Loaded Fries', 'category': 'snacks', 'price': 250, 'description': 'Seasoned fries, cheese sauce, jalapeños', 'is_popular': False},
    # DESSERTS
    {'name': 'Dark Choco Tart', 'category': 'desserts', 'price': 290, 'description': '70% dark chocolate ganache tart', 'is_popular': True},
    {'name': 'Tiramisu', 'category': 'desserts', 'price': 310, 'description': 'Classic Italian, espresso-soaked layers', 'is_popular': False},
    {'name': 'NY Cheesecake', 'category': 'desserts', 'price': 320, 'description': 'Dense, creamy, biscuit base', 'is_popular': False},
    {'name': 'Brownie Sundae', 'category': 'desserts', 'price': 270, 'description': 'Warm brownie with vanilla ice cream', 'is_popular': False},
    {'name': 'Crème Brûlée', 'category': 'desserts', 'price': 300, 'description': 'Classic French, torched sugar top', 'is_popular': False},
    # SPECIALS
    {'name': 'Rose Cardamom Latte', 'category': 'specials', 'price': 260, 'description': 'Floral, spiced, instagram-worthy', 'is_popular': True},
    {'name': 'Saffron Cold Brew', 'category': 'specials', 'price': 280, 'description': 'Kesar-infused cold brew, unique & bold', 'is_popular': False},
    {'name': 'Blue Pea Lemonade', 'category': 'specials', 'price': 230, 'description': 'Color-changing butterfly pea flower drink', 'is_popular': False},
    {'name': 'Affogato', 'category': 'specials', 'price': 240, 'description': 'Vanilla gelato drowned in hot espresso', 'is_popular': False},
    {'name': 'Espresso Martini', 'category': 'specials', 'price': 350, 'description': 'Non-alcoholic coffee cocktail, shaken', 'is_popular': False},
]

for item in menu_items:
    MenuItem.objects.create(**item)

print("Seeding Offers...")
offers = [
    {'title': 'Happy Hours', 'discount_percent': 20, 'description': '3PM–5PM on all beverages. Valid daily.', 'valid_till': date.today() + timedelta(days=365)},
    {'title': 'Weekend Brunch', 'discount_percent': 15, 'description': 'Saturday & Sunday mornings. Weekends only.', 'valid_till': date.today() + timedelta(days=365)},
    {'title': 'Loyalty Special', 'discount_percent': 25, 'description': 'On your 5th visit. Always active.', 'valid_till': date.today() + timedelta(days=365)},
]
for off in offers:
    Offer.objects.create(**off)

print("Seeding Reviews...")
reviews = [
    {'name': 'Priya S.', 'rating': 5, 'comment': 'Absolutely divine chai! Best café in Hyderabad.', 'is_approved': True},
    {'name': 'Rahul M.', 'rating': 5, 'comment': 'The ambience is magical. Felt like a luxury retreat.', 'is_approved': True},
    {'name': 'Sneha K.', 'rating': 5, 'comment': 'Truffle croissant changed my life. Will come back daily!', 'is_approved': True},
]
for rev in reviews:
    Review.objects.create(**rev)

print("Seeding Gallery...")
gallery_items = [
    {'title': 'Truffle Croissant', 'category': 'food'},
    {'title': 'Signature Espresso', 'category': 'coffee'},
    {'title': 'Cozy Corner', 'category': 'ambience'},
    {'title': 'Dark Choco Tart', 'category': 'food'},
    {'title': 'Matcha Latte', 'category': 'coffee'},
    {'title': 'Evening Vibes', 'category': 'ambience'},
    {'title': 'Live Music Night', 'category': 'events'},
    {'title': 'Avocado Toast', 'category': 'food'},
    {'title': 'Cold Brew', 'category': 'coffee'},
    {'title': 'Tea Tasting', 'category': 'events'},
    {'title': 'Morning Light', 'category': 'ambience'},
    {'title': 'Tiramisu', 'category': 'food'},
]
for gal in gallery_items:
    GalleryImage.objects.create(**gal)

print("Database fully seeded successfully!")
